import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function CommencementMeeting({ audit, onSave }) {
  const saved = audit.meetingNotes?.commencement || {};
  const [notes, setNotes] = useState(saved.notes || "");
  const [date, setDate] = useState(saved.date || "");

  function handleSave() {
    onSave({
      meetingNotes: {
        ...audit.meetingNotes,
        commencement: { notes, date, completed: true },
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
          Commencement Meeting
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Record the kick-off meeting between the audit team and project stakeholders.
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
              Meeting Notes
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discuss audit scope, objectives, road sections to cover, timelines, special concerns..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
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
