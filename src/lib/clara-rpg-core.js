// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
/**
 * Clara RPG Core
 * ---------------------------------------------------------------
 * Mesin bersama untuk seluruh fitur RPG. Dibuat karena sembilan
 * plugin RPG lama ternyata hanya PLACEHOLDER: gold dan exp-nya
 * diacak lalu dibuang, tidak pernah tersimpan ke mana pun.
 *
 * Prinsip yang dipegang di sini:
 *  - Koin dan exp memakai API database yang sudah ada
 *    (updateKoin / updateExp), sehingga hasil bermain langsung
 *    terasa di .balance, .shop, dan papan peringkat.
 *  - Data khusus RPG (HP, stamina, senjata, inventaris) disimpan
 *    terpisah di db.setting("rpgPlayers") agar tidak mengotori
 *    objek user inti.
 *  - Semua akses database dibungkus try/catch. Database yang
 *    bermasalah tidak boleh menjatuhkan pemrosesan pesan.
 */

const KEY_PEMAIN = "rpgPlayers";
const KEY_DUNIA = "rpgWorld";

/* ------------------------------------------------------------------ */
/* Angka dasar                                                         */
/* ------------------------------------------------------------------ */

const MAKS_LEVEL = 100;
const HP_DASAR = 100;
const STAMINA_MAKS = 20;
const STAMINA_ISI_MENIT = 5; // 1 stamina tiap 5 menit

/** Exp yang dibutuhkan untuk naik ke level tertentu. */
function expUntukLevel(level) {
  const l = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(l, 1.55));
}

/** Hitung level dari total exp. */
function levelDariExp(exp) {
  const total = Math.max(0, Number(exp) || 0);
  let level = 1;
  while (level < MAKS_LEVEL && total >= expUntukLevel(level + 1)) level++;
  return level;
}

/** Kemajuan menuju level berikutnya, dalam persen 0-100. */
function progresLevel(exp) {
  const total = Math.max(0, Number(exp) || 0);
  const level = levelDariExp(total);
  if (level >= MAKS_LEVEL) return 100;
  const bawah = expUntukLevel(level);
  const atas = expUntukLevel(level + 1);
  const rentang = atas - bawah;
  if (rentang <= 0) return 100;
  return Math.max(0, Math.min(100, ((total - bawah) / rentang) * 100));
}

/* ------------------------------------------------------------------ */
/* Kelas karakter                                                      */
/* ------------------------------------------------------------------ */

const KELAS = {
  ksatria: {
    nama: "Ksatria",
    ikon: "🛡️",
    hp: 1.3,
    serang: 1.0,
    bela: 1.4,
    kritis: 0.05,
    ket: "Tebal dan tahan pukulan",
  },
  penyihir: {
    nama: "Penyihir",
    ikon: "🔮",
    hp: 0.8,
    serang: 1.5,
    bela: 0.7,
    kritis: 0.12,
    ket: "Serangan besar, badan rapuh",
  },
  pemanah: {
    nama: "Pemanah",
    ikon: "🏹",
    hp: 0.95,
    serang: 1.2,
    bela: 0.9,
    kritis: 0.25,
    ket: "Sering melancarkan serangan kritis",
  },
  perampok: {
    nama: "Perampok",
    ikon: "🗡️",
    hp: 1.0,
    serang: 1.15,
    bela: 1.0,
    kritis: 0.18,
    ket: "Gesit dan pandai mencari jarahan",
  },
};

const KELAS_BAWAAN = "ksatria";

/* ------------------------------------------------------------------ */
/* State pemain                                                        */
/* ------------------------------------------------------------------ */

/** Samakan bentuk JID jadi nomor saja. */
function nomor(jid) {
  return String(jid || "").replace(/@.+/g, "").split(":")[0];
}

/** Baca seluruh peta pemain RPG. */
function bacaSemua(db) {
  try {
    const isi = db?.setting?.(KEY_PEMAIN);
    return isi && typeof isi === "object" ? isi : {};
  } catch {
    return {};
  }
}

/** Bentuk pemain baru dengan nilai bawaan yang aman. */
function pemainBaru() {
  return {
    kelas: KELAS_BAWAAN,
    hp: HP_DASAR,
    stamina: STAMINA_MAKS,
    staminaAt: Date.now(),
    senjata: null,
    armor: null,
    inventaris: {},
    statistik: { menang: 0, kalah: 0, monster: 0, bosDikalahkan: 0 },
    dibuat: Date.now(),
  };
}

