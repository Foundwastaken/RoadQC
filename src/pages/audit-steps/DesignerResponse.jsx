import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { ChatBubbleLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700 border-blue-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

export default function DesignerResponse({ audit, onSave }) {
  const issues = audit.issues || [];

  const [responses, setResponses] = useState(
    audit.responses?.length > 0
      ? audit.responses
      : issues.map((issue) => ({
          issueTitle: issue.title,
          severity: issue.severity,
          accepted: null,
          justification: "",
        }))
  );

  function updateResponse(idx, field, value) {
    setResponses(responses.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function handleSave() {
    onSave({ responses });
  }

  const acceptedCount = responses.filter((r) => r.accepted === true).length;
  const rejectedCount = responses.filter((r) => r.accepted === false).length;
  const pendingCount = responses.filter((r) => r.accepted === null).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-6 h-6 text-indigo-600" />
          Designer Response
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          The road designer reviews each issue and provides an accept/reject decision with justification.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{acceptedCount}</p>
          <p className="text-xs text-slate-500">Accepted</p>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-3 text-center">
          <p className="text-xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-xs text-slate-500">Rejected</p>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
          <p className="text-xl font-bold text-slate-600">{pendingCount}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
      </div>

      {responses.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-slate-500">No issues to respond to. Go back and add safety issues first.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {responses.map((resp, idx) => (
            <Card key={idx} className="!p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-800">{resp.issueTitle}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${SEVERITY_COLORS[resp.severity]}`}>
                    {resp.severity}
                  </span>
                </div>
              </div>

              {/* Accept / Reject buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => updateResponse(idx, "accepted", true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    resp.accepted === true
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <CheckIcon className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => updateResponse(idx, "accepted", false)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    resp.accepted === false
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <XMarkIcon className="w-4 h-4" /> Reject
                </button>
              </div>

              <textarea
                rows={2}
                value={resp.justification}
                onChange={(e) => updateResponse(idx, "justification", e.target.value)}
                placeholder="Provide justification for the decision..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </Card>
          ))}
        </div>
      )}

      <Button onClick={handleSave}>Save Responses & Continue</Button>
    </div>
  );
}
