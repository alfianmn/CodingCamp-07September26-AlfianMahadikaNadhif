# Implementation Plan: RevoU Dashboard

## Overview

Implementasi RevoU Dashboard sebagai aplikasi web satu halaman menggunakan HTML, CSS, dan Vanilla JavaScript murni. Semua logika dikemas dalam tiga file: `index.html`, `css/style.css`, dan `js/app.js`. Data persisten disimpan di Browser Local Storage. Pengujian menggunakan Vitest sebagai test runner dan fast-check untuk property-based testing.

---

## Tasks

- [x] 1. Scaffolding proyek dan kerangka HTML
  - Buat struktur direktori: `revou-dashboard/`, `css/`, `js/`
  - Buat `index.html` lengkap dengan elemen DOM seluruh widget: `#greeting-widget`, `#timer-widget`, `#todo-widget`, `#links-widget`, serta elemen internal setiap widget sesuai desain
  - Tambahkan atribut `data-theme="light"` pada elemen `<html>` dan elemen `#theme-toggle`
  - Buat `css/style.css` kosong (hanya komentar placeholder)
  - Buat `js/app.js` kosong (hanya komentar placeholder)
  - _Persyaratan: 5.2, 5.5, 5.6_

- [x] 2. Implementasi `StorageAPI`
  - [x] 2.1 Implementasikan modul `StorageAPI` di `js/app.js`
    - Implementasikan method `isAvailable()` menggunakan try/catch pada `localStorage.setItem`
    - Implementasikan method `get(key)` — mengembalikan `null` jika key tidak ada atau parse gagal
    - Implementasikan method `set(key, value)` — mengembalikan `true` jika berhasil, `false` jika QuotaExceededError
    - Implementasikan method `remove(key)`
    - Definisikan konstanta storage keys: `revou_todos`, `revou_links`, `revou_theme`, `revou_username`, `revou_pomodoro_duration`, `revou_todo_sort`
    - _Persyaratan: 3.8, 3.9, 3.10, 4.6, 4.7, 4.9_

  - [x] 2.2 Tulis unit test untuk `StorageAPI`
    - Test `get` mengembalikan `null` untuk key yang tidak ada
    - Test `set` mengembalikan `false` saat storage tidak tersedia (mock `localStorage`)
    - Test `get` mengembalikan `null` untuk JSON yang korup
    - _Persyaratan: 3.10, 4.9_

- [ ] 3. Implementasi `GreetingWidget` — logika waktu dan salam
  - [x] 3.1 Implementasikan fungsi-fungsi logika inti `GreetingWidget`
    - Implementasikan `formatTime(date)` — menghasilkan string `HH:MM` dua digit
    - Implementasikan `formatDate(date)` — menghasilkan format nama hari dan bulan bahasa Indonesia
    - Implementasikan `getGreeting(hour)` — memetakan jam 0–23 ke salam yang sesuai (Pagi/Siang/Sore/Malam)
    - Implementasikan `updateDisplay()` — memperbarui elemen DOM `#greeting-text`, `#current-time`, `#current-date`
    - Implementasikan `init()` dengan `setInterval` per 1 detik dan listener `visibilitychange` untuk sinkronisasi saat tab aktif kembali
    - Tangani zona waktu tidak dapat dibaca: tampilkan pesan "Waktu tidak tersedia" dan pertahankan salam terakhir
    - _Persyaratan: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [-] 3.2 Tulis property test untuk `formatTime` (Property 1)
    - **Property 1: Konsistensi Format Waktu**
    - Generator: `fc.date()`; assert format output cocok dengan regex `/^\d{2}:\d{2}$/` dan nilai dalam rentang valid (00–23 untuk jam, 00–59 untuk menit)
    - **Validates: Persyaratan 1.1**

  - [-] 3.3 Tulis property test untuk `formatDate` (Property 2)
    - **Property 2: Kelengkapan Nama Hari dan Bulan Indonesia**
    - Generator: `fc.date()`; assert output mengandung tepat satu nama hari dan satu nama bulan bahasa Indonesia dari daftar yang valid
    - **Validates: Persyaratan 1.2**

  - [-] 3.4 Tulis property test untuk `getGreeting` (Property 3)
    - **Property 3: Kemetaan Jam ke Salam**
    - Generator: `fc.integer({ min: 0, max: 23 })`; assert output adalah salah satu dari empat string salam dan memetakan ke salam yang benar sesuai rentang jam
    - **Validates: Persyaratan 1.3, 1.4, 1.5, 1.6**

