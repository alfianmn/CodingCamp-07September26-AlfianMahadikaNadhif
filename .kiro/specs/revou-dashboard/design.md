# Design Document

## Overview

RevoU Dashboard adalah aplikasi web beranda satu halaman (*single-page dashboard*) yang dibangun sepenuhnya dengan HTML, CSS, dan Vanilla JavaScript murni tanpa framework apapun. Aplikasi berjalan 100% di sisi klien (*client-side only*), menggunakan Browser Local Storage API sebagai satu-satunya mekanisme persistensi data.

Aplikasi ini menyediakan empat widget utama (Salam & Waktu, Focus Timer, To-Do List, Quick Links) ditambah lima fitur tantangan opsional (Dark Mode, Nama Kustom, Kustomisasi Durasi Pomodoro, Pencegahan Duplikasi Tugas, Pengurutan Tugas). Dashboard dapat dibuka langsung sebagai file HTML di browser maupun di-deploy ke GitHub Pages tanpa langkah build apapun.

---

## Architecture

### Gambaran Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                                                             │
│   ┌───────────────┐  ┌───────────────────────────────────┐  │
│   │  <link> CSS   │  │          <script> JS              │  │
│   │  css/style.css│  │        js/app.js                  │  │
│   └───────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │           js/app.js            │
              │                                │
              │  ┌──────────┐ ┌─────────────┐  │
              │  │ AppState │ │  StorageAPI │  │
              │  └──────────┘ └─────────────┘  │
              │                                │
              │  ┌──────────────────────────┐  │
              │  │       Widget Modules     │  │
              │  │  GreetingWidget          │  │
              │  │  TimerWidget             │  │
              │  │  TodoWidget              │  │
              │  │  LinksWidget             │  │
              │  └──────────────────────────┘  │
              └────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │     Browser Local Storage      │
              │  todos | links | settings      │
              └────────────────────────────────┘
```

### Prinsip Arsitektur

1. **Single File per Type**: Satu file CSS (`css/style.css`) dan satu file JavaScript (`js/app.js`).
2. **Module Pattern**: Setiap widget dienkapsulasi dalam IIFE atau objek literal di dalam `js/app.js` untuk menghindari polusi namespace global.
3. **Event-Driven UI**: Interaksi pengguna ditangani melalui event listeners. Widget tidak saling memanggil secara langsung; perubahan state disebarkan melalui custom events atau referensi shared state.
4. **Persistence Layer**: Semua operasi baca/tulis ke Local Storage dikelola oleh satu modul `StorageAPI` untuk memudahkan penanganan error dan unit testing.
5. **No Build Step**: Tidak ada bundler, transpiler, atau proses build. File dapat dibuka langsung di browser.

---

## Struktur File dan Folder

```
revou-dashboard/
├── index.html          # Markup utama, semua widget di-render di sini
├── css/
│   └── style.css       # Satu-satunya file CSS; menggunakan CSS Custom Properties untuk theming
└── js/
    └── app.js          # Satu-satunya file JS; berisi semua logika widget
```

### Struktur `index.html`

```html
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RevoU Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Theme Toggle (Challenge 7) -->
  <button id="theme-toggle" aria-label="Ganti tema">🌙</button>

  <main class="dashboard">
    <!-- Widget 1: Greeting -->
    <section id="greeting-widget" class="widget">...</section>

    <!-- Widget 2: Timer -->
    <section id="timer-widget" class="widget">...</section>

    <!-- Widget 3: Todo -->
    <section id="todo-widget" class="widget">...</section>

    <!-- Widget 4: Quick Links -->
    <section id="links-widget" class="widget">...</section>
  </main>

  <script src="js/app.js"></script>
