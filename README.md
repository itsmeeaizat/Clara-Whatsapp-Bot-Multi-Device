# Clara MD

WhatsApp Multi-Device Bot berbasis [Baileys](https://github.com/WhiskeySockets/Baileys), dengan arsitektur plugin modular. Dilanjutkan dan dikembangkan secara mandiri dari basis script pribadi — bukan fork langsung dari repo `Clara-MD` (Zeltoria) yang sudah tidak aktif dikembangkan.

## ✨ Tentang

- **235+ command** tersebar di belasan kategori (owner, main, tools, fun, game, downloader, AI, group, religi, economy, RPG, dan lainnya)
- Sistem plugin **hot-reload** — command baru langsung terdeteksi tanpa restart bot saat mode development aktif
- Database lokal berbasis JSON (`lowdb`) — tidak butuh setup database eksternal
- Sistem energi/limit, level & exp, koin, dan status premium per user
- Proteksi grup: antilink, antispam, antitoxic, antiraid, antidelete, dan lainnya
- Scheduler bawaan: jadwal sholat, notifikasi cuaca, info loker, broadcast terjadwal
- Menu interaktif dengan tombol/list picker (bukan sekadar teks polos)
- **AI Agent dengan tool-use** (`.agent`) — bukan sekadar chat, tapi bisa memanggil tool sendiri

## 📦 Requirement

- **Node.js ≥ 22.0.0**
- NPM
- Nomor WhatsApp aktif untuk pairing bot (disarankan bukan nomor utama)

## 🚀 Instalasi

```bash
git clone <url-repo-kamu>
cd clara-md
npm install
```

### Konfigurasi

Edit `config.js` sebelum menjalankan bot:

| Bagian | Keterangan |
|---|---|
| `owner.number` | Nomor WhatsApp owner bot (format `62xxxxxxxxxx`, tanpa `+`) |
| `session.pairingNumber` | Nomor yang dipakai bot untuk pairing |
| `bot.name` | Nama tampilan bot |
| `command.prefix` | Prefix command (default `.`) |
| `APIkey.*` | API key pihak ketiga untuk fitur-fitur tertentu |

> ⚠️ **Penting:** jangan commit `config.js` yang sudah berisi API key asli ke repo publik. Disarankan pindahkan key sensitif ke environment variable sebelum di-push.

### Menjalankan bot

```bash
npm start        # mode production
npm run dev       # mode development (hot-reload plugin aktif)
```

Saat pertama kali jalan, bot akan meminta **pairing code** di terminal — masukkan kode tersebut di WhatsApp: **Perangkat Tertaut → Tautkan dengan nomor telepon**.

## 🗂️ Struktur Proyek

```
├── index.js              # Entry point
├── config.js              # Konfigurasi utama bot
├── plugins/
│   ├── main/               # Mayoritas command (234 file)
│   └── religi/              # Command bertema religi
├── src/
│   ├── connection.js         # Koneksi & event handler Baileys
│   ├── handler.js            # Router pesan masuk ke plugin
│   └── lib/                  # Modul inti (database, scheduler, plugin loader, dll.)
├── database/main/          # Data JSON lokal (users, groups, settings, dll.)
└── assets/                # Gambar, font, audio, video bawaan bot
```

## 🧩 Menambah Command Baru

Buat file baru di `plugins/main/`, contoh minimal:

```js
const pluginConfig = {
  name: "ping",
  alias: ["p"],
  category: "main",
  description: "Cek respon bot",
  usage: ".ping",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.reply("Pong! 🏓");
}

export default { config: pluginConfig, handler };
```

Saat `dev.watchPlugins` aktif di `config.js`, file baru di folder `plugins/` otomatis ter-load tanpa restart.

## 🤖 AI Agent (`.agent`)

Berbeda dengan plugin AI biasa yang sekali-tanya-sekali-jawab, `.agent` menjalankan
**agentic loop**: model memilih tool → tool dieksekusi → hasilnya dikembalikan ke model →
diulang sampai tugas selesai (maksimal 6 langkah).

### Tool yang tersedia

| Tool | Fungsi |
|---|---|
| `cari_web` | Cari info terkini via DuckDuckGo |
| `baca_halaman` | Ambil & bersihkan isi teks dari sebuah URL |
| `hitung` | Kalkulator aman (whitelist karakter, bukan `eval` bebas) |
| `waktu_sekarang` | Tanggal/jam sekarang, zona waktu bisa diatur |
| `info_grup` | Nama grup, jumlah member, daftar admin, deskripsi |
| `profil_user` | Level, exp, koin, energi, status premium dari database bot |
| `daftar_command` | Cari fitur bot berdasarkan kata kunci |

### Penggunaan

```
.agent <tugas>                  # jalankan agent
.agent sonnet-5 <tugas>         # pilih model spesifik
.agent model                    # daftar provider + status API key
.agent tools                    # daftar tool
.agent memory                   # lihat riwayat percakapan
.agent reset                    # hapus ingatan
```

Contoh:

```
.agent kurs dolar hari ini berapa?
.agent ringkas https://example.com
.agent 12.5% dari 3.400.000 berapa
.agent siapa aja admin grup ini
.agent ada fitur buat download tiktok?
```

### Model yang didukung

| Alias | Model | Provider |
|---|---|---|
| `sonnet-5` *(default)* | `claude-sonnet-5` | anthropic |
| `opus-5` | `claude-opus-5` | anthropic |
| `haiku` | `claude-haiku-4-5` | anthropic |
| `4o` / `mini` | `gpt-4o` / `gpt-4o-mini` | openai |
| `llama` | `llama-3.3-70b-versatile` | groq |
| `deepseek`, `mistral`, `together` | model default masing-masing | — |

Provider Anthropic memakai tool-use native; provider lain memakai format
function-calling ala OpenAI. Provider yang tidak mendukung tool akan tetap
menjawab, hanya tanpa kemampuan memanggil tool.

### Konfigurasi API key

Urutan prioritas pembacaan key:

1. Environment variable — **disarankan**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   export OPENAI_API_KEY="sk-..."
   export GROQ_API_KEY="gsk_..."
   ```
2. `config.js` → `APIkey.anthropic`, `APIkey.openai`, dst.
3. `config.js` → `aiHelp.apiKey` (bila `aiHelp.provider` cocok)

Opsional, atur default agent di `config.js`:

```js
agent: {
  provider: "anthropic",
  model: "claude-sonnet-5",
},
```

### Memory

Agent menyimpan 12 giliran percakapan terakhir per user di database
(`setting.agentMemory`). Hapus dengan `.agent reset`. Bila modul database
tidak tersedia, agent tetap jalan — hanya tanpa ingatan.

## 🛡️ Fitur Grup & Moderasi

Empat plugin di bawah ini **hook-nya sudah lama terpasang** di `src/connection.js`
dan `index.js`, tetapi file plugin-nya belum pernah dibuat — sehingga fiturnya
diam-diam tidak pernah aktif. Sekarang sudah terisi.

### `.anticulik` — cegah bot "diculik"

Bot otomatis keluar bila ditarik ke grup asing oleh orang yang tidak berhak.

```
.anticulik on / off
.anticulik mode owner|whitelist
.anticulik add 628xxx      .anticulik del 628xxx
.anticulik list            .anticulik log
```

| Mode | Perilaku |
|---|---|
| `owner` *(default)* | Hanya owner yang boleh menambahkan bot |
| `whitelist` | Owner + nomor pada daftar putih |
| `off` | Nonaktif |

Bila penambah tidak berhak: bot kirim pesan sopan, keluar, lalu lapor ke owner.
Bila info penambah tidak tersedia, bot **tidak** bertindak (menghindari false positive).

### `.giveaway` — undian grup otomatis

```
.giveaway start 30m 1 Voucher 50rb
.giveaway info        .giveaway peserta
.giveaway cancel      .giveaway draw
```

- Durasi: `90s`, `30m`, `2h`, `1d` (maks 7 hari)
- Peserta cukup ketik `ikut` / `join` / `gas` / `hadir` / `daftar` — bot memberi reaksi 🎉
- Pemenang diundi **otomatis** saat waktu habis (checker tiap 30 detik)
- Hanya admin grup yang bisa membuka, membatalkan, atau mengundi

### `.notifgantitag` — notifikasi perubahan label member

Mengumumkan saat tag/label member grup diubah (WhatsApp `protocolMessage` type 30).

```
.notifgantitag on / off
```

Nonaktif secara default per grup; hanya admin yang bisa mengubah.

### `.autosahur` — pengingat sahur otomatis

Memakai **jadwal imsak asli** dari `api.myquran.com` sesuai kota, bukan jam statis.

```
.autosahur on jakarta
.autosahur off
.autosahur jadwal            # lihat imsak hari ini
.autosahur menit 60 30 10    # atur tahap pengingat
```

Default mengingatkan pada 60, 30, dan 10 menit sebelum imsak, dengan pesan
bervariasi dan anti-duplikat (satu pengingat per tahap per hari).

## 👥 Fitur Grup Lanjutan

### `.absen` — absensi grup

```
.absen buka <judul>     .absen cek
.absen belum            .absen tutup
```

Member cukup ketik `hadir` / `absen` / `ada` (bot beri reaksi ✅).
`.absen belum` me-mention siapa saja yang belum absen. Buka/tutup khusus admin.

### `.voting` — polling dengan bar visual

```
.voting buat Makan dimana? | Padang | Sunda | Bakso
.voting buat 30m Libur besok? | Ya | Tidak     # dengan batas waktu
.voting hasil     .voting tutup     .voting batal
```

Member memilih cukup dengan mengetik **angka**. Bisa ganti pilihan (reaksi 🔄),
hasil ditampilkan sebagai bar `████░░░░░░ 4 (67%)`, dan hasil seri terdeteksi.
Maksimal 10 opsi.

### `.afk` — tandai sedang pergi

```
.afk lagi makan       .afk list
```

Kalau ada yang mention atau reply ke user yang AFK, bot memberi tahu alasan dan
sudah berapa lama. Status otomatis lepas begitu user itu chat lagi.

### `.rekap` — statistik aktivitas grup

```
.rekap hari      .rekap minggu
.rekap sepi      .rekap reset      # reset khusus admin
```

Papan peringkat member paling aktif (🥇🥈🥉) dan `.rekap sepi` menampilkan
anggota paling pendiam. Hanya menyimpan **hitungan angka per hari**, bukan isi
pesan, dan otomatis dipangkas ke 8 hari terakhir.

### `.reminder` — pengingat terjadwal

```
.reminder 30m rapat tim
.reminder harian 8h minum obat
.reminder list        .reminder hapus 1
```

Berjalan di grup maupun chat pribadi, dicek tiap 20 detik. Maksimal 20 pengingat
per chat.

## 🛠️ Moderasi & Administrasi Grup

### `.autowarn` — peringatan yang benar-benar menindak

Plugin `.warn` lama menampilkan "Warn Count: 1/3" tapi tidak pernah melakukan
apa pun saat mencapai 3. `.autowarn` melengkapinya:

```
.autowarn @user <alasan>      .autowarn cabut @user
.autowarn limit 3             .autowarn aksi kick|mute|notify
.autowarn list                .autowarn reset @user
```

Warn disimpan **per grup** (tidak tercampur antar grup) dan otomatis hangus
setelah 30 hari. Kalau bot bukan admin, aksi kick dilewati dengan pesan jelas.

### `.kas` — kas & iuran grup

```
.kas set 50rb                 .kas bayar @user 50rb
.kas keluar 30rb beli spanduk .kas cek
.kas belum                    .kas riwayat
.kas reset                    # periode baru, saldo tetap
```

Nominal menerima `50000`, `50rb`, `50k`, `1.5jt`. `.kas belum` me-mention
siapa saja yang masih nunggak beserta kekurangannya. Pengeluaran melebihi
saldo ditolak.

### `.piket` — jadwal giliran bergilir

```
.piket set Piket Kebersihan   .piket tambah @user
.piket now                    .piket next
.piket list                   .piket hapus @user
```

Giliran berputar otomatis. Kalau petugas yang sedang bertugas dihapus dari
daftar, urutan tetap konsisten (tidak meleset).

### `.catatan` — catatan bersama grup

```
.catatan simpan aturan Dilarang spam
.catatan list                 .catatan hapus aturan
#aturan                       # panggil cepat
```

Bisa menyimpan dari pesan yang di-reply. Daftar diurutkan berdasarkan catatan
yang paling sering dipanggil. Maksimal 50 catatan per grup.

## 📝 Catatan Pengembangan

- Basis kode ini sebelumnya menggunakan penamaan internal berbeda dan sudah di-rename penuh menjadi `clara-*` di seluruh file/modul.
- Plugin `auto-sahur`, `anti-culik`, `notif-ganti-tag`, dan `giveaway` kini **sudah tersedia**. Sebelumnya `src/connection.js` dan `index.js` sudah memanggil keempatnya, tapi file plugin-nya tidak ada sehingga fitur diam-diam tidak aktif.
- Desain UI menu menggunakan sistem style terpusat di `src/lib/clara-menu-style.js`, dipakai konsisten di seluruh command agar tampilan seragam.

## ⚠️ Disclaimer

Proyek ini menggunakan library WhatsApp tidak resmi (Baileys). Gunakan dengan bijak dan pahami risiko pemblokiran nomor oleh WhatsApp, terutama untuk penggunaan bot publik dengan volume tinggi.

## 📄 Lisensi

ISC
