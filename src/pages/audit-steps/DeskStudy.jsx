import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { BookOpenIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const CHECKLIST_ITEMS = [
  { key: "geometry", label: "Road Geometry", desc: "Horizontal/vertical alignment, cross-section, sight distance" },
  { key: "junctions", label: "Junctions & Intersections", desc: "Type, layout, turning movements, signal phasing" },
  { key: "alignment", label: "Road Alignment", desc: "Curves, gradients, superelevation compliance" },
  { key: "signage", label: "Signs & Markings", desc: "Regulatory, warning, guide signs, road markings" },
  { key: "drainage", label: "Drainage & Shoulders", desc: "Surface drainage, shoulder width and condition" },
];

export default function DeskStudy({ audit, onSave }) {
  const [checks, setChecks] = useState(audit.deskStudy || {});

  function toggle(key) {
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  }

  function handleSave() {
    onSave({ deskStudy: checks });
  }

  const completedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpenIcon className="w-6 h-6 text-indigo-600" />
          Desk Study
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review design documents and mark each category as checked.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-slate-600">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <Card key={item.key} className="!p-4">
            <label className="flex items-start gap-4 cursor-pointer">
              <button
                onClick={() => toggle(item.key)}
                className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  checks[item.key]
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                {checks[item.key] && <CheckCircleIcon className="w-4 h-4 text-white" />}
              </button>
              <div>
                <p className={`font-medium ${checks[item.key] ? "text-emerald-700" : "text-slate-800"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </label>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave}>Save & Continue</Button>
    </div>
  );
}
