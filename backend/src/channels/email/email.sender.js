const axios = require("axios");
const emailService = require("./email.service");
const { decryptToken } = require("../../utils/tokenEncryption");

const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function encodeBase64Url(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizeSubject(subject) {
  if (!subject) {
    return "Re: (No subject)";
  }

  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

function buildRawEmail({ to, subject, body, messageId, inReplyTo, references }) {
  const referenceHeader = references || inReplyTo || messageId;

  const lines = [
    `To: ${to}`,
    `Subject: ${normalizeSubject(subject)}`,
    "Content-Type: text/plain; charset=UTF-8",
    "MIME-Version: 1.0",
  ];

  if (messageId) {
    lines.push(`In-Reply-To: ${messageId}`);
  }

  if (referenceHeader) {
    lines.push(`References: ${referenceHeader}`);
  }

  lines.push("", body);

  return encodeBase64Url(lines.join("\r\n"));
}

class EmailSender {
  async sendReply({ integration, to, subject, body, threadId, messageId, inReplyTo, references }) {
    const activeIntegration = await emailService.ensureValidToken(integration);
    const accessToken = decryptToken(activeIntegration.access_token);
    const raw = buildRawEmail({
      to,
      subject,
      body,
      messageId,
      inReplyTo,
      references,
    });

    const response = await axios.post(
      GMAIL_SEND_URL,
      {
        raw,
        threadId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    return response.data;
  }
}

module.exports = new EmailSender();
module.exports.buildRawEmail = buildRawEmail;