</body>
</html>
```

### Struktur `js/app.js`

```
js/app.js
├── StorageAPI          — wrapper untuk localStorage (get/set/remove + error handling)
├── AppState            — state global yang dibagikan antar widget
├── GreetingWidget      — modul widget salam dan waktu
├── TimerWidget         — modul widget focus timer
├── TodoWidget          — modul widget to-do list
├── LinksWidget         — modul widget quick links
├── ThemeManager        — modul pengaturan dark/light mode (Challenge 7)
└── init()              — fungsi inisialisasi yang memanggil semua widget
```

---

## Components and Interfaces

### 1. StorageAPI

Modul ini bertanggung jawab atas semua operasi baca/tulis ke `localStorage`. Antarmuka:

```javascript
const StorageAPI = {
  get(key)           // → any | null; mengembalikan null jika key tidak ada atau parse gagal
  set(key, value)    // → boolean; true jika berhasil, false jika gagal (e.g. storage penuh)
  remove(key)        // → void
  isAvailable()      // → boolean; menguji apakah localStorage dapat digunakan
}
```

**Storage Keys** yang digunakan:

| Key | Tipe Nilai | Deskripsi |
|-----|-----------|-----------|
| `revou_todos` | `TodoItem[]` | Array semua tugas |
| `revou_links` | `LinkItem[]` | Array semua tautan |
| `revou_theme` | `'light' \| 'dark'` | Preferensi tema |
| `revou_username` | `string` | Nama pengguna kustom |
| `revou_pomodoro_duration` | `number` | Durasi Pomodoro dalam menit |
| `revou_todo_sort` | `SortMethod` | Preferensi urutan tugas |

---

### 2. GreetingWidget

Mengelola tampilan salam, waktu, tanggal, dan nama pengguna (Challenge 8).

**Elemen DOM yang dikelola:**
- `#greeting-text` — teks salam (mis. "Selamat Pagi, Budi!")
- `#current-time` — tampilan jam HH:MM
- `#current-date` — tampilan tanggal lengkap
- `#username-input` — input field nama pengguna
- `#username-save-btn` — tombol simpan nama

**Fungsi utama:**
```javascript
GreetingWidget = {
  init()                          // pasang interval, muat nama dari storage
  formatTime(date)                // Date → 'HH:MM'
  formatDate(date)                // Date → 'Senin, 14 Juli 2025'
  getGreeting(hour)               // number (0–23) → string salam
  updateDisplay()                 // perbarui semua elemen DOM
  loadUsername()                  // baca dari StorageAPI
  saveUsername(name)              // validasi + tulis ke StorageAPI
}
```

---

### 3. TimerWidget

Mengelola Focus Timer berbasis Pomodoro dengan kustomisasi durasi (Challenge 9).

**Elemen DOM yang dikelola:**
- `#timer-display` — tampilan MM:SS
- `#timer-start` — tombol Start
- `#timer-stop` — tombol Stop
- `#timer-reset` — tombol Reset
- `#duration-input` — input durasi dalam menit (Challenge 9)
- `#duration-save` — tombol simpan durasi

**State internal:**
```javascript
{
  durationMinutes: number,  // durasi yang dikonfigurasi (default: 25)
  remainingSeconds: number, // sisa waktu dalam detik
  isRunning: boolean,       // apakah timer sedang berjalan
  intervalId: number | null // ID setInterval yang sedang berjalan
}
```

**Fungsi utama:**
```javascript
TimerWidget = {
  init()
  formatTime(seconds)     // number → 'MM:SS'
  start()                 // mulai setInterval, update state
  stop()                  // clearInterval, pertahankan sisa waktu
  reset()                 // clearInterval, kembalikan ke durationMinutes
  onTick()                // dikurangi 1 detik, periksa 00:00
  onComplete()            // tampilkan notifikasi, hentikan timer
  updateButtons()         // sesuaikan enabled/disabled tombol
  saveDuration(minutes)   // validasi + tulis ke StorageAPI
  loadDuration()          // baca dari StorageAPI
}
```

---

### 4. TodoWidget

Mengelola daftar tugas dengan fitur tambah, edit, selesai, hapus, duplikasi (Challenge 10), dan sortir (Challenge 11).

**Elemen DOM yang dikelola:**
- `#todo-input` — input teks tugas baru
- `#todo-add-btn` — tombol tambah
- `#todo-list` — container `<ul>` untuk semua tugas
- `#sort-select` — dropdown sortir (Challenge 11)

