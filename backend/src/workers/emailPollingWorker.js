const env = require("../config/env");
const { processMessage } = require("../core/messageProcessor");
const emailService = require("../channels/email/email.service");
const emailParser = require("../channels/email/email.parser");
const emailSender = require("../channels/email/email.sender");
const EmailIntegration = require("../models/EmailIntegration");
const Message = require("../models/Message");

const DEFAULT_REPLY_ERROR = "I could not generate a reply right now.";

class EmailPollingWorker {
  constructor(pollInterval = env.EMAIL_POLLING_INTERVAL || 60000) {
    this.pollInterval = pollInterval;
    this.timer = null;
    this.isRunning = false;
  }

  start() {
    if (this.timer) {
      return;
    }

    console.log(`[EmailWorker] Started with interval ${this.pollInterval}ms`);

    this.poll().catch((error) => {
      console.error(`[EmailWorker] Initial poll failed: ${error.message}`);
    });

    this.timer = setInterval(() => {
      this.poll().catch((error) => {
        console.error(`[EmailWorker] Poll failed: ${error.message}`);
      });
    }, this.pollInterval);
  }

  async poll() {
    if (this.isRunning) {
      console.log("[EmailWorker] Previous poll still running, skipping cycle");
      return;
    }

    this.isRunning = true;

    try {
      const integrations = await EmailIntegration.find({
        isActive: true,
      });

      for (const integration of integrations) {
        await this.processIntegration(integration);
      }
    } finally {
      this.isRunning = false;
    }
  }

  async processIntegration(integration) {
    const startedAt = new Date();

    try {
      const afterDate =
        integration.lastCheckedAt || new Date(Date.now() - this.pollInterval);

      const messages = await emailService.listUnreadMessages(integration, afterDate);

      for (const message of messages) {
        await this.processEmail(integration, message.id);
      }

      await EmailIntegration.updateOne(
        { _id: integration._id },
        {
          $set: {
            lastCheckedAt: startedAt,
          },
        },
      );
    } catch (error) {
      console.error(
        `[EmailWorker] Integration processing failed for ${integration.email}: ${error.message}`,
      );
    }
  }

  async processEmail(integration, gmailMessageId) {
    try {
      const existingMessage = await Message.findOne({
        "metadata.gmailMessageId": gmailMessageId,
      });

      if (existingMessage) {
        await emailService.markAsRead(integration, gmailMessageId);
        return;
      }

      const gmailMessage = await emailService.getMessage(integration, gmailMessageId);
      const parsedEmail = emailParser.parseEmail(gmailMessage);
      const senderEmail = parsedEmail.senderEmail;

      console.log(`[EmailWorker] Processing: ${senderEmail}`);

      if (
        !senderEmail ||
        senderEmail.toLowerCase() === String(integration.email).toLowerCase()
      ) {
        await emailService.markAsRead(integration, gmailMessageId);
        return;
      }

      if (!parsedEmail.body) {
        await emailService.markAsRead(integration, gmailMessageId);
        return;
      }

      const customerId = `email-${integration.agentId}-${senderEmail}-${parsedEmail.threadId}`;

      const result = await processMessage({
        agentId: integration.agentId,
        customerId,
        message: parsedEmail.body,
        channel: "email",
        businessId: integration.businessId,
        metadata: {
          source: "user",
          gmailMessageId,
          gmailThreadId: parsedEmail.threadId,
          emailMessageId: parsedEmail.messageId,
          from: parsedEmail.from,
          subject: parsedEmail.subject,
          inReplyTo: parsedEmail.inReplyTo,
          references: parsedEmail.references,
        },
      });

      const hasUsableReply =
        Boolean(result.reply) && result.reply !== DEFAULT_REPLY_ERROR;
      const replyBody =
        hasUsableReply && integration.autoReply
          ? result.reply
          : integration.fallbackMessage;

      if (!replyBody) {
        throw new Error("Fallback message is required but missing");
      }

      await emailSender.sendReply({
        integration,
        to: senderEmail,
        subject: parsedEmail.subject,
        body: replyBody,
        threadId: parsedEmail.threadId,
        messageId: parsedEmail.messageId,
        inReplyTo: parsedEmail.inReplyTo,
        references: parsedEmail.references,
      });

      await emailService.markAsRead(integration, gmailMessageId);
    } catch (error) {
      console.error(
        `[EmailWorker] Failed to process Gmail message ${gmailMessageId}: ${error.message}`,
      );
    }
  }
}

module.exports = EmailPollingWorker;
