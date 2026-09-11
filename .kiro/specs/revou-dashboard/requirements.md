# Requirements Document

## Introduction

RevoU Dashboard adalah aplikasi web beranda (homepage-style dashboard) yang dibangun menggunakan HTML, CSS, dan Vanilla JavaScript murni tanpa framework. Aplikasi ini berjalan sepenuhnya di sisi klien menggunakan Local Storage sebagai mekanisme penyimpanan data.

Dashboard menyediakan empat fitur utama: tampilan salam kontekstual dengan waktu dan tanggal, Focus Timer berbasis Pomodoro, daftar tugas (To-Do List), dan koleksi tautan cepat (Quick Links). Selain itu, terdapat lima fitur tantangan pilihan (challenge) yang dapat dipilih tiga di antaranya untuk diimplementasikan.

Aplikasi ini bersifat standalone dan dapat digunakan sebagai halaman web biasa maupun sebagai browser extension, tanpa memerlukan backend server maupun proses setup yang rumit.

---

## Glossary

- **Dashboard**: Halaman web utama yang menampilkan seluruh widget secara terintegrasi.
- **Greeting_Widget**: Komponen UI yang menampilkan salam, tanggal, dan waktu saat ini.
- **Timer_Widget**: Komponen UI Focus Timer berbasis metode Pomodoro.
- **Todo_Widget**: Komponen UI pengelola daftar tugas.
- **Links_Widget**: Komponen UI pengelola dan penampil tautan favorit (Quick Links).
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan semua data persisten.
- **Sesi_Pomodoro**: Satu siklus fokus berdurasi yang dapat dikonfigurasi, secara default 25 menit.
- **Tugas**: Satu item pekerjaan dalam daftar to-do yang memiliki teks deskripsi dan status selesai.
- **Tautan**: Satu entri quick link yang terdiri dari label dan URL tujuan.
- **Mode_Tampilan**: Pengaturan tema visual yang dapat berupa mode terang (light) atau mode gelap (dark).
- **Nama_Pengguna**: Nama kustom yang disimpan pengguna untuk ditampilkan pada salam.

---

## Requirements

---

### Persyaratan 1: Tampilan Salam dan Waktu

**User Story:** Sebagai pengguna, saya ingin melihat waktu, tanggal, dan salam yang sesuai dengan waktu hari ini, agar saya mendapatkan orientasi waktu yang kontekstual saat membuka dasbor.

#### Kriteria Penerimaan

1. THE Greeting_Widget SHALL menampilkan waktu saat ini dalam format 24 jam (HH:MM) menggunakan jam dan menit dari zona waktu sistem pengguna.
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini dalam bahasa Indonesia dengan format nama hari, tanggal, nama bulan, dan tahun (contoh: Senin, 14 Juli 2025).
3. WHEN waktu sistem berada antara pukul 05:00 dan 11:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Pagi".
4. WHEN waktu sistem berada antara pukul 12:00 dan 17:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Siang".
5. WHEN waktu sistem berada antara pukul 18:00 dan 20:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Sore".
6. WHEN waktu sistem berada antara pukul 21:00 dan 04:59, THE Greeting_Widget SHALL menampilkan teks salam "Selamat Malam".
7. WHILE Dashboard sedang ditampilkan, THE Greeting_Widget SHALL memperbarui tampilan waktu setiap 1 detik tanpa memuat ulang halaman.
8. WHEN pengguna kembali ke tab Dashboard setelah tab tersebut tidak aktif, THE Greeting_Widget SHALL menyinkronkan kembali tampilan waktu ke waktu sistem terkini dalam waktu kurang dari 1 detik.
9. IF zona waktu sistem pengguna tidak dapat dibaca oleh browser, THEN THE Greeting_Widget SHALL menampilkan pesan bahwa waktu tidak tersedia dan tetap menampilkan salam berdasarkan waktu terakhir yang berhasil dibaca.

---

### Persyaratan 2: Focus Timer (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer Pomodoro dengan kontrol start, stop, dan reset, agar saya dapat mengelola sesi fokus kerja secara efektif.

#### Kriteria Penerimaan

