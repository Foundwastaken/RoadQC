import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

const DESK_STUDY_LABELS = {
  geometry: "Road Geometry",
  junctions: "Junctions & Intersections",
  alignment: "Road Alignment",
  signage: "Signs & Markings",
  drainage: "Drainage & Shoulders",
};

function formatDate(ts) {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleDateString("en-US", { dateStyle: "long" });
}

/**
 * Generates and downloads a full Road Safety Audit PDF report.
 * Can be called from any page — just pass the full audit object.
 */
export default function generateAuditPDF(audit) {
  try {
  const issues = audit.issues || [];
  const inspection = audit.inspection || {};
  const deskStudy = audit.deskStudy || {};
  const team = audit.team || [];
  const bg = audit.backgroundData || {};
  const commencement = audit.meetingNotes?.commencement || {};
  const responses = audit.responses || [];
  const implementation = audit.implementation || [];

  const highCount = issues.filter((i) => i.severity === "High").length;
  const medCount = issues.filter((i) => i.severity === "Medium").length;
  const lowCount = issues.filter((i) => i.severity === "Low").length;
  const deskChecked = Object.values(deskStudy).filter(Boolean).length;
  const deskTotal = Object.keys(deskStudy).length || 1;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const colors = {
    primary: [67, 56, 202],
    dark: [30, 41, 59],
    medium: [100, 116, 139],
    light: [241, 245, 249],
    white: [255, 255, 255],
    red: [220, 38, 38],
    amber: [217, 119, 6],
    green: [22, 163, 74],
    blue: [37, 99, 235],
  };

  function addPage() {
    doc.addPage();
    y = margin;
  }

  function checkSpace(needed) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) addPage();
  }

  // --- COVER HEADER ---
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageW, 55, "F");

  doc.setTextColor(...colors.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ROAD SAFETY AUDIT REPORT", pageW / 2, 22, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text(audit.roadName || "Untitled Road", pageW / 2, 33, { align: "center" });

  doc.setFontSize(10);
  const subtitle = [audit.location, `${audit.length} km`].filter(Boolean).join("  •  ");
  doc.text(subtitle, pageW / 2, 42, { align: "center" });

  doc.setFontSize(9);
  doc.text(`Generated: ${formatDate(Date.now())}`, pageW / 2, 50, { align: "center" });

  y = 65;

  // --- 1. AUDIT INFORMATION ---
  doc.setTextColor(...colors.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. Audit Information", margin, y);
  y += 8;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: colors.dark },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    head: [["Field", "Details"]],
    body: [
      ["Road Name", audit.roadName || "N/A"],
      ["Location", audit.location || "N/A"],
      ["Road Length", `${audit.length} km`],
      ["Audit Created By", audit.createdBy || "N/A"],
      ["Audit Date", formatDate(audit.timestamp)],
      ["Commencement Meeting", commencement.date || "N/A"],
      ["Inspection Type", (inspection.dayNight || "day").charAt(0).toUpperCase() + (inspection.dayNight || "day").slice(1) + " Inspection"],
    ],
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- 2. AUDIT TEAM ---
  checkSpace(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. Audit Team", margin, y);
  y += 8;

  if (team.length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: colors.dark },
      head: [["#", "Name", "Role"]],
      body: team.map((m, i) => [i + 1, m.name, m.role]),
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...colors.medium);
    doc.text("No team members recorded.", margin, y);
    y += 8;
  }

  // --- 3. BACKGROUND DATA ---
  checkSpace(40);
  doc.setTextColor(...colors.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. Background Data", margin, y);
  y += 8;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: colors.dark, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    head: [["Category", "Data"]],
    body: [
      ["Traffic Data", bg.trafficData || "Not provided"],
      ["Accident Data", bg.accidentData || "Not provided"],
      ["Additional Notes", bg.notes || "Not provided"],
    ],
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- 4. DESK STUDY ---
  checkSpace(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("4. Desk Study Review", margin, y);
  y += 8;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: colors.dark },
    head: [["Design Element", "Status"]],
    body: Object.entries(DESK_STUDY_LABELS).map(([key, label]) => [
      label,
      deskStudy[key] ? "Checked" : "Not Checked",
    ]),
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === "Checked" ? colors.green : colors.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = doc.lastAutoTable.finalY + 5;

  doc.setFontSize(9);
  doc.setTextColor(...colors.medium);
  doc.text(`Completion: ${deskChecked}/${deskTotal} items checked (${Math.round((deskChecked / deskTotal) * 100)}%)`, margin, y + 5);
  y += 12;

  // --- 5. SITE INSPECTION ---
  checkSpace(40);
  doc.setTextColor(...colors.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("5. Site Inspection Summary", margin, y);
  y += 8;

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: colors.dark },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    head: [["Parameter", "Value"]],
    body: [
      ["Distance Covered", `${(inspection.distance || 0).toFixed(3)} km`],
      ["Road Coverage", `${(inspection.coverage || 0).toFixed(1)}%`],
      ["Coverage Status", inspection.status || "Pending"],
      ["Inspection Time", (inspection.dayNight || "N/A").charAt(0).toUpperCase() + (inspection.dayNight || "").slice(1)],
      ["GPS Points Recorded", String(inspection.path?.length || 0)],
      ["Images Captured", String(inspection.imageUrls?.length || (inspection.imageUrl ? 1 : 0))],
    ],
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 2 && data.column.index === 1) {
        data.cell.styles.textColor = inspection.status === "Valid" ? colors.green : colors.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- 5b. INSPECTION IMAGES ---
  const allImages = inspection.imageUrls || (inspection.imageUrl ? [inspection.imageUrl] : []);
  if (allImages.length > 0) {
    checkSpace(50);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text("Site Inspection Photos", margin, y);
    y += 6;

    const imgW = (contentW - 6) / 2; // two columns with 6mm gap
    const imgH = imgW * 0.65;

    for (let i = 0; i < allImages.length; i++) {
      const col = i % 2;
      if (col === 0) checkSpace(imgH + 12);

      const x = margin + col * (imgW + 6);

      try {
        doc.addImage(allImages[i], "JPEG", x, y, imgW, imgH);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(x, y, imgW, imgH, "S");

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.medium);
        doc.text(`Photo ${i + 1}`, x + 1, y + imgH + 3.5);
      } catch (_) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.medium);
        doc.text(`[Photo ${i + 1} - could not embed]`, x + 2, y + imgH / 2);
      }

      if (col === 1 || i === allImages.length - 1) {
        y += imgH + 8;
      }
    }
    y += 2;
  }

  // --- 6. SAFETY ISSUES ---
  checkSpace(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.dark);
  doc.text("6. Safety Issues Identified", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.medium);
  doc.text(`Total: ${issues.length}  |  High: ${highCount}  |  Medium: ${medCount}  |  Low: ${lowCount}`, margin, y);
  y += 6;

  if (issues.length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: colors.dark, cellPadding: 3 },
      head: [["#", "Issue", "Description", "Severity"]],
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 3: { cellWidth: 22, halign: "center" } },
      body: issues.map((issue, i) => [i + 1, issue.title, issue.description || "—", issue.severity]),
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          data.cell.styles.fontStyle = "bold";
          if (data.cell.raw === "High") data.cell.styles.textColor = colors.red;
          else if (data.cell.raw === "Medium") data.cell.styles.textColor = colors.amber;
          else data.cell.styles.textColor = colors.blue;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("No safety issues recorded.", margin, y);
    y += 10;
  }

  // --- 7. DESIGNER RESPONSES ---
  if (responses.length > 0) {
    checkSpace(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text("7. Designer Responses", margin, y);
    y += 8;

    const accepted = responses.filter((r) => r.accepted === true).length;
    const rejected = responses.filter((r) => r.accepted === false).length;
    const pending = responses.filter((r) => r.accepted === null).length;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.medium);
    doc.text(`Accepted: ${accepted}  |  Rejected: ${rejected}  |  Pending: ${pending}`, margin, y);
    y += 6;

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: colors.dark, cellPadding: 3 },
      head: [["Issue", "Decision", "Justification"]],
      columnStyles: { 1: { cellWidth: 25, halign: "center" } },
      body: responses.map((r) => [
        r.issueTitle,
        r.accepted === true ? "Accepted" : r.accepted === false ? "Rejected" : "Pending",
        r.justification || "—",
      ]),
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          data.cell.styles.fontStyle = "bold";
          if (data.cell.raw === "Accepted") data.cell.styles.textColor = colors.green;
          else if (data.cell.raw === "Rejected") data.cell.styles.textColor = colors.red;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- 8. IMPLEMENTATION STATUS ---
  if (implementation.length > 0) {
    checkSpace(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text("8. Implementation Status", margin, y);
    y += 8;

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: colors.dark, cellPadding: 3 },
      head: [["Issue", "Severity", "Status"]],
      columnStyles: { 1: { cellWidth: 22, halign: "center" }, 2: { cellWidth: 28, halign: "center" } },
      body: implementation.map((item) => [item.issueTitle, item.severity, item.status]),
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          data.cell.styles.fontStyle = "bold";
          if (data.cell.raw === "Completed") data.cell.styles.textColor = colors.green;
          else if (data.cell.raw === "In Progress") data.cell.styles.textColor = colors.amber;
        }
      },
    });
  }

  // --- FOOTER on every page ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...colors.medium);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Road Safety Audit Report — ${audit.roadName}  |  Page ${i} of ${totalPages}`,
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
  }

  const fileName = `Road_Safety_Audit_${(audit.roadName || "Report").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("PDF generation failed: " + err.message);
  }
}