- [ ] 4. Implementasi `TimerWidget` — countdown Pomodoro
  - [x] 4.1 Implementasikan state dan fungsi-fungsi inti `TimerWidget`
    - Definisikan state internal: `durationMinutes`, `remainingSeconds`, `isRunning`, `intervalId`
    - Implementasikan `formatTime(seconds)` — menghasilkan `MM:SS` dari total detik
    - Implementasikan `start()` menggunakan pendekatan berbasis `endTime` (`Date.now() + remainingSeconds * 1000`) untuk akurasi
    - Implementasikan `stop()` — `clearInterval`, pertahankan `remainingSeconds`
    - Implementasikan `reset()` — `clearInterval`, kembalikan ke `durationMinutes * 60`
    - Implementasikan `onTick()` — hitung sisa dari `endTime`, panggil `onComplete()` saat mencapai nol
    - Implementasikan `onComplete()` — hentikan timer, tampilkan notifikasi, nonaktifkan tombol Start dan Stop
    - Implementasikan `updateButtons()` — aktif/nonaktif tombol Start dan Stop berdasarkan `isRunning` dan `remainingSeconds`
    - Implementasikan `init()` — muat durasi dari storage, inisialisasi tampilan `#timer-display`
    - _Persyaratan: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [~] 4.2 Tulis property test konsistensi state tombol (Property 4)
    - **Property 4: Konsistensi State Tombol Timer**
    - Generator: `fc.record({ isRunning: fc.boolean(), remainingSeconds: fc.integer({ min: 0, max: 1500 }) })`; assert konfigurasi tombol selalu konsisten dengan state
    - **Validates: Persyaratan 2.4, 2.5**

  - [~] 4.3 Tulis property test stop mempertahankan sisa waktu (Property 5)
    - **Property 5: Stop Timer Mempertahankan Sisa Waktu**
    - Generator: `fc.integer({ min: 1, max: 1500 })`; set `remainingSeconds`, panggil `stop()`, assert `remainingSeconds` tidak berubah
    - **Validates: Persyaratan 2.6**

  - [~] 4.4 Tulis unit test untuk `TimerWidget`
    - Test tampilan awal 25:00 saat Dashboard dimuat
    - Test transisi state tombol saat countdown mencapai 00:00
    - _Persyaratan: 2.1, 2.9_

- [ ] 5. Implementasi `TodoWidget` — CRUD daftar tugas
  - [x] 5.1 Implementasikan fungsi validasi dan CRUD inti `TodoWidget`
    - Implementasikan `validateText(text)` — mengembalikan `{ valid: boolean, error?: string }` untuk string kosong, hanya spasi, atau lebih dari 200 karakter
    - Implementasikan `addTask(text)` — validasi, buat `TodoItem` baru (`id` berbasis timestamp, `completed: false`, `createdAt: Date.now()`), tambah ke array, simpan
    - Implementasikan `editTask(id, newText)` — validasi, perbarui teks, simpan; tolak dan pertahankan teks lama jika tidak valid
    - Implementasikan `toggleTask(id)` — flip `completed`, simpan
    - Implementasikan `deleteTask(id)` — hapus dari array, simpan
    - Implementasikan `saveTasks()` dan `loadTasks()` menggunakan `StorageAPI`
    - Implementasikan `renderList()` — render ulang seluruh `#todo-list` termasuk tampilan teks dicoret untuk tugas selesai
    - Tampilkan pesan error inline menggunakan `<span class="error-msg" role="alert">` yang dihapus saat pengguna mengetik
    - Tampilkan pesan error saat `StorageAPI` gagal menyimpan atau memuat
    - _Persyaratan: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [~] 5.2 Tulis property test penambahan tugas valid (Property 6)
    - **Property 6: Penambahan Tugas yang Valid Memperbesar Daftar**
    - Generator: `fc.string({ minLength: 1, maxLength: 200 })`; assert panjang daftar bertambah satu dan `completed = false`
    - **Validates: Persyaratan 3.1**

  - [~] 5.3 Tulis property test penolakan teks tidak valid (Property 7)
    - **Property 7: Penolakan Teks Tugas yang Tidak Valid**
    - Generator: `fc.oneof(fc.constant(''), fc.string().map(s => '   '), fc.string({ minLength: 201 }))`; assert `validateText` mengembalikan `{ valid: false }` dan daftar tidak berubah
    - **Validates: Persyaratan 3.2**

  - [~] 5.4 Tulis property test edit tugas tidak valid (Property 8)
    - **Property 8: Edit Tugas Tidak Valid Mempertahankan Teks Lama**
    - Generator: kombinasi `TodoItem` acak dan teks tidak valid; assert teks tugas tidak berubah setelah `editTask` dengan input tidak valid
    - **Validates: Persyaratan 3.4**

  - [~] 5.5 Tulis property test penghapusan tugas (Property 9)
    - **Property 9: Penghapusan Tugas Menghilangkan Tugas dari Daftar**
    - Generator: `fc.array(fc.record({...}), { minLength: 1 })`; pilih id acak, panggil `deleteTask`, assert id tidak ada dan panjang berkurang satu
    - **Validates: Persyaratan 3.7**

  - [~] 5.6 Tulis property test round-trip persistensi todo (Property 10)
    - **Property 10: Round-Trip Persistensi To-Do List**
    - Generator: `fc.array(fc.record({ id: fc.string(), text: fc.string(), completed: fc.boolean(), createdAt: fc.integer() }))`; serialize JSON dan deserialize, assert identik
    - **Validates: Persyaratan 3.9**

