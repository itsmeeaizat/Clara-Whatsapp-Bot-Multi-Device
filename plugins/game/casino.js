/**
 * Casino — judi koin RPG
 * ---------------------------------------------------------------
 *   .casino              lihat menu casino
 *   .casino slot <bet>   slot machine
 *   .casino dadu <bet> <high|low>  dadu 2D6
 */

import {
  alyaHeader,
  bracketBox,
  separator,
  tipText,
} from "../../src/lib/clara-menu-style.js";
import {
  ambilPemain,
  ambilKoin,
  beriHadiah,
  angka,
} from "../../src/lib/clara-rpg-core.js";

const pluginConfig = {
  name: "casino",
  alias: ["judi", "gamble", "bet"],
  category: "game",
  description: "Casino RPG — slot machine & dadu dengan koin",
  usage: ".casino [slot <bet> | dadu <bet> <high|low>]",
  example: ".casino slot 1000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const BET_MIN = 100;
const BET_MAX = 50000;

const SIMBOL = ["🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎"];

const MULTIPLIER = {
  "💎💎💎": 50,
  "⭐⭐⭐": 20,
  "🔔🔔🔔": 15,
  "🍇🍇🍇": 12,
  "🍊🍊🍊": 10,
  "🍋🍋🍋": 8,
  "🍒🍒🍒": 10,
};

async function handler(m, { sock, config }) {
  const prefix = config?.command?.prefix || ".";
  const db = m?.db || sock?.db;
  if (!db) return { handled: true };

  try {
    const p = ambilPemain(db, m.sender);
    if (!p) {
      await m.reply(
        alyaHeader("Casino", "🎰") +
          "\n\n" +
          bracketBox("❌", "ɪɴꜰᴏ", ["◦ Kamu belum terdaftar. Ketik *.petualang* dulu."])
      );
      return { handled: true };
    }

    const teks = (m.text || "").trim().toLowerCase();
    const parts = teks.split(/\s+/);
    const sub = parts[0];

    // --- .casino (menu) ---
    if (!sub || sub === "menu") {
      await m.reply(
        alyaHeader("Casino", "🎰") +
          "\n\n" +
          bracketBox("💰", "ꜱᴀʟᴅᴏ", [`◦ Koin: *${angka(p.koin)}*`]) +
          "\n\n" +
          bracketBox("🎰", "ᴘᴇʀᴍᴀɪɴᴀɴ", [
            `◦ *${prefix}casino slot <bet>* — Slot Machine`,
            `  3 simbol sama = 8x-50x bet`,
            `  2 simbol sama = 2x bet`,
            "",
            `◦ *${prefix}casino dadu <bet> <high|low>*`,
            `  High (7-12) / Low (1-6) = 1.8x bet`,
            "",
            `◦ Min bet: *${angka(BET_MIN)}* | Max: *${angka(BET_MAX)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText("Bermain bertanggung jawab ya! 😄")
      );
      return { handled: true };
    }

    // --- .casino slot <bet> ---
    if (sub === "slot") {
      const bet = parseInt(parts[1], 10);
      if (!bet || bet < BET_MIN) {
        await m.reply(
          alyaHeader("Slot", "🎰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Min bet: *${angka(BET_MIN)} koin*`])
        );
        return { handled: true };
      }
      if (bet > BET_MAX) {
        await m.reply(
          alyaHeader("Slot", "🎰") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Max bet: *${angka(BET_MAX)} koin*`])
        );
        return { handled: true };
      }

      if (!ambilKoin(db, m.sender, bet)) {
        await m.reply(
          alyaHeader("Koin Kurang", "❌") +
            "\n\n" +
            bracketBox("💰", "ɪɴꜰᴏ", [
              `◦ Koin: *${angka(p.koin)}*`,
              `◦ Bet: *${angka(bet)}*`,
            ])
        );
        return { handled: true };
      }

      // Spin
      const reel = [];
      for (let i = 0; i < 3; i++) {
        reel.push(SIMBOL[Math.floor(Math.random() * SIMBOL.length)]);
      }

      const combo = reel.join("");
      let menang = 0;
      let pesan = "";

      if (MULTIPLIER[combo]) {
        menang = bet * MULTIPLIER[combo];
        pesan = `🎉 JACKPOT! ${MULTIPLIER[combo]}x — *+${angka(menang)} koin*`;
      } else if (reel[0] === reel[1] || reel[1] === reel[2] || reel[0] === reel[2]) {
        menang = bet * 2;
        pesan = `✅ 2 cocok — *+${angka(menang)} koin*`;
      } else {
        pesan = `❌ Tidak ada yang cocok — *-${angka(bet)} koin*`;
      }

      if (menang > 0) {
        beriHadiah(db, m.sender, menang, 0);
      }

      const sesudah = ambilPemain(db, m.sender);

      await m.reply(
        alyaHeader("Slot Machine", "🎰") +
          "\n\n" +
          bracketBox("🎰", "ʜᴀꜱɪʟ", [
            `┌─────┬─────┬─────┐`,
            `│  ${reel[0]}  │  ${reel[1]}  │  ${reel[2]}  │`,
            `└─────┴─────┴─────┘`,
            "",
            pesan,
          ]) +
          "\n\n" +
          bracketBox("💰", "ꜱᴀʟᴅᴏ", [
            `◦ Sebelum: *${angka(p.koin)}*`,
            `◦ Sekarang: *${angka(sesudah.koin)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Main lagi: ${prefix}casino slot <bet>`)
      );
      return { handled: true };
    }

    // --- .casino dadu <bet> <high|low> ---
    if (sub === "dadu" || sub === "dice") {
      const bet = parseInt(parts[1], 10);
      const pilihan = parts[2];

      if (!bet || bet < BET_MIN) {
        await m.reply(
          alyaHeader("Dadu", "🎲") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Min bet: *${angka(BET_MIN)} koin*`])
        );
        return { handled: true };
      }
      if (bet > BET_MAX) {
        await m.reply(
          alyaHeader("Dadu", "🎲") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [`◦ Max bet: *${angka(BET_MAX)} koin*`])
        );
        return { handled: true };
      }

      if (pilihan !== "high" && pilihan !== "low") {
        await m.reply(
          alyaHeader("Dadu", "🎲") +
            "\n\n" +
            bracketBox("❌", "ɪɴꜰᴏ", [
              `◦ Pilih: *high* (7-12) atau *low* (1-6)`,
              `◦ Contoh: *${prefix}casino dadu ${bet} high*`,
            ])
        );
        return { handled: true };
      }

      if (!ambilKoin(db, m.sender, bet)) {
        await m.reply(
          alyaHeader("Koin Kurang", "❌") +
            "\n\n" +
            bracketBox("💰", "ɪɴꜰᴏ", [`◦ Koin: *${angka(p.koin)}* | Bet: *${angka(bet)}*`])
        );
        return { handled: true };
      }

      // Roll 2D6
      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
      const total = d1 + d2;
      const isHigh = total >= 7;
      const benar = (pilihan === "high" && isHigh) || (pilihan === "low" && !isHigh);

      let menang = 0;
      let pesan = "";

      if (benar) {
        menang = Math.floor(bet * 1.8);
        beriHadiah(db, m.sender, menang, 0);
        pesan = `✅ Menang! *+${angka(menang)} koin*`;
      } else {
        pesan = `❌ Kalah! *-${angka(bet)} koin*`;
      }

      const sesudah = ambilPemain(db, m.sender);

      await m.reply(
        alyaHeader("Dadu", "🎲") +
          "\n\n" +
          bracketBox("🎲", "ʟᴇᴍᴘᴀʀ", [
            `◦ Dadu 1: *${d1}*`,
            `◦ Dadu 2: *${d2}*`,
            `◦ Total: *${total}*`,
            `◦ Pilihan: *${pilihan.toUpperCase()}*`,
            "",
            pesan,
          ]) +
          "\n\n" +
          bracketBox("💰", "ꜱᴀʟᴅᴏ", [
            `◦ Sebelum: *${angka(p.koin)}*`,
            `◦ Sekarang: *${angka(sesudah.koin)}*`,
          ]) +
          "\n\n" +
          separator() +
          "\n" +
          tipText(`Main lagi: ${prefix}casino dadu <bet> <high|low>`)
      );
      return { handled: true };
    }

    // Unknown sub
    await m.reply(
      alyaHeader("Casino", "🎰") +
        "\n\n" +
        bracketBox("❌", "ɪɴꜰᴏ", [
          `◦ Tidak dikenal. Ketik *${prefix}casino* untuk menu.`,
        ])
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
