import {
  UserGroupIcon,
  DocumentArrowUpIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export const AUDIT_STEPS = [
  { key: "team", label: "Team Selection", icon: UserGroupIcon },
  { key: "background", label: "Background Data", icon: DocumentArrowUpIcon },
  { key: "commencement", label: "Commencement Meeting", icon: ChatBubbleLeftRightIcon },
  { key: "deskStudy", label: "Desk Study", icon: BookOpenIcon },
  { key: "siteInspection", label: "Site Inspection", icon: MapPinIcon },
  { key: "issues", label: "Safety Issues", icon: ExclamationTriangleIcon },
  { key: "report", label: "Audit Report", icon: DocumentTextIcon },
  { key: "completion", label: "Completion Meeting", icon: FlagIcon },
  { key: "response", label: "Designer Response", icon: ChatBubbleLeftIcon },
  { key: "implementation", label: "Implementation", icon: CheckBadgeIcon },
];

export const AUDIT_STATUSES = [
  "Created",
  "Assigned",
  "In Progress",
  "Report Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Implementation",
  "Closed",
];

export function createBlankAudit({ roadName, location, length, createdBy, assignedAuditor, assignedDesigner, auditorPhone, designerPhone }) {
  return {
    roadName,
    location,
    length: parseFloat(length) || 5,
    status: assignedAuditor ? "Assigned" : "Created",
    assignedAuditor: assignedAuditor || "",
    assignedDesigner: assignedDesigner || "",
    auditorPhone: auditorPhone || "",
    designerPhone: designerPhone || "",
    roadStart: null,
    roadEnd: null,
    team: [],
    backgroundData: { trafficData: "", accidentData: "", notes: "" },
    meetingNotes: { commencement: { notes: "", date: "" }, completion: { notes: "", date: "" } },
    deskStudy: { geometry: false, junctions: false, alignment: false, signage: false, drainage: false },
    inspection: { distance: 0, coverage: 0, status: "Pending", imageUrl: "", imageUrls: [], path: [], dayNight: "day" },
    issues: [],
    report: {},
    responses: [],
    implementation: [],
    currentStep: 0,
    createdBy,
    timestamp: Date.now(),
  };
}
