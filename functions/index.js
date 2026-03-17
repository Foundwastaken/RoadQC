const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioPhone = defineString("TWILIO_PHONE_NUMBER");

/**
 * Sends SMS notifications when a new audit is created.
 * Reads auditorPhone and designerPhone from the audit document.
 */
exports.sendSmsOnAuditCreate = onDocumentCreated("audits/{auditId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const twilio = require("twilio");
  const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());
  const fromNumber = twilioPhone.value();

  const message = [
    "New Road Safety Audit Assigned",
    "",
    `Road: ${data.roadName || "N/A"}`,
    `Location: ${data.location || "N/A"}`,
    `Status: ${data.status || "Created"}`,
    "",
    "Login to the system for details.",
  ].join("\n");

  const results = [];

  if (data.auditorPhone) {
    try {
      await client.messages.create({
        body: `[Auditor] ${message}`,
        from: fromNumber,
        to: data.auditorPhone,
      });
      results.push(`SMS sent to auditor: ${data.auditorPhone}`);
    } catch (err) {
      results.push(`SMS to auditor failed: ${err.message}`);
    }
  }

  if (data.designerPhone) {
    try {
      await client.messages.create({
        body: `[Designer] ${message}`,
        from: fromNumber,
        to: data.designerPhone,
      });
      results.push(`SMS sent to designer: ${data.designerPhone}`);
    } catch (err) {
      results.push(`SMS to designer failed: ${err.message}`);
    }
  }

  if (results.length > 0) {
    console.log("SMS results:", results.join(" | "));
  } else {
    console.log("No phone numbers provided, skipping SMS");
  }
});

/**
 * Sends SMS when an audit status changes (e.g., report submitted, approved).
 * Triggered on audit document updates.
 */
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

exports.sendSmsOnStatusChange = onDocumentUpdated("audits/{auditId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;
  if (before.status === after.status) return;

  const twilio = require("twilio");
  const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());
  const fromNumber = twilioPhone.value();

  const statusMessage = [
    "Road Safety Audit Status Update",
    "",
    `Road: ${after.roadName || "N/A"}`,
    `Status: ${before.status} -> ${after.status}`,
    "",
    "Login to the system for details.",
  ].join("\n");

  const recipients = [];
  if (after.auditorPhone) recipients.push({ phone: after.auditorPhone, role: "Auditor" });
  if (after.designerPhone) recipients.push({ phone: after.designerPhone, role: "Designer" });

  for (const r of recipients) {
    try {
      await client.messages.create({
        body: `[${r.role}] ${statusMessage}`,
        from: fromNumber,
        to: r.phone,
      });
      console.log(`Status SMS sent to ${r.role}: ${r.phone}`);
    } catch (err) {
      console.error(`Status SMS to ${r.role} failed:`, err.message);
    }
  }
});
