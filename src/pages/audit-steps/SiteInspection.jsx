import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  MapPinIcon,
  CameraIcon,
  ArrowUpTrayIcon,
  SignalIcon,
  SignalSlashIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const VALID_THRESHOLD = 80;
const MAX_IMAGES = 10;

/** Haversine formula — great-circle distance between two GPS points in km. */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Uses Google Gemini Vision API to validate whether an image shows a road.
 * Sends a compressed version of the image to keep the request fast.
 * Falls back to "valid" if the API key is missing or the request fails,
 * so the app still works without Gemini configured.
 */
async function validateRoadImage(file) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    return { valid: true, confidence: 0, reason: "Gemini API key not set — skipping validation." };
  }

  try {
    const base64 = await fileToBase64(file);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are a road safety audit image validator. Analyze this image and determine if it shows a road, street, highway, pavement, or any road infrastructure (including sidewalks, intersections, bridges, tunnels, road signs, road markings).

Reply ONLY with a JSON object in this exact format, no other text:
{"valid": true/false, "confidence": 0-100, "reason": "one short sentence"}

Rules:
- valid=true if the image shows ANY road, street, path, highway, or road infrastructure
- valid=false if the image is a selfie, person, animal, food, indoor scene, document, screenshot, meme, or anything not road-related
- Be strict: if you're unsure, mark it as invalid
- The reason should explain what you see in the image`
              },
              {
                inlineData: {
                  mimeType: file.type || "image/jpeg",
                  data: base64,
                },
              },
            ],
          }],
        }),
      }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from the response (handles markdown code blocks too)
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        valid: Boolean(result.valid),
        confidence: Number(result.confidence) || 0,
        reason: String(result.reason || (result.valid ? "Road image detected." : "Not a road image.")),
      };
    }

    return { valid: true, confidence: 0, reason: "Could not parse AI response." };
  } catch {
    // If Gemini fails for any reason, allow the image through
    return { valid: true, confidence: 0, reason: "Validation unavailable — image accepted." };
  }
}

/** Convert file to base64 string (without the data:... prefix) */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Compress an image to a small data URL that fits safely in Firestore */
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 300;
        const scale = Math.min(maxW / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function SiteInspection({ audit, onSave }) {
  const { user } = useAuth();
  const totalLength = audit.length || 5;

  const existing = audit.inspection || {};
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [path, setPath] = useState(existing.path || []);
  const [distance, setDistance] = useState(existing.distance || 0);
  const [dayNight, setDayNight] = useState(existing.dayNight || "day");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Multi-image state: each entry = { file, preview, validation }
  const existingImages = existing.imageUrls || (existing.imageUrl ? [existing.imageUrl] : []);
  const [images, setImages] = useState(
    existingImages.map((url) => ({ file: null, preview: url, validation: { valid: true, confidence: 100, reason: "Previously saved" } }))
  );
  const [validating, setValidating] = useState(false);

  // Webcam
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const watchIdRef = useRef(null);
  const fileInputRef = useRef(null);

  const coverage = Math.min((distance / totalLength) * 100, 100);
  const isValid = coverage >= VALID_THRESHOLD;

  const handlePosition = useCallback((position) => {
    const { latitude, longitude } = position.coords;
    setPath((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const delta = haversineDistance(last.lat, last.lng, latitude, longitude);
        if (delta > 0.002) {
          setDistance((d) => d + delta);
          return [...prev, { lat: latitude, lng: longitude }];
        }
        return prev;
      }
      return [{ lat: latitude, lng: longitude }];
    });
  }, []);

  function startTracking() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setGpsStatus("tracking");
    setError("");
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        setGpsStatus("error");
        setError(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus("idle");
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      stopWebcam();
    };
  }, []);

  // --- Image validation + add ---
  async function addImageFile(file) {
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    setValidating(true);
    setError("");

    const preview = URL.createObjectURL(file);
    const validation = await validateRoadImage(file);

    if (!validation.valid) {
      setImages((prev) => [...prev, { file, preview, validation }]);
      setError(validation.reason);
    } else {
      setImages((prev) => [...prev, { file, preview, validation }]);
    }
    setValidating(false);
  }

  function removeImageAt(idx) {
    setImages((prev) => {
      const removed = prev[idx];
      if (removed.preview && !removed.preview.startsWith("http") && !removed.preview.startsWith("data:")) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== idx);
    });
    setError("");
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => addImageFile(f));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // --- Webcam ---
  async function openWebcam() {
    setShowWebcam(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setError("Camera access denied or not available. Try 'Upload File' instead.");
      setShowWebcam(false);
    }
  }

  function captureFromWebcam() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      stopWebcam();
      setShowWebcam(false);
      addImageFile(file);
    }, "image/jpeg", 0.9);
  }

  function stopWebcam() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  // --- Save ---
  async function handleSave() {
    const invalidImages = images.filter((img) => !img.validation.valid);
    if (invalidImages.length > 0) {
      setError("Please remove invalid images before saving. Only road images are accepted.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const imageUrls = [];

      for (const img of images) {
        if (!img.file) {
          imageUrls.push(img.preview);
          continue;
        }

        // Compress image and store as data URL
        // Firebase Storage upload is skipped to avoid hangs when Storage rules block access.
        // To enable Storage uploads, set up Storage rules in Firebase Console first.
        const dataUrl = await fileToDataUrl(img.file);
        imageUrls.push(dataUrl);
      }

      stopTracking();

      const trimmedPath = path.slice(-500).map((p) => ({ lat: p.lat, lng: p.lng }));

      await onSave({
        inspection: {
          distance: parseFloat(distance.toFixed(3)),
          coverage: parseFloat(coverage.toFixed(1)),
          status: isValid ? "Valid" : "Incomplete",
          imageUrl: imageUrls[0] || "",
          imageUrls,
          path: trimmedPath,
          dayNight,
        },
      });
    } catch (err) {
      setError(`Save failed: ${err.message}`);
      setUploading(false);
    }
  }

  const validCount = images.filter((i) => i.validation.valid).length;
  const invalidCount = images.filter((i) => !i.validation.valid).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-indigo-600" />
          Site Inspection
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Conduct field inspection with GPS tracking, capture road images.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Day/Night Toggle */}
      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Inspection Time</span>
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setDayNight("day")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                dayNight === "day" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500"
              }`}
            >
              <SunIcon className="w-4 h-4" /> Day
            </button>
            <button
              onClick={() => setDayNight("night")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                dayNight === "night" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              <MoonIcon className="w-4 h-4" /> Night
            </button>
          </div>
        </div>
      </Card>

      {/* GPS Tracking */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">GPS Tracking</h3>
          <GpsStatusIndicator status={gpsStatus} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Stat label="Distance" value={`${distance.toFixed(3)} km`} />
          <Stat label="GPS Points" value={path.length} />
        </div>
        <div className="flex gap-3">
          {gpsStatus !== "tracking" ? (
            <Button onClick={startTracking}>
              <SignalIcon className="w-4 h-4" /> Start Tracking
            </Button>
          ) : (
            <Button variant="danger" onClick={stopTracking}>
              <SignalSlashIcon className="w-4 h-4" /> Stop Tracking
            </Button>
          )}
        </div>
      </Card>

      {/* Coverage */}
      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-3">Road Coverage</h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-slate-500">
            {distance.toFixed(2)} / {totalLength} km
          </span>
          <span className="text-sm font-semibold text-slate-700">{coverage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isValid ? "bg-emerald-500" : "bg-indigo-500"
            }`}
            style={{ width: `${Math.min(coverage, 100)}%` }}
          />
        </div>
        <div className="mt-2">
          {isValid ? (
            <span className="text-sm font-semibold text-emerald-600">
              Valid &#x2705; — Coverage meets the 80% threshold
            </span>
          ) : (
            <span className="text-sm font-semibold text-red-500">
              Incomplete &#x274C; — Need at least 80% coverage
            </span>
          )}
        </div>
      </Card>

      {/* Road Images — Multi-upload + Validation */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-indigo-600" />
            Road Images
          </h3>
          {images.length > 0 && (
            <span className="text-xs text-slate-500">
              {validCount} valid{invalidCount > 0 && <>, <span className="text-red-500">{invalidCount} invalid</span></>}
              {" "}/ {MAX_IMAGES} max
            </span>
          )}
        </div>

        {/* Webcam modal */}
        {showWebcam && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h4 className="font-semibold text-slate-800">Camera</h4>
                <button onClick={() => { stopWebcam(); setShowWebcam(false); }} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[60vh] object-contain" />
              </div>
              <div className="p-4 flex justify-center">
                <button
                  onClick={captureFromWebcam}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full border-4 border-white shadow-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <div className="w-12 h-12 border-2 border-white rounded-full" />
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Image grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 ${
                img.validation.valid ? "border-emerald-300" : "border-red-400"
              }`}>
                <img
                  src={img.preview}
                  alt={`Road ${idx + 1}`}
                  className="w-full h-32 object-cover"
                />

                {/* Validation badge */}
                <div className={`absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  img.validation.valid
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {img.validation.valid
                    ? <><CheckCircleIcon className="w-3 h-3" /> Valid</>
                    : <><ExclamationTriangleIcon className="w-3 h-3" /> Invalid</>
                  }
                </div>

                {/* Invalid overlay — sits below the buttons */}
                {!img.validation.valid && (
                  <div className="absolute inset-0 z-10 bg-red-500/10 flex items-end pointer-events-none">
                    <p className="w-full bg-red-600/90 text-white text-[10px] px-2 py-1.5 text-center leading-tight">
                      {img.validation.reason}
                    </p>
                  </div>
                )}

                {/* Remove button — always visible, above overlay */}
                <button
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-1.5 right-1.5 z-20 bg-red-600 text-white p-1.5 rounded-lg cursor-pointer hover:bg-red-700 transition-colors shadow-md"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-4">
            <CameraIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Capture photos or upload files (up to {MAX_IMAGES})</p>
            <p className="text-xs text-slate-400 mt-1">Only road/street images are accepted</p>
          </div>
        )}

        {validating && (
          <div className="flex items-center gap-2 mb-3 text-sm text-indigo-600">
            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            Analyzing image...
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={openWebcam} className="flex-1" disabled={images.length >= MAX_IMAGES}>
            <CameraIcon className="w-4 h-4" /> Capture Photo
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1" disabled={images.length >= MAX_IMAGES}>
            <ArrowUpTrayIcon className="w-4 h-4" /> Upload Files
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
        </div>
      </Card>

      <Button
        onClick={handleSave}
        loading={uploading}
        variant="success"
        className="w-full"
        disabled={invalidCount > 0}
      >
        {invalidCount > 0
          ? `Remove ${invalidCount} invalid image${invalidCount > 1 ? "s" : ""} to continue`
          : "Save Inspection Data & Continue"
        }
      </Button>
    </div>
  );
}

function GpsStatusIndicator({ status }) {
  const config = {
    idle: { label: "Not started", color: "bg-slate-400" },
    tracking: { label: "Tracking", color: "bg-emerald-500 animate-pulse" },
    error: { label: "Error", color: "bg-red-500" },
  };
  const { label, color } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}