1. WHEN Dashboard pertama kali dimuat, THE Timer_Widget SHALL menampilkan hitung mundur dengan durasi default 25 menit dalam format MM:SS (25:00).
2. WHEN pengguna menekan tombol Start dan timer tidak sedang berjalan, THE Timer_Widget SHALL memulai hitung mundur dari nilai waktu saat ini dalam waktu kurang dari 200 milidetik.
3. WHILE timer sedang berjalan, THE Timer_Widget SHALL memperbarui tampilan hitung mundur setiap 1 detik dengan akurasi ±100 milidetik.
4. WHILE timer sedang berjalan, THE Timer_Widget SHALL menampilkan tombol Stop dalam keadaan aktif dan tombol Start dalam keadaan nonaktif.
5. WHILE timer tidak sedang berjalan dan nilai waktu tersisa lebih dari 00:00, THE Timer_Widget SHALL menampilkan tombol Start dalam keadaan aktif dan tombol Stop dalam keadaan nonaktif.
6. WHEN pengguna menekan tombol Stop dan timer sedang berjalan, THE Timer_Widget SHALL menghentikan hitung mundur dalam waktu kurang dari 200 milidetik dan mempertahankan nilai waktu tersisa.
7. WHEN pengguna menekan tombol Reset, THE Timer_Widget SHALL menghentikan timer dan mengembalikan tampilan hitung mundur ke 25:00.
8. WHEN hitung mundur mencapai 00:00, THE Timer_Widget SHALL menampilkan notifikasi kepada pengguna yang mengindikasikan sesi fokus telah selesai.
9. WHEN hitung mundur mencapai 00:00, THE Timer_Widget SHALL menghentikan timer secara otomatis dan menonaktifkan tombol Start serta tombol Stop.

---

### Persyaratan 3: Daftar Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya dengan kemampuan tambah, edit, selesai, dan hapus, agar saya dapat melacak pekerjaan yang perlu dilakukan.

#### Kriteria Penerimaan

1. WHEN pengguna memasukkan teks tugas dengan panjang 1 hingga 200 karakter dan mengkonfirmasi penambahan, THE Todo_Widget SHALL menambahkan tugas baru dengan status belum selesai ke daftar.
2. IF teks tugas yang dimasukkan pengguna kosong, hanya mengandung spasi, atau melebihi 200 karakter, THEN THE Todo_Widget SHALL menolak penambahan dan menampilkan pesan kesalahan kepada pengguna yang menjelaskan alasan penolakan.
3. WHEN pengguna memilih opsi edit pada sebuah tugas, THE Todo_Widget SHALL menampilkan field input yang berisi teks tugas saat ini untuk dapat diubah.
4. IF teks hasil edit tugas kosong, hanya mengandung spasi, atau melebihi 200 karakter, THEN THE Todo_Widget SHALL menolak penyimpanan, menampilkan pesan kesalahan kepada pengguna, dan mempertahankan teks tugas yang lama.
5. WHEN pengguna menyimpan hasil edit tugas dengan teks yang valid, THE Todo_Widget SHALL memperbarui teks tugas dengan teks yang baru.
6. WHEN pengguna menandai sebuah tugas sebagai selesai, THE Todo_Widget SHALL mengubah status tugas menjadi selesai dan menampilkan tampilan visual berbeda (misalnya: teks dicoret) untuk membedakannya dari tugas yang belum selesai.
7. WHEN pengguna menghapus sebuah tugas, THE Todo_Widget SHALL menghapus tugas tersebut dari daftar secara permanen.
8. WHEN perubahan dilakukan pada daftar tugas (tambah, edit, selesai, atau hapus), THE Todo_Widget SHALL menyimpan seluruh daftar tugas ke Local_Storage dalam waktu 1 detik setelah perubahan terjadi.
9. WHEN Dashboard dimuat ulang, THE Todo_Widget SHALL memuat dan menampilkan semua tugas yang sebelumnya tersimpan di Local_Storage dalam waktu kurang dari 2 detik.
10. IF Local_Storage tidak dapat diakses saat menyimpan atau memuat tugas, THEN THE Todo_Widget SHALL menampilkan pesan kesalahan kepada pengguna bahwa data tidak dapat disimpan atau dimuat, dan tetap menampilkan tugas yang ada dalam memori sesi saat ini.

---

### Persyaratan 4: Tautan Cepat (Quick Links)

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan ke website favorit saya dari dasbor, agar saya dapat berpindah ke situs yang sering dikunjungi dengan cepat.

#### Kriteria Penerimaan

