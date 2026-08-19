// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Clara Agent Runtime
 * ---------------------------------------------------------------
 * Agentic loop dengan tool-use (function calling) untuk Clara MD.
 *
 * Berbeda dengan plugin AI biasa yang sekali tanya-sekali jawab,
 * runtime ini menjalankan loop:
 *   user prompt -> model memilih tool -> tool dieksekusi ->
 *   hasil dikembalikan ke model -> ulangi sampai model selesai.
 *
 * Provider yang didukung untuk tool-use:
 *   - anthropic (Claude Sonnet 5 / Opus 5 / Haiku 4.5)  [native tools]
 *   - openai, groq, mistral, deepseek, together, github [OpenAI-style tools]
 *
 * Provider tanpa tool-use akan otomatis fallback ke mode chat biasa.
 */

/*
 * Catatan: modul database sengaja di-import secara lazy (dynamic import)
 * agar runtime ini bisa diuji / dipakai tanpa menarik seluruh dependency
 * chain bot (chalk, lowdb, dsb). Memory bersifat opsional — kalau modul
 * database tidak tersedia, agent tetap jalan tanpa ingatan.
 */
let _dbModule;
async function getDb() {
  try {
    if (!_dbModule) _dbModule = await import("./clara-database.js");
    return _dbModule.getDatabase();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Model registry                                                      */
/* ------------------------------------------------------------------ */

/**
 * Model yang direkomendasikan untuk agent per provider.
 * Sonnet 5 (rilis 30 Juni 2026) adalah default karena paling agentic.
 */
const AGENT_MODELS = {
  anthropic: {
    label: "Claude Sonnet 5",
    model: "claude-sonnet-5",
    style: "anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    alternatives: {
      "sonnet-5": "claude-sonnet-5",
      sonnet5: "claude-sonnet-5",
      sonnet: "claude-sonnet-5",
      "opus-5": "claude-opus-5",
      opus5: "claude-opus-5",
      opus: "claude-opus-5",
      "haiku-4.5": "claude-haiku-4-5",
      haiku: "claude-haiku-4-5",
      "sonnet-4.6": "claude-sonnet-4-6",
    },
  },
  openai: {
    label: "GPT-4o",
    model: "gpt-4o",
    style: "openai",
    endpoint: "https://api.openai.com/v1/chat/completions",
    alternatives: { "4o": "gpt-4o", mini: "gpt-4o-mini" },
  },
  groq: {
    label: "Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
    style: "openai",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    alternatives: { llama: "llama-3.3-70b-versatile" },
  },
  mistral: {
    label: "Mistral Small",
    model: "mistral-small-latest",
    style: "openai",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    alternatives: {},
  },
  deepseek: {
    label: "DeepSeek Chat",
    model: "deepseek-chat",
    style: "openai",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    alternatives: { reasoner: "deepseek-reasoner" },
  },
  together: {
    label: "Llama 3.3 70B Turbo",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    style: "openai",
    endpoint: "https://api.together.xyz/v1/chat/completions",
    alternatives: {},
  },
};

const DEFAULT_PROVIDER = "anthropic";

/* ------------------------------------------------------------------ */
/* Tool definitions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Setiap tool punya:
 *   name, description, parameters (JSON Schema), run(args, ctx)
 * ctx = { m, sock, botConfig, db }
 */
const TOOLS = [
  {
    name: "cari_web",
    description:
      "Cari informasi terkini di internet lewat DuckDuckGo. Gunakan untuk pertanyaan " +
      "tentang berita, harga, fakta terbaru, atau apa pun yang butuh data real-time.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Kata kunci pencarian" },
      },
      required: ["query"],
    },
    async run({ query }) {
      const url =
        "https://api.duckduckgo.com/?q=" +
        encodeURIComponent(String(query || "")) +
        "&format=json&no_html=1&skip_disambig=1";

      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ClaraBot/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DuckDuckGo error ${res.status}`);
      const data = await res.json().catch(() => ({}));

      const out = [];
      if (data.AbstractText) out.push(`Ringkasan: ${data.AbstractText}`);
      if (data.Answer) out.push(`Jawaban: ${data.Answer}`);

      const topics = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
      for (const t of topics.slice(0, 5)) {
        if (t?.Text) out.push(`- ${t.Text}`);
        else if (Array.isArray(t?.Topics)) {
          for (const s of t.Topics.slice(0, 2)) {
            if (s?.Text) out.push(`- ${s.Text}`);
          }
        }
      }

      if (!out.length) return `Tidak ada hasil untuk "${query}".`;
      return out.join("\n").slice(0, 2500);
    },
  },

  {
    name: "baca_halaman",
    description:
      "Ambil dan baca isi teks dari sebuah URL. Gunakan setelah cari_web bila butuh detail " +
      "lebih dalam dari sebuah halaman.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL lengkap termasuk https://" },
      },
      required: ["url"],
    },
    async run({ url }) {
      const target = String(url || "");
      if (!/^https?:\/\//i.test(target)) throw new Error("URL harus diawali http:// atau https://");

      const res = await fetch(target, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ClaraBot/1.0)" },
        signal: AbortSignal.timeout(20000),
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`Gagal ambil halaman: HTTP ${res.status}`);

      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();

      if (!text) return "Halaman kosong atau tidak bisa dibaca.";
      return text.slice(0, 4000);
    },
  },

  {
    name: "hitung",
    description:
      "Hitung ekspresi matematika secara akurat. Selalu pakai tool ini untuk perhitungan " +
      "angka, jangan hitung sendiri di kepala.",
    parameters: {
      type: "object",
      properties: {
        ekspresi: {
          type: "string",
          description: "Ekspresi matematika, contoh: (1250000 * 0.11) + 45000",
        },
      },
      required: ["ekspresi"],
    },
    async run({ ekspresi }) {
      const raw = String(ekspresi || "").trim();
      // Whitelist ketat: hanya angka, operator, kurung, titik, spasi
      if (!/^[0-9+\-*/%.()\s,eE]+$/.test(raw)) {
        throw new Error("Ekspresi hanya boleh berisi angka dan operator + - * / % ( ).");
      }
      if (raw.length > 200) throw new Error("Ekspresi terlalu panjang.");

      const expr = raw.replace(/,/g, "");
      // eslint-disable-next-line no-new-func
      const fn = new Function(`"use strict"; return (${expr});`);
      const result = fn();

      if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Hasil bukan angka valid.");
      }
      return `${expr} = ${result}`;
    },
  },

  {
    name: "waktu_sekarang",
    description:
      "Ambil tanggal dan waktu saat ini. Gunakan bila user bertanya soal hari ini, " +
      "besok, jam berapa, atau butuh menghitung selisih tanggal.",
    parameters: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "Zona waktu IANA, default Asia/Jakarta",
        },
      },
    },
    async run({ timezone }) {
      const tz = timezone || "Asia/Jakarta";
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("id-ID", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "long",
      });
      return `Sekarang: ${fmt.format(now)} (${tz})\nISO: ${now.toISOString()}`;
    },
  },

  {
    name: "info_grup",
    description:
      "Ambil informasi grup WhatsApp tempat pesan ini dikirim: nama grup, jumlah member, " +
      "daftar admin, deskripsi. Hanya berfungsi di dalam grup.",
    parameters: { type: "object", properties: {} },
    async run(_args, { m, sock }) {
      if (!m?.isGroup) return "Perintah ini dikirim di chat pribadi, bukan grup.";
      const meta = await sock.groupMetadata(m.chat);
      const admins = (meta.participants || [])
        .filter((p) => p.admin)
        .map((p) => (p.id || "").split("@")[0]);

      return [
        `Nama grup: ${meta.subject || "-"}`,
        `Jumlah member: ${(meta.participants || []).length}`,
        `Jumlah admin: ${admins.length}`,
        `Admin: ${admins.join(", ") || "-"}`,
        `Dibuat: ${meta.creation ? new Date(meta.creation * 1000).toISOString() : "-"}`,
        `Deskripsi: ${(meta.desc || "-").slice(0, 500)}`,
      ].join("\n");
    },
  },

  {
    name: "profil_user",
    description:
      "Ambil data profil user yang sedang chat dari database bot: level, exp, koin, " +
      "energi, status premium, tanggal daftar.",
    parameters: { type: "object", properties: {} },
    async run(_args, { m, db }) {
      const user = db?.getUser?.(m.sender);
      if (!user) return "Data user belum terdaftar di database.";
      return [
        `Nama: ${user.name || "-"}`,
        `Username: ${user.username || "-"}`,
        `Role: ${user.role || "user"}`,
        `Level: ${user.level ?? 0}`,
        `Exp: ${user.exp ?? 0}`,
        `Koin/balance: ${user.balance ?? user.money ?? 0}`,
        `Energi: ${user.energi ?? "-"}`,
        `Premium: ${user.premium ? "ya" : "tidak"}`,
        `Terdaftar: ${user.registeredAt || "-"}`,
      ].join("\n");
    },
  },

  {
    name: "daftar_command",
    description:
      "Cari command/fitur yang tersedia di bot Clara berdasarkan kata kunci. " +
      "Gunakan bila user bertanya 'ada fitur apa untuk X' atau 'gimana cara Y'.",
    parameters: {
      type: "object",
      properties: {
        kata_kunci: {
          type: "string",
          description: "Kata kunci fitur, contoh: sticker, download, islami",
        },
      },
      required: ["kata_kunci"],
    },
    async run({ kata_kunci }, { botConfig }) {
      const prefix = botConfig?.command?.prefix || ".";
      const kw = String(kata_kunci || "").toLowerCase();

      // Plugin registry ada di clara-plugins.js (pluginStore), bukan di
      // instance Database. Lazy import supaya modul ini tetap bisa diuji
      // tanpa menarik seluruh dependency chain bot.
      let all = [];
      try {
        const mod = await import("./clara-plugins.js");
        all = mod.getAllPlugins ? mod.getAllPlugins() : [];
      } catch {
        return "Registry plugin tidak bisa diakses saat ini.";
      }
      const seen = new Set();
      const hits = [];

      for (const p of all) {
        const c = p?.config;
        if (!c || c.isEnabled === false || seen.has(c.name)) continue;
        const hay = `${c.name} ${c.description || ""} ${c.category || ""} ${(c.alias || []).join(" ")}`.toLowerCase();
        if (hay.includes(kw)) {
          seen.add(c.name);
          hits.push(`${prefix}${c.name} — ${c.description || "tanpa deskripsi"} [${c.category || "?"}]`);
        }
        if (hits.length >= 15) break;
      }

      if (!hits.length) return `Tidak ada command yang cocok dengan "${kata_kunci}".`;
      return hits.join("\n");
    },
  },
];

const TOOL_MAP = new Map(TOOLS.map((t) => [t.name, t]));

/* ------------------------------------------------------------------ */
/* Memory (riwayat percakapan per user)                                */
/* ------------------------------------------------------------------ */

const MEMORY_KEY = "agentMemory";
const MEMORY_MAX_TURNS = 12;

async function loadMemory(jid) {
  try {
    const db = await getDb();
    const all = db?.setting?.(MEMORY_KEY) || {};
    return Array.isArray(all[jid]) ? all[jid] : [];
  } catch {
    return [];
  }
}

async function saveMemory(jid, messages) {
  try {
    const db = await getDb();
    if (!db?.setting) return;
    const all = db.setting(MEMORY_KEY) || {};
    all[jid] = messages.slice(-MEMORY_MAX_TURNS);
    db.setting(MEMORY_KEY, all);
  } catch {
    // memory bersifat opsional, jangan sampai bikin agent gagal
  }
}

async function clearMemory(jid) {
  try {
    const db = await getDb();
    if (!db?.setting) return false;
    const all = db.setting(MEMORY_KEY) || {};
    delete all[jid];
    db.setting(MEMORY_KEY, all);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Schema conversion                                                   */
/* ------------------------------------------------------------------ */

function toolsForAnthropic() {
  return TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

function toolsForOpenAI() {
  return TOOLS.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/* ------------------------------------------------------------------ */
/* Provider resolution                                                 */
/* ------------------------------------------------------------------ */

function resolveApiKey(providerKey, botConfig) {
  const envMap = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    groq: "GROQ_API_KEY",
    mistral: "MISTRAL_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    together: "TOGETHER_API_KEY",
  };

  // 1) Environment variable (paling aman, disarankan)
  const fromEnv = process.env[envMap[providerKey]];
  if (fromEnv) return fromEnv;

  // 2) config.js -> APIkey.<provider>
  const fromConfig = botConfig?.APIkey?.[providerKey];
  if (fromConfig) return fromConfig;

  // 3) config.js -> aiHelp.apiKey (bila provider-nya cocok)
  if (botConfig?.aiHelp?.provider === providerKey && botConfig?.aiHelp?.apiKey) {
    return botConfig.aiHelp.apiKey;
  }

  return "";
}

/**
 * Tentukan provider + model dari argumen user.
 * Contoh input: "anthropic", "sonnet-5", "groq", "opus"
 */
function resolveAgentModel(input, botConfig) {
  const fallbackProvider =
    botConfig?.agent?.provider || botConfig?.aiHelp?.provider || DEFAULT_PROVIDER;

  if (!input) {
    const spec = AGENT_MODELS[fallbackProvider] || AGENT_MODELS[DEFAULT_PROVIDER];
    return {
      providerKey: AGENT_MODELS[fallbackProvider] ? fallbackProvider : DEFAULT_PROVIDER,
      model: botConfig?.agent?.model || spec.model,
      spec,
    };
  }

  const lower = String(input).toLowerCase();

  // Cocokkan nama provider langsung
  if (AGENT_MODELS[lower]) {
    return { providerKey: lower, model: AGENT_MODELS[lower].model, spec: AGENT_MODELS[lower] };
  }

  // Cocokkan alias model di semua provider
  for (const [key, spec] of Object.entries(AGENT_MODELS)) {
    if (spec.alternatives?.[lower]) {
      return { providerKey: key, model: spec.alternatives[lower], spec };
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Agentic loop — Anthropic                                            */
/* ------------------------------------------------------------------ */

async function runAnthropicLoop({ model, apiKey, systemPrompt, history, ctx, maxSteps, onStep }) {
  const messages = [...history];
  const trace = [];

  for (let step = 0; step < maxSteps; step++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        tools: toolsForAnthropic(),
        messages,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const content = Array.isArray(data.content) ? data.content : [];

    // Model selesai bicara tanpa minta tool
    if (data.stop_reason !== "tool_use") {
      const text = content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n")
        .trim();
      messages.push({ role: "assistant", content: data.content });
      return { text: text || "(kosong)", messages, trace };
    }

    // Model minta jalankan tool
    messages.push({ role: "assistant", content: data.content });

    const toolResults = [];
    for (const block of content) {
      if (block.type !== "tool_use") continue;

      const tool = TOOL_MAP.get(block.name);
      let resultText;
      let ok = true;

      if (!tool) {
        resultText = `Tool "${block.name}" tidak dikenal.`;
        ok = false;
      } else {
        try {
          if (onStep) await onStep(block.name, block.input);
          resultText = String(await tool.run(block.input || {}, ctx));
        } catch (err) {
          resultText = `Error: ${err.message}`;
          ok = false;
        }
      }

      trace.push({ tool: block.name, input: block.input, ok });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: resultText.slice(0, 6000),
        ...(ok ? {} : { is_error: true }),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    text: "Agent mencapai batas langkah maksimum tanpa menyelesaikan tugas.",
    messages,
    trace,
  };
}

/* ------------------------------------------------------------------ */
/* Agentic loop — OpenAI-compatible                                    */
/* ------------------------------------------------------------------ */

async function runOpenAILoop({ endpoint, model, apiKey, systemPrompt, history, ctx, maxSteps, onStep }) {
  const messages = [{ role: "system", content: systemPrompt }, ...history];
  const trace = [];

  for (let step = 0; step < maxSteps; step++) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: toolsForOpenAI(),
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    if (!msg) throw new Error("Respon AI kosong.");

    const calls = msg.tool_calls || [];
    if (!calls.length) {
      messages.push(msg);
      return { text: (msg.content || "(kosong)").trim(), messages, trace };
    }

    messages.push(msg);

    for (const call of calls) {
      const name = call.function?.name;
      const tool = TOOL_MAP.get(name);

      let args = {};
      try {
        args = JSON.parse(call.function?.arguments || "{}");
      } catch {
        args = {};
      }

      let resultText;
      let ok = true;

      if (!tool) {
        resultText = `Tool "${name}" tidak dikenal.`;
        ok = false;
      } else {
        try {
          if (onStep) await onStep(name, args);
          resultText = String(await tool.run(args, ctx));
        } catch (err) {
          resultText = `Error: ${err.message}`;
          ok = false;
        }
      }

      trace.push({ tool: name, input: args, ok });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: resultText.slice(0, 6000),
      });
    }
  }

  return {
    text: "Agent mencapai batas langkah maksimum tanpa menyelesaikan tugas.",
    messages,
    trace,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(botConfig, m) {
  const botName = botConfig?.bot?.name || "Clara";
  const prefix = botConfig?.command?.prefix || ".";
  return [
    `Kamu adalah ${botName}, asisten AI di dalam bot WhatsApp.`,
    `Kamu punya akses ke beberapa tool. Gunakan tool bila perlu data faktual,`,
    `perhitungan, waktu, atau info grup — jangan mengarang.`,
    ``,
    `Aturan menjawab:`,
    `- Bahasa Indonesia yang santai tapi jelas.`,
    `- Ringkas. Ini WhatsApp, bukan blog. Maksimal ~1500 karakter kecuali diminta detail.`,
    `- Jangan pakai tabel markdown (tidak terbaca di WhatsApp).`,
    `- Format tebal pakai *satu bintang*, bukan **dua**.`,
    `- Kalau pakai tool dan hasilnya kosong, katakan terus terang.`,
    `- Prefix command bot ini adalah "${prefix}".`,
    ``,
    `Konteks: ${m?.isGroup ? "pesan dari grup" : "pesan dari chat pribadi"}.`,
  ].join("\n");
}

/**
 * Jalankan agent.
 * @returns {Promise<{text:string, trace:Array, provider:string, model:string}>}
 */
async function runAgent({
  prompt,
  m,
  sock,
  botConfig,
  db,
  providerArg = null,
  useMemory = true,
  maxSteps = 6,
  onStep = null,
}) {
  const resolved = resolveAgentModel(providerArg, botConfig);
  if (!resolved) {
    throw new Error(
      `Model "${providerArg}" tidak dikenal. Pilihan: ${Object.keys(AGENT_MODELS).join(", ")}`
    );
  }

  const { providerKey, model, spec } = resolved;
  const apiKey = resolveApiKey(providerKey, botConfig);
  if (!apiKey) {
    throw new Error(
      `API key untuk ${providerKey} belum diatur. ` +
        `Set environment variable ${providerKey.toUpperCase()}_API_KEY ` +
        `atau isi APIkey.${providerKey} di config.js`
    );
  }

  const jid = String(m?.sender || "unknown");
  const history = useMemory ? await loadMemory(jid) : [];
  history.push({ role: "user", content: String(prompt) });

  const systemPrompt = buildSystemPrompt(botConfig, m);
  const ctx = { m, sock, botConfig, db };

  const runner = spec.style === "anthropic" ? runAnthropicLoop : runOpenAILoop;
  const result = await runner({
    endpoint: spec.endpoint,
    model,
    apiKey,
    systemPrompt,
    history,
    ctx,
    maxSteps,
    onStep,
  });

  if (useMemory) {
    // Simpan hanya giliran user/assistant berupa teks agar memory tetap ringan
    const plain = [
      ...history.filter((x) => typeof x.content === "string"),
      { role: "assistant", content: result.text },
    ];
    await saveMemory(jid, plain);
  }

  return {
    text: result.text,
    trace: result.trace,
    provider: providerKey,
    model,
    label: spec.label,
  };
}

export {
  runAgent,
  clearMemory,
  loadMemory,
  resolveAgentModel,
  resolveApiKey,
  AGENT_MODELS,
  TOOLS,
  DEFAULT_PROVIDER,
};
