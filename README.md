<div align="center">

# 🌸 Clara MD

**Bot WhatsApp Multi-Device dengan 290+ command, AI Agent, dan sistem plugin modular**

[![Gratis](https://img.shields.io/badge/Harga-GRATIS%20Selamanya-brightgreen?style=for-the-badge)](#-lisensi--bot-ini-gratis)
[![Dilarang Dijual](https://img.shields.io/badge/Dilarang-DIPERJUALBELIKAN-red?style=for-the-badge)](#-lisensi--bot-ini-gratis)
[![Node](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-Multi--Device-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)

**290 command · 799 alias · 1.089 total trigger · 15 kategori**

</div>

---

> ### 🎁 Bot ini **GRATIS** dan **DILARANG DIPERJUALBELIKAN**
>
> Kalau ada yang menawarkan Clara MD dengan bayaran — **jasa pasang, sewa bot,
> panel berbayar, atau fitur premium** — itu **melanggar lisensi**.
> Ambil sendiri, gratis, di repositori ini.
>
> 📖 Selengkapnya di [bagian lisensi](#-lisensi--bot-ini-gratis)

---

## ✨ Kenapa Clara?

|  | |
|---|---|
| 🤖 **AI Agent sungguhan** | Bukan sekadar chatbot — bisa memakai *tool*: cari web, baca halaman, hitung, cek data grup. Default **Claude Sonnet 5** |
| 🧩 **290+ command** | 15 kategori: AI, grup, game, ekonomi, RPG, downloader, religi, tools, dan lainnya |
| ⚡ **Hot-reload plugin** | Tambah command baru tanpa restart bot |
| 🛡️ **Proteksi grup lengkap** | Antilink, antispam, spamguard, anticulik, antiraid, antidelete |
| 💾 **Tanpa setup database** | JSON lokal via `lowdb` — tinggal jalan |
| 🕌 **Ramah lokal** | Jadwal sholat, auto-sahur, kas grup, piket, absensi — dibuat untuk pengguna Indonesia |
| 🎨 **Kartu sambutan** | Welcome card bergambar untuk member baru |
| ⏰ **Terjadwal otomatis** | Buka/tutup grup, pengingat, notifikasi cuaca, info loker |

---

## 🚀 Mulai Cepat

```bash
git clone https://github.com/itsmeeaizat/Clara-Whatsapp-Bot-Multi-Device.git
cd Clara-Whatsapp-Bot-Multi-Device
npm install
```

Edit `config.js` seperlunya:

| Bagian | Keterangan |
|---|---|
| `owner.number` | Nomor owner, format `62xxx` tanpa `+` |
| `session.pairingNumber` | Nomor yang dipakai bot |
| `bot.name` | Nama tampilan bot |
| `command.prefix` | Prefix command (default `.`) |

```bash
npm start      # production
npm run dev    # development + hot-reload plugin
```

Bot akan menampilkan **pairing code** di terminal. Masukkan di WhatsApp:
**Perangkat Tertaut → Tautkan dengan nomor telepon**.

> ⚠️ **Jangan commit `config.js` yang sudah berisi API key asli.**
> Pakai environment variable untuk kunci sensitif.

**Butuh:** Node.js ≥ 22 · nomor WhatsApp aktif (disarankan bukan nomor utama)

---

## 🤖 AI Agent

Berbeda dari plugin AI biasa yang sekali-tanya-sekali-jawab, `.agent`
menjalankan **agentic loop**: model memilih *tool* → tool dieksekusi →
hasilnya dikembalikan → diulang sampai tugas selesai (maks 6 langkah).

```bash
.agent kurs dolar hari ini berapa?
.agent ringkas https://example.com
.agent 12.5% dari 3.400.000 berapa
.agent siapa aja admin grup ini
```

**7 tool:** `cari_web` · `baca_halaman` · `hitung` · `waktu_sekarang` ·
`info_grup` · `profil_user` · `daftar_command`

<details>
<summary><b>Model, konfigurasi API key, dan memory</b></summary>

### Model

| Alias | Model | Provider |
|---|---|---|
| `sonnet-5` *(default)* | `claude-sonnet-5` | anthropic |
| `opus-5` | `claude-opus-5` | anthropic |
| `haiku` | `claude-haiku-4-5` | anthropic |
| `4o` / `mini` | `gpt-4o` / `gpt-4o-mini` | openai |
| `llama` | `llama-3.3-70b-versatile` | groq |

Anthropic memakai tool-use native; provider lain memakai format
function-calling ala OpenAI.

```bash
.agent sonnet-5 <tugas>    # pilih model
.agent model               # daftar + status API key
.agent tools               # daftar tool
.agent reset               # hapus ingatan
```

### API key

Urutan prioritas pembacaan:

1. **Environment variable** — disarankan
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   export OPENAI_API_KEY="sk-..."
   export GROQ_API_KEY="gsk_..."
   ```
2. `config.js` → `APIkey.anthropic`, `APIkey.openai`, dst.
3. `config.js` → `aiHelp.apiKey`

Opsional, atur default di `config.js`:

```js
agent: { provider: "anthropic", model: "claude-sonnet-5" },
```

### Memory

Menyimpan 12 giliran terakhir per user di `setting.agentMemory`.
Hapus dengan `.agent reset`. Bila database tidak tersedia, agent tetap
jalan — hanya tanpa ingatan.

</details>

---

## 👥 Fitur Grup Unggulan

<table>
<tr><td width="50%" valign="top">

**📋 `.absen` — absensi**
Member cukup ketik `hadir` (bot beri reaksi ✅).
`.absen belum` me-mention yang belum absen.

**🗳️ `.voting` — polling**
Pilih cukup ketik **angka**. Hasil bar visual
`████░░░░░░ 4 (67%)`, deteksi seri.

**💤 `.afk` — sedang pergi**
Di-mention saat AFK → bot balas alasan + durasi.
Lepas otomatis saat chat lagi.

**📊 `.rekap` — statistik chat**
Peringkat 🥇🥈🥉 dan `.rekap sepi` untuk
anggota paling pendiam.

**⏰ `.reminder` — pengingat**
Sekali atau harian, jalan di grup & chat pribadi.

**🎁 `.giveaway` — undian**
Peserta ketik `ikut`, pemenang diundi
**otomatis** saat waktu habis.

</td><td width="50%" valign="top">

**⚠️ `.autowarn` — peringatan menindak**
Kick/mute otomatis saat batas tercapai.
Warn per grup, hangus 30 hari.

**💰 `.kas` — kas & iuran**
`.kas belum` me-mention penunggak beserta
kekurangannya. Format `50rb`, `1.5jt`.

**🧹 `.piket` — giliran bergilir**
Berputar otomatis, urutan tetap konsisten.

**📝 `.catatan` — catatan bersama**
Panggil cepat dengan `#aturan`.

**🎨 `.welcomecard` — kartu sambutan**
Kartu bergambar untuk member baru & keluar.

**🛡️ `.spamguard` — anti flood**
Deteksi flood, pesan berulang, dan pesan
kepanjangan. Admin & owner kebal.

</td></tr>
</table>

<details>
<summary><b>Lihat semua perintah grup lengkap</b></summary>

### Keamanan

```bash
.anticulik on              # bot keluar bila ditarik orang tak berhak
.anticulik mode owner|whitelist
.spamguard on
.spamguard limit 5 7       # maks 5 pesan / 7 detik
.spamguard aksi warn|delete|kick
.autowarn @user <alasan>
.autowarn limit 3 · aksi kick|mute|notify
```

### Administrasi

```bash
.absen buka <judul> · cek · belum · tutup
.izin sakit demam tinggi   # member mengajukan
.izin list · setuju 1 · tolak 1
.piket tambah @user · now · next · list
.kas set 50rb · bayar @user · keluar 30rb <ket> · belum
.catatan simpan aturan <isi>   →  panggil: #aturan
```

### Otomatis & terjadwal

```bash
.jadwalgrup set 07:00 22:00    # buka/tutup grup otomatis
.autosahur on jakarta          # pengingat imsak per kota
.notifgantitag on              # notif perubahan label member
.welcomecard on · gaya v4|discord
.reminder 30m rapat tim
.reminder harian 8h minum obat
```

### Interaksi

```bash
.voting buat Makan dimana? | Padang | Sunda
.giveaway start 30m 1 Voucher 50rb
.rekap hari · minggu · sepi
.afk lagi makan
```

</details>

---

## 🎨 Dua Mode Tampilan Menu

Bot ini punya **dua gaya menu** yang bisa ditukar kapan saja:

```bash
.modemenu                  # lihat gaya aktif + pilihan
.modemenu klasik           # gaya Clara orisinal
.modemenu modern           # gaya khas repo ini
.modemenu contoh klasik    # intip dulu sebelum memilih
```

<table>
<tr><th width="50%">1️⃣ Klasik <sub>(default)</sub></th><th width="50%">2️⃣ Modern</th></tr>
<tr><td valign="top">

```
╔┈┈「 *Info User* 」
╎
╎❏ *Nama:* Aizat
╎❏ *Limit:* 25
╠┈┈「 *Info Bot* 」
╎❏ *Prefix:* [ *.* ]
╚┈┈┈┈┈┈┈┈┈❖

╔┈「 Main 」
╎ぎ .menu
╚┈┈┈┈┈┈┈┈┈❖
```

Meniru **[Clara-MD orisinal](https://github.com/Zeltoria/Clara-MD)**
lengkap dengan weton Jawa, tanggal Hijriah, dan uptime `02 H 15 M 30 S`.

</td><td valign="top">

```
✧　🤖 *ᴍᴇɴᴜ ᴜᴛᴀᴍᴀ* 　✧
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

╭─ 📊 *ꜱᴇʀᴠᴇʀ*
│  ✿ Bot  ·  *Clara*
│  ✿ Prefix  ·  *[ . ]*
╰─ · · ·
```

Gaya khas repo ini: header `✧`, kotak `╭─`, dan huruf small caps.

</td></tr>
</table>

Pilihan berlaku untuk **`.menu` dan `.allmenu`**, tersimpan di database
sehingga bertahan setelah restart.

## 🗂️ Struktur Proyek

```
├── index.js                 # Entry point
├── config.js                # Konfigurasi utama
├── plugins/
│   ├── main/                # Mayoritas command
│   ├── group/               # Fitur & moderasi grup
│   └── religi/              # Command religi
├── src/
│   ├── connection.js        # Koneksi & event Baileys
│   ├── handler.js           # Router pesan masuk
│   └── lib/                 # Modul inti
├── database/main/           # Data JSON lokal
└── assets/                  # Gambar, font, audio, video
```

### Kategori command

| Kategori | Jumlah | | Kategori | Jumlah |
|---|---|---|---|---|
| AI | 51 | | Info | 12 |
| Group | 47 | | Fun | 12 |
| Game | 41 | | Religi | 11 |
| Tools | 20 | | Maker | 11 |
| Economy | 18 | | Search | 10 |
| Owner | 16 | | Music | 10 |
| Download | 14 | | Main · Sticker | 17 |

---

## 🧩 Menambah Command Baru

Buat file di `plugins/main/` (atau `plugins/group/`):

```js
const pluginConfig = {
  name: "ping",
  alias: ["p", "cek"],
  category: "main",
  description: "Cek respon bot",
  usage: ".ping",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig, db }) {
  await m.reply("Pong! 🏓");
  return { handled: true };
}

export default { config: pluginConfig, handler };
```

Saat `dev.watchPlugins` aktif, file baru **langsung ter-load tanpa restart**.

<details>
<summary><b>Tips: cek admin grup dengan benar</b></summary>

`m.groupMetadata` adalah **objek**, bukan fungsi — memanggil
`m.groupMetadata()` akan melempar `TypeError`. Pakai helper bersama:

```js
import { isAdmin, num } from "../../src/lib/clara-group-util.js";

if (!isAdmin(m)) return m.reply("Khusus admin grup.");
```

Helper `clara-group-util.js` juga menyediakan `memberJids`, `parseDuration`,
`humanDuration`, `todayKey`, dan `readGroupState` / `writeGroupState`.

</details>

---

## 📄 Lisensi — Bot Ini **GRATIS**

<div align="center">

### 🆓 GRATIS SELAMANYA &nbsp;·&nbsp; 🚫 DILARANG DIPERJUALBELIKAN

</div>

Clara MD dirilis di bawah **Lisensi Penggunaan Non-Komersial**
(lihat berkas [`LICENSE`](LICENSE)).

### ✅ Boleh

- Dipakai untuk keperluan **pribadi maupun komunitas**
- **Dipelajari, dimodifikasi**, dan dikembangkan
- **Dibagikan ulang** — asli atau hasil modifikasi — selama **tetap gratis**
  dan menyertakan lisensi serta atribusi penulis asli
- Menerima **donasi sukarela** yang tidak mengikat, selama bot tetap bisa
  dipakai penuh tanpa membayar

### ❌ Dilarang

- **Menjual, menyewakan, atau melisensikan ulang** bot ini, sebagian maupun
  seluruhnya
- Menjadikannya bagian dari **produk atau layanan berbayar** — termasuk
  *jasa pasang bot*, *sewa bot*, *panel berbayar*, atau paket berlangganan
- **Mengunci fitur di balik pembayaran** (paywall), termasuk "premium" berbayar
  di bot turunan
- **Menghapus atau mengaburkan atribusi** penulis asli
- **Mengklaim** karya ini sebagai buatan sendiri

> 💡 Biaya pihak ketiga yang wajar dan di luar kendali penulis — misalnya sewa
> VPS milik pengguna sendiri atau kuota API berbayar — **bukan** termasuk
> menjual perangkat lunak ini.

### 🚨 Menemukan yang menjual Clara MD?

Itu **melanggar lisensi**. Kamu tidak perlu membayar siapa pun —
[**ambil gratis di sini**](https://github.com/itsmeeaizat/Clara-Whatsapp-Bot-Multi-Device).
Silakan laporkan lewat *issue* di repositori ini.

---

## ⚠️ Disclaimer

Proyek ini memakai library WhatsApp **tidak resmi** ([Baileys](https://github.com/WhiskeySockets/Baileys)).

- Gunakan dengan bijak dan pahami **risiko pemblokiran nomor** oleh WhatsApp,
  terutama untuk bot publik dengan volume tinggi
- Disarankan memakai **nomor cadangan**, bukan nomor utama
- Perangkat lunak disediakan **apa adanya, tanpa jaminan apa pun**
- Penulis **tidak bertanggung jawab** atas kerugian akibat penggunaan bot ini
- Dependensi pihak ketiga memiliki lisensinya masing-masing

---

## 📝 Catatan Pengembangan

- Proyek ini adalah **penerus [Clara-MD](https://github.com/Zeltoria/Clara-MD)**
  karya [Zeltoria](https://github.com/Zeltoria) yang sudah berhenti dikembangkan
  sejak 2023. Basis kodenya ditulis ulang mandiri (bukan fork langsung), namun
  **tampilan menunya sengaja disamakan** dengan Clara orisinal agar pengguna
  lama tetap merasa familier — blok `╔┈┈「 」` dengan `╎❏`, dan daftar command
  `╎ぎ`. Terima kasih untuk Zeltoria atas Clara yang asli 🙏
- Seluruh penamaan internal sudah diseragamkan menjadi `clara-*`
- Tampilan menu: `clara-classic-style.js` (gaya Clara lama),
  `clara-menu-style.js` (gaya modern), `clara-menu-builder.js` (penyusun
  kedua gaya), dan `clara-menu-mode.js` (pemilih mode)
- Helper grup terpusat di `src/lib/clara-group-util.js`

---

<div align="center">

**Dibuat dengan ❤️ oleh [Aizat](https://github.com/itsmeeaizat)**

Kalau Clara membantu, beri ⭐ di repositori ini — itu sudah lebih dari cukup.

**Gratis untuk semua. Selamanya.**

</div>