1. WHEN pengguna menambahkan tautan baru dengan label dan URL yang valid, THE Links_Widget SHALL menampilkan tombol tautan baru di panel Quick Links yang menampilkan teks label tersebut.
2. IF URL yang dimasukkan pengguna tidak mengikuti format URL yang valid (mengandung protokol http:// atau https://), THEN THE Links_Widget SHALL menolak penambahan, tidak menyimpan tautan, dan menampilkan pesan kesalahan yang mengindikasikan format URL tidak valid kepada pengguna.
3. IF label tautan yang dimasukkan pengguna kosong, hanya mengandung spasi, atau melebihi 100 karakter, THEN THE Links_Widget SHALL menolak penambahan, tidak menyimpan tautan, dan menampilkan pesan kesalahan yang mengindikasikan label tidak valid kepada pengguna.
4. WHEN pengguna mengklik sebuah tombol tautan, THE Links_Widget SHALL membuka URL yang terkait di tab baru browser tanpa menutup atau menavigasi tab yang sedang aktif.
5. WHEN pengguna menghapus sebuah tautan, THE Links_Widget SHALL menghapus tombol tautan tersebut dari panel secara permanen dan tidak lagi menampilkannya saat Dashboard dimuat ulang.
6. WHEN perubahan dilakukan pada daftar tautan (tambah atau hapus), THE Links_Widget SHALL menyimpan seluruh daftar tautan ke Local_Storage dalam waktu 1 detik setelah perubahan terjadi.
7. WHEN Dashboard dimuat ulang, THE Links_Widget SHALL memuat dan menampilkan semua tautan yang sebelumnya tersimpan di Local_Storage dalam urutan yang sama seperti saat disimpan.
8. IF jumlah tautan yang tersimpan telah mencapai 20 tautan, THEN THE Links_Widget SHALL menolak penambahan tautan baru dan menampilkan pesan kesalahan yang mengindikasikan batas maksimum tautan telah tercapai.
9. IF Local_Storage tidak tersedia atau gagal dibaca saat Dashboard dimuat ulang, THEN THE Links_Widget SHALL menampilkan panel Quick Links dalam keadaan kosong dan menampilkan pesan kesalahan yang mengindikasikan data tautan tidak dapat dimuat.

---

### Persyaratan 5: Kompatibilitas Browser dan Struktur Proyek

**User Story:** Sebagai pengguna, saya ingin aplikasi berjalan dengan baik di semua browser modern dan dapat di-deploy ke GitHub Pages, agar saya dapat mengaksesnya dari mana saja tanpa instalasi.

#### Kriteria Penerimaan

1. THE Dashboard SHALL berfungsi dengan benar di rilis stabil terbaru dari Google Chrome, Mozilla Firefox, Microsoft Edge, dan Apple Safari.
2. THE Dashboard SHALL dapat dijalankan sebagai halaman web standalone hanya dengan membuka file HTML di browser, tanpa memerlukan server lokal atau backend.
3. THE Dashboard SHALL memuat dan menampilkan seluruh konten dalam waktu kurang dari 3 detik pada koneksi dengan kecepatan unduh minimal 10 Mbps.
4. THE Dashboard SHALL merespons setiap interaksi pengguna (klik, input) dalam waktu kurang dari 100 milidetik.
5. THE Dashboard SHALL menggunakan tepat satu file CSS di dalam direktori `css/` dan tepat satu file JavaScript di dalam direktori `js/`.
6. THE Dashboard SHALL dapat di-deploy ke GitHub Pages dengan mendorong file ke repositori GitHub tanpa langkah build tambahan.

---

### Persyaratan 6: Desain Visual dan Keterbacaan

**User Story:** Sebagai pengguna, saya ingin tampilan dasbor yang bersih, minimal, dan mudah dibaca, agar saya dapat menggunakan semua fitur dengan nyaman.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menampilkan seluruh widget dalam section-section yang terpisah secara visual sehingga tidak ada dua widget yang tumpang tindih pada resolusi layar yang didukung.
2. THE Dashboard SHALL menggunakan tipografi dengan ukuran font minimal 14px untuk teks konten agar mudah dibaca.
3. THE Dashboard SHALL memastikan kontras warna antara teks dan latar belakang memenuhi rasio kontras minimum 4.5:1 sesuai standar WCAG AA.
4. WHEN layar memiliki lebar antara 320px dan 1920px, THE Dashboard SHALL menampilkan semua konten tanpa scrollbar horizontal dan semua elemen interaktif dapat dijangkau serta dioperasikan.

---

### Persyaratan 7 (Challenge): Mode Terang dan Gelap

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode terang dan mode gelap, agar tampilan dasbor sesuai dengan preferensi dan kondisi pencahayaan saya.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menyediakan kontrol (tombol atau toggle) yang terlihat jelas untuk beralih antara Mode_Tampilan terang dan Mode_Tampilan gelap.
2. WHEN pengguna mengaktifkan Mode_Tampilan gelap, THE Dashboard SHALL menerapkan skema warna gelap pada seluruh komponen halaman dalam waktu kurang dari 200 milidetik.
3. WHEN pengguna mengaktifkan Mode_Tampilan terang, THE Dashboard SHALL menerapkan skema warna terang pada seluruh komponen halaman dalam waktu kurang dari 200 milidetik.
4. WHEN pengguna mengubah Mode_Tampilan, THE Dashboard SHALL menyimpan preferensi Mode_Tampilan ke Local_Storage.
5. WHEN Dashboard dimuat ulang, THE Dashboard SHALL membaca preferensi Mode_Tampilan dari Local_Storage dan menerapkannya sebelum elemen halaman pertama kali dirender agar tidak terjadi kilatan warna yang salah.
6. IF Local_Storage tidak mengandung preferensi Mode_Tampilan yang tersimpan, THEN THE Dashboard SHALL menerapkan Mode_Tampilan terang sebagai default.

---

### Persyaratan 8 (Challenge): Nama Kustom pada Salam

**User Story:** Sebagai pengguna, saya ingin salam menampilkan nama saya, agar pengalaman menggunakan dasbor terasa lebih personal.

#### Kriteria Penerimaan

1. THE Greeting_Widget SHALL menyediakan mekanisme (misalnya: field input atau tombol edit) bagi pengguna untuk memasukkan dan menyimpan Nama_Pengguna dengan panjang 1 hingga 50 karakter.
2. IF Nama_Pengguna yang dimasukkan pengguna kosong, hanya mengandung spasi, atau melebihi 50 karakter, THEN THE Greeting_Widget SHALL menolak penyimpanan dan menampilkan pesan kesalahan kepada pengguna.
3. WHEN Nama_Pengguna yang valid telah tersimpan, THE Greeting_Widget SHALL menampilkan salam yang menyertakan Nama_Pengguna (contoh: "Selamat Pagi, Budi!").
4. IF Nama_Pengguna belum diatur atau Local_Storage tidak mengandung nilai Nama_Pengguna, THEN THE Greeting_Widget SHALL menampilkan salam tanpa nama (contoh: "Selamat Pagi!").
5. WHEN pengguna menyimpan Nama_Pengguna yang valid, THE Greeting_Widget SHALL menyimpan nilai Nama_Pengguna ke Local_Storage dan segera memperbarui tampilan salam.
6. WHEN Dashboard dimuat ulang, THE Greeting_Widget SHALL memuat Nama_Pengguna dari Local_Storage dan menampilkannya pada salam.

---

### Persyaratan 9 (Challenge): Kustomisasi Durasi Pomodoro

**User Story:** Sebagai pengguna, saya ingin dapat mengubah durasi Sesi_Pomodoro sesuai kebutuhan saya, agar saya dapat menyesuaikan teknik fokus dengan preferensi pribadi.

#### Kriteria Penerimaan

1. THE Timer_Widget SHALL menyediakan kontrol (misalnya: field input angka) bagi pengguna untuk mengatur durasi Sesi_Pomodoro dalam satuan menit dengan nilai bilangan bulat.
2. IF durasi yang dimasukkan pengguna kurang dari 1 menit atau lebih dari 120 menit atau bukan bilangan bulat positif, THEN THE Timer_Widget SHALL menolak perubahan dan menampilkan pesan kesalahan yang menyebutkan rentang valid (1–120 menit) kepada pengguna.
3. IF timer sedang berjalan saat pengguna mencoba menyimpan durasi baru, THEN THE Timer_Widget SHALL menolak perubahan dan menampilkan pesan kepada pengguna bahwa durasi tidak dapat diubah saat timer sedang aktif.
4. WHEN pengguna menyimpan durasi baru yang valid dan timer tidak sedang berjalan, THE Timer_Widget SHALL memperbarui tampilan hitung mundur ke durasi yang baru diatur dalam waktu kurang dari 200 milidetik.
5. WHEN pengguna menyimpan durasi Sesi_Pomodoro yang valid, THE Timer_Widget SHALL menyimpan nilai durasi ke Local_Storage.
6. WHEN Dashboard dimuat ulang, THE Timer_Widget SHALL memuat durasi Sesi_Pomodoro dari Local_Storage dan menggunakannya sebagai durasi default tampilan awal.

---

### Persyaratan 10 (Challenge): Pencegahan Duplikasi Tugas

**User Story:** Sebagai pengguna, saya ingin sistem mencegah penambahan tugas yang identik, agar daftar tugas saya tetap bersih dan tidak mengandung duplikasi yang tidak disengaja.

#### Kriteria Penerimaan

1. WHEN pengguna mencoba menambahkan tugas baru, THE Todo_Widget SHALL memeriksa apakah tugas dengan teks yang identik—setelah memangkas spasi di awal dan akhir serta mengabaikan perbedaan huruf besar/kecil—sudah ada dalam daftar.
2. IF tugas dengan teks yang identik sudah ada, THEN THE Todo_Widget SHALL menolak penambahan dan menampilkan pesan peringatan kepada pengguna bahwa tugas tersebut sudah ada dalam daftar.
3. WHEN pengguna mengedit teks sebuah tugas dan menyimpannya, THE Todo_Widget SHALL memeriksa apakah teks hasil edit—setelah memangkas spasi di awal dan akhir serta mengabaikan perbedaan huruf besar/kecil—identik dengan tugas lain yang sudah ada, tidak termasuk tugas yang sedang diedit itu sendiri.
4. IF teks hasil edit identik dengan tugas lain yang sudah ada, THEN THE Todo_Widget SHALL menolak penyimpanan dan menampilkan pesan peringatan kepada pengguna bahwa tugas dengan teks tersebut sudah ada dalam daftar.

---

### Persyaratan 11 (Challenge): Pengurutan Tugas

**User Story:** Sebagai pengguna, saya ingin dapat mengurutkan daftar tugas saya, agar saya dapat memprioritaskan dan mengelola tugas dengan lebih mudah.

#### Kriteria Penerimaan

1. THE Todo_Widget SHALL menyediakan kontrol (misalnya: dropdown atau tombol) yang memungkinkan pengguna memilih salah satu dari metode pengurutan berikut: (a) Abjad A–Z, (b) Abjad Z–A, (c) Status (belum selesai lebih dulu), (d) Terbaru ditambahkan lebih dulu.
2. WHEN pengguna memilih pengurutan Abjad A–Z, THE Todo_Widget SHALL menampilkan ulang semua tugas dalam urutan abjad menaik berdasarkan teks tugas dengan perbandingan tidak membedakan huruf besar/kecil.
3. WHEN pengguna memilih pengurutan Abjad Z–A, THE Todo_Widget SHALL menampilkan ulang semua tugas dalam urutan abjad menurun berdasarkan teks tugas dengan perbandingan tidak membedakan huruf besar/kecil.
4. WHEN pengguna memilih pengurutan berdasarkan Status, THE Todo_Widget SHALL menampilkan semua tugas yang belum selesai terlebih dahulu diikuti oleh tugas yang sudah selesai; untuk tugas dengan status yang sama, urutan sekunder menggunakan waktu penambahan terbaru lebih dulu.
5. WHEN pengguna memilih pengurutan Terbaru ditambahkan lebih dulu, THE Todo_Widget SHALL menampilkan ulang semua tugas dalam urutan tugas yang paling akhir ditambahkan muncul di posisi teratas.
6. WHEN pengguna memilih metode pengurutan, THE Todo_Widget SHALL menyimpan preferensi pengurutan ke Local_Storage.
7. WHEN Dashboard dimuat ulang, THE Todo_Widget SHALL memuat preferensi pengurutan dari Local_Storage dan menerapkannya pada tampilan daftar tugas.
8. IF Local_Storage tidak mengandung preferensi pengurutan, THEN THE Todo_Widget SHALL menggunakan pengurutan default "Terbaru ditambahkan lebih dulu".
