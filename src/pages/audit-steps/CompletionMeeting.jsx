import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { FlagIcon } from "@heroicons/react/24/outline";

export default function CompletionMeeting({ audit, onSave }) {
  const saved = audit.meetingNotes?.completion || {};
  const [notes, setNotes] = useState(saved.notes || "");
  const [date, setDate] = useState(saved.date || "");

  function handleSave() {
    onSave({
      meetingNotes: {
        ...audit.meetingNotes,
        completion: { notes, date, completed: true },
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FlagIcon className="w-6 h-6 text-indigo-600" />
          Completion Meeting
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Final review meeting to present audit findings and recommendations to the client.
        </p>
      </div>

      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Meeting Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Meeting Notes & Outcomes
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summarize discussions, client feedback, agreed next steps, deadlines for designer response..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Summary stats from audit */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Audit Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Issues Found:</span>{" "}
                <span className="font-semibold">{audit.issues?.length || 0}</span>
              </div>
              <div>
                <span className="text-slate-500">High Risk:</span>{" "}
                <span className="font-semibold text-red-600">
                  {audit.issues?.filter((i) => i.severity === "High").length || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Coverage:</span>{" "}
                <span className="font-semibold">{(audit.inspection?.coverage || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {saved.completed && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Previously completed
            </div>
          )}
        </div>
      </Card>

      <Button onClick={handleSave}>Mark Complete & Continue</Button>
    </div>
  );
}