- [ ] 6. Implementasi `LinksWidget` — pengelola tautan cepat
  - [x] 6.1 Implementasikan fungsi validasi dan CRUD `LinksWidget`
    - Implementasikan `validateLabel(label)` — mengembalikan `{ valid: boolean, error?: string }` untuk label kosong, hanya spasi, atau lebih dari 100 karakter
    - Implementasikan `validateUrl(url)` — menggunakan `new URL(url)` dan cek protokol `http:` atau `https:`
    - Implementasikan `addLink(label, url)` — validasi keduanya, cek batas maksimum 20 tautan, buat `LinkItem`, simpan
    - Implementasikan `deleteLink(id)` — hapus dari array, simpan
    - Implementasikan `openLink(url)` — `window.open(url, '_blank', 'noopener,noreferrer')`
    - Implementasikan `renderLinks()` — render ulang `#links-list` sebagai tombol dengan tombol hapus
    - Implementasikan `saveLinks()` dan `loadLinks()` menggunakan `StorageAPI`; tampilkan panel kosong + pesan error jika storage gagal
    - _Persyaratan: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [~] 6.2 Tulis property test penambahan tautan valid (Property 11)
    - **Property 11: Penambahan Tautan Valid Muncul dalam Daftar**
    - Generator: label valid dan URL valid; assert tautan muncul dan panjang bertambah satu (saat total < 20)
    - **Validates: Persyaratan 4.1**

  - [~] 6.3 Tulis property test penolakan URL tidak valid (Property 12)
    - **Property 12: Penolakan URL yang Tidak Valid**
    - Generator: `fc.string()` yang tidak diawali `http://` atau `https://`; assert `validateUrl` mengembalikan `false` dan daftar tidak berubah
    - **Validates: Persyaratan 4.2**

  - [~] 6.4 Tulis property test batas kapasitas tautan (Property 13)
    - **Property 13: Batas Kapasitas Tautan**
    - Set daftar dengan tepat 20 item, panggil `addLink` dengan input valid apapun; assert ditolak dan panjang tetap 20
    - **Validates: Persyaratan 4.8**

  - [~] 6.5 Tulis property test round-trip persistensi tautan (Property 14)
    - **Property 14: Round-Trip Persistensi Tautan dengan Urutan**
    - Generator: `fc.array(fc.record({ id, label, url, order }))`; serialize JSON dan deserialize, assert urutan elemen identik
    - **Validates: Persyaratan 4.7**

