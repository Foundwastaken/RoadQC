import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import AuditStepper from "../components/AuditStepper";
import { AUDIT_STEPS } from "../lib/auditSteps";

import TeamSelection from "./audit-steps/TeamSelection";
import BackgroundData from "./audit-steps/BackgroundData";
import CommencementMeeting from "./audit-steps/CommencementMeeting";
import DeskStudy from "./audit-steps/DeskStudy";
import SiteInspection from "./audit-steps/SiteInspection";
import SafetyIssues from "./audit-steps/SafetyIssues";
import AuditReport from "./audit-steps/AuditReport";
import CompletionMeeting from "./audit-steps/CompletionMeeting";
import DesignerResponse from "./audit-steps/DesignerResponse";
import ImplementationStatus from "./audit-steps/ImplementationStatus";

const STEP_COMPONENTS = [
  TeamSelection,
  BackgroundData,
  CommencementMeeting,
  DeskStudy,
  SiteInspection,
  SafetyIssues,
  AuditReport,
  CompletionMeeting,
  DesignerResponse,
  ImplementationStatus,
];

const LOCKED_STATUSES = ["Report Submitted", "Under Review", "Approved", "Implementation", "Closed"];

export default function AuditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [audit, setAudit] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const isLocked = audit && LOCKED_STATUSES.includes(audit.status);
  const homeRoute = role === "admin" ? "/admin" : "/dashboard";

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "audits", id));
        if (!snap.exists()) { navigate(homeRoute); return; }
        const data = { id: snap.id, ...snap.data() };
        setAudit(data);
        setActiveStep(data.currentStep || 0);
      } catch {
        navigate(homeRoute);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate, homeRoute]);

  async function handleStepSave(partialUpdate) {
    if (isLocked) return;
    setSaving(true);
    try {
      const nextStep = Math.min(activeStep + 1, AUDIT_STEPS.length - 1);
      const highestStep = Math.max(audit.currentStep || 0, nextStep);

      const statusUpdate = {};
      if (audit.status === "Assigned" || audit.status === "Created") {
        statusUpdate.status = "In Progress";
      }

      const updates = { ...partialUpdate, currentStep: highestStep, ...statusUpdate };
      await updateDoc(doc(db, "audits", id), updates);

      setAudit((prev) => ({ ...prev, ...updates }));
      setActiveStep(nextStep);

      setToast("Saved successfully!");
      setTimeout(() => setToast(""), 2500);

      if (activeStep === AUDIT_STEPS.length - 1) {
        setTimeout(() => navigate(homeRoute), 1500);
      }
    } catch (err) {
      console.error("Save error:", err);
      setToast(`Error: ${err.message}`);
      setTimeout(() => setToast(""), 5000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitReport() {
    setSaving(true);
    try {
      await updateDoc(doc(db, "audits", id), { status: "Report Submitted" });
      setAudit((prev) => ({ ...prev, status: "Report Submitted" }));
      console.log("Admin notified: Report submitted for", audit.roadName);
      setToast("Report submitted! Audit is now locked for review.");
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setToast(`Error: ${err.message}`);
      setTimeout(() => setToast(""), 5000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  const StepComponent = STEP_COMPONENTS[activeStep];
  const canSubmit = !isLocked && audit.status === "In Progress" && (audit.currentStep || 0) >= 6;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{audit.roadName}</h1>
          <StatusBadge status={audit.status || "Created"} />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {audit.location} &middot; {audit.length} km
        </p>
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl flex items-center gap-2">
          <span className="font-semibold">Read-only:</span>
          This audit has been submitted and is currently "{audit.status}". Editing is locked.
        </div>
      )}

      {/* Submit Report button */}
      {canSubmit && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-800">Ready to submit?</p>
            <p className="text-xs text-indigo-600">Submitting will lock the audit for admin review.</p>
          </div>
          <Button onClick={handleSubmitReport} loading={saving}>
            Submit Report
          </Button>
        </div>
      )}

      {/* Stepper */}
      <Card className="mb-6 !p-4">
        <AuditStepper
          currentStep={activeStep}
          onStepClick={(idx) => {
            if (idx <= (audit.currentStep || 0)) setActiveStep(idx);
          }}
        />
      </Card>

      {/* Active step content */}
      <div className="relative">
        {saving && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        {isLocked ? (
          <Card className="py-8 text-center">
            <p className="text-slate-500">This audit is locked ({audit.status}). You can view steps above but cannot edit.</p>
          </Card>
        ) : (
          <StepComponent audit={audit} onSave={handleStepSave} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.startsWith("Error") ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
