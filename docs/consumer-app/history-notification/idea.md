# DOKUMEN SPESIFIKASI UI/UX: ACTIVITY HUB (NOTIFIKASI & RIWAYAT)

**Konteks Layar:** Pusat waktu dan aktivitas pengguna, mencakup tindakan instan (masa kini) dan rekam jejak (masa lalu).

### 1. Arsitektur Kontainer Utama (The Unified Container)

Layar ini menggunakan pola navigasi tab geser ( _Swipeable Tabs_ ) agar interaksi terasa cair tanpa memuat ulang halaman.

- **Top Navigation Bar:**
  - Terletak di bawah _status bar_ , menggunakan komponen **Segmented Control** (Kapsul terbagi dua).
  - Tab Kiri: **`🔔 Notifikasi`** (Memiliki _red dot indicator_ jika ada pemberitahuan baru yang belum dibaca).
  - Tab Kanan: **`🕒 Riwayat`**
- **Mekanisme Transisi:** Layar mendukung interaksi geser layar penuh ( _Edge-to-Edge Swipe_ ) ke kiri atau kanan.
- **Global State Persistence:** Membaca jumlah notifikasi secara _real-time_ dari Nano Stores agar selaras dengan ikon _Bottom Navigation_ di seluruh aplikasi.

### 2. Modul A: Tab Notifikasi (The Present Pulse)

Fokus antarmuka ini adalah **konversi tindakan ( _action conversion_ )** . Pengguna tidak boleh sekadar membaca informasi; mereka harus bisa mengeksekusi tindakan langsung dari dalam kartu notifikasi.

#### A. Sistem Penyaringan Cerdas (Chip Filters)

Terletak tepat di bawah _Segmented Control_ , berupa barisan _chip_ horizontal yang bisa digeser ( _horizontal scroll_ ).

- `[Semua]` (Default aktif)
- `[Undangan]` (Hanya menampilkan inisiasi sesi)
- `[Sistem]` (Peringatan teknis dan perjalanan)
- `[Promo & Info]` (Notifikasi dari mitra B2B/Kafe)

#### B. Arketipe Kartu Notifikasi

**1. Tipe A: Undangan Interaktif (Action-Driven)**

- **Visual:** Foto profil (avatar) Inisiator (misal: Eka atau Rahmat) berbentuk lingkaran. Di sudut kanan bawah avatar, terdapat emblem ikon lokasi kecil. Latar belakang kartu memiliki _highlight_ biru pudar jika belum diklik.
- **Teks Primer:** **"Eka mengajak grup Tongkrongan kumpul di Filosofi Kopi."** (Teks tebal pada entitas subjek dan objek).
- **Teks Sekunder:** _"5 menit yang lalu"_
- **UX In-line Action:** Di bawah teks, terdapat tombol ukuran medium **`Lihat Detail / RSVP`** .
  - _Interaksi:_ Jika ditekan, pengguna **tidak dilempar** ke halaman obrolan. Sistem langsung menarik _Bottom Sheet RSVP_ menutupi layar saat ini, memungkinkan pengguna mengonfirmasi `Ikut`, menentukan moda transportasi, lalu menutup _sheet_ dan kembali ke daftar notifikasi dengan mulus.

**2. Tipe B: Peringatan Sistem & Navigasi (Critical Alerts)**

- **Visual:** Avatar diganti dengan ikon vektor sistem (misalnya: Radar berdenyut, jam pasir, atau tanda seru merah).
- **Teks Primer:** **"Sesi Jumpa akan dibatalkan otomatis dalam 5 menit."**
- **Teks Sekunder:** _"Waktu perjalanan telah melampaui batas ETA maksimal."_
- **UX In-line Action:** Tombol sekunder bergaris luar bertuliskan **`Buka Peta`** , yang langsung melempar pengguna ke layar _FullScreenMap_ (Fase 5) sesi tersebut (page home).

**3. Tipe C: Interaksi Sosial & Gamifikasi (Engagement)**

- **Visual:** Ikon piala, bintang emas, atau jempol.
- **Teks Primer:** **"Ulasanmu untuk Titik Temu Coffee mendapatkan 10 suka!"**
- **Teks Sekunder:** _"Dapatkan 50 poin tambahan untuk ulasan berikutnya."_
- **UX In-line Action:** Area kartu dapat diklik seluruhnya ( _clickable area_ ) untuk melompat ke halaman Profil pengguna yang menyorot ulasan tersebut.

### 3. Modul B: Tab Riwayat (The Memory Bank)

Fokus antarmuka ini adalah **pencatatan, audit, dan konversi ke ulasan** . Menampilkan data dari Fase 6 (Terminasi) dengan tata letak yang bersih.

#### A. Hierarki Waktu (Time Headers)

Daftar dipisahkan oleh tipografi _header_ yang ramah manusia (bukan sekadar tanggal kaku) agar mudah dipindai oleh mata:

- `Minggu Ini`
- `Bulan Lalu`
- `Januari 2026`

#### B. Anatomi Kartu Riwayat (Session Card)

- **Header Kartu:** Tanggal absolut (misal: "Sabtu, 14 Mar") di kiri, dan Label Status (misal: `✅ Selesai` atau `❌ Dibatalkan`) di kanan atas.
- **Thumbnail Visual:** Di sebelah kiri kartu, terdapat area persegi dengan sudut melengkung ( _rounded square_ ).
  - _Jika Sukses:_ Menampilkan potongan gambar peta statis ( _Static Map API_ ) berpusat pada destinasi.
  - _Jika Batal:_ Menampilkan peta dengan gradasi abu-abu ( _grayscale_ ).
- **Informasi Destinasi:** Nama tempat dicetak tebal (misal: **Filosofi Kopi** ). Jika sesi merupakan hasil dari algoritma _geom-median_ , terdapat label kecil di bawahnya: `"📍 Dipilih oleh Algoritma Jumpa"`.
- **Kompilasi Peserta:** Di bawah nama tempat, terdapat deretan avatar kecil yang saling tumpang tindih ( _overlapping avatars_ ) dari anggota yang hadir.

#### C. Utilitas Pasca-Sesi (Post-Session Actions)

Di bagian paling bawah setiap kartu riwayat sukses, terdapat pembatas garis tipis yang memuat dua aksi:

- **Tombol Kiri (`⭐ Beri Ulasan`):** Berwarna kontras jika pengguna belum memberikan ulasan. Jika sudah, teks memudar menjadi `"Lihat Ulasanmu"`.
- **Tombol Kanan (`Kumpul di Sini Lagi`):** Tombol _shortcut_ untuk menyalin parameter pertemuan sebelumnya. Jika ditekan, langsung memulai skenario "Sesi Ekspres" baru ke grup yang sama dan tempat yang sama.

### 4. Manajemen State Kosong (Empty States)

UI yang matang harus menangani kondisi saat tidak ada data sama sekali.

- **Empty State Notifikasi:** Menampilkan ilustrasi minimalis (misalnya kotak pos yang bersih atau burung yang sedang tidur) dengan teks: _"Belum ada aktivitas baru. Ajak temanmu nongkrong dari layar Beranda!"_
- **Empty State Riwayat:** Menampilkan ilustrasi kalender kosong dengan teks: _"Belum ada riwayat pertemuan. Mulai sesi Jumpa pertamamu di obrolan grup."_
