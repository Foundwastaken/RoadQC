import { useState } from "react";
import generateAuditPDF from "../../lib/generateAuditPDF";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

const DESK_STUDY_LABELS = {
  geometry: "Road Geometry",
  junctions: "Junctions & Intersections",
  alignment: "Road Alignment",
  signage: "Signs & Markings",
  drainage: "Drainage & Shoulders",
};

export default function AuditReport({ audit, onSave }) {
  const [generating, setGenerating] = useState(false);

  const issues = audit.issues || [];
  const inspection = audit.inspection || {};
  const deskStudy = audit.deskStudy || {};
  const team = audit.team || [];
  const bg = audit.backgroundData || {};
  const commencement = audit.meetingNotes?.commencement || {};
  const responses = audit.responses || [];
  const implementation = audit.implementation || [];

  const highCount = issues.filter((i) => i.severity === "High").length;
  const medCount = issues.filter((i) => i.severity === "Medium").length;
  const lowCount = issues.filter((i) => i.severity === "Low").length;
  const deskChecked = Object.values(deskStudy).filter(Boolean).length;
  const deskTotal = Object.keys(deskStudy).length || 1;

  function formatDate(ts) {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleDateString("en-US", { dateStyle: "long" });
  }

  async function handleDownloadPDF() {
    setGenerating(true);
    try {
      generateAuditPDF(audit);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    onSave({
      report: {
        totalIssues: issues.length,
        highRisk: highCount,
        mediumRisk: medCount,
        lowRisk: lowCount,
        coverage: inspection.coverage || 0,
        inspectionStatus: inspection.status || "Pending",
        deskStudyCompletion: Math.round((deskChecked / deskTotal) * 100),
        generatedAt: Date.now(),
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
            Audit Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review the audit summary and download the full report.
          </p>
        </div>
        <Button variant="secondary" onClick={handleDownloadPDF} loading={generating}>
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Report header card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white !border-indigo-200">
        <div className="text-center">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Road Safety Audit</p>
          <h3 className="text-lg font-bold text-slate-800">{audit.roadName}</h3>
          <p className="text-sm text-slate-500">{audit.location} &middot; {audit.length} km</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {team.map((m, i) => (
              <span key={i} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600">
                {m.name} ({m.role})
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Created {formatDate(audit.timestamp)} by {audit.createdBy}
          </p>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          icon={ExclamationTriangleIcon}
          label="Total Issues"
          value={issues.length}
          color="text-slate-800"
          bg="bg-slate-50"
        />
        <MetricCard
          icon={ExclamationTriangleIcon}
          label="High Risk"
          value={highCount}
          color="text-red-600"
          bg="bg-red-50"
        />
        <MetricCard
          icon={MapPinIcon}
          label="Coverage"
          value={`${(inspection.coverage || 0).toFixed(1)}%`}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <MetricCard
          icon={inspection.status === "Valid" ? CheckCircleIcon : XCircleIcon}
          label="Inspection"
          value={inspection.status || "Pending"}
          color={inspection.status === "Valid" ? "text-emerald-600" : "text-amber-600"}
          bg={inspection.status === "Valid" ? "bg-emerald-50" : "bg-amber-50"}
        />
      </div>

      {/* Issues breakdown */}
      {issues.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Issues Breakdown</h3>
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{issue.title}</p>
                  <p className="text-xs text-slate-500 truncate">{issue.description}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-3 flex-shrink-0 ${SEVERITY_COLORS[issue.severity]}`}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Desk study summary */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-3">Desk Study Completion</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(deskChecked / deskTotal) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {deskChecked}/{deskTotal}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(DESK_STUDY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${deskStudy[key] ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className={deskStudy[key] ? "text-slate-700" : "text-slate-400"}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Inspection summary */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-3">Site Inspection Data</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500">Distance</p>
            <p className="font-bold text-slate-800">{(inspection.distance || 0).toFixed(3)} km</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500">Coverage</p>
            <p className="font-bold text-slate-800">{(inspection.coverage || 0).toFixed(1)}%</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-500">Time</p>
            <p className="font-bold text-slate-800 capitalize">{inspection.dayNight || "N/A"}</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleDownloadPDF} loading={generating} variant="secondary" className="flex-1">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download Full PDF Report
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-4 text-center`}>
      <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} />
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
