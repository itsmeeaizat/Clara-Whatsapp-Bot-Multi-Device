// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
import { callAI, DEFAULT_PROVIDERS } from "./clara-ai-service.js";

/**
 * Resolve provider key from user input
 */
export function resolveProviderKey(input) {
  if (!input) return null;
  const lower = input.toLowerCase();
  const keys = Object.keys(DEFAULT_PROVIDERS);
  // Exact match
  if (keys.includes(lower)) return lower;
  // Partial match
  const match = keys.find(k => k.includes(lower) || lower.includes(k));
  return match || null;
}

/**
 * Call AI with optional provider selection
 * Usage: await callAITask({ prompt, systemPrompt, botConfig, providerArg })
 */
export async function callAITask({ prompt, systemPrompt = "", botConfig, providerArg = null }) {
  const aiHelp = botConfig.aiHelp || {};
  const apiKey = aiHelp.apiKey;
  const apiEndpoint = aiHelp.apiEndpoint;

  // If user specified a provider, use multi-model
  if (providerArg) {
    const providerKey = resolveProviderKey(providerArg);
    if (providerKey) {
      const provider = DEFAULT_PROVIDERS[providerKey];
      const model = provider.defaultModel || provider.model;
      return await callAI({
        providerKey,
        model,
        messages: [{ role: "user", content: prompt }],
        systemPrompt,
        apiKey,
        apiEndpoint,
      });
    }
  }

  // Default: use configured provider
  const defaultProvider = aiHelp.provider || "openai";
  const model = aiHelp.model || "gpt-4o-mini";
  return await callAI({
    providerKey: defaultProvider,
    model,
    messages: [{ role: "user", content: prompt }],
    systemPrompt,
    apiKey,
    apiEndpoint,
  });
}

export { DEFAULT_PROVIDERS };