- [~] 7. Checkpoint — pastikan semua tes lulus
  - Pastikan semua unit test dan property test yang telah ditulis lulus. Tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 8. Implementasi `ThemeManager` — mode terang dan gelap (Challenge 7)
  - [-] 8.1 Implementasikan modul `ThemeManager`
    - Implementasikan `load()` — baca dari `StorageAPI`, fallback ke `'light'` jika tidak ada
    - Implementasikan `apply(theme)` — set `document.documentElement.setAttribute('data-theme', theme)` 
    - Implementasikan `save(theme)` — tulis ke `StorageAPI` menggunakan key `revou_theme`
    - Implementasikan `toggle()` — flip tema saat ini, simpan, terapkan
    - Implementasikan `init()` — panggil `apply(load())` **sebelum** elemen pertama dirender (di `<head>` atau awal `app.js`) untuk mencegah flash of wrong theme
    - Pasang event listener pada `#theme-toggle`, perbarui ikon tombol (🌙/☀️) sesuai tema aktif
    - _Persyaratan: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [~] 8.2 Tulis property test round-trip persistensi tema (Property 15)
    - **Property 15: Round-Trip Persistensi Preferensi Tema**
    - Generator: `fc.constantFrom('light', 'dark')`; simpan ke storage, baca kembali, assert nilai identik
    - **Validates: Persyaratan 7.4, 7.5**

  - [~] 8.3 Tulis unit test untuk `ThemeManager`
    - Test default ke `'light'` saat tidak ada preferensi tersimpan
    - Test `toggle()` membalik tema dari `'light'` ke `'dark'` dan sebaliknya
    - _Persyaratan: 7.6_

- [ ] 9. Implementasi nama kustom pada salam (Challenge 8)
  - [~] 9.1 Tambahkan fitur nama pengguna ke `GreetingWidget`
    - Implementasikan `loadUsername()` — baca dari `StorageAPI` menggunakan key `revou_username`
    - Implementasikan `saveUsername(name)` — validasi panjang 1–50 karakter (bukan hanya spasi); simpan ke storage; perbarui tampilan salam segera
    - Perbarui `updateDisplay()` — jika `Nama_Pengguna` tersimpan, salam ditampilkan sebagai `"Selamat Pagi, Budi!"`; jika tidak ada, tampilkan `"Selamat Pagi!"`
    - Pasang event listener pada `#username-save-btn`; tampilkan pesan error inline jika validasi gagal
    - Muat nama pengguna saat `init()` dipanggil
    - _Persyaratan: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [~] 9.2 Tulis property test salam mencantumkan nama valid (Property 16)
    - **Property 16: Salam Mencantumkan Nama Pengguna yang Valid**
    - Generator: `fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)`; assert output salam mengandung nama sebagai substring
    - **Validates: Persyaratan 8.3, 8.5**

  - [~] 9.3 Tulis property test penolakan nama tidak valid (Property 17)
    - **Property 17: Penolakan Nama Pengguna yang Tidak Valid**
    - Generator: string kosong, hanya spasi, atau panjang > 50; assert `saveUsername` menolak dan nilai tersimpan tidak berubah
    - **Validates: Persyaratan 8.2**

- [ ] 10. Implementasi kustomisasi durasi Pomodoro (Challenge 9)
  - [~] 10.1 Tambahkan fitur kustomisasi durasi ke `TimerWidget`
    - Implementasikan `loadDuration()` — baca dari `StorageAPI` menggunakan key `revou_pomodoro_duration`, fallback ke 25
    - Implementasikan `saveDuration(minutes)` — validasi: bilangan bulat, 1 ≤ nilai ≤ 120; tolak jika timer sedang berjalan (`isRunning = true`) dengan pesan yang sesuai; simpan ke storage; perbarui tampilan timer dalam < 200ms
    - Pasang event listener pada `#duration-save`; tampilkan pesan error inline jika validasi gagal
    - _Persyaratan: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [~] 10.2 Tulis property test penolakan durasi tidak valid (Property 18)
    - **Property 18: Penolakan Durasi Pomodoro yang Tidak Valid**
    - Generator: `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 121 }), fc.float().filter(n => !Number.isInteger(n)))`; assert `saveDuration` menolak dan durasi tersimpan tidak berubah
    - **Validates: Persyaratan 9.2**

  - [~] 10.3 Tulis property test penolakan perubahan durasi saat timer berjalan (Property 19)
    - **Property 19: Penolakan Perubahan Durasi Saat Timer Berjalan**
    - Generator: `fc.integer({ min: 1, max: 120 })`; set `isRunning = true`, panggil `saveDuration`; assert selalu ditolak dan state tidak berubah
    - **Validates: Persyaratan 9.3**

