# DOKUMEN SPESIFIKASI UI/UX: PROFIL PENGGUNA & GAMIFIKASI

**Konteks Layar:** Halaman sentral untuk manajemen identitas pengguna, kurasi lokasi, rekam jejak ulasan, serta pengaturan privasi akun.

### 1. Header Identitas & Metrik Aktivitas

Area ini mendominasi bagian sepertiga atas layar, berfungsi menyajikan data identitas dasar dan akumulasi interaksi pengguna di dalam platform.

- **Informasi Profil Primer:**
  - **Avatar:** Gambar profil berbentuk lingkaran.
  - **Nama Tampilan:** Ditampilkan dengan cetak tebal (contoh: **Kadek Agus Arya Pranata** ).
  - **Username:** Pengenal unik dengan awalan simbol '@' (contoh: `@aryapranata`).
  - **Bio:** Area teks maksimal 150 karakter untuk deskripsi singkat (opsional).
- **Bilah Metrik (Data Bar):** Terletak tepat di bawah informasi profil, dibagi menjadi dua kolom metrik utama dengan angka yang ditonjolkan:
  - **Kolom Kiri (`120 Teman`):** Menampilkan total koneksi pertemanan resiprokal (dua arah). Tidak ada pemisahan antara _followers_ dan _following_ .
  - **Kolom Kanan (`45 Kali Jumpa`):** Menampilkan angka akumulatif dari total partisipasi pengguna dalam sesi pertemuan yang berhasil diselesaikan (mencapai Fase 6/Terminasi).

### 2. Modul Gamifikasi (Status Kontribusi)

Elemen _banner_ horizontal yang diletakkan di antara bilah metrik dan area konten utama. Berfungsi sebagai indikator level kontribusi lokal pengguna.

- **Komponen Visual Utama:**
  - Ikon lencana ( _badge_ ) yang merepresentasikan level pengguna saat ini.
  - Teks gelar level (misalnya: _Local Explorer_ atau _Master Guide_ ).
  - _Progress Bar_ (bilah kemajuan) linier yang menunjukkan jarak poin menuju level berikutnya.
- **Sistem Perolehan Poin (Backend Trigger):** Sistem akan menambahkan poin secara otomatis ketika pengguna memicu _event_ berikut:
  1. Penyelesaian sesi Jumpa secara sinkron.
  2. Publikasi ulasan (_rating_ & teks) untuk mitra B2B/Kafe.
  3. Unggahan aset foto orisinal ke profil suatu tempat.
- **Interaksi Klik (Leaderboard Overlay):** Jika area _banner_ ini ditekan, antarmuka memunculkan _Bottom Sheet_ yang memuat rincian poin dan papan peringkat ( _Leaderboard_ ). Papan peringkat ini secara baku ( _default_ ) hanya mengkomparasi skor pengguna dengan daftar teman (lingkup terbatas), bukan peringkat global seluruh kota.

### 3. Konten Utama: Segmented Control

Area ini mengelola konten buatan pengguna ( _User-Generated Content_ ). Navigasi menggunakan komponen _Segmented Control_ (tab geser) untuk membagi data kurasi dan data ulasan.

#### A. Tab Kiri: `📂 Daftar Tempat (Place-lists)`

Modul kurasi lokasi spasial yang dapat diatur tingkat visibilitasnya.

- **Tata Letak ( _Layout_ ):** Ditampilkan dalam format _Grid_ (kisi) 2 kolom.
- **Anatomi Kartu Daftar (List Card):**
  - **Sampul Visual:** Kolase foto ( _thumbnail_ ) yang diambil dari 4 tempat teratas di dalam daftar tersebut.
  - **Judul:** Nama daftar yang dibuat pengguna (contoh: "Spot Nugas", "Kafe Skena Denpasar").
  - **Metadata:** Jumlah item lokasi di dalam daftar (contoh: "12 Tempat").
- **Indikator Privasi:**
  - Daftar publik: Ditampilkan secara normal dan dapat dilihat oleh teman.
  - Daftar privat: Ditandai dengan ikon gembok kecil (🔒) di sudut kanan atas kartu, hanya terlihat oleh pemilik profil.
- **Aksi Silang Pengguna ( _Cross-User Interaction_ ):** Jika teman membuka profil pengguna dan melihat daftar publik, akan muncul tombol aksi:
  - **`Simpan Daftar`:** Menduplikasi daftar tersebut ke profil penyimpan.
  - **`Mulai Jumpa ke Sini`:** Pemicu langsung menuju alur "Sesi Ekspres" yang menyasar salah satu lokasi di dalam daftar tersebut.

#### B. Tab Kanan: `📝 Ulasan (Reviews)`

Modul rekam jejak opini dan jejak digital pengguna di platform.

- **Tata Letak ( _Layout_ ):** Menggunakan _Vertical List Feed_ (Daftar gulir vertikal) layaknya linimasa standar.
- **Anatomi Kartu Ulasan:**
  - Header nama destinasi (dapat diklik untuk membuka profil lokasi).
  - Komponen _Rating_ bintang (1 hingga 5).
  - Teks ulasan.
  - Grid media (jika pengguna mengunggah lebih dari satu foto).
  - Metrik interaksi (jumlah ikon _Like/Helpful_ dari pengguna lain).

### 4. Menu Konfigurasi & Pengaturan

Pusat kontrol aplikasi dan manajemen privasi data spasial.

- **Aksesibilitas Menu:** Diletakkan sebagai ikon Roda Gigi (⚙️) di pojok kanan atas, sejajar dengan bagian atas header profil.
- **Kategori Pengaturan Utama:**
  - **Edit Profil:** Modifikasi teks bio, pembaruan foto _avatar_ , dan perubahan _username_ .
  - **Manajemen Privasi Spasial:**
    - _Toggle Switch 1:_ `"Izinkan teman melihat lokasi saya di Peta Utama saat Sesi aktif"`.
    - _Toggle Switch 2:_ `"Visibilitas Akun Publik"` (untuk mengatur apakah akun dapat ditemukan di bilah pencarian global atau hanya melalui undangan tautan).
  - **Tautan Pendukung:** Pusat Bantuan, Syarat dan Ketentuan, serta fungsi _Log Out_ .