**Fungsi utama:**
```javascript
TodoWidget = {
  init()
  addTask(text)              // validasi + tambah + simpan
  editTask(id, newText)      // validasi + perbarui + simpan
  toggleTask(id)             // flip status completed
  deleteTask(id)             // hapus dari array + simpan
  isDuplicate(text, excludeId?)  // cek duplikasi (trim + lower)
  sortTasks(method)          // urutkan tasks[] berdasarkan method
  renderList()               // render ulang seluruh #todo-list
  saveTasks()                // tulis ke StorageAPI
  loadTasks()                // baca dari StorageAPI
  validateText(text)         // → { valid: boolean, error?: string }
}
```

---

### 5. LinksWidget

Mengelola koleksi tautan cepat dengan fitur tambah, hapus, dan buka di tab baru.

**Elemen DOM yang dikelola:**
- `#link-label-input` — input label tautan
- `#link-url-input` — input URL tautan
- `#link-add-btn` — tombol tambah
- `#links-list` — container tombol-tombol tautan

**Fungsi utama:**
```javascript
LinksWidget = {
  init()
  addLink(label, url)      // validasi + tambah + simpan
  deleteLink(id)           // hapus dari array + simpan
  openLink(url)            // window.open(url, '_blank')
  renderLinks()            // render ulang #links-list
  saveLinks()              // tulis ke StorageAPI
  loadLinks()              // baca dari StorageAPI
  validateLabel(label)     // → { valid: boolean, error?: string }
  validateUrl(url)         // → { valid: boolean, error?: string }
}
```

---

### 6. ThemeManager (Challenge 7)

Mengelola peralihan antara mode terang dan mode gelap.

**Fungsi utama:**
```javascript
ThemeManager = {
  init()              // baca preferensi dari storage, terapkan
  toggle()            // flip tema saat ini
  apply(theme)        // set atribut data-theme pada <html>
  save(theme)         // tulis ke StorageAPI
  load()              // baca dari StorageAPI, fallback ke 'light'
}
```

---

## Data Models

### `TodoItem`

```javascript
{
  id: string,           // UUID atau timestamp sebagai string unik
  text: string,         // deskripsi tugas (1–200 karakter)
  completed: boolean,   // status penyelesaian
  createdAt: number     // Unix timestamp (ms) saat tugas dibuat
}
```

### `LinkItem`

```javascript
{
  id: string,           // UUID atau timestamp sebagai string unik
  label: string,        // nama tautan yang ditampilkan (1–100 karakter)
  url: string,          // URL tujuan, harus diawali http:// atau https://
  order: number         // indeks urutan penyimpanan (0-based)
}
```

### `AppSettings` (disimpan terpisah per key)

```javascript
// revou_theme:
'light' | 'dark'

// revou_username:
string  // nama pengguna, 1–50 karakter; tidak tersimpan jika belum diatur

// revou_pomodoro_duration:
number  // integer 1–120; default 25 jika tidak tersimpan

// revou_todo_sort:
'az' | 'za' | 'status' | 'newest'  // default 'newest' jika tidak tersimpan
```

### Schema Local Storage (JSON yang Disimpan)

```
localStorage['revou_todos']    = JSON.stringify(TodoItem[])
localStorage['revou_links']    = JSON.stringify(LinkItem[])
localStorage['revou_theme']    = 'light' | 'dark'
localStorage['revou_username'] = string
localStorage['revou_pomodoro_duration'] = string(number)
localStorage['revou_todo_sort'] = 'az' | 'za' | 'status' | 'newest'
```

---

## Tata Letak UI

### Layout Desktop (≥ 768px)

