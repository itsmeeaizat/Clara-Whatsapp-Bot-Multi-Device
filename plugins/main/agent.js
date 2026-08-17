import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  runAgent,
  clearMemory,
  loadMemory,
  resolveAgentModel,
  resolveApiKey,
  AGENT_MODELS,
  TOOLS,
} from "../../src/lib/clara-agent-runtime.js";

const pluginConfig = {
  name: "agent",
  alias: ["agent", "agents", "subagent", "assistant", "ai-agent"],
  category: "ai",
  description: "AI Agent dengan tool-use (web, kalkulator, info grup) — Claude Sonnet 5",
  usage: ".agent <pertanyaan/tugas>",
  example: ".agent harga bitcoin hari ini berapa rupiah?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

/* ------------------------------------------------------------------ */
/* Helper tampilan                                                     */
/* ------------------------------------------------------------------ */

function helpText(prefix) {
  return (
    alyaHeader("AI Agent", "🤖") +
    "\n\n" +
    bracketBox("🤖", "ᴀᴘᴀ ɪᴛᴜ", [
      "◦ Agent AI yang bisa *pakai tool*, bukan",
      "  sekadar jawab dari ingatan.",
      "◦ Bisa cari web, baca halaman, hitung,",
      "  cek info grup, dan cari fitur bot.",
    ]) +
    "\n\n" +
    bracketBox("📋", "ᴄᴀʀᴀ ᴘᴀᴋᴀɪ", [
      `◦ *${prefix}agent <tugas>*`,
      `◦ *${prefix}agent sonnet-5 <tugas>* (pilih model)`,
      `◦ *${prefix}agent reset* — hapus ingatan`,
      `◦ *${prefix}agent tools* — daftar tool`,
      `◦ *${prefix}agent model* — daftar model`,
    ]) +
    "\n\n" +
    bracketBox("💡", "ᴄᴏɴᴛᴏʜ", [
      `◦ ${prefix}agent kurs dolar hari ini berapa?`,
      `◦ ${prefix}agent ringkas https://example.com`,
      `◦ ${prefix}agent 12.5% dari 3.400.000 berapa`,
      `◦ ${prefix}agent siapa aja admin grup ini`,
      `◦ ${prefix}agent ada fitur buat download tiktok?`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText("Agent ingat percakapan sebelumnya · reset untuk mulai baru")
  );
}

function modelListText(prefix, botConfig) {
  const lines = [];
  for (const [key, spec] of Object.entries(AGENT_MODELS)) {
    const hasKey = resolveApiKey(key, botConfig) ? "✅" : "❌";
    lines.push(`◦ ${hasKey} *${key}* — ${spec.label}`);
  }

  return (
    alyaHeader("Model Agent", "🧠") +
    "\n\n" +
    bracketBox("🧠", "ᴘʀᴏᴠɪᴅᴇʀ", lines) +
    "\n\n" +
    bracketBox("🏷️", "ᴀʟɪᴀꜱ ᴍᴏᴅᴇʟ", [
      "◦ *sonnet-5* → claude-sonnet-5 (default)",
      "◦ *opus-5* → claude-opus-5",
      "◦ *haiku* → claude-haiku-4-5",
      "◦ *4o* → gpt-4o · *mini* → gpt-4o-mini",
      "◦ *llama* → llama-3.3-70b (groq)",
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`✅ = API key siap · ❌ = key belum diset`)
  );
}

function toolsListText(prefix) {
  const lines = TOOLS.map((t) => `◦ *${t.name}*`);
  const desc = TOOLS.map((t) => {
    const short = t.description.split(".")[0];
    return `◦ ${t.name}: ${short.slice(0, 60)}`;
  });

  return (
    alyaHeader("Tool Agent", "🛠️") +
    "\n\n" +
    bracketBox("🛠️", "ᴛᴇʀꜱᴇᴅɪᴀ", lines) +
    "\n\n" +
    bracketBox("📖", "ᴋᴇᴛᴇʀᴀɴɢᴀɴ", desc) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Agent memilih tool sendiri sesuai kebutuhan`)
  );
}

function errorText(prefix, message) {
  return (
    alyaHeader("Gagal", "❌") +
    "\n\n" +
    bracketBox("❌", "ᴇʀʀᴏʀ", [
      `◦ Status: *Gagal*`,
      `◦ Alasan: *${String(message).slice(0, 200)}*`,
    ]) +
    "\n\n" +
    separator() +
    "\n" +
    tipText(`Ketik ${prefix}agent untuk bantuan`)
  );
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

async function handler(m, { sock, config: botConfig, db }) {
  const prefix = botConfig?.command?.prefix || ".";

  try {
    const input = (m.text || "").trim();

    /* --- tanpa argumen: tampilkan bantuan --- */
    if (!input) {
      await m.reply(helpText(prefix));
      return { handled: true };
    }

    const args = input.split(/\s+/);
    const sub = args[0].toLowerCase();

    /* --- subcommand: reset memory --- */
    if (["reset", "clear", "lupa", "hapus"].includes(sub)) {
      const ok = await clearMemory(String(m.sender));
      const text =
        alyaHeader("Reset Memory", "🧹") +
        "\n\n" +
        bracketBox("🧹", "ᴍᴇᴍᴏʀʏ", [
          ok ? "◦ Status: *Berhasil dihapus*" : "◦ Status: *Gagal / sudah kosong*",
          "◦ Agent tidak ingat obrolan sebelumnya.",
        ]) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Mulai obrolan baru dengan ${prefix}agent <tugas>`);
      await m.reply(text);
      return { handled: true };
    }

    /* --- subcommand: daftar model --- */
    if (["model", "models", "provider", "providers"].includes(sub)) {
      await m.reply(modelListText(prefix, botConfig));
      return { handled: true };
    }

    /* --- subcommand: daftar tool --- */
    if (["tool", "tools", "alat"].includes(sub)) {
      await m.reply(toolsListText(prefix));
      return { handled: true };
    }

    /* --- subcommand: cek memory --- */
    if (["memory", "ingatan", "history"].includes(sub)) {
      const mem = await loadMemory(String(m.sender));
      const lines = mem.length
        ? mem.slice(-6).map((x) => {
            const who = x.role === "user" ? "Kamu" : "Agent";
            return `◦ ${who}: ${String(x.content).slice(0, 45)}...`;
          })
        : ["◦ Belum ada riwayat percakapan."];

      const text =
        alyaHeader("Memory Agent", "🧾") +
        "\n\n" +
        bracketBox("🧾", "ʀɪᴡᴀʏᴀᴛ", lines) +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`${prefix}agent reset untuk menghapus`);
      await m.reply(text);
      return { handled: true };
    }

    /* --- parse pilihan model opsional --- */
    let providerArg = null;
    let prompt = input;

    const maybeModel = resolveAgentModel(sub, botConfig);
    const isExplicitModel =
      maybeModel &&
      (AGENT_MODELS[sub] ||
        Object.values(AGENT_MODELS).some((s) => s.alternatives?.[sub]));

    if (isExplicitModel && args.length > 1) {
      providerArg = sub;
      prompt = args.slice(1).join(" ").trim();
    }

    if (!prompt) {
      await m.reply(helpText(prefix));
      return { handled: true };
    }

    /* --- indikator sedang berpikir --- */
    try {
      await sock.sendPresenceUpdate("composing", m.chat);
    } catch {
      // abaikan bila gagal
    }

    const steps = [];
    const started = Date.now();

    const result = await runAgent({
      prompt,
      m,
      sock,
      botConfig,
      db,
      providerArg,
      useMemory: true,
      maxSteps: 6,
      onStep: (toolName) => {
        steps.push(toolName);
      },
    });

    const elapsed = ((Date.now() - started) / 1000).toFixed(1);

    /* --- susun balasan --- */
    const infoLines = [
      `◦ Model: *${result.label}*`,
      `◦ Waktu: *${elapsed}s*`,
    ];
    if (steps.length) {
      infoLines.push(`◦ Tool dipakai: *${[...new Set(steps)].join(", ")}*`);
    }

    const text =
      alyaHeader("AI Agent", "🤖") +
      "\n\n" +
      bracketBox("🤖", "ᴀɢᴇɴᴛ", infoLines) +
      "\n\n" +
      result.text +
      "\n\n" +
      separator() +
      "\n" +
      tipText(`${prefix}agent reset untuk mulai obrolan baru`);

    await m.reply(text);
  } catch (error) {
    await m.reply(errorText(prefix, error.message));
  }

  return { handled: true };
}

export default {
  config: pluginConfig,
  handler,
};