/**
 * Ambil data RPG seorang pemain, sudah digabung dengan exp/koin
 * dari database inti. Stamina ikut dipulihkan sesuai waktu berlalu.
 */
function ambilPemain(db, jid) {
  const id = nomor(jid);
  const semua = bacaSemua(db);
  const mentah = semua[id] && typeof semua[id] === "object" ? semua[id] : {};
  const p = { ...pemainBaru(), ...mentah };

  // Pulihkan stamina berdasarkan waktu berlalu
  const lewatMenit = Math.floor((Date.now() - (p.staminaAt || Date.now())) / 60000);
  if (lewatMenit >= STAMINA_ISI_MENIT) {
    const tambah = Math.floor(lewatMenit / STAMINA_ISI_MENIT);
    p.stamina = Math.min(STAMINA_MAKS, (p.stamina ?? 0) + tambah);
    p.staminaAt = Date.now();
  }

  // Exp dan koin selalu diambil dari sumber kebenaran: database user
  let user = null;
  try {
    user = db?.getUser?.(jid) || null;
  } catch {
    user = null;
  }
  p.exp = Math.max(0, Number(user?.exp) || 0);
  p.koin = Math.max(0, Number(user?.koin) || 0);
  p.level = levelDariExp(p.exp);
  p.nama = user?.name || "Petualang";

  const k = KELAS[p.kelas] || KELAS[KELAS_BAWAAN];
  p.hpMaks = Math.floor((HP_DASAR + p.level * 12) * k.hp);
  // Pemain yang belum pernah bertarung (hp belum tercatat) mulai penuh,
  // begitu pula bila hpMaks naik karena level atau ganti kelas.
  if (!Number.isFinite(mentah.hp) || p.hp > p.hpMaks) p.hp = p.hpMaks;
  p.hp = Math.max(0, Math.floor(p.hp));

  return p;
}