```
┌─────────────────────────────────────────────────────────────┐
│  [🌙]                                          Theme Toggle  │
├─────────────────────────────────────────────────────────────┤
│           Selamat Pagi, Budi!                                │
│           14:35   Senin, 14 Juli 2025                        │
│           [edit nama]                                        │
├───────────────────────┬─────────────────────────────────────┤
│   Focus Timer         │  To-Do List                         │
│   ┌─────────────┐     │  [input tugas...         ] [+]      │
│   │   25:00     │     │  [sortir: Terbaru ▼]                │
│   └─────────────┘     │  ☐ Belajar JavaScript               │
│   [Start] [Stop]      │  ☑ ~~Baca dokumentasi~~             │
│   [Reset]             │  ☐ Kerjakan latihan                 │
│   Durasi: [25] menit  │                                     │
├───────────────────────┴─────────────────────────────────────┤
│  Quick Links                                                 │
│  [Label] [URL] [Tambah]                                      │
│  [GitHub] [YouTube] [Google] [MDN] [×]                      │
└─────────────────────────────────────────────────────────────┘
```

### Layout Mobile (< 768px)

Semua widget ditampilkan dalam satu kolom vertikal dengan urutan: Greeting → Timer → Todo → Links.

---

## Algoritma Kunci

### Algoritma Penentuan Salam

```javascript
function getGreeting(hour) {
  // hour: 0–23
  if (hour >= 5  && hour <= 11) return 'Selamat Pagi';
  if (hour >= 12 && hour <= 17) return 'Selamat Siang';
  if (hour >= 18 && hour <= 20) return 'Selamat Sore';
  return 'Selamat Malam'; // 21–23 dan 0–4
}
```

### Algoritma Format Waktu

```javascript
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
```

### Algoritma Format Tanggal (Bahasa Indonesia)

```javascript
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
               'Juli','Agustus','September','Oktober','November','Desember'];

function formatDate(date) {
  const hari  = HARI[date.getDay()];
  const tgl   = date.getDate();
  const bulan = BULAN[date.getMonth()];
  const tahun = date.getFullYear();
  return `${hari}, ${tgl} ${bulan} ${tahun}`;
}
```

### Algoritma Timer Countdown

```javascript
function start() {
  if (state.isRunning) return;
  state.isRunning = true;
  const endTime = Date.now() + state.remainingSeconds * 1000;
  state.intervalId = setInterval(() => {
    state.remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    updateDisplay();
    if (state.remainingSeconds === 0) onComplete();
  }, 1000);
  updateButtons();
}
```

> Catatan: Timer menggunakan pendekatan berbasis `endTime` (bukan sekadar decrement) untuk menjaga akurasi meskipun tab tidak aktif atau JavaScript tertunda.

### Algoritma Pengecekan Duplikasi Tugas

```javascript
function normalize(text) {
  return text.trim().toLowerCase();
}

function isDuplicate(text, excludeId = null) {
  const normalized = normalize(text);
  return state.tasks.some(task =>
    task.id !== excludeId && normalize(task.text) === normalized
  );
}
```

### Algoritma Sortir Tugas

```javascript
function sortTasks(tasks, method) {
  const copy = [...tasks]; // tidak mutasi array asli
  switch (method) {
    case 'az':
      return copy.sort((a, b) =>
        a.text.toLowerCase().localeCompare(b.text.toLowerCase(), 'id'));
    case 'za':
      return copy.sort((a, b) =>
        b.text.toLowerCase().localeCompare(a.text.toLowerCase(), 'id'));
    case 'status':
      return copy.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt; // terbaru lebih dulu untuk status sama
      });
    case 'newest':
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}
```

### Algoritma Validasi URL

```javascript
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
```

### Algoritma Dark Mode (Challenge 7)

```javascript
function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // CSS menggunakan [data-theme="dark"] { ... } untuk override CSS Custom Properties
}
```

CSS menggunakan custom properties:

```css
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  /* ... */
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  /* ... */
}
```

---

## Correctness Properties

*Sebuah properti adalah karakteristik atau perilaku yang harus berlaku benar di seluruh eksekusi sistem yang valid—pada dasarnya, pernyataan formal tentang apa yang seharusnya dilakukan sistem. Properti berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi oleh mesin.*

---

### Property 1: Konsistensi Format Waktu

*Untuk sembarang* objek `Date` yang valid, fungsi `formatTime` harus menghasilkan string dengan format tepat dua digit jam (00–23) diikuti tanda titik dua dan tepat dua digit menit (00–59).

