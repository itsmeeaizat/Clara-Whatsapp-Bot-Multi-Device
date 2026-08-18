import db from "../../src/lib/clara-db.js";

const pluginConfig = {
  name: "role",
  alias: ["role", "levelrole"],
  category: "rpg",
  description: "Menampilkan role/gelar RPG berdasarkan level pemain",
  usage: ".role",
  example: ".role",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function getRoleByLevel(level) {
  if (level <= 2) return "Newbie ㋡";
  if (level <= 5) return "Beginner Grade 1 ⚊¹";
  if (level <= 10) return "Beginner Grade 2 ⚊²";
  if (level <= 20) return "Private Grade 1 ⚌¹";
  if (level <= 40) return "Corporal Grade 1 ☰¹";
  if (level <= 60) return "Sergeant Grade 1 ≣¹";
  if (level <= 80) return "Staff Grade 1 ﹀¹";
  if (level <= 100) return "Major Grade 1 ✷¹";
  if (level <= 150) return "Colonel Grade 1 ✷✷¹";
  if (level <= 200) return "Brigadier Diamond ✪";
  return "Legendary Master 忍";
}

async function handler(m, { sock }) {
  try {
    if (!db.data) db.data = {};
    if (!db.data.users) db.data.users = {};
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {
        money: 0,
        exp: 0,
        level: 1,
        health: 100,
        hunger: 50,
        thirst: 50,
        stamina: 100,
        fish: 0,
        coal: 0,
        gold: 0,
        diamond: 0,
        iron: 0,
        wood: 0,
        stone: 0,
      };
      await db.write();
    }

    const user = db.data.users[m.sender];
    const role = getRoleByLevel(user.level || 1);
    user.role = role;
    await db.write();

    await m.reply(
      `🎖️ *RPG USER ROLE & CLASS*\n\n` +
      `👤 Level: *${user.level || 1}*\n` +
      `🏅 Role/Gelar: *${role}*\n` +
      `✨ Total EXP: *${user.exp || 0}*\n` +
      `🗡️ Skill: *${user.skill || "Belum ada"}*`
    );
  } catch (err) {
    await m.reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
}

export default { config: pluginConfig, handler };
