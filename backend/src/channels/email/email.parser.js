const { convert } = require("html-to-text");

function getHeader(headers, name) {
  return headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function decodeBase64Url(value) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function extractPart(parts, mimeType) {
  for (const part of parts || []) {
    if (part.mimeType === mimeType && part.body?.data) {
      return part.body.data;
    }

    if (part.parts?.length) {
      const nested = extractPart(part.parts, mimeType);

      if (nested) {
        return nested;
      }
    }
  }

  return "";
}

function cleanEmailBody(text) {
  if (!text) {
    return "";
  }

  let body = text.replace(/\r\n/g, "\n");
  body = body.replace(/\n>.*(\n>.*)*/g, "");
  body = body.replace(/On .*wrote:\n[\s\S]*$/i, "");
  body = body.replace(/From: .*[\s\S]*$/i, "");
  body = body.split("\n-- \n")[0];
  body = body.replace(/\n{3,}/g, "\n\n").trim();
  body = body.slice(0, 5000);

  return body;
}

function extractPlainText(payload) {
  if (!payload) {
    return "";
  }

  const plainTextData =
    payload.mimeType === "text/plain"
      ? payload.body?.data
      : extractPart(payload.parts, "text/plain");

  if (plainTextData) {
    return decodeBase64Url(plainTextData);
  }

  const htmlData =
    payload.mimeType === "text/html"
      ? payload.body?.data
      : extractPart(payload.parts, "text/html");

  if (htmlData) {
    return convert(decodeBase64Url(htmlData), {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "img", format: "skip" },
      ],
    });
  }

  return decodeBase64Url(payload.body?.data || "");
}

function extractSenderEmail(fromHeader) {
  const match = fromHeader.match(/<([^>]+)>/);
  return (match ? match[1] : fromHeader).trim().toLowerCase();
}

function  parseEmail(message) {
  const headers = message.payload?.headers || [];
  const from = getHeader(headers, "From");
  const subject = getHeader(headers, "Subject") || "(No subject)";
  const messageId = getHeader(headers, "Message-ID");
  const inReplyTo = getHeader(headers, "In-Reply-To");
  const references = getHeader(headers, "References");

  let body = extractPlainText(message.payload);
  body = cleanEmailBody(body);

  return {
    from,
    senderEmail: extractSenderEmail(from),
    subject,
    body,
    threadId: message.threadId,
    messageId,
    inReplyTo,
    references,
    gmailMessageId: message.id,
  };
}

module.exports = {
  cleanEmailBody,
  decodeBase64Url,
  extractPlainText,
  extractSenderEmail,
  parseEmail,
};
