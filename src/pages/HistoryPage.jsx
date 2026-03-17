import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { AUDIT_STEPS } from "../lib/auditSteps";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import generateAuditPDF from "../lib/generateAuditPDF";
import {
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAudits() {
      try {
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
    fetchAudits();
  }, [user.email]);

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Audit History</h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
      )}

      {audits.length === 0 && !error ? (
        <Card className="text-center py-12">
          <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No audit records found.</p>
          <p className="text-sm text-slate-400 mt-1">Complete an audit to see it here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {audits.map((audit) => {
            const step = audit.currentStep || 0;
            const progress = Math.round((step / AUDIT_STEPS.length) * 100);
            const issues = audit.issues || [];
            const highCount = issues.filter((i) => i.severity === "High").length;
            const inspection = audit.inspection || {};

            return (
              <Card
                key={audit.id}
                className="overflow-hidden !p-0 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/audit/${audit.id}`)}
              >
                {(inspection.imageUrls?.[0] || inspection.imageUrl) && (
                  <div className="relative">
                    <img
                      src={inspection.imageUrls?.[0] || inspection.imageUrl}
                      alt="Road inspection"
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                    {inspection.imageUrls?.length > 1 && (
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                        +{inspection.imageUrls.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{audit.roadName}</h3>
                      {audit.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="w-3 h-3" /> {audit.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        title="Download PDF Report"
                        onClick={(e) => { e.stopPropagation(); generateAuditPDF(audit); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <StatusBadge status={audit.status || "In Progress"} size="xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-slate-500">Coverage</p>
                      <p className="text-sm font-bold text-slate-800">
                        {(inspection.coverage || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5">
                        <ExclamationTriangleIcon className="w-3 h-3" /> Issues
                      </p>
                      <p className="text-sm font-bold text-slate-800">{issues.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-slate-500 text-red-500">High Risk</p>
                      <p className="text-sm font-bold text-red-600">{highCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{progress}%</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">{formatDate(audit.timestamp)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
