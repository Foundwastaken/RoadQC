import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import {
  MapPinIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const DESIGNER_VISIBLE = ["Report Submitted", "Under Review", "Approved", "Implementation"];

const SEVERITY_COLORS = {
  High: "border-l-red-500",
  Medium: "border-l-amber-500",
  Low: "border-l-blue-500",
};

export default function DesignerPortal() {
  const { user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchAudits();
  }, [user.email]);

  async function fetchAudits() {
    try {
      const q = query(collection(db, "audits"), where("assignedDesigner", "==", user.email));
      const snap = await getDocs(q);
      const results = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAudits(results);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleSaveIssue(auditId, issueIdx, updates) {
    setSaving(true);
    try {
      const audit = audits.find((a) => a.id === auditId);
      const updatedIssues = [...audit.issues];
      updatedIssues[issueIdx] = { ...updatedIssues[issueIdx], ...updates };

      const allResponded = updatedIssues.every((i) => i.responseStatus);
      const newStatus = allResponded ? "Under Review" : audit.status;

      await updateDoc(doc(db, "audits", auditId), {
        issues: updatedIssues,
        status: newStatus,
      });

      setAudits((prev) =>
        prev.map((a) =>
          a.id === auditId ? { ...a, issues: updatedIssues, status: newStatus } : a
        )
      );

      if (allResponded && audit.status !== "Under Review") {
        console.log("Admin notified: All designer responses submitted");
      }

      showToast("Response saved");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Designer Portal</h1>
        <p className="text-slate-500 mt-1">Respond to audit issues and track implementation</p>
      </div>

      {audits.length === 0 ? (
        <Card className="text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No audits require your attention.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => {
            const issues = audit.issues || [];
            const isExpanded = expandedId === audit.id;
            const respondedCount = issues.filter((i) => i.responseStatus).length;
            const canRespond = DESIGNER_VISIBLE.includes(audit.status);

            return (
              <Card key={audit.id} className="!p-0 overflow-hidden">
                {/* Audit header - clickable */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : audit.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-slate-800 truncate">{audit.roadName}</h3>
                      <StatusBadge status={audit.status || "Created"} size="xs" />
                      {canRespond ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Action Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Waiting
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      {audit.location && (
                        <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {audit.location}</span>
                      )}
                      <span>{issues.length} issues</span>
                      {issues.length > 0 && (
                        <span className="text-indigo-600 font-medium">{respondedCount}/{issues.length} responded</span>
                      )}
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUpIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    : <ChevronDownIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 space-y-4 bg-slate-50/50">
                    {!canRespond ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">This audit is still <span className="font-semibold">{audit.status || "in progress"}</span>.</p>
                        <p className="text-xs text-slate-400 mt-1">You can respond once the auditor submits their report.</p>
                      </div>
                    ) : issues.length === 0 ? (
                      <p className="text-sm text-slate-500">No issues recorded for this audit.</p>
                    ) : (
                      issues.map((issue, idx) => (
                        <IssueResponseCard
                          key={idx}
                          issue={issue}
                          saving={saving}
                          onSave={(updates) => handleSaveIssue(audit.id, idx, updates)}
                        />
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.startsWith("Error") ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function IssueResponseCard({ issue, saving, onSave }) {
  const [response, setResponse] = useState(issue.designerResponse || "");
  const [status, setStatus] = useState(issue.responseStatus || "");
  const [implStatus, setImplStatus] = useState(issue.implementationStatus || "Not Started");
  const [dirty, setDirty] = useState(false);

  function handleSave() {
    onSave({
      designerResponse: response,
      responseStatus: status,
      implementationStatus: implStatus,
    });
    setDirty(false);
  }

  return (
    <div className={`bg-white rounded-xl border border-l-4 ${SEVERITY_COLORS[issue.severity] || "border-l-slate-400"} p-4`}>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <h4 className="font-semibold text-slate-800">{issue.title}</h4>
        <StatusBadge status={issue.severity || "Low"} size="xs" />
        {issue.adminDecision && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            issue.adminDecision === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}>
            Admin: {issue.adminDecision}
          </span>
        )}
      </div>
      {issue.description && (
        <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Response Status</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setDirty(true); }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Implementation Status</label>
          <select
            value={implStatus}
            onChange={(e) => { setImplStatus(e.target.value); setDirty(true); }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Designer Response</label>
        <textarea
          value={response}
          onChange={(e) => { setResponse(e.target.value); setDirty(true); }}
          rows={2}
          placeholder="Provide your response and justification..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!status || !dirty}
          className="!py-2 !px-4 !text-xs"
        >
          Save Response
        </Button>
      </div>
    </div>
  );
}
