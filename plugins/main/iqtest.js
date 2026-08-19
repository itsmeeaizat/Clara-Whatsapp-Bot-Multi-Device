/**
 * IQ Test (Fun Game)
 * ---------------------------------------------------------------
 * Recode dari game-iqtest.js (Clara Aizat/Clara-MD).
 * Memberikan nilai IQ random untuk hiburan.
 */

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const IQ_VALUES = [
  "IQ Anda Sebesar : 1",
  "IQ Anda Sebesar : 14",
  "IQ Anda Sebesar : 23",
  "IQ Anda Sebesar : 35",
  "IQ Anda Sebesar : 41",
  "IQ Anda Sebesar : 50",
  "IQ Anda Sebesar : 67",
  "IQ Anda Sebesar : 72",
  "IQ Anda Sebesar : 86",
  "IQ Anda Sebesar : 99",
  "IQ Anda Sebesar : 150",
  "IQ Anda Sebesar : 340",
  "IQ Anda Sebesar : 423",
  "IQ Anda Sebesar : 500",
  "IQ Anda Sebesar : 676",
  "IQ Anda Sebesar : 780",
  "IQ Anda Sebesar : 812",
  "IQ Anda Sebesar : 945",
  "IQ Anda Sebesar : 1000",
  "IQ Anda Sebesar : Tidak Terbatas!",
  "IQ Anda Sebesar : 5000",
  "IQ Anda Sebesar : 7500",
  "IQ Anda Sebesar : 10000",
];

const pluginConfig = {
  name: "iqtest",
  alias: ["iqtest"],
  category: "game",
  description: "Tes IQ (fun game) - dapat nilai IQ random",
  usage: ".iqtest",
  example: ".iqtest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const iq = pickRandom(IQ_VALUES);
  await m.reply(`🧠 *IQ TEST*\n\n${iq}`);
  return { handled: true };
}

export default { config: pluginConfig, handler };
