import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { AUDIT_STEPS } from "../lib/auditSteps";
import { isValidPhone } from "../lib/validation";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import generateAuditPDF from "../lib/generateAuditPDF";
import {
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myPhone, setMyPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneToast, setPhoneToast] = useState("");

  useEffect(() => {
    fetchAudits();
  }, [user.email]);

  async function fetchAudits() {
    try {
      // Auditor sees audits assigned to them OR created by them
      const byAssigned = query(collection(db, "audits"), where("assignedAuditor", "==", user.email));
      const byCreated = query(collection(db, "audits"), where("createdBy", "==", user.email));

      const [snapA, snapC] = await Promise.all([getDocs(byAssigned), getDocs(byCreated)]);
      const map = new Map();
      snapA.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
      snapC.docs.forEach((d) => { if (!map.has(d.id)) map.set(d.id, { id: d.id, ...d.data() }); });

      const results = [...map.values()].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAudits(results);
    } catch (err) {
      setError(`Failed to load audits: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMyPhone() {
    if (!myPhone.trim()) return;
    if (!isValidPhone(myPhone)) {
      setPhoneToast("Invalid phone. Use format: +919876543210");
      setTimeout(() => setPhoneToast(""), 3000);
      return;
    }
    setPhoneSaving(true);
    try {
      let updated = 0;
      for (const audit of audits) {
        if (audit.assignedAuditor === user.email) {
          await updateDoc(doc(db, "audits", audit.id), { auditorPhone: myPhone.trim() });
          updated++;
        }
      }
      setAudits((prev) =>
        prev.map((a) =>
          a.assignedAuditor === user.email ? { ...a, auditorPhone: myPhone.trim() } : a
        )
      );
      setPhoneToast(`Phone saved for ${updated} audit(s)`);
      setTimeout(() => setPhoneToast(""), 3000);
    } catch (err) {
      setPhoneToast(`Error: ${err.message}`);
      setTimeout(() => setPhoneToast(""), 3000);
    } finally {
      setPhoneSaving(false);
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString("en-US", { dateStyle: "medium" });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Auditor Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome, <span className="font-medium text-slate-700">{user?.email}</span>
          </p>
        </div>
      </div>

      {/* Contact number */}
      <Card className="mb-6 !p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <PhoneIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">My Contact Number</span>
            <span className="text-[10px] text-slate-400">(optional — for SMS notifications)</span>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="tel"
              value={myPhone}
              onChange={(e) => setMyPhone(e.target.value)}
              placeholder="+919876543210"
              className={`flex-1 max-w-xs px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                myPhone && !isValidPhone(myPhone) ? "border-red-400" : "border-slate-300"
              }`}
            />
            <Button
              onClick={handleSaveMyPhone}
              loading={phoneSaving}
              className="!py-2 !text-xs"
              disabled={!myPhone.trim()}
            >
              Save
            </Button>
          </div>
          {myPhone && !isValidPhone(myPhone) && (
            <p className="text-[10px] text-red-500">Must start with + and have 10-13 digits</p>
          )}
        </div>
        {phoneToast && (
          <p className={`text-xs mt-2 font-medium ${phoneToast.startsWith("Error") || phoneToast.startsWith("Invalid") ? "text-red-600" : "text-emerald-600"}`}>
            {phoneToast}
          </p>
        )}
      </Card>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Your Assigned Audits</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : audits.length === 0 ? (
        <Card className="text-center py-12">
          <ShieldCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No audits assigned to you yet.</p>
          <p className="text-sm text-slate-400 mt-1">Contact your admin to get audits assigned.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => {
            const step = audit.currentStep || 0;
            const progress = Math.round((step / AUDIT_STEPS.length) * 100);
            const isLocked = ["Report Submitted", "Under Review", "Approved", "Implementation", "Closed"].includes(audit.status);
            const currentLabel = isLocked ? audit.status : (step >= AUDIT_STEPS.length ? "Completed" : AUDIT_STEPS[step]?.label);

            return (
              <Card
                key={audit.id}
                className="hover:shadow-md transition-shadow cursor-pointer !p-0 overflow-hidden"
                onClick={() => navigate(`/audit/${audit.id}`)}
              >
                <div className="flex items-stretch">
                  <div className={`w-1.5 flex-shrink-0 ${isLocked ? "bg-slate-400" : "bg-indigo-500"}`} />
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-800 truncate">{audit.roadName}</h3>
                          <StatusBadge status={audit.status || "Created"} size="xs" />
                          {isLocked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                          {audit.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" /> {audit.location}
                            </span>
                          )}
                          <span>{audit.length} km</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" /> {formatDate(audit.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          title="Download PDF Report"
                          onClick={(e) => { e.stopPropagation(); generateAuditPDF(audit); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <div className="text-right hidden sm:block">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isLocked ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {currentLabel}
                          </span>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isLocked ? "bg-slate-400" : "bg-indigo-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 w-8 text-right">{progress}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
