import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { UserPlusIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const ROLES = ["Lead Auditor", "Auditor", "Observer", "Traffic Engineer", "Road Engineer"];

export default function TeamSelection({ audit, onSave }) {
  const [team, setTeam] = useState(audit.team?.length > 0 ? audit.team : [{ name: "", role: ROLES[0] }]);

  function addMember() {
    setTeam([...team, { name: "", role: ROLES[0] }]);
  }

  function removeMember(idx) {
    setTeam(team.filter((_, i) => i !== idx));
  }

  function updateMember(idx, field, value) {
    setTeam(team.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  }

  function handleSave() {
    const valid = team.filter((m) => m.name.trim());
    if (valid.length === 0) return;
    onSave({ team: valid });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <UserGroupIcon className="w-6 h-6 text-indigo-600" />
          Audit Team Selection
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Add team members who will participate in this road safety audit.
        </p>
      </div>

      <div className="space-y-3">
        {team.map((member, idx) => (
          <Card key={idx} className="!p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(idx, "name", e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <select
                  value={member.role}
                  onChange={(e) => updateMember(idx, "role", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {team.length > 1 && (
                <button
                  onClick={() => removeMember(idx)}
                  className="self-end p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={addMember}>
          <UserPlusIcon className="w-4 h-4" />
          Add Member
        </Button>
        <Button onClick={handleSave}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
