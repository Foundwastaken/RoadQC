import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

const CONFIG = {
  Created:            { icon: ClockIcon,              classes: "bg-slate-100 text-slate-600" },
  Assigned:           { icon: ClockIcon,              classes: "bg-blue-100 text-blue-700" },
  "In Progress":      { icon: ArrowPathIcon,          classes: "bg-amber-100 text-amber-700" },
  "Report Submitted": { icon: DocumentCheckIcon,      classes: "bg-indigo-100 text-indigo-700" },
  "Under Review":     { icon: EyeIcon,                classes: "bg-purple-100 text-purple-700" },
  Approved:           { icon: CheckCircleIcon,         classes: "bg-emerald-100 text-emerald-700" },
  Rejected:           { icon: XCircleIcon,             classes: "bg-red-100 text-red-700" },
  Implementation:     { icon: WrenchScrewdriverIcon,   classes: "bg-orange-100 text-orange-700" },
  Closed:             { icon: LockClosedIcon,          classes: "bg-slate-200 text-slate-700" },
  Valid:              { icon: CheckCircleIcon,          classes: "bg-emerald-100 text-emerald-700" },
  Completed:          { icon: CheckCircleIcon,          classes: "bg-emerald-100 text-emerald-700" },
  Incomplete:         { icon: XCircleIcon,             classes: "bg-red-100 text-red-700" },
  Pending:            { icon: ClockIcon,              classes: "bg-slate-100 text-slate-600" },
  "Not Started":      { icon: ClockIcon,              classes: "bg-slate-100 text-slate-600" },
};

export default function StatusBadge({ status, size = "sm" }) {
  const { icon: Icon, classes } = CONFIG[status] || CONFIG.Pending;
  const sizeClasses = size === "xs"
    ? "px-2 py-0.5 text-[10px] gap-1"
    : "px-3 py-1 text-xs gap-1.5";
  const iconSize = size === "xs" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold ${classes}`}>
      <Icon className={iconSize} />
      {status}
    </span>
  );
}
