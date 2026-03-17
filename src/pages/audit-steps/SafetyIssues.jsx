import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const SEVERITIES = ["Low", "Medium", "High"];

const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

const blankIssue = { title: "", description: "", severity: "Medium" };

export default function SafetyIssues({ audit, onSave }) {
  const [issues, setIssues] = useState(
    audit.issues?.length > 0 ? audit.issues : [{ ...blankIssue }]
  );
  const [showForm, setShowForm] = useState(audit.issues?.length === 0);

  function addIssue() {
    setIssues([...issues, { ...blankIssue }]);
    setShowForm(true);
  }

  function removeIssue(idx) {
    setIssues(issues.filter((_, i) => i !== idx));
  }

  function updateIssue(idx, field, value) {
    setIssues(issues.map((issue, i) => (i === idx ? { ...issue, [field]: value } : issue)));
  }

  function handleSave() {
    const valid = issues.filter((i) => i.title.trim());
    onSave({ issues: valid });
  }

  const highCount = issues.filter((i) => i.severity === "High" && i.title.trim()).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-indigo-600" />
          Safety Issue Identification
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Document all safety concerns found during the desk study and site inspection.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{issues.filter((i) => i.title.trim()).length}</p>
          <p className="text-xs text-slate-500">Total Issues</p>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-600">{highCount}</p>
          <p className="text-xs text-slate-500">High Severity</p>
        </div>
        <div className="bg-amber-50 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {issues.filter((i) => i.severity === "Medium" && i.title.trim()).length}
          </p>
          <p className="text-xs text-slate-500">Medium Severity</p>
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {issues.map((issue, idx) => (
          <Card key={idx} className="!p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">Issue #{idx + 1}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[issue.severity]}`}>
                  {issue.severity}
                </span>
                {issues.length > 1 && (
                  <button onClick={() => removeIssue(idx)} className="text-red-400 hover:text-red-600 cursor-pointer">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={issue.title}
                onChange={(e) => updateIssue(idx, "title", e.target.value)}
                placeholder="Issue title (e.g., Missing guard rail at curve km 1.2)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <textarea
                rows={2}
                value={issue.description}
                onChange={(e) => updateIssue(idx, "description", e.target.value)}
                placeholder="Detailed description of the safety concern..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Severity</label>
                <div className="flex gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateIssue(idx, "severity", s)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        issue.severity === s
                          ? SEVERITY_COLORS[s]
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={addIssue}>
          <PlusIcon className="w-4 h-4" /> Add Issue
        </Button>
        <Button onClick={handleSave}>Save Issues & Continue</Button>
      </div>
    </div>
  );
}
