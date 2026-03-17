import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

export default function BackgroundData({ audit, onSave }) {
  const [data, setData] = useState({
    trafficData: audit.backgroundData?.trafficData || "",
    accidentData: audit.backgroundData?.accidentData || "",
    notes: audit.backgroundData?.notes || "",
  });

  function update(field, value) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function handleSave() {
    onSave({ backgroundData: data });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <DocumentArrowUpIcon className="w-6 h-6 text-indigo-600" />
          Background Data Upload
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide existing traffic, accident, and contextual data for the road being audited.
        </p>
      </div>

      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Traffic Data
            </label>
            <textarea
              rows={3}
              value={data.trafficData}
              onChange={(e) => update("trafficData", e.target.value)}
              placeholder="e.g., Average Daily Traffic (ADT): 12,000 vehicles/day, Peak hour flow: 1,200 veh/hr..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Accident Data
            </label>
            <textarea
              rows={3}
              value={data.accidentData}
              onChange={(e) => update("accidentData", e.target.value)}
              placeholder="e.g., 15 accidents in last 3 years, 3 fatalities, mostly at junction km 2.5..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={data.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any other relevant information, design documents, or references..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave}>Save & Continue</Button>
    </div>
  );
}
