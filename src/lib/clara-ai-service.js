// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Multi-Provider AI Service
 * Supports: OpenAI, Google Gemini, Anthropic Claude,
 *           Meta Llama, Blackbox AI, GitHub Models, Groq, Together AI
 */

const DEFAULT_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
    chatEndpoint: "https://api.openai.com/v1/chat/completions",
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: true,
    supportsSystem: true,
  },
  gemini: {
    name: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash",
    chatEndpoint: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=__API_KEY__`,
    authHeader: () => ({}),
    buildBody: ({ messages }) => ({
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
    parseResponse: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
    supportsVision: true,
    supportsSystem: false,
  },
  anthropic: {
    name: "Anthropic Claude",
    models: [
      "claude-sonnet-5",
      "claude-opus-5",
      "claude-haiku-4-5",
      "claude-sonnet-4-6",
      "claude-sonnet-4-20250514",
    ],
    defaultModel: "claude-sonnet-5",
    chatEndpoint: "https://api.anthropic.com/v1/messages",
    authHeader: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    }),
    buildBody: ({ model, messages, systemPrompt }) => {
      const filtered = messages.filter((m) => m.role !== "system");
      const body = { model, messages: filtered, max_tokens: 1024, temperature: 0.7 };
      if (systemPrompt && filtered.length) body.system = systemPrompt;
      return body;
    },
    parseResponse: (data) => data?.content?.[0]?.text || "",
    supportsVision: true,
    supportsSystem: true,
  },
  groq: {
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"],
    defaultModel: "llama-3.3-70b-versatile",
    chatEndpoint: "https://api.groq.com/openai/v1/chat/completions",
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: false,
    supportsSystem: true,
  },
  together: {
    name: "Together AI",
    models: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct-Turbo"],
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    chatEndpoint: "https://api.together.xyz/v1/chat/completions",
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: false,
    supportsSystem: true,
  },
  blackbox: {
    name: "Blackbox AI",
    models: ["blackboxai/gpt-4o", "blackboxai/claude-sonnet-4"],
    defaultModel: "blackboxai/gpt-4o",
    chatEndpoint: "https://api.blackbox.ai/api/chat",
    authHeader: (key) => ({ Authorization: key ? `Bearer ${key}` : undefined }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || data?.text || "",
    supportsVision: false,
    supportsSystem: true,
  },
  github: {
    name: "GitHub Models",
    models: ["gpt-4o-mini", "llama-3.3-70b-versatile", "gemma-2-9b-it"],
    defaultModel: "gpt-4o-mini",
    chatEndpoint: (model) => `https://models.inference.ai.azure.com/chat/completions?api-version=2024-05-01-preview`,
    authHeader: (key) => ({ Authorization: `Bearer ${key}`, "Content-Type": "application/json" }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: false,
    supportsSystem: true,
  },
  mistral: {
    name: "Mistral",
    models: ["mistral-small-latest", "open-mistral-nemo", "codestral-latest"],
    defaultModel: "mistral-small-latest",
    chatEndpoint: "https://api.mistral.ai/v1/chat/completions",
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: true,
    supportsSystem: true,
  },
  deepseek: {
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    defaultModel: "deepseek-chat",
    chatEndpoint: "https://api.deepseek.com/v1/chat/completions",
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    buildBody: ({ model, messages }) => ({ model, messages, temperature: 0.7, max_tokens: 1024 }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content || "",
    supportsVision: false,
    supportsSystem: true,
  },
};

function getCustomProviders() {
  try {
    const { getDatabase } = require("./clara-database.js");
    const db = getDatabase();
    const data = db.get("aiCustomProviders");
    if (data && typeof data === "object") return data;
  } catch {}
  return {};
}

function resolveProviderKey(providerKey) {
  const custom = getCustomProviders();
  if (custom[providerKey]) return custom[providerKey];
  return DEFAULT_PROVIDERS[providerKey] || null;
}

function resolveProvider(providerKey, providerConfig) {
  const base = resolveProviderKey(providerKey);
  if (!base) return null;
  return { ...base, ...(providerConfig || {}) };
}

function normalizeMessages(messages, systemPrompt) {
  const out = [];
  if (systemPrompt) out.push({ role: "system", content: systemPrompt });
  for (const m of messages || []) {
    const role = ["user", "assistant"].includes(m.role) ? m.role : "user";
    out.push({ role, content: String(m.content || "") });
  }
  return out;
}

async function callAI({ providerKey = "openai", model, messages, systemPrompt, apiKey, apiEndpoint, temperature = 0.7, maxTokens = 1024 }) {
  const provider = resolveProvider(providerKey, {
    chatEndpoint: typeof apiEndpoint === "string" && apiEndpoint ? apiEndpoint : undefined,
    authHeader: typeof apiKey === "string" && apiKey ? () => ({ Authorization: `Bearer ${apiKey}` }) : undefined,
    buildBody: () => ({ model: model || providerKey, messages, temperature, max_tokens: maxTokens }),
  });
  if (!provider) throw new Error(`Provider ${providerKey} tidak didukung.`);

  const effectiveApiKey = String(apiKey || "");
  const effectiveModel = String(model || provider.defaultModel);
  const normalizedMessages = normalizeMessages(messages, systemPrompt && provider.supportsSystem ? systemPrompt : undefined);

  const url = typeof provider.chatEndpoint === "function" ? provider.chatEndpoint(effectiveModel) : provider.chatEndpoint;
  const finalUrl = String(url || "").replace("__API_KEY__", encodeURIComponent(effectiveApiKey));
  const body = provider.buildBody({ model: effectiveModel, messages: normalizedMessages, systemPrompt });

  const res = await fetch(finalUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(effectiveApiKey ? provider.authHeader(effectiveApiKey) : provider.authHeader("")),
    },
    body: JSON.stringify({ ...body, temperature, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI ${providerKey} error ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  const text = provider.parseResponse(data);
  if (!text) throw new Error("AI mengembalikan respon kosong.");
  return text;
}

export {
  DEFAULT_PROVIDERS,
  resolveProvider,
  callAI,
  normalizeMessages,
};
