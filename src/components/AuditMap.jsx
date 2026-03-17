import { useMemo, useEffect, useRef, useState } from "react";
import {
  MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, useMap,
} from "react-leaflet";
import L from "leaflet";

const INDIA_CENTER = [22.9734, 78.6569];
const DEFAULT_ZOOM = 5;

const SEVERITY_STYLES = {
  High:   { color: "#dc2626", fillColor: "#dc2626", radius: 8 },
  Medium: { color: "#d97706", fillColor: "#d97706", radius: 7 },
  Low:    { color: "#16a34a", fillColor: "#16a34a", radius: 6 },
};

const ROAD_COLORS = [
  "#4338ca", "#7c3aed", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#db2777", "#4f46e5", "#0d9488", "#ca8a04",
];

const startIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#dc2626;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ points }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!points || points.length === 0) return;

    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    if (!bounds.isValid()) return;

    const doFit = () => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    };

    // Fit immediately + after a short delay to handle layout shifts
    doFit();
    const t1 = setTimeout(doFit, 300);
    const t2 = setTimeout(doFit, 800);
    fitted.current = true;

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [points, map]);

  // Re-fit when the map container resizes
  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    const handler = () => {
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    };
    map.on("resize", handler);
    return () => map.off("resize", handler);
  }, [points, map]);

  return null;
}

export default function AuditMap({ audits = [], height = 500 }) {
  const [mapReady, setMapReady] = useState(false);

  const { polylines, markers, allPoints, startEndMarkers } = useMemo(() => {
    const polylines = [];
    const markers = [];
    const allPoints = [];
    const startEndMarkers = [];

    audits.forEach((audit, idx) => {
      const color = ROAD_COLORS[idx % ROAD_COLORS.length];
      const start = audit.roadStart;
      const end = audit.roadEnd;

      const routePath = audit.routePath;
      if (routePath?.length >= 2) {
        const routePoints = routePath.map((p) => [p.lat, p.lng]);
        polylines.push({
          id: audit.id + "-route",
          positions: routePoints,
          color,
          name: audit.roadName,
          distanceKm: audit.routeDistanceKm,
        });
        allPoints.push(...routePoints);
      } else if (start?.lat && start?.lng && end?.lat && end?.lng) {
        polylines.push({
          id: audit.id,
          positions: [[start.lat, start.lng], [end.lat, end.lng]],
          color,
          name: audit.roadName,
        });
        allPoints.push([start.lat, start.lng], [end.lat, end.lng]);
      }

      if (start?.lat && start?.lng) {
        startEndMarkers.push({ position: [start.lat, start.lng], type: "start", name: audit.roadName });
        if (!allPoints.some((p) => p[0] === start.lat && p[1] === start.lng)) {
          allPoints.push([start.lat, start.lng]);
        }
      }
      if (end?.lat && end?.lng) {
        startEndMarkers.push({ position: [end.lat, end.lng], type: "end", name: audit.roadName });
        if (!allPoints.some((p) => p[0] === end.lat && p[1] === end.lng)) {
          allPoints.push([end.lat, end.lng]);
        }
      }

      const path = audit.inspection?.path;
      if (path?.length >= 2 && !routePath?.length) {
        const pathPoints = path.map((p) => [p.lat, p.lng]);
        if (!polylines.find((pl) => pl.id === audit.id)) {
          polylines.push({ id: audit.id + "-gps", positions: pathPoints, color, name: audit.roadName });
        }
        allPoints.push(...pathPoints);
      }

      (audit.issues || []).forEach((issue) => {
        if (issue.location?.lat && issue.location?.lng) {
          markers.push({
            auditId: audit.id,
            roadName: audit.roadName,
            position: [issue.location.lat, issue.location.lng],
            title: issue.title,
            severity: issue.severity || "Low",
            description: issue.description,
          });
          allPoints.push([issue.location.lat, issue.location.lng]);
        }
      });
    });

    return { polylines, markers, allPoints, startEndMarkers };
  }, [audits]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={allPoints.length > 0 ? allPoints[0] : INDIA_CENTER}
        zoom={allPoints.length > 0 ? 12 : DEFAULT_ZOOM}
        style={{ height: `${height}px`, width: "100%" }}
        scrollWheelZoom={true}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {mapReady && allPoints.length > 0 && <FitBounds points={allPoints} />}

        {polylines.map((pl) => (
          <Polyline
            key={pl.id}
            positions={pl.positions}
            pathOptions={{ color: pl.color, weight: 5, opacity: 0.85 }}
          >
            <Popup>
              <div>
                <strong className="text-sm">{pl.name}</strong>
                {pl.distanceKm && (
                  <p className="text-xs text-slate-500 mt-0.5">{pl.distanceKm} km (driving route)</p>
                )}
              </div>
            </Popup>
          </Polyline>
        ))}

        {startEndMarkers.map((m, i) => (
          <Marker key={`se-${i}`} position={m.position} icon={m.type === "start" ? startIcon : endIcon}>
            <Popup>
              <span className="text-xs font-semibold">
                {m.type === "start" ? "Start" : "End"}: {m.name}
              </span>
            </Popup>
          </Marker>
        ))}

        {markers.map((m, i) => {
          const style = SEVERITY_STYLES[m.severity] || SEVERITY_STYLES.Low;
          return (
            <CircleMarker
              key={`${m.auditId}-${i}`}
              center={m.position}
              radius={style.radius}
              pathOptions={{
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-bold text-sm text-slate-800">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.roadName}</p>
                  <span
                    className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: style.fillColor }}
                  >
                    {m.severity}
                  </span>
                  {m.description && (
                    <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="bg-white px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs border-t border-slate-200">
        <span className="font-semibold text-slate-600">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block bg-green-600 border-2 border-white shadow-sm" />
          Start
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block bg-red-600 border-2 border-white shadow-sm" />
          End
        </span>
        {Object.entries(SEVERITY_STYLES).map(([sev, style]) => (
          <span key={sev} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block border border-white shadow-sm"
              style={{ backgroundColor: style.fillColor }}
            />
            {sev}
          </span>
        ))}
        <span className="flex items-center gap-1.5 ml-auto text-slate-400">
          <span className="w-6 h-0.5 bg-indigo-600 inline-block rounded" />
          Road Route
        </span>
      </div>
    </div>
  );
}