- [ ] 11. Implementasi pencegahan duplikasi tugas (Challenge 10)
  - [~] 11.1 Tambahkan fungsi `isDuplicate` ke `TodoWidget`
    - Implementasikan fungsi `normalize(text)` — `text.trim().toLowerCase()`
    - Implementasikan `isDuplicate(text, excludeId = null)` — cek apakah ada tugas dengan teks yang sama setelah normalize, kecuali tugas dengan `excludeId`
    - Integrasikan ke `addTask` — panggil `isDuplicate` sebelum menambah, tolak dengan pesan peringatan jika duplikat
    - Integrasikan ke `editTask` — panggil `isDuplicate(newText, id)` sebelum menyimpan, tolak dengan pesan peringatan jika duplikat
    - _Persyaratan: 10.1, 10.2, 10.3, 10.4_

  - [~] 11.2 Tulis property test deteksi duplikasi case-insensitive (Property 20)
    - **Property 20: Deteksi Duplikasi Tugas (Case-Insensitive, Trim)**
    - Generator: `fc.string({ minLength: 1 })`; tambahkan tugas, coba tambah variasi case/spasi yang sama; assert `isDuplicate` mengembalikan `true`
    - **Validates: Persyaratan 10.1, 10.2**

  - [~] 11.3 Tulis property test pengecualian diri sendiri saat edit (Property 21)
    - **Property 21: Pengecualian Diri Sendiri pada Deteksi Duplikasi Saat Edit**
    - Generator: `TodoItem` acak; assert `isDuplicate(task.text, task.id)` selalu mengembalikan `false`
    - **Validates: Persyaratan 10.3, 10.4**

- [ ] 12. Implementasi pengurutan tugas (Challenge 11)
  - [~] 12.1 Implementasikan fungsi `sortTasks` dan integrasi UI di `TodoWidget`
    - Implementasikan `sortTasks(tasks, method)` — mendukung `'az'`, `'za'`, `'status'`, `'newest'`; tidak mutasi array asli (gunakan `[...tasks]`)
    - Untuk `'status'`: tugas belum selesai lebih dulu, urutan sekunder berdasarkan `createdAt` terbaru
    - Untuk `'az'` dan `'za'`: gunakan `localeCompare` dengan locale `'id'` case-insensitive
    - Implementasikan `loadSortPreference()` — baca dari `StorageAPI`, fallback ke `'newest'`
    - Simpan preferensi sortir ke storage saat pengguna memilih metode baru via `#sort-select`
    - Terapkan sortir pada `renderList()` sebelum merender item
    - _Persyaratan: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [~] 12.2 Tulis property test invariant sortir A–Z (Property 22)
    - **Property 22: Invariant Sortir Abjad A–Z**
    - Generator: `fc.array(fc.record({ text: fc.string(), ... }))`; setelah `sortTasks(tasks, 'az')`, assert setiap pasang berurutan memenuhi `a.text.toLowerCase() <= b.text.toLowerCase()`
    - **Validates: Persyaratan 11.2**

  - [~] 12.3 Tulis property test invariant sortir berdasarkan status (Property 23)
    - **Property 23: Invariant Sortir Berdasarkan Status**
    - Generator: array `TodoItem` acak dengan `completed` bervariasi; setelah `sortTasks(tasks, 'status')`, assert semua `completed = false` muncul sebelum `completed = true`
    - **Validates: Persyaratan 11.4**

  - [~] 12.4 Tulis property test round-trip persistensi preferensi sortir (Property 24)
    - **Property 24: Round-Trip Persistensi Preferensi Sortir**
    - Generator: `fc.constantFrom('az', 'za', 'status', 'newest')`; simpan ke storage, baca kembali, assert nilai identik
    - **Validates: Persyaratan 11.6, 11.7**

