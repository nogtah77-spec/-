import { logger } from "./logger";

export type ChatMsg = { role: "user" | "assistant"; content: string };

type ProviderName = "gemini" | "groq" | "openrouter";

interface ResolvedProvider {
  provider: ProviderName;
  key: string;
  model: string;
}

// Priority order requested by the project owner:
//   1. Google Gemini (best quality on the free tier, excellent Arabic + dialects)
//   2. Groq (fast, strong open models)
//   3. OpenRouter (free models)
// The first provider whose API key is present wins. Keys are read from the
// environment so they can be filled in later without any code change.
export function resolveProvider(): ResolvedProvider | null {
  const gemini = process.env.GEMINI_API_KEY?.trim();
  if (gemini) {
    return {
      provider: "gemini",
      key: gemini,
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    };
  }
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) {
    return {
      provider: "groq",
      key: groq,
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    };
  }
  const openrouter = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouter) {
    return {
      provider: "openrouter",
      key: openrouter,
      model: process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.0-flash-exp:free",
    };
  }
  return null;
}

export function aiConfigured(): boolean {
  return resolveProvider() !== null;
}

export function aiProviderName(): ProviderName | "none" {
  return resolveProvider()?.provider ?? "none";
}

const REQUEST_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function geminiChat(
  key: string,
  model: string,
  system: string,
  messages: ChatMsg[],
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    logger.error({ status: res.status, detail: detail.slice(0, 500) }, "gemini upstream error");
    throw new Error("AI_UPSTREAM_ERROR");
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("AI_EMPTY_RESPONSE");
  return text;
}

async function openaiCompatChat(
  provider: ProviderName,
  key: string,
  model: string,
  system: string,
  messages: ChatMsg[],
): Promise<string> {
  const url =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";
  const body = {
    model,
    temperature: 0.7,
    max_tokens: 2048,
    messages: [{ role: "system", content: system }, ...messages],
  };
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    logger.error({ provider, status: res.status, detail: detail.slice(0, 500) }, "ai upstream error");
    throw new Error("AI_UPSTREAM_ERROR");
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("AI_EMPTY_RESPONSE");
  return text;
}

export async function aiChat(system: string, messages: ChatMsg[]): Promise<string> {
  const resolved = resolveProvider();
  if (!resolved) throw new Error("AI_NOT_CONFIGURED");
  const { provider, key, model } = resolved;
  if (provider === "gemini") return geminiChat(key, model, system, messages);
  return openaiCompatChat(provider, key, model, system, messages);
}
