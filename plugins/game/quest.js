/**
 * Quest Harian — misi harian dengan hadiah
 * ---------------------------------------------------------------
 *   .quest            lihat quest harian
 *   .quest claim <id> klaim hadiah quest yang selesai
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  simpanPemain,
  beriHadiah,
  buatQuestHarian,
  progresQuest,
  bar,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "quest",
  alias: ["questharian", "misi", "dailyquest"],
  category: "game",
  description: "Quest harian RPG — misi dengan hadiah koin & exp",
  usage: ".quest [claim <id>]",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

function pastikanQuest(p) {
  const today = hariIni();
  if (!p.questHarian || p.questReset !== today) {
    return {
      questHarian: buatQuestHarian(p.level),
      questReset: today,
    };
  }
  return null;
}

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Quest Harian", "📋") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Daftar sebagai petualang dulu")
      );
      return { handled: true };
    }

    // Pastikan quest harian ada & ter-reset
    const reset = pastikanQuest(p);
    if (reset) {
      simpanPemain(db, m.sender, reset);
    }

    const pemain = ambilPemain(db, m.sender);
    const quests = pemain.questHarian || [];

    // --- .quest claim <id> ---
    const teks = (m.text || "").trim().toLowerCase();
    if (teks.startsWith("claim") || teks.startsWith("klaim")) {
      const parts = teks.split(/\s+/);
      const id = parts[1];

      if (!id) {
        await m.reply(
          alyaHeader("Claim Quest", "🎁") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Format: *${prefix}quest claim <id>*`]) +
            "\n\n" +
            tipText("Contoh: .quest claim menang_tarung")
        );
        return { handled: true };
      }

      const quest = quests.find((q) => q.id === id);
      if (!quest) {
        await m.reply(
          alyaHeader("Quest Tidak Ditemukan", "❌") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Quest ID *${id}* tidak ada.`])
        );
        return { handled: true };
      }

      if (!quest.selesai) {
        await m.reply(
          alyaHeader("Belum Selesai", "⏳") +
            "\n\n" +
            bracketBox("⏳", "ǫᴜᴇꜱᴛ", [
              `◦ ${quest.deskripsi}`,
              `◦ Progres: *${quest.progres}/${quest.target}*`,
            ]) +
            "\n\n" +
            tipText("Selesaikan quest dulu untuk klaim hadiah")
        );
        return { handled: true };
      }

      if (quest.claimed) {
        await m.reply(
          alyaHeader("Sudah Diklaim", "✅") +
            "\n\n" +
            bracketBox("✅", "ɪɴꜰᴏ", ["◦ Hadiah quest ini sudah diklaim."])
        );
        return { handled: true };
      }

      // Klaim hadiah
      quest.claimed = true;
      simpanPemain(db, m.sender, { questHarian: quests });
      const hadiah = beriHadiah(db, m.sender, quest.hadiahKoin, quest.hadiahExp);

      await m.reply(
        alyaHeader("Quest Selesai! 🎉", "🎁") +
          "\n\n" +
          bracketBox("🏆", "ǫᴜᴇꜱᴛ ꜱᴇʟᴇꜱᴀɪ", [
            `◦ ${quest.deskripsi}`,
          ]) +
          "\n\n" +
          bracketBox("💎", "ʜᴀᴅɪᴀʜ", [
            `◦ Koin: *+${angka(quest.hadiahKoin)}*`,
            `◦ Exp: *+${angka(quest.hadiahExp)}*`,
            hadiah?.naikLevel ? `◦ 🎊 *LEVEL UP! → Level ${hadiah.levelBaru}*` : null,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Cek quest lain: ${prefix}quest`)
      );
      return { handled: true };
    }

    // --- .quest (lihat semua) ---
    const lines = [];
    for (const q of quests) {
      const persen = q.target > 0 ? (q.progres / q.target) * 100 : 0;
      const status = q.claimed ? "✅" : q.selesai ? "🎁" : "⏳";
      lines.push(`${status} ${q.deskripsi}`);
      lines.push(`   ${bar(persen, 100)} *${q.progres}/${q.target}*`);
      lines.push(`   Hadiah: 💰 ${angka(q.hadiahKoin)} | ⭐ ${angka(q.hadiahExp)} exp`);
      if (q.selesai && !q.claimed) {
        lines.push(`   → Klaim: *${prefix}quest claim ${q.id}*`);
      }
      lines.push("");
    }

    const belumKlaim = quests.filter((q) => q.selesai && !q.claimed).length;

    await m.reply(
      alyaHeader("Quest Harian", "📋") +
        "\n\n" +
        bracketBox("📅", "ʀᴇꜱᴇᴛ", [
          `◦ Hari ini: *${hariIni()}*`,
          `◦ Reset besok jam 00:00`,
        ]) +
        "\n\n" +
        bracketBox("🎯", "ᴍɪꜱɪ ʜᴀʀɪᴀɴ", lines) +
        (belumKlaim > 0
          ? "\n\n" +
            bracketBox("🎁", "ꜱɪᴀᴘ ᴋʟᴀɪᴍ", [
              `◦ *${belumKlaim}* quest siap diklaim!`,
            ])
          : "") +
        "\n\n" +
        separator() +
        "\n" +
        tipText(`Klaim: ${prefix}quest claim <id>`)
    );
  } catch (err) {
    await m.reply(
      alyaHeader("Error", "❌") +
        "\n\n" +
        bracketBox("❌", "ᴇʀʀᴏʀ", [`◦ ${String(err.message).slice(0, 100)}`])
    );
  }

  return { handled: true };
}

export { pluginConfig, handler };
