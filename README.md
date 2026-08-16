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

## 📝 Catatan Pengembangan

- Basis kode ini sebelumnya menggunakan penamaan internal berbeda dan sudah di-rename penuh menjadi `clara-*` di seluruh file/modul.
- Beberapa plugin opsional (auto-sahur, anti-culik, notif-ganti-tag) belum tersedia di basis ini — bot tetap berjalan normal tanpanya, fitur terkait saja yang nonaktif sampai plugin-nya dibuat.
- Desain UI menu menggunakan sistem style terpusat di `src/lib/clara-menu-style.js`, dipakai konsisten di seluruh command agar tampilan seragam.

## ⚠️ Disclaimer

Proyek ini menggunakan library WhatsApp tidak resmi (Baileys). Gunakan dengan bijak dan pahami risiko pemblokiran nomor oleh WhatsApp, terutama untuk penggunaan bot publik dengan volume tinggi.

## 📄 Lisensi

ISC