- [~] 13. Checkpoint — pastikan semua tes lulus
  - Pastikan semua unit test dan property test lulus. Tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 14. CSS — desain visual, responsivitas, dan aksesibilitas
  - [-] 14.1 Implementasikan CSS base dan sistem variabel tema
    - Definisikan CSS Custom Properties di `:root` untuk warna, font, spacing (mode terang)
    - Tambahkan override `[data-theme="dark"]` untuk semua variabel warna
    - Pastikan rasio kontras teks terhadap latar belakang minimal 4.5:1 (WCAG AA) di kedua mode
    - Gunakan ukuran font minimal 14px untuk teks konten
    - _Persyaratan: 6.2, 6.3, 7.2, 7.3_

  - [~] 14.2 Implementasikan layout widget dan responsivitas
    - Implementasikan layout dua kolom untuk desktop (≥ 768px): Timer + Todo berdampingan, Greeting dan Links melebar penuh
    - Implementasikan layout satu kolom untuk mobile (< 768px): semua widget vertikal berurutan
    - Pastikan tidak ada scrollbar horizontal pada lebar 320px–1920px; semua elemen interaktif dapat dijangkau
    - Pastikan tidak ada dua widget yang tumpang tindih
    - _Persyaratan: 5.1, 6.1, 6.4_

  - [~] 14.3 Tulis unit test visual keterbacaan (snapshot/manual check)
    - Verifikasi tipografi dan spasi memenuhi standar desain
    - _Persyaratan: 6.2, 6.3_

- [ ] 15. Fungsi `init()` — pengkabelan semua modul
  - [~] 15.1 Implementasikan fungsi `init()` dan hubungkan semua widget
    - Panggil `ThemeManager.init()` **pertama** (sebelum render apapun) untuk mencegah FOUWT (flash of unwanted theme)
    - Panggil `GreetingWidget.init()`, `TimerWidget.init()`, `TodoWidget.init()`, `LinksWidget.init()` secara berurutan
    - Pastikan `init()` dipanggil pada event `DOMContentLoaded`
    - Verifikasi bahwa tidak ada widget yang saling memanggil secara langsung (komunikasi hanya via shared `AppState` atau custom events)
    - _Persyaratan: 5.2, 5.3, 5.4_

  - [~] 15.2 Tulis unit test integrasi inisialisasi
    - Test seluruh widget terinisialisasi tanpa error saat `init()` dipanggil dengan DOM lengkap
    - Test `ThemeManager.init()` dipanggil sebelum widget lain
    - _Persyaratan: 5.3_

- [ ] 16. Setup GitHub Pages dan verifikasi deployment
  - [~] 16.1 Siapkan konfigurasi untuk deployment GitHub Pages
    - Pastikan semua path di `index.html` menggunakan path relatif (bukan absolut)
    - Verifikasi tidak ada dependensi eksternal yang memerlukan backend atau build step
    - Buat atau perbarui `README.md` dengan instruksi cara membuka file lokal dan cara deploy ke GitHub Pages
    - _Persyaratan: 5.2, 5.6_

- [~] 17. Checkpoint akhir — verifikasi menyeluruh
  - Pastikan semua test lulus, semua persyaratan tercakup, dan Dashboard dapat dibuka langsung sebagai file HTML. Tanyakan kepada pengguna jika ada pertanyaan.

---

## Notes

- Tugas bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap tugas merujuk ke persyaratan spesifik untuk ketertelusuran
- Semua 24 property test menggunakan fast-check dengan minimum 100 iterasi per properti
- Setiap property test diberi anotasi komentar: `// Feature: revou-dashboard, Property N: <judul>`
- Unit test menggunakan Vitest; tidak diperlukan bundler — Vitest mendukung Vanilla JS
- Timer menggunakan pendekatan berbasis `endTime` (bukan sekadar decrement) untuk menjaga akurasi meskipun tab tidak aktif
- Semua pesan error ditampilkan sebagai `<span class="error-msg" role="alert">` dan dihapus saat pengguna mengetik kembali
- Tidak ada framework, tidak ada build step — file dapat dibuka langsung di browser

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "4.2", "4.3", "4.4", "5.2", "5.3", "5.4", "5.5", "5.6", "6.2", "6.3", "6.4", "6.5", "8.1", "14.1"] },
    { "id": 3, "tasks": ["8.2", "8.3", "9.1", "11.1", "12.1", "14.2"] },
    { "id": 4, "tasks": ["9.2", "9.3", "10.1", "11.2", "11.3", "12.2", "12.3", "12.4", "14.3"] },
    { "id": 5, "tasks": ["10.2", "10.3", "15.1"] },
    { "id": 6, "tasks": ["15.2", "16.1"] }
  ]
}
```
