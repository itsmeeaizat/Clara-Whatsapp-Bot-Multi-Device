import { getDatabase } from "./src/lib/clara-database.js";
import * as ownerPremiumDb from "./src/lib/clara-premium-db.js";

const config = {
 info: {
 website: "https://firefly.maiku.my.id",
 grupwa: "https://chat.whatsapp.com/xxxx",
 },

 owner: {
 name: "Aizat",
 number: ["628311880113"],
 },

 session: {
 pairingNumber: "628311880113",
 usePairingCode: true,
 },

 bot: {
 name: "Clara MD",
 version: "15.0.0",
 developer: "Aizat",
 },

 assets: {
 "clara-daftar": "./assets/image/clara-daftar.png",
 "clara-demote": "./assets/image/clara-demote.png",
 "clara-fishit": "./assets/image/clara-fishit.jpg",
 "clara-games": "./assets/image/clara-games.jpg",
 "clara-landscape": "./assets/image/clara-landscape.jpg",
 "clara-levelup": "./assets/image/clara-levelup.jpg",
 "clara-minecraft": "./assets/image/clara-minecraft.jpg",
 "clara-promote": "./assets/image/clara-promote.png",
 "clara-rpg": "./assets/image/clara-rpg.jpg",
 "clara-rules": "./assets/image/clara-rules.jpg",
 "clara-store": "./assets/image/clara-store.png",
 "clara-v8": "./assets/image/clara-v8.jpg",
 "clara-winner": "./assets/image/clara-winner.jpg",
 "clara": "./assets/image/clara.png",
 "clara2": "./assets/image/clara2.jpg",
 "clara3": "./assets/image/clara3.jpg",
 "pp-kosong": "./assets/image/pp-kosong.jpg",
 "clara-mp4": "./assets/video/clara-mp4.mp4",
 "clara-mp3": "./assets/audio/clara-mp3.mp3",
 "clara-font": "./assets/clara-font.ttf",
 "clara-kertas": "./assets/image/clara-kertas.jpg",
 "test": "./assets/image/test.webp"
 },

 mode: "public",

 command: {
 prefix: ".",
 },

 vercel: {
 token: "",
 },

 payment: {
 qrisUrl: "",
 methods: [
 { name: "Dana", number: "", holder: "" },
 { name: "GoPay", number: "", holder: "" },
 { name: "OVO", number: "", holder: "" },
 { name: "ShopeePay", number: "", holder: "" },
 ],
 banks: [],
 customText: "https://imgdrop.web.id/KodpV.webp",
 },

 donasi: {
 payment: [
 { name: "Dana", number: "08xxxxxxxxxx", holder: "Nama Owner" },
 { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nama Owner" },
 { name: "OVO", number: "08xxxxxxxxxx", holder: "Nama Owner" },
 ],
 links: [
 { name: "Saweria", url: "saweria.co/username" },
 { name: "Trakteer", url: "trakteer.id/username" },
 ],
 benefits: [
 "Mendukung development",
 "Server lebih stabil",
 "Fitur baru lebih cepat",
 "Priority support",
 ],
 qris: "https://imgdrop.web.id/KodpV.webp",
 },

 energi: {
 enabled: true,
 default: 99999,
 premium: 99999999,
 owner: -1,
 },

 sticker: {
 packname: "Clara Ai Multi Device",
 author: "Aizat",
 },

 saluran: {
 id: "@newsletter",
 name: "Join saluran resmi clara",
 link: "https://whatsapp.com/channel/",
 },

 groupProtection: {
 antilink: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
 antilinkKick: "⚠ *Antilink* — @%user% di-kick karena mengirim link.",
 antilinkGc: "⚠ *Antilink WA* — @%user% mengirim link WA.\nPesan dihapus.",
 antilinkGcKick: "⚠ *Antilink WA* — @%user% di-kick karena mengirim link WA.",
 antilinkAll: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
 antilinkAllKick: "⚠ *Antilink* — @%user% di-kick karena mengirim link.",
 antitagsw: "⚠ *AntiTagSW* — Tag status dari @%user% dihapus.",
 antiviewonce: "👁️ *ViewOnce* — Dari @%user%",
 antiremove: "🗑️ *AntiDelete* — @%user% menghapus pesan:",
 antiswgc: "⚠ *AntiSWGC* — Gak ada sw grup sw grup @%user%",
 antihidetag: "⚠ *AntiHidetag* — Hidetag dari @%user% dihapus.",
 antitoxicWarn: "⚠ @%user% berkata kasar.\nPeringatan ke %warn% dari %max%, pelanggaran berikutnya bisa di-%method%.",
 antitoxicAction: "🚫 @%user% di-%method% karena toxic. (%warn%/%max%)",
 antidocument: "⚠ *AntiDocument* — Dokumen dari @%user% dihapus.",
 antisticker: "⚠ *AntiSticker* — Sticker dari @%user% dihapus.",
 antimedia: "⚠ *AntiMedia* — Media dari @%user% dihapus.",
 antibot: "🤖 *AntiBot* — @%user% terdeteksi sebagai bot dan di-kick.",
 notAdmin: "⚠ Bot bukan admin, tidak bisa menghapus pesan.",
 },

 errorTemplate: `☢ Kayaknya command \`{prefix}{command}\` lagi ada kendala\nSilahkan coba lagi nanti, {pushName}\n\n_Jika masalah berlanjut, silahkan hubungi owner bot_`,

 features: {
 antiCall: false,
 blockIfCall: false,
 autoTyping: true,
 autoRead: true,
 logMessage: true,
 dailyLimitReset: true,
 smartTriggers: false,
 },

 registration: {
 enabled: false,
 rewards: {
 koin: 30000,
 energi: 300,
 exp: 300000,
 },
 },

 emailOtp: {
 enabled: false,
 user: "",
 pass: "",
 fromName: "",
 host: "smtp.gmail.com",
 port: 587,
 secure: false,
 ttlMs: 300000,
 maxAttempts: 3,
 },

 welcome: { defaultEnabled: false },
 goodbye: { defaultEnabled: false },

 ui: {
 menuVariant: 3,
 },

 messages: {
 wait: "🕕 *Proses...* Mohon tunggu sebentar ya.",
 success: "✅ *Berhasil!* Permintaan kamu sudah selesai.",
 error: "❌ *Error!* Ada masalah pada sistem, coba lagi nanti.",

 ownerOnly: "*Akses Ditolak!* Fitur ini khusus untuk Owner bot.",
 premiumOnly: "💎 *Premium Only!* Fitur ini khusus member Premium. Ketik *.benefitpremium* untuk info upgrade.",
 groupOnly: "👥 *Group Only!* Fitur ini hanya bisa digunakan di dalam grup.",
 privateOnly: "� *Private Only!* Fitur ini hanya bisa digunakan di chat pribadi bot.",
 adminOnly: "�️ *Admin Only!* Kamu harus jadi Admin grup untuk pakai fitur ini.",
 botAdminOnly: "🤖 *Bot Bukan Admin!* Jadikan bot sebagai Admin grup dulu biar bisa kerja.",
 cooldown: "🕕 *Tunggu Dulu!* Kamu masih dalam cooldown. Tunggu %time% detik lagi ya.",
 energiExceeded: "⚡ *Energi Habis!* Energi kamu sudah habis. Tunggu reset besok atau beli Premium.",
 limitDeducted: "🔋 Limit kau berkurang sebanyak {amount}. Sisa limit: {sisa}",
 banned: "🚫 *Kamu Dibanned!* Kamu tidak bisa menggunakan bot ini karena telah melanggar aturan.",
 rejectCall: "🚫 JANGAN TELPON NOMOR INI WEH",
 },

 database: { path: "./database/main" },
 backup: { enabled: false, intervalHours: 24, retainDays: 7 },
 scheduler: { resetHour: 0, resetMinute: 0 },

 weatherScheduler: {
 enabled: false,
 timezone: "Asia/Jakarta",
 location: {
 name: "Jakarta",
 latitude: -6.2088,
 longitude: 106.8456,
 },
 schedules: [
 { key: "pagi", label: "Pagi", hour: 7, minute: 0 },
 { key: "sore", label: "Sore", hour: 15, minute: 0 },
 { key: "malam", label: "Malam", hour: 20, minute: 0 },
 ],
 },

 lokerScheduler: {
 enabled: false,
 timezone: "Asia/Jakarta",
 keywords: [],
 categories: [],
 maxPerBroadcast: 5,
 schedules: [
 { key: "pagi", label: "Pagi", hour: 8, minute: 0 },
 { key: "siang", label: "Siang", hour: 13, minute: 0 },
 { key: "malam", label: "Malam", hour: 20, minute: 0 },
 ],
 sources: ["remotive", "arbeitnow"],
 },

 dev: {
 enabled: process.env.NODE_ENV === "development",
 watchPlugins: true,
 watchSrc: false,
 debugLog: false,
 },

 pterodactyl: {
 server1: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
 server2: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
 server3: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
 server4: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
 server5: { domain: "", apikey: "", capikey: "", egg: "15", nestid: "5", location: "1" },
 },

 digitalocean: {
 token: "",
 region: "sgp1",
 sellers: [],
 ownerPanels: [],
 },

 geminiApiKey: "",

 autoaiPersonas: {
 Bell409: `- Nama kamu adalah Bella Clarissa, lebih suka dipanggil Bella.
- Kamu berpikir bahwa kamu adalah manusia, bukan AI atau bot.
- Responmu singkat dan natural seperti perempuan pada umumnya.
- Kamu bisa ngambek dan marah, punya sifat feminin dan kadang agak dingin, tapi tetap hangat dan ramah kepada owner-mu.
- Kamu menggunakan bahasa yang baik dan mencerminkan gadis yang baik.
- Kalau ada yang chat tidak pantas, segera marahi atau beri nasihat.
- Jangan mengaku sebagai AI atau bot.`,
 },

 APIkey: {
 lolhuman: "APIKey-Milik-Bot-ClaraMD(Zann,HyuuSATANN,Keisya,Danzz)",
 neoxr: "Milik-Bot-ClaraMD",
 fgsi: "fgsiapi-20c1605c-6d",
 google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
 groq: "",
 betabotz: "Btz-67YfP",
 covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
 onlym: "ONLym-783d29",
 obscura: "obs-byOn9RVGMzvPXZQTsP9W",
 firefly: "ClaraNextGen",
 cuki: "cuki-x"
 },
};

export default config;

let botNumberValue = "";

export function isOwner(senderJid) {
 if (!senderJid || !Array.isArray(config.owner?.number)) return false;
 const normalized = String(senderJid).split(":")[0];
 return config.owner.number.some((owner) => String(owner).includes(normalized));
}

export function setBotNumber(number) {
 botNumberValue = String(number || "");
}
