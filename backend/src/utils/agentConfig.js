const ALLOWED_TONES = new Set(["formal", "friendly", "professional"]);
const ALLOWED_RESPONSE_LENGTHS = new Set(["short", "medium", "detailed"]);

// FIX: Define valid channels so we can normalize safely
const ALLOWED_CHANNELS = new Set(["web", "chatbot", "whatsapp", "email"]);

function parseLegacyInstructions(value) {
  if (typeof value !== "string") {
    return {};
  }

  const toneMatch = value.match(/Tone:\s*([a-zA-Z]+)/i);
  const responseLengthMatch = value.match(/Response Length:\s*([a-zA-Z]+)/i);

  const tone = toneMatch?.[1]?.toLowerCase();
  const responseLength = responseLengthMatch?.[1]?.toLowerCase();

  return normalizeInstructions({ tone, responseLength });
}

function normalizeInstructions(value) {
  if (typeof value === "string") {
    return parseLegacyInstructions(value);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized = {};
  const tone =
    typeof value.tone === "string" ? value.tone.toLowerCase().trim() : "";
  const responseLength =
    typeof value.responseLength === "string"
      ? value.responseLength.toLowerCase().trim()
      : "";

  if (ALLOWED_TONES.has(tone)) normalized.tone = tone;
  if (ALLOWED_RESPONSE_LENGTHS.has(responseLength))
    normalized.responseLength = responseLength;

  return normalized;
}

function normalizeAgent(agent = {}) {
  const baseAgent =
    agent && typeof agent.toObject === "function"
      ? agent.toObject()
      : { ...agent };
  const instructions = normalizeInstructions(baseAgent.instructions);

  return {
    ...baseAgent,
    _id: baseAgent._id || agent?._id || agent?.id,
    instructions,
  };
}

// FIX: Accept an optional activeChannel parameter.
//
// WHY: The agent DB schema stores `channels` as an array (for multi-channel
// deployment) but the runtime already knows WHICH channel the current
// conversation is on — it's passed into executeAgentChat() as `channel`.
// We use that runtime value as the source of truth.
// If not provided, fall back to the first entry in the agent's channels
// array, then to "chatbot" as a safe default.
//
// This value is what kb_engine.py uses to decide whether to allow
// generative tasks (e.g. email drafting on the email channel).

function buildAgentConfig(agent = {}, activeChannel = null) {
  const normalizedAgent = normalizeAgent(agent);
  // Do not read agent.channels — that field stores scrape source URLs
  // in existing documents, not deployment channel types.
  // Channel is always sourced from the runtime request (activeChannel).
  const rawChannel = activeChannel || "chatbot";

  const channel = ALLOWED_CHANNELS.has(rawChannel.toLowerCase().trim())
    ? rawChannel.toLowerCase().trim()
    : "chatbot";

  return {
    agent_id:
      normalizedAgent._id?.toString?.() ||
      normalizedAgent._id ||
      normalizedAgent.agent_id,
    type: "knowledge_based",
    name: normalizedAgent.name || "",
    description: normalizedAgent.description || "",
    purpose: normalizedAgent.purpose || "",
    instructions: normalizedAgent.instructions,
    memory_window: normalizedAgent.memoryWindow || 5,
    channel, // FIX: now included — consumed by kb_engine.py
  };
}

module.exports = {
  ALLOWED_CHANNELS,
  ALLOWED_RESPONSE_LENGTHS,
  ALLOWED_TONES,
  buildAgentConfig,
  normalizeAgent,
  normalizeInstructions,
  parseLegacyInstructions,
};

