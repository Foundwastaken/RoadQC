import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { createBlankAudit, AUDIT_STATUSES } from "../../lib/auditSteps";
import Card from "../../components/Card";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import generateAuditPDF from "../../lib/generateAuditPDF";
import { isValidPhone } from "../../lib/validation";
import {
  PlusIcon,
  FunnelIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  MapIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import AuditMap from "../../components/AuditMap";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ roadName: "", location: "", length: "", assignedAuditor: "", assignedDesigner: "", auditorPhone: "", designerPhone: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchAllAudits();
  }, []);

  async function fetchAllAudits() {
    try {
      const snap = await getDocs(collection(db, "audits"));
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAudits(results);
    } catch (err) {
      setError(`Failed to load audits: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.roadName.trim()) return;
    if (form.auditorPhone && !isValidPhone(form.auditorPhone)) {
      setError("Invalid auditor phone. Use format: +919876543210");
      return;
    }
    if (form.designerPhone && !isValidPhone(form.designerPhone)) {
      setError("Invalid designer phone. Use format: +919876543210");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const auditData = createBlankAudit({
        roadName: form.roadName.trim(),
        location: form.location.trim(),
        length: form.length,
        createdBy: user.email,
        assignedAuditor: form.assignedAuditor.trim(),
        assignedDesigner: form.assignedDesigner.trim(),
        auditorPhone: form.auditorPhone.trim(),
        designerPhone: form.designerPhone.trim(),
      });
      if (form.assignedAuditor.trim()) console.log("Auditor notified:", form.assignedAuditor.trim());
      if (form.assignedDesigner.trim()) console.log("Designer notified:", form.assignedDesigner.trim());
      await addDoc(collection(db, "audits"), auditData);
      setForm({ roadName: "", location: "", length: "", assignedAuditor: "", assignedDesigner: "", auditorPhone: "", designerPhone: "" });
      setShowCreate(false);
      fetchAllAudits();
    } catch (err) {
      setError(`Failed to create audit: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  const filtered = statusFilter === "All"
    ? audits
    : audits.filter((a) => a.status === statusFilter);

  const stats = {
    total: audits.length,
    inProgress: audits.filter((a) => ["In Progress", "Assigned"].includes(a.status)).length,
    submitted: audits.filter((a) => a.status === "Report Submitted").length,
    closed: audits.filter((a) => a.status === "Closed").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage all road safety audits</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowMap(!showMap)}>
            <MapIcon className="w-4 h-4" />
            {showMap ? "Hide Map" : "View Map"}
          </Button>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <PlusIcon className="w-4 h-4" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Audits", value: stats.total, color: "text-indigo-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-amber-600" },
          { label: "Awaiting Review", value: stats.submitted, color: "text-purple-600" },
          { label: "Closed", value: stats.closed, color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label} className="!p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Map View */}
      {showMap && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Audit Map Overview</h2>
          <AuditMap audits={audits} height={480} />
          {audits.filter((a) => !a.roadStart && !a.inspection?.path?.length).length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              Some audits don't have GPS coordinates yet. Set road start/end in the audit detail page, or complete a site inspection with GPS tracking.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Create & Assign New Audit</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Road Name *</label>
                <input
                  type="text"
                  required
                  value={form.roadName}
                  onChange={(e) => setForm({ ...form, roadName: e.target.value })}
                  placeholder="e.g., NH-48 Bangalore Highway"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., KM 12-17, Sector 5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Length (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value })}
                  placeholder="5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <label className="block text-sm font-medium text-indigo-700 mb-1">Auditor (inspects road)</label>
                <input
                  type="email"
                  value={form.assignedAuditor}
                  onChange={(e) => setForm({ ...form, assignedAuditor: e.target.value })}
                  placeholder="e.g. auditor@pravi.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-indigo-600 mb-1">
                    <PhoneIcon className="w-3 h-3 inline mr-1" />Auditor Phone (SMS notifications)
                  </label>
                  <input
                    type="tel"
                    value={form.auditorPhone}
                    onChange={(e) => setForm({ ...form, auditorPhone: e.target.value })}
                    placeholder="+919876543210"
                    className={`w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      form.auditorPhone && !isValidPhone(form.auditorPhone) ? "border-red-400" : "border-indigo-200"
                    }`}
                  />
                  {form.auditorPhone && !isValidPhone(form.auditorPhone) && (
                    <p className="text-[10px] text-red-500 mt-0.5">Must start with + and have 10-13 digits</p>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <label className="block text-sm font-medium text-purple-700 mb-1">Designer (responds to issues)</label>
                <input
                  type="email"
                  value={form.assignedDesigner}
                  onChange={(e) => setForm({ ...form, assignedDesigner: e.target.value })}
                  placeholder="e.g. designer@pravi.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-purple-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-purple-600 mb-1">
                    <PhoneIcon className="w-3 h-3 inline mr-1" />Designer Phone (SMS notifications)
                  </label>
                  <input
                    type="tel"
                    value={form.designerPhone}
                    onChange={(e) => setForm({ ...form, designerPhone: e.target.value })}
                    placeholder="+919876543210"
                    className={`w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      form.designerPhone && !isValidPhone(form.designerPhone) ? "border-red-400" : "border-purple-200"
                    }`}
                  />
                  {form.designerPhone && !isValidPhone(form.designerPhone) && (
                    <p className="text-[10px] text-red-500 mt-0.5">Must start with + and have 10-13 digits</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={creating}>Create Audit</Button>
              <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FunnelIcon className="w-4 h-4 text-slate-400" />
        {["All", ...AUDIT_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Audit list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500">No audits found{statusFilter !== "All" ? ` with status "${statusFilter}"` : ""}.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((audit) => {
            const issues = audit.issues || [];
            const highCount = issues.filter((i) => i.severity === "High").length;

            return (
              <Card
                key={audit.id}
                className="!p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/audit/${audit.id}`)}
              >
                <div className="flex items-stretch">
                  <div className={`w-1.5 flex-shrink-0 ${
                    audit.status === "Closed" ? "bg-slate-400"
                    : audit.status === "Approved" ? "bg-emerald-500"
                    : audit.status === "Rejected" ? "bg-red-500"
                    : "bg-indigo-500"
                  }`} />
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-slate-800 truncate">{audit.roadName}</h3>
                          <StatusBadge status={audit.status || "Created"} size="xs" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                          {audit.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" /> {audit.location}
                            </span>
                          )}
                          <span>{audit.length} km</span>
                          {audit.assignedAuditor && (
                            <span className="text-indigo-600 font-medium">
                              Auditor: {audit.assignedAuditor}
                            </span>
                          )}
                          {audit.assignedDesigner && (
                            <span className="text-purple-600 font-medium">
                              Designer: {audit.assignedDesigner}
                            </span>
                          )}
                          {issues.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              {issues.length} issues
                              {highCount > 0 && (
                                <span className="text-red-600 font-semibold">({highCount} high)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          title="Download PDF"
                          onClick={(e) => { e.stopPropagation(); generateAuditPDF(audit); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                      </div>
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