/** Simpan perubahan data RPG. Hanya medan milik RPG yang ditulis. */
function simpanPemain(db, jid, data) {
  const id = nomor(jid);
  try {
    const semua = bacaSemua(db);
    const bersih = { ...semua[id], ...data };
    // exp, koin, level, nama, hpMaks hanya turunan — jangan disimpan
    for (const buang of ["exp", "koin", "level", "nama", "hpMaks"]) {
      delete bersih[buang];
    }
    semua[id] = bersih;
    db?.setting?.(KEY_PEMAIN, semua);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Hadiah                                                              */
/* ------------------------------------------------------------------ */

/**
 * Berikan koin dan exp lewat API database inti, lalu laporkan
 * apakah pemain naik level.
 * @returns {{koin:number, exp:number, naikLevel:boolean, levelLama:number, levelBaru:number}}
 */
function beriHadiah(db, jid, koin = 0, exp = 0) {
  const sebelum = (() => {
    try {
      return Math.max(0, Number(db?.getUser?.(jid)?.exp) || 0);
    } catch {
      return 0;
    }
  })();
  const levelLama = levelDariExp(sebelum);

  try {
    if (koin) db?.updateKoin?.(jid, Math.floor(koin));
  } catch {
    /* ekonomi gagal, jangan jatuhkan permainan */
  }
  try {
    if (exp) db?.updateExp?.(jid, Math.floor(exp));
  } catch {
    /* sama */
  }

  const sesudah = (() => {
    try {
      return Math.max(0, Number(db?.getUser?.(jid)?.exp) || 0);
    } catch {
      return sebelum + Math.floor(exp);
    }
  })();
  const levelBaru = levelDariExp(sesudah);

  return {
    koin: Math.floor(koin),
    exp: Math.floor(exp),
    naikLevel: levelBaru > levelLama,
    levelLama,
    levelBaru,
  };
}

/** Kurangi koin pemain. Mengembalikan false bila saldo kurang. */
function ambilKoin(db, jid, jumlah) {
  const n = Math.floor(Math.max(0, jumlah));
  if (!n) return true;
  try {
    const punya = Math.max(0, Number(db?.getUser?.(jid)?.koin) || 0);
    if (punya < n) return false;
    db?.updateKoin?.(jid, -n);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Stamina                                                             */
/* ------------------------------------------------------------------ */

/** Pakai stamina. Mengembalikan false bila tidak cukup. */
function pakaiStamina(db, jid, jumlah = 1) {
  const p = ambilPemain(db, jid);
  if (p.stamina < jumlah) return false;
  simpanPemain(db, jid, {
    stamina: p.stamina - jumlah,
    staminaAt: p.staminaAt || Date.now(),
  });
  return true;
}

/** Berapa lama lagi sampai stamina bertambah satu, dalam menit. */
function menitStaminaBerikutnya(p) {
  if (p.stamina >= STAMINA_MAKS) return 0;
  const lewat = Math.floor((Date.now() - (p.staminaAt || Date.now())) / 60000);
  return Math.max(1, STAMINA_ISI_MENIT - (lewat % STAMINA_ISI_MENIT));
}

/* ------------------------------------------------------------------ */
/* Pertarungan                                                         */
/* ------------------------------------------------------------------ */

/** Kekuatan serang total, sudah menghitung kelas dan perlengkapan. */
function kekuatanSerang(p) {
  const k = KELAS[p.kelas] || KELAS[KELAS_BAWAAN];
  const dasar = 10 + p.level * 3;
  const senjata = SENJATA[p.senjata]?.serang || 0;
  return Math.floor(dasar * k.serang + senjata);
}

/** Pertahanan total. */
function kekuatanBela(p) {
  const k = KELAS[p.kelas] || KELAS[KELAS_BAWAAN];
  const dasar = 5 + p.level * 1.5;
  const armor = ARMOR[p.armor]?.bela || 0;
  return Math.floor(dasar * k.bela + armor);
}

/** Peluang serangan kritis, 0-1. */
function peluangKritis(p) {
  const k = KELAS[p.kelas] || KELAS[KELAS_BAWAAN];
  return Math.min(0.6, k.kritis + (SENJATA[p.senjata]?.kritis || 0));
}

/**
 * Hitung satu serangan.
 * @returns {{damage:number, kritis:boolean, meleset:boolean}}
 */
function hitungSerangan(penyerang, pertahanan, acakFn = Math.random) {
  if (acakFn() < 0.08) return { damage: 0, kritis: false, meleset: true };

  const kritis = acakFn() < peluangKritis(penyerang);
  const serang = kekuatanSerang(penyerang);
  const variasi = 0.85 + acakFn() * 0.3; // 85%-115%
  let damage = serang * variasi - pertahanan * 0.5;
  if (kritis) damage *= 1.8;

  return {
    damage: Math.max(1, Math.floor(damage)),
    kritis,
    meleset: false,
  };
}

/* ------------------------------------------------------------------ */
/* Barang                                                              */
/* ------------------------------------------------------------------ */

const SENJATA = {
  pedang_kayu: { nama: "Pedang Kayu", ikon: "🪵", serang: 5, kritis: 0, harga: 500 },
  pedang_besi: { nama: "Pedang Besi", ikon: "⚔️", serang: 15, kritis: 0.02, harga: 2500 },
  pedang_baja: { nama: "Pedang Baja", ikon: "🗡️", serang: 30, kritis: 0.05, harga: 8000 },
  tongkat_sihir: { nama: "Tongkat Sihir", ikon: "🪄", serang: 40, kritis: 0.08, harga: 15000 },
  pedang_naga: { nama: "Pedang Naga", ikon: "🐉", serang: 70, kritis: 0.12, harga: 50000 },
  excalibur: { nama: "Excalibur", ikon: "✨", serang: 120, kritis: 0.2, harga: 150000 },
};

const ARMOR = {
  baju_kain: { nama: "Baju Kain", ikon: "👕", bela: 3, harga: 400 },
  zirah_kulit: { nama: "Zirah Kulit", ikon: "🦺", bela: 10, harga: 2000 },
  zirah_besi: { nama: "Zirah Besi", ikon: "🛡️", bela: 22, harga: 7000 },
  zirah_naga: { nama: "Zirah Naga", ikon: "🐲", bela: 45, harga: 40000 },
  zirah_dewa: { nama: "Zirah Dewa", ikon: "🌟", bela: 80, harga: 120000 },
};

const BAHAN = {
  ramuan: { nama: "Ramuan HP", ikon: "🧪", harga: 300, jual: 120 },
  batu_asah: { nama: "Batu Asah", ikon: "🪨", harga: 800, jual: 320 },
  kristal: { nama: "Kristal Sihir", ikon: "💎", harga: 2000, jual: 900 },
  sisik_naga: { nama: "Sisik Naga", ikon: "🐍", harga: 5000, jual: 2200 },
  peti_harta: { nama: "Peti Harta", ikon: "🎁", harga: 0, jual: 1500 },
};

/** Cari barang di seluruh katalog. */
function cariBarang(kode) {
  const k = String(kode || "").toLowerCase().replace(/\s+/g, "_");
  if (SENJATA[k]) return { jenis: "senjata", kode: k, ...SENJATA[k] };
  if (ARMOR[k]) return { jenis: "armor", kode: k, ...ARMOR[k] };
  if (BAHAN[k]) return { jenis: "bahan", kode: k, ...BAHAN[k] };
  return null;
}

/** Tambah barang ke inventaris. */
function tambahBarang(db, jid, kode, jumlah = 1) {
  const p = ambilPemain(db, jid);
  const inv = { ...(p.inventaris || {}) };
  inv[kode] = Math.max(0, (inv[kode] || 0) + jumlah);
  if (inv[kode] === 0) delete inv[kode];
  simpanPemain(db, jid, { inventaris: inv });
  return inv[kode] || 0;
}

/** Kurangi barang. Mengembalikan false bila tidak punya cukup. */
function kurangiBarang(db, jid, kode, jumlah = 1) {
  const p = ambilPemain(db, jid);
  const inv = { ...(p.inventaris || {}) };
  if ((inv[kode] || 0) < jumlah) return false;
  inv[kode] -= jumlah;
  if (inv[kode] <= 0) delete inv[kode];
  simpanPemain(db, jid, { inventaris: inv });
  return true;
}

/* ------------------------------------------------------------------ */
/* Monster                                                             */
/* ------------------------------------------------------------------ */

const MONSTER = [
  { nama: "Slime", ikon: "🟢", lvl: 1, hp: 40, serang: 6, koin: 40, exp: 15 },
  { nama: "Kelelawar", ikon: "🦇", lvl: 3, hp: 65, serang: 10, koin: 70, exp: 25 },
  { nama: "Goblin", ikon: "👺", lvl: 5, hp: 95, serang: 15, koin: 120, exp: 40 },
  { nama: "Serigala", ikon: "🐺", lvl: 8, hp: 140, serang: 22, koin: 200, exp: 60 },
  { nama: "Golem Batu", ikon: "🗿", lvl: 12, hp: 240, serang: 30, koin: 350, exp: 95 },
  { nama: "Orc", ikon: "👹", lvl: 16, hp: 320, serang: 42, koin: 520, exp: 140 },
  { nama: "Naga Muda", ikon: "🐉", lvl: 22, hp: 500, serang: 60, koin: 900, exp: 240 },
  { nama: "Iblis", ikon: "😈", lvl: 30, hp: 750, serang: 85, koin: 1500, exp: 400 },
];

/** Pilih monster yang sepadan dengan level pemain. */
function monsterUntukLevel(level, acakFn = Math.random) {
  const layak = MONSTER.filter((mo) => mo.lvl <= level + 3);
  const pilih = layak.length ? layak : [MONSTER[0]];
  return { ...pilih[Math.floor(acakFn() * pilih.length)] };
}

/* ------------------------------------------------------------------ */
/* Tampilan                                                            */
/* ------------------------------------------------------------------ */

/** Bar visual, mis. HP atau progres. */
function bar(nilai, maks, lebar = 10) {
  const rasio = maks > 0 ? Math.max(0, Math.min(1, nilai / maks)) : 0;
  const isi = Math.round(rasio * lebar);
  return "█".repeat(isi) + "░".repeat(Math.max(0, lebar - isi));
}

/** Angka dengan pemisah ribuan gaya Indonesia. */
function angka(n) {
  return Math.floor(Number(n) || 0).toLocaleString("id-ID");
}

/** Nama kelas beserta ikonnya. */
function labelKelas(kode) {
  const k = KELAS[kode] || KELAS[KELAS_BAWAAN];
  return `${k.ikon} ${k.nama}`;
}


/* ------------------------------------------------------------------ */
/* Peliharaan (Pet)                                                    */
/* ------------------------------------------------------------------ */

const JENIS_PET = {
  kucing: { nama: "Kucing", ikon: "🐱", atkBonus: 5, defBonus: 0, raritas: "common", bobot: 40 },
  anjing: { nama: "Anjing", ikon: "🐶", atkBonus: 0, defBonus: 5, raritas: "common", bobot: 40 },
  elang: { nama: "Elang", ikon: "🦅", atkBonus: 10, defBonus: 0, raritas: "uncommon", bobot: 25 },
  serigala: { nama: "Serigala", ikon: "🐺", atkBonus: 15, defBonus: 5, raritas: "rare", bobot: 12 },
  naga_kecil: { nama: "Naga Kecil", ikon: "🐉", atkBonus: 25, defBonus: 10, raritas: "epic", bobot: 3 },
  feniks: { nama: "Feniks", ikon: "🔥", atkBonus: 40, defBonus: 20, raritas: "legendary", bobot: 0.5 },
};

function ambilPet(p) {
  if (!p?.peliharaan?.jenis) return null;
  return p.peliharaan;
}

function bonusPet(p) {
  const pet = ambilPet(p);
  if (!pet) return { atk: 0, def: 0 };
  const base = JENIS_PET[pet.jenis] || {};
  const lvlBonus = Math.floor((pet.level || 1) / 5);
  return {
    atk: (base.atkBonus || 0) + lvlBonus * 2,
    def: (base.defBonus || 0) + lvlBonus * 1,
  };
}

/* ------------------------------------------------------------------ */
/* Quest Harian                                                        */
/* ------------------------------------------------------------------ */

const QUEST_TEMPLATES = [
  { id: "menang_tarung", deskripsi: "Menangkan 3 pertarungan", target: 3, hadiahKoin: 500, hadiahExp: 80 },
  { id: "tambang_5x", deskripsi: "Tambang 5 kali", target: 5, hadiahKoin: 400, hadiahExp: 60 },
  { id: "mancing_3x", deskripsi: "Mancing 3 kali", target: 3, hadiahKoin: 300, hadiahExp: 50 },
  { id: "belanja_1k", deskripsi: "Belanjakan 1000 koin di toko", target: 1000, hadiahKoin: 600, hadiahExp: 70 },
  { id: "petualang_3x", deskripsi: "Petualang 3 kali", target: 3, hadiahKoin: 350, hadiahExp: 55 },
  { id: "duel_1x", deskripsi: "Menangkan 1 duel PvP", target: 1, hadiahKoin: 700, hadiahExp: 100 },
];

function buatQuestHarian(level) {
  const multiplier = 1 + Math.floor(level / 10) * 0.5;
  const pool = [...QUEST_TEMPLATES];
  const terpilih = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool.splice(idx, 1)[0];
    terpilih.push({
      ...q,
      progres: 0,
      selesai: false,
      claimed: false,
      hadiahKoin: Math.floor(q.hadiahKoin * multiplier),
      hadiahExp: Math.floor(q.hadiahExp * multiplier),
    });
  }
  return terpilih;
}

function progresQuest(p, questId, jumlah = 1) {
  if (!p?.questHarian) return;
  for (const q of p.questHarian) {
    if (q.id === questId && !q.selesai) {
      q.progres = Math.min(q.target, q.progres + jumlah);
      if (q.progres >= q.target) q.selesai = true;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Guild                                                               */
/* ------------------------------------------------------------------ */

const KEY_GUILD = "rpgGuilds";
const GUILD_MAKS_ANGGOTA = 20;
const GUILD_BIAYA_BUAT = 5000;


export {
  // konstanta
  KEY_PEMAIN,
  KEY_DUNIA,
  MAKS_LEVEL,
  HP_DASAR,
  STAMINA_MAKS,
  STAMINA_ISI_MENIT,
  KELAS,
  KELAS_BAWAAN,
  SENJATA,
  ARMOR,
  BAHAN,
  MONSTER,
  // level & exp
  expUntukLevel,
  levelDariExp,
  progresLevel,
  // pemain
  nomor,
  bacaSemua,
  pemainBaru,
  ambilPemain,
  simpanPemain,
  // ekonomi
  beriHadiah,
  ambilKoin,
  // stamina
  pakaiStamina,
  menitStaminaBerikutnya,
  // tempur
  kekuatanSerang,
  kekuatanBela,
  peluangKritis,
  hitungSerangan,
  // barang
  cariBarang,
  tambahBarang,
  kurangiBarang,
  monsterUntukLevel,
  // tampilan
  bar,
  angka,
  labelKelas,
  // peliharaan
  JENIS_PET,
  ambilPet,
  bonusPet,
  // quest harian
  QUEST_TEMPLATES,
  buatQuestHarian,
  progresQuest,
  // guild
  KEY_GUILD,
  GUILD_MAKS_ANGGOTA,
  GUILD_BIAYA_BUAT,
};
