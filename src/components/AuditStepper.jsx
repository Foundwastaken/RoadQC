import { AUDIT_STEPS } from "../lib/auditSteps";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function AuditStepper({ currentStep, onStepClick }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      {/* Desktop stepper */}
      <div className="hidden lg:flex items-center justify-between min-w-[900px]">
        {AUDIT_STEPS.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => onStepClick(idx)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400"
                  }`}
                >
                  {done ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium text-center leading-tight max-w-[80px] ${
                    active ? "text-indigo-700" : done ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < AUDIT_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mt-[-18px] rounded-full transition-colors ${
                    idx < currentStep ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper — compact horizontal scroll */}
      <div className="lg:hidden flex items-center gap-1 min-w-max px-1">
        {AUDIT_STEPS.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <button
              key={step.key}
              onClick={() => onStepClick(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : done
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? (
                <CheckIcon className="w-3.5 h-3.5" />
              ) : (
                <step.icon className="w-3.5 h-3.5" />
              )}
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
