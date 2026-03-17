import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const STATUSES = ["Pending", "In Progress", "Completed"];

const STATUS_STYLES = {
  Pending: "bg-slate-100 text-slate-600",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const SEVERITY_BADGE = {
  Low: "bg-blue-50 text-blue-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

export default function ImplementationStatus({ audit, onSave }) {
  const issues = audit.issues || [];
  const responses = audit.responses || [];

  // Only include accepted issues for implementation tracking
  const acceptedIssues = issues.filter((_, idx) => responses[idx]?.accepted === true);

  const [implementation, setImplementation] = useState(
    audit.implementation?.length > 0
      ? audit.implementation
      : acceptedIssues.map((issue) => ({
          issueTitle: issue.title,
          severity: issue.severity,
          status: "Pending",
        }))
  );

  function updateStatus(idx, status) {
    setImplementation(implementation.map((item, i) => (i === idx ? { ...item, status } : item)));
  }

  function handleSave() {
    onSave({ implementation });
  }

  const completedCount = implementation.filter((i) => i.status === "Completed").length;
  const total = implementation.length || 1;
  const progress = Math.round((completedCount / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CheckBadgeIcon className="w-6 h-6 text-indigo-600" />
          Implementation Status
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Track the implementation progress of accepted safety recommendations.
        </p>
      </div>

      {/* Progress overview */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white !border-indigo-200">
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-indigo-600">{progress}%</p>
          <p className="text-sm text-slate-500 mt-1">
            {completedCount} of {implementation.length} issues resolved
          </p>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-indigo-100">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {implementation.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-slate-500">
            No accepted issues to track. Complete the Designer Response step first.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {implementation.map((item, idx) => (
            <Card key={idx} className="!p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-800 truncate">{item.issueTitle}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${SEVERITY_BADGE[item.severity]}`}>
                      {item.severity}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(idx, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        item.status === s
                          ? STATUS_STYLES[s]
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={handleSave} variant="success" className="w-full">
        Save & Complete Audit
      </Button>
    </div>
  );
}
