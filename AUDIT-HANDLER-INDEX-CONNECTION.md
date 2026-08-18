# Audit Bug — `index.js`, `src/handler.js`, `src/connection.js`

Tanggal audit: 18 Agustus 2026 · Commit awal: `97514b7`
Metode: pembacaan kode + pembuktian lewat eksekusi nyata (bukan dugaan).

> **STATUS: SELESAI SELURUHNYA.** Bug #1-#4 dan #11 diperbaiki pada commit
> `4557fdb`; bug #5, #6, #7, #8, #10 diperbaiki pada commit lanjutan.
> Verifikasi: 95 asersi regresi lulus, dan `node index.js` boot bersih
> dengan 303 plugin termuat tanpa satu pun error.
>
> Satu bug tambahan (#11) ditemukan **saat** mengerjakan perbaikan dan
> ikut dibetulkan — lihat bagian paling bawah.

---

## Ringkasan

| # | Bug | Berkas | Tingkat |
|---|---|---|---|
| 1 | `messageHandler` dkk. tidak pernah ditemukan → bot bisu total | `index.js` | 🔴 FATAL |
| 2 | Arity salah: 2 argumen dikirim, 5 dibutuhkan | `index.js` | 🔴 FATAL |
| 3 | `db.getPlugin()` tidak ada → routing command mustahil | `handler.js` | 🔴 FATAL |
| 4 | `db.addUser()` tidak ada → crash tak tertangkap | `handler.js` | 🔴 FATAL |
| 5 | `onGroupUpdate` menerima dua bentuk data berbeda | `connection.js` | 🟠 SERIUS |
| 6 | `groups.update` membuang update selain yang pertama | `connection.js` | 🟠 SERIUS |
| 7 | `flushInterval` menumpuk tiap reconnect | `connection.js` | 🟡 SEDANG |
| 8 | Cache registrasi tanpa invalidasi | `handler.js` | 🟡 SEDANG |
| 9 | `getUptime()` kode mati | `connection.js` | 🟡 SEDANG |
| 10 | 26 blok `catch` kosong menelan error | semua | 🟡 SEDANG |
| 11 | `handleCommand` baca `m.text`, harusnya `m.command` | `handler.js` | 🔴 FATAL |

**Empat bug pertama saling menutupi.** Bug #1 membuat bot tidak pernah
memproses pesan, sehingga bug #2, #3, dan #4 tidak pernah sempat terpicu.
Memperbaiki #1 saja justru akan memunculkan tiga crash baru.

---

## 🔴 Bug #1 — Semua handler adalah stub kosong

**Berkas:** `index.js` baris 5-17

```js
let messageHandler = async () => {};          // stub
try {
  const handlerMod = await import("./src/handler.js");
  if (typeof handlerMod.messageHandler === "function")   // <-- tidak pernah true
    messageHandler = handlerMod.messageHandler;
  ...
} catch {}
```

`src/handler.js` mengekspor `handleMessage`, **bukan** `messageHandler`.
Karena dibungkus `if (typeof ... === "function")`, tidak ada error yang
muncul — stub kosong dibiarkan terpasang secara diam-diam.

### Bukti

```
EXPORTS handler.js: ensureUserRegistered, handleMessage, isRegistered, markRegistered
  index.js mencari "messageHandler"            -> undefined
  index.js mencari "messageUpdateHandler"      -> undefined
  index.js mencari "groupHandler"              -> undefined
  index.js mencari "groupSettingsHandler"      -> undefined
  index.js mencari "handleAntiRemoveFromUpsert"-> undefined
```

Simulasi pesan `.menu` masuk memakai logika boot yang persis sama:

```
hasil messageHandler(.menu): undefined
jumlah balasan ke user: 0
>>> TERKONFIRMASI: pesan masuk, TIDAK ADA respons. Bot bisu total.
```

`grep` seluruh repo: `handleMessage` **tidak pernah dipanggil di mana pun.**

### Dampak

Kelima jalur ini mati total:

| Callback | Fitur yang mati |
|---|---|
| `messageHandler` | **seluruh command**, AFK, rekap, spamguard, absen, voting, giveaway, catatan |
| `messageUpdateHandler` | deteksi pesan diedit |
| `groupHandler` | welcome/goodbye, anticulik |
| `groupSettingsHandler` | notifikasi perubahan setelan grup |
| `handleAntiRemoveFromUpsert` | antidelete |

### Perbaikan

```js
if (typeof handlerMod.handleMessage === "function")
  messageHandler = handlerMod.handleMessage;
```

Empat nama lain memang belum ada di `handler.js` dan harus dibuat, atau
callback-nya dilepas dari `startConnection`.

---

## 🔴 Bug #2 — Arity salah

**Berkas:** `index.js` baris 330

```js
const handlerPromise = messageHandler(msg, sock);   // 2 argumen
```

Sedangkan tanda tangannya:

```js
async function handleMessage(m, sock, botConfig, db, uptime)   // 5 parameter
```

`botConfig`, `db`, dan `uptime` menjadi `undefined`.

### Bukti

```
handleMessage(m, sock) 2 argumen -> CRASH: TypeError: Cannot read properties of undefined (reading 'getUser')
=> Memperbaiki nama saja TIDAK CUKUP. Arity juga harus dibetulkan.
```

### Perbaikan

```js
const db = getDatabase();
const { getUptime } = await import("./src/connection.js");
const handlerPromise = messageHandler(msg, sock, config, db, getUptime());
```

---

## 🔴 Bug #3 — `db.getPlugin()` tidak ada

**Berkas:** `src/handler.js` baris 72

```js
const plugin = db.getPlugin(command);
```

### Bukti

```
db.getPlugin ada di prototype? false
metode db yang mirip: (TIDAK ADA SATU PUN)
panggilan db.getPlugin -> LEMPAR ERROR: TypeError: dbPalsu.getPlugin is not a function
```

`getPlugin` sebenarnya ada di `src/lib/clara-plugins.js`, bukan di kelas
`Database`. Untungnya `handleCommand` punya `try/catch`, jadi ini "hanya"
membuat **setiap command gagal senyap** dan mencetak error ke konsol.

### Perbaikan

```js
import { getPlugin } from "./lib/clara-plugins.js";
...
const plugin = getPlugin(command);
```

---

## 🔴 Bug #4 — `db.addUser()` tidak ada, dan tidak dijaga

**Berkas:** `src/handler.js` baris 36 dan 94

```js
db.addUser({ id: userId, ... });          // metode ini tidak ada
```

### Bukti

```
metode terkait user: getUser, setUser, deleteUser, getAllUsers, getUserCount, getTopUsers, users
db.addUser     >>> TIDAK ADA <<<
db.getUser     ADA
db.setUser     ADA

ensureUserRegistered -> CRASH: TypeError: db.addUser is not a function
```

Lebih parah, pemanggilnya **tidak dibungkus `try/catch`**:

```js
if (!isRegistered(userId)) {
  await ensureUserRegistered(m, db, botConfig);   // baris 94 — tanpa penjaga
}
```

Ini baris pertama `handleMessage`. Setiap pesan dari pengguna baru akan
menghentikan seluruh pemrosesan pesan tersebut.

### Perbaikan

Ganti `db.addUser(...)` menjadi `db.setUser(userId, {...})` sesuai API yang
ada, lalu bungkus pemanggilannya dengan `try/catch`.

---

## 🟠 Bug #5 — `onGroupUpdate` menerima dua bentuk data berbeda

**Berkas:** `src/connection.js` baris 587 dan 1234

```js
// baris 587 — event: groups.update
sock.ev.on("groups.update", async ([event]) => {
  ... await options.onGroupUpdate(ev, s);        // ev = Partial<GroupMetadata>
});

// baris 1234 — event: group-participants.update
sock.ev.on("group-participants.update", async (update) => {
  _groupEventQueue.push({ handler: options.onGroupUpdate, args: [update, sock] });
                                              // update = { id, action, participants }
});
```

Satu callback dipanggil dengan dua struktur berbeda. Menurut definisi tipe
Baileys sendiri (`node_modules/ourin/lib/Types/Events.d.ts`):

```
'groups.update': Partial<GroupMetadata>[];
'group-participants.update': { id, author, participants, action };
```

Penerima harus menebak sendiri sedang menangani yang mana, dan `event.action`
akan `undefined` untuk separuh panggilan.

---

## 🟠 Bug #6 — `groups.update` membuang update selain yang pertama

**Berkas:** `src/connection.js` baris 587

```js
sock.ev.on("groups.update", async ([event]) => {
```

Destrukturisasi `[event]` hanya mengambil elemen pertama. Baileys mengirim
**array**, dan saat beberapa grup berubah dalam satu batch, sisanya hilang
tanpa jejak. Bandingkan dengan baris 1244 yang menangani event sama dengan
benar memakai `for (const update of updates)`.

### Perbaikan

```js
sock.ev.on("groups.update", async (events) => {
  for (const event of events) { ... }
});
```

---

## 🟡 Bug #7 — `flushInterval` menumpuk tiap reconnect

**Berkas:** `src/connection.js` baris 1351

```js
const flushInterval = setInterval(() => {
  if (!connectionState.isConnected) { clearInterval(flushInterval); return; }
  ...
}, 30000);
```

Interval hanya membersihkan diri **bila sempat berdetak saat status sudah
terputus**. Pada reconnect cepat, `startConnection()` dipanggil ulang dan
membuat interval baru sementara yang lama masih hidup.

### Bukti

```
interval dibuat: 5 | dibersihkan: 0
=> 5 interval aktif bersamaan (masing-masing flush tiap 30 detik)
```

### Perbaikan

Simpan handle di `connectionState` dan `clearInterval` di awal
`startConnection()`, sejajar dengan penanganan `watchdogTimer` yang sudah
benar (`if (watchdogTimer) clearInterval(watchdogTimer)`).

---

## 🟡 Bug #8 — Cache registrasi tanpa invalidasi

**Berkas:** `src/handler.js` baris 15-22

```js
let registeredUsers = new Set();
```

Set ini hanya tumbuh. Setelah pengguna ditandai, `ensureUserRegistered`
tidak pernah berjalan lagi walau datanya dihapus dari database (`.unreg`,
reset, atau berkas JSON dihapus manual). Pengguna itu menjadi "hantu":
dianggap terdaftar padahal `db.getUser()` mengembalikan `null`.

Set juga tidak pernah dibersihkan, sehingga tumbuh terus selama proses hidup.

---

## 🟡 Bug #9 — `getUptime()` adalah kode mati

**Berkas:** `src/connection.js` baris 1393

Diekspor, tetapi tidak ada satu pun pemanggil di seluruh repo:

```
./src/connection.js:1393:function getUptime() {
./src/connection.js:1435:  getUptime,
./src/lib/clara-menu-builder.js:53:  * ... (hanya komentar)
```

Inilah akar masalah uptime `.menu` yang sebelumnya ditambal di
`clara-menu-builder.js` lewat `uptimeMs()`. Tambalan itu menebak satuan
karena nilainya memang tidak pernah sampai. Setelah bug #2 diperbaiki,
tambalan tersebut bisa disederhanakan.

---

## 🟡 Bug #10 — 26 blok `catch` kosong

| Berkas | Jumlah |
|---|---|
| `src/connection.js` | 20 |
| `index.js` | 6 |
| `src/handler.js` | 0 |

Termasuk yang menyembunyikan bug #1:

```js
} catch {}     // index.js baris 17
```

Kegagalan memuat handler tidak menghasilkan peringatan apa pun. Inilah
sebabnya bot tampak "berjalan normal" padahal seluruh routing mati.

Minimal seharusnya:

```js
} catch (e) {
  logger.error("bootstrap", "gagal memuat handler: " + e.message);
}
```

---

## Urutan perbaikan yang disarankan

Empat bug pertama **harus diperbaiki bersamaan**. Memperbaiki sebagian
justru memperburuk keadaan:

1. Perbaiki #1 saja → bot mulai memproses pesan → langsung crash oleh #2.
2. Perbaiki #1 + #2 → `ensureUserRegistered` jalan → crash oleh #4.
3. Perbaiki #1 + #2 + #4 → routing jalan → setiap command gagal oleh #3.

Karena itu satu perbaikan menyeluruh lebih aman daripada bertahap.

**Catatan penting:** perbaikan ini menyentuh jalur pesan utama dan
**tidak bisa diverifikasi tanpa koneksi WhatsApp sungguhan**. Uji otomatis
hanya mampu memastikan fungsi terpanggil dengan argumen benar, bukan bahwa
bot betul-betul membalas di grup.


---

# 🔴 Bug #11 — `handleCommand` membaca medan yang salah

**Ditemukan saat mengerjakan perbaikan, bukan pada audit awal.**

Setelah bug #1-#4 dibetulkan, uji dengan bentuk pesan yang **persis** seperti
keluaran `clara-serialize.js` tetap gagal. Penyebabnya medan yang dibaca salah.

`src/handler.js` baris 92 (versi lama):

```js
const text = (m.text || "").trim();
if (!text.startsWith(prefix)) return false;
const command = text.slice(prefix.length).split(/[ \n]+/)[0].toLowerCase();
```

Padahal `clara-serialize.js` baris 286-293 sudah memecah pesan menjadi:

| Medan | Isi untuk pesan `.pilih a | b` |
|---|---|
| `m.body` | `.pilih a \| b` — teks utuh |
| `m.command` | `pilih` — nama perintah, sudah huruf kecil |
| `m.text` | `a \| b` — **argumen saja, tanpa perintah** |

Untuk perintah tanpa argumen seperti `.ping`, `m.text` bernilai **string
kosong**, sehingga `text.startsWith(prefix)` selalu `false`.

### Bukti

```
pesan nyata ".ping" (m.text="", m.body=".ping") -> handled: false
>>> BUG #11 TERKONFIRMASI: handleCommand baca m.text, padahal command ada di m.body
```

### Kenapa nyaris lolos

Uji rantai pertama saya membentuk `m.text = ".ping"` — bentuk yang **tidak
pernah terjadi** pada pesan sungguhan. Uji itu lulus dan memberi rasa aman
palsu. Barulah setelah meniru keluaran serializer secara akurat, bug ini
muncul. Pelajaran: tiruan objek pesan harus meniru serializer, bukan
menebak bentuknya.

### Perbaikan

Percaya pada `m.command` yang sudah disiapkan serializer, dengan `m.body`
sebagai cadangan bila pesan belum diserialisasi:

```js
let command = String(m.command || "").toLowerCase();
if (!command) {
  const body = String(m.body ?? m.text ?? "").trim();
  if (!body.startsWith(prefix)) return false;
  command = body.slice(prefix.length).split(/[ \n]+/)[0].toLowerCase();
}
```

Validasi prefix memang tugas serializer, bukan handler. Serializer mendukung
**multi-prefix** (`database/prefix.json`) dan **mode tanpa prefix**; bila
handler memeriksa prefix sendiri, kedua fitur itu akan rusak.

---

# Ringkasan verifikasi

| Pemeriksaan | Hasil |
|---|---|
| Asersi regresi (`t8.mjs`) | **95 / 95 lulus** |
| `node index.js` | boot bersih, **303 plugin** termuat |
| Error saat boot | **nol** |
| `.ping` lewat rantai penuh | membalas dengan benar |
| `.menu` uptime 8130000 ms | tampil `02 H 15 M 30 S` ✅ |
| 9 plugin batch 6 & 7 | **9 / 9** merespons |
| Penjaga boot (export hilang) | keluar dengan pesan FATAL, kode 1 |

## Yang TIDAK bisa diverifikasi di sini

Perbaikan ini menyentuh jalur pesan utama. Uji otomatis membuktikan fungsi
terpanggil dengan argumen benar dan plugin membalas, **tetapi tidak bisa
membuktikan bot benar-benar menjawab di grup WhatsApp sungguhan.** Sandbox
ini tidak punya sesi WhatsApp — koneksi ditolak di tahap pairing.

**Mohon uji langsung** setelah menarik perubahan ini: kirim `.menu`, `.ping`,
dan satu perintah grup, lalu pastikan bot membalas.


---

# Lanjutan — Bug #5 dan #10 diperbaiki

## Bug #5 — amplop seragam untuk `onGroupUpdate`

Dua event dengan bentuk data berbeda kini dibungkus amplop yang sama:

```js
{ tipe: "metadata", grupId, data }  // dari groups.update
{ tipe: "peserta",  grupId, data }  // dari group-participants.update
```

Penerima tinggal memeriksa `tipe` lebih dulu. Kontraknya ditulis di JSDoc
`startConnection()`. Sebelumnya `data.action` sering `undefined` karena
penerima tidak tahu sedang menangani event yang mana.

### Regresi yang ikut tertangkap

Saat memperbaiki ini saya menemukan **regresi dari commit sebelumnya**.
Karena `onGroupUpdate` dilepas dari `index.js`, baris penjaga

```js
if (!options.onGroupUpdate) return;   // <- membunuh penyegaran cache
```

membuat `groupCache` tidak pernah disegarkan lagi. Cache itu dipakai
Baileys lewat `cachedGroupMetadata`, jadi **daftar admin akan basi setelah
promote/demote**. Penjaga dipindah sehingga penyegaran cache berjalan lebih
dulu, tanpa bergantung pada ada tidaknya callback.

Terverifikasi lewat simulasi: tanpa callback sekalipun, 3 dari 3 grup tetap
ter-cache; batch 7 grup tetap utuh; event cacat (null / tanpa id) dilewati
tanpa menjatuhkan antrean.

## Bug #10 — `catch` kosong

### `handler.js`: 11 → 1

Sebelas hook plugin dulu dibungkus `catch {}` berkomentar "plugin tidak
tersedia". Masalahnya plugin **hilang** dan plugin **rusak** menghasilkan
diam yang sama persis, sehingga bug di dalam plugin grup mustahil dilacak.

Diganti satu helper `jalankanHook(modul, fungsi, jalankan)` yang:

* melewati modul yang memang tidak terpasang (`ERR_MODULE_NOT_FOUND`) tanpa suara,
* melaporkan bila modul ada tetapi tidak mengekspor fungsi yang diminta,
* melaporkan error yang dilempar plugin, lengkap dengan nama fungsinya.

Dibuktikan dengan sengaja merusak `plugins/group/rekap.js`:

```
[handler] catatPesan() melempar error: BUG SENGAJA di dalam plugin rekap
handled: true | balasan: 1
```

Plugin rusak kini **disebut namanya**, sementara bot tetap melayani. Saat
berkasnya dihapus sama sekali, keluaran kembali senyap — persis seperti
yang diinginkan.

Reaksi emoji dipisah ke `beriReaksi()` karena murni kosmetik; kegagalannya
hanya muncul bila `DEBUG` aktif.

### `connection.js`: 20 → 14

Enam yang benar-benar menyembunyikan masalah kini melapor lewat
`laporHookGagal()`: `anticulik`, `welcomecard`, `goodbyecard`,
`notifgantitag`, `onRawMessage`, dan percobaan ulang `group-queue`.

Empat belas sisanya **sengaja dibiarkan** karena memang tidak ada yang bisa
dilakukan: menutup socket yang sudah mati, cache miss yang langsung
diambilkan ulang, dan pengambilan nama kontak yang sudah punya nilai
cadangan.

### `index.js`: 6 → 3

`initializeAgent`, `initSahurCron`, dan `otp-poller` kini melapor lewat
`logger.warn`. Tiga sisanya adalah pencetak error terakhir dan komentar.

---

# Verifikasi akhir

| Pemeriksaan | Hasil |
|---|---|
| Regresi bug #5 & #10 (`t9.mjs`) | **59 / 59 lulus** |
| Regresi jalur pesan (`t8.mjs`, ronde sebelumnya) | 95 / 95 lulus |
| `node index.js` | boot bersih, **303 plugin**, nol error |
| Uptime `.menu` | tetap `02 H 15 M 30 S` |
| 10 plugin batch 6 & 7 | **10 / 10** merespons |
| Plugin rusak | dilaporkan dengan nama fungsinya |
| Plugin hilang | dilewati tanpa suara |
| `groupCache` tanpa callback | tetap disegarkan |

Peringatan yang sama masih berlaku: **sandbox tidak punya sesi WhatsApp**,
jadi semua ini membuktikan fungsi terpanggil benar — bukan bahwa bot
menjawab di grup sungguhan. Mohon uji langsung.