**Validates: Requirements 1.1**

---

### Property 2: Kelengkapan Nama Hari dan Bulan Indonesia

*Untuk sembarang* objek `Date` yang valid, fungsi `formatDate` harus menghasilkan string yang mengandung tepat satu nama hari bahasa Indonesia (`Minggu`, `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, atau `Sabtu`) dan tepat satu nama bulan bahasa Indonesia (`Januari` s.d. `Desember`).

**Validates: Requirements 1.2**

---

### Property 3: Kemetaan Jam ke Salam

*Untuk sembarang* jam integer dalam rentang 0–23, fungsi `getGreeting` harus menghasilkan tepat satu dari empat string salam yang valid (`Selamat Pagi`, `Selamat Siang`, `Selamat Sore`, `Selamat Malam`), dan setiap jam harus dipetakan ke salam yang benar sesuai rentang yang didefinisikan dalam persyaratan.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Konsistensi State Tombol Timer

*Untuk sembarang* state timer (berjalan/berhenti, sisa waktu berapa pun), konfigurasi tombol yang ditampilkan harus selalu konsisten: saat `isRunning = true`, tombol Stop aktif dan Start nonaktif; saat `isRunning = false` dan `remainingSeconds > 0`, tombol Start aktif dan Stop nonaktif.

**Validates: Requirements 2.4, 2.5**

---

### Property 5: Stop Timer Mempertahankan Sisa Waktu

*Untuk sembarang* timer yang sedang berjalan dengan sisa waktu `t` detik, memanggil `stop()` harus menghasilkan `remainingSeconds` yang sama dengan `t` (tidak berkurang).

**Validates: Requirements 2.6**

---

### Property 6: Penambahan Tugas yang Valid Memperbesar Daftar

*Untuk sembarang* daftar tugas dan sembarang teks tugas yang valid (panjang 1–200 karakter setelah trim), memanggil `addTask(text)` harus menghasilkan panjang daftar bertambah tepat satu dan tugas baru muncul dengan status `completed = false`.

**Validates: Requirements 3.1**

---

### Property 7: Penolakan Teks Tugas yang Tidak Valid

*Untuk sembarang* string yang merupakan string kosong, string yang hanya terdiri dari whitespace, atau string dengan panjang lebih dari 200 karakter, fungsi `validateText` harus mengembalikan `{ valid: false }` dan `addTask` harus menolak penambahan tanpa mengubah panjang daftar.

**Validates: Requirements 3.2**

---

### Property 8: Edit Tugas Tidak Valid Mempertahankan Teks Lama

*Untuk sembarang* tugas yang ada dan sembarang teks edit yang tidak valid, memanggil `editTask(id, invalidText)` harus mempertahankan teks tugas asal tanpa perubahan.

**Validates: Requirements 3.4**

---

### Property 9: Penghapusan Tugas Menghilangkan Tugas dari Daftar

*Untuk sembarang* daftar tugas yang mengandung tugas dengan `id` tertentu, memanggil `deleteTask(id)` harus menghasilkan daftar yang tidak lagi mengandung tugas dengan `id` tersebut, dan panjang daftar berkurang tepat satu.

**Validates: Requirements 3.7**

---

### Property 10: Round-Trip Persistensi To-Do List

*Untuk sembarang* array `TodoItem[]` yang valid, melakukan serialisasi ke JSON lalu deserialisasi kembali harus menghasilkan array yang secara struktural sama (id, text, completed, createdAt identik untuk setiap elemen).

**Validates: Requirements 3.9**

---

### Property 11: Penambahan Tautan Valid Muncul dalam Daftar

*Untuk sembarang* label yang valid (1–100 karakter) dan URL yang valid (diawali `http://` atau `https://`), memanggil `addLink(label, url)` harus menghasilkan tautan tersebut muncul dalam daftar dan jumlah tautan bertambah satu, selama jumlah tautan sebelumnya kurang dari 20.

**Validates: Requirements 4.1**

---

### Property 12: Penolakan URL yang Tidak Valid

*Untuk sembarang* string URL yang tidak diawali dengan `http://` atau `https://`, fungsi `validateUrl` harus mengembalikan `false` dan `addLink` harus menolak penambahan tanpa mengubah daftar tautan.

**Validates: Requirements 4.2**

---

### Property 13: Batas Kapasitas Tautan

*Untuk sembarang* daftar tautan yang telah berisi tepat 20 item, mencoba memanggil `addLink` dengan input apapun yang valid harus ditolak dan panjang daftar tetap 20.

**Validates: Requirements 4.8**

---

### Property 14: Round-Trip Persistensi Tautan dengan Urutan

*Untuk sembarang* array `LinkItem[]` yang valid, melakukan serialisasi ke JSON lalu deserialisasi kembali harus menghasilkan array dengan urutan elemen yang identik (urutan dipertahankan).

**Validates: Requirements 4.7**

---

### Property 15: Round-Trip Persistensi Preferensi Tema

*Untuk sembarang* nilai tema yang valid (`'light'` atau `'dark'`), menyimpan ke storage lalu membaca kembali harus menghasilkan nilai yang sama persis.

**Validates: Requirements 7.4, 7.5**

---

### Property 16: Salam Mencantumkan Nama Pengguna yang Valid

*Untuk sembarang* nama pengguna yang valid (1–50 karakter, bukan hanya whitespace), fungsi pemformatan salam harus menghasilkan string yang mengandung nama tersebut sebagai substring.

**Validates: Requirements 8.3, 8.5**

---

### Property 17: Penolakan Nama Pengguna yang Tidak Valid

*Untuk sembarang* string yang merupakan string kosong, string yang hanya terdiri dari whitespace, atau string dengan panjang lebih dari 50 karakter, fungsi `saveUsername` harus menolak penyimpanan dan tidak mengubah nilai nama yang tersimpan.

**Validates: Requirements 8.2**

---

### Property 18: Penolakan Durasi Pomodoro yang Tidak Valid

*Untuk sembarang* input durasi yang kurang dari 1, lebih dari 120, atau bukan bilangan bulat positif, fungsi `saveDuration` harus menolak dan tidak mengubah durasi yang tersimpan.

**Validates: Requirements 9.2**

---

### Property 19: Penolakan Perubahan Durasi Saat Timer Berjalan

*Untuk sembarang* durasi valid dalam rentang 1–120, jika state timer adalah `isRunning = true`, memanggil `saveDuration` harus selalu ditolak dan state timer tidak berubah.

**Validates: Requirements 9.3**

---

### Property 20: Deteksi Duplikasi Tugas (Case-Insensitive, Trim)

*Untuk sembarang* dua string teks yang menghasilkan output `normalize()` yang identik (setelah trim dan lowercase), fungsi `isDuplicate` harus mengembalikan `true` jika salah satunya sudah ada dalam daftar.

**Validates: Requirements 10.1, 10.2**

---

### Property 21: Pengecualian Diri Sendiri pada Deteksi Duplikasi Saat Edit

*Untuk sembarang* tugas dengan `id` tertentu, memanggil `isDuplicate(task.text, task.id)` harus selalu mengembalikan `false` meskipun teks yang diberikan identik dengan teks tugas itu sendiri.

**Validates: Requirements 10.3, 10.4**

---

### Property 22: Invariant Sortir Abjad A–Z

*Untuk sembarang* array tugas, setelah memanggil `sortTasks(tasks, 'az')`, setiap pasang elemen berurutan `(tasks[i], tasks[i+1])` harus memenuhi `tasks[i].text.toLowerCase() <= tasks[i+1].text.toLowerCase()`.

**Validates: Requirements 11.2**

---

### Property 23: Invariant Sortir Berdasarkan Status

*Untuk sembarang* array tugas, setelah memanggil `sortTasks(tasks, 'status')`, semua tugas dengan `completed = false` harus muncul sebelum semua tugas dengan `completed = true`.

**Validates: Requirements 11.4**

---

### Property 24: Round-Trip Persistensi Preferensi Sortir

*Untuk sembarang* nilai `SortMethod` yang valid (`'az'`, `'za'`, `'status'`, `'newest'`), menyimpan ke storage lalu membaca kembali harus menghasilkan nilai yang sama persis.

**Validates: Requirements 11.6, 11.7**

---

## Error Handling

### Strategi Umum

| Jenis Error | Penanganan |
|------------|-----------|
| LocalStorage tidak tersedia | Tampilkan pesan error non-blocking di UI; operasi tetap berjalan di memori sesi |
| LocalStorage penuh (QuotaExceeded) | Tangkap exception di `StorageAPI.set()`, kembalikan `false`, widget menampilkan pesan error |
| JSON parse error (data korup) | `StorageAPI.get()` mengembalikan `null`; widget menggunakan state default kosong |
| Zona waktu tidak dapat dibaca | `GreetingWidget` menampilkan pesan "Waktu tidak tersedia"; salam terakhir dipertahankan |
| URL tidak valid | `validateUrl()` mengembalikan `false`; pesan error ditampilkan inline di bawah input |
| Input teks kosong/spasi | `validateText()` mengembalikan `{ valid: false, error: '...' }`; pesan error ditampilkan |

### Tampilan Pesan Error

Semua pesan error ditampilkan sebagai teks inline di bawah elemen input terkait, menggunakan elemen `<span class="error-msg" role="alert">`. Pesan dihapus saat pengguna mulai mengetik kembali.

---

## Testing Strategy

### Pendekatan Pengujian Ganda

Strategi pengujian terdiri dari dua lapisan yang saling melengkapi:

1. **Unit Tests**: Memverifikasi contoh spesifik, kasus batas, dan kondisi error menggunakan Vitest atau Jest.
2. **Property-Based Tests**: Memverifikasi properti universal di seluruh input yang di-generate menggunakan **fast-check** (library property-based testing untuk JavaScript).

### Konfigurasi Property-Based Tests

- Setiap property test dikonfigurasi dengan minimum **100 iterasi** untuk memaksimalkan cakupan input acak.
- Setiap property test diberi komentar anotasi dengan format: `// Feature: revou-dashboard, Property N: <judul properti>`
- Setiap property test diimplementasikan sebagai satu test case yang memanggil `fc.assert(fc.property(...))`.

### Library yang Digunakan

- **Test runner**: Vitest (kompatibel dengan Vanilla JS, tidak memerlukan bundler khusus)
- **Property-Based Testing**: [fast-check](https://github.com/dubzzz/fast-check)

### Apa yang Diuji dengan Property Tests

Semua 24 properti kebenaran yang didefinisikan di atas diimplementasikan sebagai property-based tests dengan fast-check. Setiap properti menggunakan generator input yang sesuai:

- Fungsi format waktu/tanggal: `fc.date()` untuk men-generate tanggal acak
- Fungsi validasi: `fc.string()`, `fc.integer()` untuk men-generate input valid dan invalid
- Operasi daftar (tambah/hapus/sortir): `fc.array(fc.record({...}))` untuk men-generate daftar acak
- Round-trip serialization: kombinasi generator data struktural

### Apa yang Diuji dengan Unit Tests

- State awal widget (mis. timer menampilkan 25:00 saat load)
- Transisi state tombol pada kondisi terminal (mis. tombol setelah countdown = 00:00)
- Perilaku error handling saat LocalStorage tidak tersedia
- Kasus batas spesifik (mis. label tepat 100 karakter harus diterima, 101 harus ditolak)
- Dark mode default ke `'light'` saat tidak ada preferensi tersimpan

### Apa yang TIDAK Diuji dengan Automated Tests

- Rendering visual dan kepatuhan WCAG (memerlukan pengujian manual dengan alat aksesibilitas)
- Kompatibilitas lintas browser (memerlukan pengujian manual di setiap browser)
- Responsivitas layout (memerlukan pengujian manual atau Playwright/Puppeteer)
- Perilaku `window.open()` untuk membuka tab baru (bergantung pada browser)
- Akurasi timing setInterval dengan toleransi ±100ms (bergantung pada environment runtime)
