# Business Requirements Document (BRD)

## Aplikasi Ulasan & Rating Tempat Usaha (Cafe / Restoran)

> **Topik:** Masalah #9 dari 10 masalah Firyal  
> **Versi:** 1.0  
> **Tanggal:** 16 November 2026  
> **Status:** Draft untuk Review Stakeholder  

---

## 1. Ringkasan Eksekutif

Banyak pelanggan ingin memberikan ulasan atau rating terhadap kafe, restoran, dan tempat usaha yang dikunjungi, tetapi sering mengurungkan niat karena proses pencarian dan pemberian ulasan di Google Maps dianggap kurang praktis dan membutuhkan beberapa langkah [S3, S4]. Penelitian menunjukkan bahwa **94% konsumen bersedia menulis ulasan**, tetapi hanya **69% yang benar-benar melakukannya** dalam setahun terakhir [S22]. Gap antara niat dan tindakan ini disebabkan oleh *friction* (gesekan) pada perjalanan pengguna mobile: setiap langkah tambahan—mencari bisnis, login, scroll ke bagian ulasan—menyebabkan drop-off signifikan [S4].

Dokumen ini merumuskan kebutuhan bisnis untuk sebuah aplikasi yang mengurangi friction tersebut dengan menyediakan jalur cepat (QR code / NFC / deep link), sistem insentif berbasis gamifikasi, dashboard pemilik usaha untuk respons otomatis, dan mekanisme moderasi yang memenuhi regulasi. Target pasar awal adalah kafe dan restoran di Indonesia, dengan ekspansi bertahap ke kategori usaha lokal lainnya.

---

## 2. Latar Belakang & Problem Statement

### 2.1 Bukti Data Pasar

| Fakta | Sumber |
|---|---|
| **91% orang membaca ulasan online minimal sekali sebulan** | [S6] |
| **71% konsumen membaca ulasan saat riset bisnis lokal** | [S5] |
| **97% responden membaca ulasan sebelum memilih bisnis lokal** (BrightLocal 2026) | [S18] |
| **94% pelanggan restoran cek ulasan online sebelum memilih makan** | [S19] |
| **52% responden mengharapkan rating minimal 4/5 sebelum pertimbangkan layanan** | [S6] |
| **47% UKM memiliki < 20 ulasan**; **89% konsumen harapkan respons pemilik usaha** | [S9] |
| **Google Maps: >2 Miliar pengguna aktif bulanan; >300 juta tempat; 292 juta ulasan diblokir/hapus (2025)** | [S11] |
| **70% konsumen pernah menyesal setelah beli berdasarkan ulasan** | [S18] |
| **Hanya 51% pemilik usaha merespons ulasan**; **45% butuh 1–2 hari untuk merespons** | [S10] |
| **40 pengalaman positif diperlukan untuk menetralkan dampak 1 ulasan negatif** | [S8] |

### 2.2 Root Cause Analysis

Berdasarkan analisis perjalanan pengguna Google Maps di mobile [S1, S4]:

1. **Langkah terlalu banyak** — Minimal 7 langkah: buka Maps → cari tempat → tap profil → tab Reviews → tap bintang → tulis teks → submit.
2. **Delay waktu** — Jika diminta setelah pelanggan keluar, momen kepuasan sudah hilang [S4].
3. **Pencarian manual** — Harus mencari nama bisnis, berisiko salah listing atau distraksi [S4].
4. **Login barrier** — Prompt Google Sign-in di tengah proses menyebabkan drop-off [S4].
5. **Kualitas informasi rendah** — Google Maps dipenuhi listing berkualitas rendah, review palsu, dan iklan sponsor [S3].

### 2.3 Peluang

- **94% konsumen terbuka menulis ulasan** vs **69% yang benar-benar menulis** = gap 25 poin persentase [S22]
- **Koleksi QR/NFC meningkatkan volume ulasan drastis dalam 30 hari** [S23, S24]
- **Skor kepuasan 34% lebih tinggi** jika feedback dikumpulkan dalam 15 menit vs 24 jam kemudian [S24]
- **74% konsumen hanya percaya ulasan < 3 bulan terakhir** → recency penting [S22]

---

## 3. Tujuan Bisnis & KPI

### 3.1 Tujuan Utama

| # | Tujuan | Indikator Keberhasilan | Target MVP (6 bulan) |
|---|---|---|---|
| T1 | Mengurangi friction submit ulasan | Waktu rata-rata dari scan QR → ulasan terkirim | < 60 detik |
| T2 | Meningkatkan volume ulasan per bisnis | Rata-rata ulasan baru/bulan per mitra bisnis | ≥ 30 ulasan/bulan |
| T3 | Meningkatkan kepuasan pengguna reviewer | NPS pengguna reviewer | ≥ 50 |
| T4 | Membantu pemilik usaha mengelola reputasi | % mitra yang aktif merespons ulasan | ≥ 80% |
| T5 | Membangun basis data ulasan tepercaya | % ulasan lolos verifikasi anti-fraud | ≥ 95% |
| T6 | Monetisasi berkelanjutan | ARR (Annual Recurring Revenue) | ≥ Rp 500 juta/tahun (v2) |

### 3.2 KPI Operasional

- **Review submission rate**: % scan QR yang berakhir di ulasan terkirim (target ≥ 35%)
- **Time-to-first-response**: rata-rata waktu pemilik usaha merespons ulasan (target ≤ 24 jam)
- **Fake review detection rate**: % ulasan palsu terdeteksi sebelum publikasi (target ≥ 90%)
- **DAU/MAU ratio**: engagement pengguna (target ≥ 0.25)
- **Business churn rate**: % mitra berhenti berlangganan (target ≤ 5%/bulan)

---

## 4. Stakeholder & Persona

### 4.1 Stakeholder Utama

| Stakeholder | Peran | Minat Utama |
|---|---|---|
| **Reviewer (konsumen)** | Menulis ulasan & rating | Proses cepat, mudah, ada reward |
| **Pemilik/Pengelola usaha** | Merespons ulasan, melihat analytics | Reputasi baik, lebih banyak pelanggan |
| **Moderator platform** | Menyaring konten ilegal/palsu | Platform bersih, patuh hukum |
| **Investor/Bisnis owner** | ROI, skalabilitas | Pertumbuhan userbase, monetisasi |
| **Regulator (Kominfo, OJK)** | Kepatuhan hukum | Perlindungan data, transparansi |

### 4.2 Persona Pengguna

#### Persona A: "Rina" — Reviewer Aktif (Primary)
- **Usia:** 22–28 tahun, mahasiswa/karyawan muda
- **Perilaku:** Suka coba kafe baru, aktif di Instagram/TikTok, suka share pengalaman
- **Pain point:** "Mau kasih rating tapi males cari-cari di Google Maps, langkahnya banyak"
- **Motivasi:** Social recognition, membantu teman, dapat reward [S14, S15]
- **Device:** Android mid-range, pakai GoFood/GrabFood

#### Persona B: "Pak Budi" — Pemilik Kafe (Secondary)
- **Usia:** 35–50 tahun, pemilik 1–3 cabang kafe
- **Perilaku:** Sibuk operasional, jarang punya waktu kelola reputasi digital
- **Pain point:** "Ulasan negatif dibiarkan, gak tau cara respon cepat"
- **Minat:** Lebih banyak pelanggan datang dari ulasan positif [S19, S26]

#### Persona C: "Andi" — Casual Diner (Tertiary)
- **Usia:** 18–35 tahun, cari tempat makan spontan
- **Perilaku:** Lihat 3–5 ulasan terbaru sebelum putuskan [S30]
- **Pain point:** "Ulasan lama, gak relevan, atau curiga palsu"

---

## 5. Lingkup Proyek (Scope)

### 5.1 In Scope (MVP)

- Aplikasi mobile (Android + iOS) untuk **submit ulasan & rating**
- **QR code / deep link** sebagai entry point utama
- **Profil bisnis dasar** (nama, alamat, jam operasional, foto, kategori)
- **Sistem rating bintang 1–5 + teks ulasan + foto**
- **Gamifikasi** (poin, level, badge) untuk motivasi reviewer [S26]
- **Dashboard pemilik usaha** web-based (lihat ulasan, respons, analytics)
- **Moderasi otomatis + manual** (anti-spam, anti-fake) [S27, S28]
- **Notifikasi push** (untuk reviewer & pemilik usaha)
- **Integrasi Google Places API** untuk data lokasi [S16]

### 5.2 Out of Scope (MVP — defer ke v1.1/v2)

- Fitur pemesanan/meja (booking)
- Pembayaran / e-wallet integration
- Forum diskusi / Q&A antara pengguna
- Multi-bahasa (selain Bahasa Indonesia & Inggris)
- API publik untuk third-party developer
- Program affiliate / referral marketer
- Video review
- AR/VR preview lokasi

---

## 6. Proses Bisnis: User Journey

### 6.1 As-Is (Google Maps Mobile) — 7+ Langkah [S1, S4]

```
[Selesai makan] → [Ingat mau review] → [Buka Google Maps] 
→ [Cari nama kafe] → [Tap hasil yang benar] → [Scroll ke Reviews] 
→ [Tap tulis review] → [Login Google kalau belum] → [Pilih bintang] 
→ [Tulis teks] → [Submit]
```

**Drop-off points:**
- Setelah langkah "Ingat" → **~60% tidak lanjut** [S4]
- Saat "Cari nama" → **salah listing / distraksi** [S4]
- Saat "Login" → **drop signifikan** [S4]

### 6.2 To-Be (Aplikasi Baru) — 3 Langkah

```
[Scan QR di meja / klik deep link] 
→ [Landing langsung di form review (sudah pre-filled: bisnis, waktu kunjungan)] 
→ [Pilih bintang + tulis opsional + foto opsional] → [Submit (< 60 detik)]
```

**Reduksi langkah:** 7+ → 3 (**57% fewer steps**)  
**Pre-fill data:** bisnis, timestamp, lokasi otomatis dari QR/deep link context.

### 6.3 Journey Pemilik Usaha (To-Be)

```
[Ulasan masuk] → [Notifikasi push + email] 
→ [AI draft respons (opsional)] → [Review & edit] → [Publish respons] 
→ [Analytics update real-time]
```

Target: **respons ≤ 24 jam** (vs rata-rata industri 1–2 hari [S10]).

---

## 7. Kebutuhan Fungsional (Functional Requirements)

Setiap FR memiliki ID, prioritas **MoSCoW** (Must / Should / Could / Won't), dan traceability ke sumber riset.

### FR-01: Registrasi & Autentikasi Pengguna

| Atribut | Detail |
|---|---|
| **ID** | FR-01 |
| **Prioritas** | Must |
| **Deskripsi** | Pengguna dapat registrasi via email, Google Sign-In, atau nomor HP (OTP). Minimum usia 13 tahun (COPPA-compliant untuk < 13 tahun tidak boleh); platform target usia 18+ sesuai ketentuan Trustpilot [S17]. |
| **Acceptance Criteria** | - Registrasi email: verifikasi link dalam 24 jam<br>- Google Sign-In: OAuth 2.0 flow standar<br>- OTP SMS: kode 6 digit, expired 5 menit<br>- Profil minimal: nama tampilan, foto opsional |
| **Traceability** | [S17], [S21] |

### FR-02: Scan QR Code / Deep Link Entry Point

| Atribut | Detail |
|---|---|
| **ID** | FR-02 |
| **Prioritas** | Must |
| **Deskripsi** | Pengguna dapat memulai ulasan dengan scan QR code (via kamera app) atau klik deep link (dari WhatsApp/SMS/email). QR code unik per bisnis + opsional per meja/zona. Deep link berisi `business_id` + optional `table_id`. |
| **Acceptance Criteria** | - Scan QR → landing di form review pre-filled dalam ≤ 3 detik<br>- Deep link clickable dari browser & messaging apps<br>- QR code dapat dicetak oleh pemilik usaha (PDF/PNG)<br>- Support dynamic QR (bisa update tanpa cetak ulang) |
| **Traceability** | [S4], [S22], [S23], [S24] |

### FR-03: Submit Ulasan & Rating

| Atribut | Detail |
|---|---|
| **ID** | FR-03 |
| **Prioritas** | Must |
| **Deskripsi** | Pengguna dapat memberikan rating bintang 1–5, teks ulasan (opsional, min 10 karakter jika diisi), upload foto maksimal 5 per ulasan, dan tag kategori opsional (makanan, pelayanan, suasana, harga, kebersihan). |
| **Acceptance Criteria** | - Rating wajib (1–5 bintang)<br>- Teks opsional; jika diisi, min 10 char, max 2000 char<br>- Foto: JPG/WebP, max 5 MB per file, auto-resize<br>- Timestamp kunjungan otomatis (dari QR context) atau manual<br>- Submit → status "pending moderation" → "published" |
| **Traceability** | [S1], [S4], [S20], [S21] |

### FR-04: Sistem Gamifikasi (Poin, Level, Badge)

| Atribut | Detail |
|---|---|
| **ID** | FR-04 |
| **Prioritas** | Should |
| **Deskripsi** | Reviewer mendapat poin untuk setiap ulasan (+ foto bonus). Level naik berdasarkan akumulasi poin. Badge untuk pencapaian (misal: "Reviewer Setia", "Foto Eksplorator"). Model referensi: Google Local Guides (Level 1–10, 0–100.000 poin) [S26]. Motivasi utama: social recognition & connection, social validation [S15]. |
| **Acceptance Criteria** | - Poin: 5 per ulasan teks, +3 per foto, +2 bonus first-review-of-day<br>- Level: 10 tier dengan threshold eksponensial<br>- Badge: ≥ 10 jenis, ditampilkan di profil<br>- Leaderboard mingguan/bulanan (opsional, privacy-conscious)<br>- **Tidak ada insentif uang untuk ulasan positif saja** (melanggar FTC [S30]) |
| **Traceability** | [S14], [S15], [S26], [S30] |

### FR-05: Profil Bisnis (Business Listing)

| Atribut | Detail |
|---|---|
| **ID** | FR-05 |
| **Prioritas** | Must |
| **Deskripsi** | Setiap bisnis memiliki halaman profil: nama, alamat, koordinat GPS, jam operasional, nomor telepon, website, kategori (kafe/restoran/dll), menu/foto galeri, rata-rata rating, jumlah ulasan. Data lokasi dapat di-sync dari Google Places API [S16]. |
| **Acceptance Criteria** | - Profil searchable by name, category, location radius<br>- Map embedding (Google Maps static/embedded)<br>- Rating agregat: weighted average (recency-weighted)<br>- Foto galeri: max 20 foto, bisa di-upload pemilik/reviewer |
| **Traceability** | [S16], [S20], [S21] |

### FR-06: Pencarian & Filter Tempat Usaha

| Atribut | Detail |
|---|---|
| **ID** | FR-06 |
| **Prioritas** | Must |
| **Deskripsi** | Pengguna dapat mencari bisnis berdasarkan nama, kategori, kata kunci, lokasi (GPS/nearby). Filter: rating minimum, jarak, harga ($–$$$$), jam buka, kategori spesifik. Sort: relevance, rating, distance, newest. |
| **Acceptance Criteria** | - Search response time < 2 detik<br>- Result list: card layout (foto, nama, rating, kategori, jarak)<br>- Filter kombinasi (rating ≥ 4 + < 2km + buka sekarang)<br>- Auto-detect lokasi user (permission required) |
| **Traceability** | [S3], [S21] |

### FR-07: Dashboard Pemilik Usaha (Web)

| Atribut | Detail |
|---|---|
| **ID** | FR-07 |
| **Prioritas** | Must |
| **Deskripsi** | Pemilik usaha login ke dashboard web untuk melihat semua ulasan, statistik rating tren, volume ulasan per periode, sentiment analysis ringkas, dan kompetitor comparison (jika tersedia data publik). Referensi fitur: Yelp for Business [S32], Praising.ai [S19]. |
| **Acceptance Criteria** | - Login: email + password atau Google SSO<br>- Overview: total ulasan, avg rating, trend chart (7/30/90 hari)<br>- List ulasan: filter by rating, date, responded status<br>- Export CSV/PDF laporan bulanan<br>- Multi-location support (untuk chain) |
| **Traceability** | [S19], [S20], [S32] |

### FR-08: Respons Ulasan oleh Pemilik Usaha

| Atribut | Detail |
|---|---|
| **ID** | FR-08 |
| **Prioritas** | Must |
| **Deskripsi** | Pemilik usaha dapat merespons setiap ulasan secara publik (terlihat di bawah ulasan). Respons bersifat public, tidak bisa di-edit setelah publish (hanya bisa dihapus dan di-posting ulang). AI-assisted draft respons tersedia (opsional). |
| **Acceptance Criteria** | - Respons: teks bebas, max 1000 karakter<br>- Status: "responded" / "not responded"<br>- Notifikasi ke reviewer saat ada respons baru<br>- AI draft: generate berdasarkan sentimen ulasan, editable<br>- **Respons harus netral, tidak menawarkan imbalan** (FTC compliance [S30]) |
| **Traceability** | [S9], [S10], [S30], [S32] |

### FR-09: Moderasi Otomatis Ulasan

| Atribut | Detail |
|---|---|
| **ID** | FR-09 |
| **Prioritas** | Must |
| **Deskripsi** | Sistem otomatis menyaring ulasan sebelum/sesudah publikasi menggunakan rule-based engine + ML classifier. Deteksi: spam keyword, duplicate content, fake pattern (IP/device fingerprint), profanity, personal info (doxxing), incentivized bias signal. Case study: Trustpilot + Checkstep turunkan resolution time dari 3–5 menit → 20 detik [S27]. |
| **Acceptance Criteria** | - Auto-flag: ulasan dengan confidence score > 80% untuk kategori spam/fake/profanity<br>- Queue moderator human untuk edge cases<br>- SLA moderation: < 1 jam untuk high-severity, < 24 jam untuk normal<br>- Log audit trail untuk setiap keputusan moderasi<br>- Appeal mechanism untuk reviewer (ulasan di-reject) |
| **Traceability** | [S1], [S27], [S28], [S30] |

### FR-10: Moderasi Manual (Human Review)

| Atribut | Detail |
|---|---|
| **ID** | FR-10 |
| **Prioritas** | Must |
| **Deskripsi** | Tim moderator manusia (internal/outsourced) meninjau ulasan yang di-flag oleh sistem atau dilaporkan oleh pengguna. TripAdvisor: 300+ staf global untuk content integrity [S28]. |
| **Acceptance Criteria** | - Moderator UI: queue, bulk action, reason codes<br>- Training: SOP moderasi, turn-around time target<br>- Escalation path: legal/compliance untuk kasus berat<br>- Rotasi moderator untuk mencegah fatigue bias |
| **Traceability** | [S27], [S28] |

### FR-11: Laporkan Ulasan / Bisnis

| Atribut | Detail |
|---|---|
| **ID** | FR-11 |
| **Prioritas** | Should |
| **Deskripsi** | Pengguna dapat melaporkan ulasan (spam, palsu, ofensif) atau bisnis (tidak ada lagi, info salah). Laporan masuk ke queue moderasi. |
| **Acceptance Criteria** | - Form laporan: pilih alasan (predefined) + teks opsional<br>- Anonim default; identitas opsional<br>- Konfirmasi laporan diterima (email/in-app)<br>- Update status laporan dalam 72 jam |
| **Traceability** | [S17], [S28] |

### FR-12: Notifikasi Push & Email

| Atribut | Detail |
|---|---|
| **ID** | FR-12 |
| **Prioritas** | Should |
| **Deskripsi** | Notifikasi dikirim ke: (a) reviewer saat ulasan dipublish/respon masuk, (b) pemilik usaha saat ulasan baru masuk, (c) pengguna untuk reminder/gamifikasi milestone. |
| **Acceptance Criteria** | - Push notification: Firebase Cloud Messaging (FCM) / APNs<br>- Email: transactional (SMTP provider)<br>- Preference: user dapat on/off per kategori notifikasi<br>- Quiet hours: tidak kirim 22:00–07:00 (kecuali urgent) |
| **Traceability** | [S10], [S19] |

### FR-13: Bookmark / Simpan Tempat Favorit

| Atribut | Detail |
|---|---|
| **ID** | FR-13 |
| **Prioritas** | Could |
| **Deskripsi** | Pengguna dapat menyimpan bisnis ke daftar favorit ("Want to Visit", "Visited"). Fitur discovery retention. |
| **Acceptance Criteria** | - Save/unsave toggle<br>- Daftar: grid/list view<br>- Share list (link/QR) |
| **Traceability** | [S21] |

### FR-14: Integrasi Google Places API

| Atribut | Detail |
|---|---|
| **ID** | FR-14 |
| **Prioritas** | Must |
| **Deskripsi** | Gunakan Google Places API (New) untuk autocomplete pencarian bisnis, detail tempat (alamat, koordinat, jam, foto), dan photo/review summaries [S16]. Patuhi policy: attribution, logo size, contrast ratio, display relative publish time. |
| **Acceptance_criteria** | - Autocomplete: min 3 karakter, debounced 300ms<br>- Place details: cached 24 jam, refresh on demand<br>- Attribution: "Powered by Google" sesuai spec [S16]<br>- Rate limit handling: graceful degradation<br>- Cost budgeting: monitor SKU usage (Autocomplete, Place Details, Photos) |
| **Traceability** | [S16] |

### FR-15: Feed / Timeline Ulasan Terbaru

| Atribut | Detail |
|---|---|
| **ID** | FR-15 |
| **Prioritas** | Could |
| **Deskripsi** | Halaman feed menampilkan ulasan terbaru dari bisnis di sekitar user (location-based) dan dari user yang di-follow. Social discovery element. |
| **Acceptance Criteria** | - Infinite scroll, sorted by recency<br>- Card: foto + excerpt + rating + bisnis nama<br>- Tap → full review + bisnis profil |
| **Traceability** | [S21] |

### FR-16: Onboarding Guided untuk Reviewer Baru

| Atribut | Detail |
|---|---|
| **ID** | FR-16 |
| **Prioritas** | Should |
| **Deskripsi** | First-time user experience (FTUE): 3-step onboarding yang menjelaskan value proposition, permission request (lokasi, kamera, notifikasi), dan demo scan QR. Reducing friction sejak awal [S25]. |
| **Acceptance Criteria** | - Max 3 screens, skipable<br>- Progress indicator<br>- Completion rate tracking (analytics event) |
| **Traceability** | [S4], [S25] |

### FR-17: Multi-Lokasi untuk Chain / Franchise

| Atribut | Detail |
|---|---|
| **ID** | FR-17 |
| **Prioritas** | Should |
| **Deskripsi** | Pemilik usaha dengan multiple outlet dapat mengelola semua lokasi dari satu dashboard. Agregat & breakdown per lokasi. |
| **Acceptance Criteria** | - Switcher lokasi di dashboard<br>- Corporate view: aggregate metrics across locations<br>- Per-location: dedicated settings, QR code, staff access |
| **Traceability** | [S19], [S20] |

### FR-18: Export & Sharing Ulasan

| Atribut | Detail |
|---|---|
| **ID** | FR-18 |
| **Prioritas** | Could |
| **Deskripsi** | Reviewer dapat share ulasannya ke sosial media (Instagram Story, WhatsApp, Twitter/X) dengan template branded. Pemilik usaha dapat embed widget review di website sendiri. |
| **Acceptance Criteria** | - Share sheet native (Android/iOS)<br>- Template: image card dengan rating + quote + logo bisnis<br>- Embed widget: JS snippet, customizable theme |
| **Traceability** | [S19], [S23] |

### FR-19: Sentiment Analytics untuk Pemilik Usaha

| Atribut | Detail |
|---|---|
| **ID** | FR-19 |
| **Prioritas** | Should |
| **Deskripsi** | Dashboard menampilkan analisis sentimen otomatis (positive/neutral/negative) dari ulasan, keyword cloud, trending topic per periode. |
| **Acceptance Criteria** | - Sentiment per ulasan (ML classification)<br>- Aggregat: % positive/neutral/negative per periode<br>- Keyword extraction: top 20 mention terms<br>- Trend: perubahan sentimen over time |
| **Traceability** | [S19], [S24] |

### FR-20: Verifikasi Kunjungan (Visit Verification)

| Atribut | Detail |
|---|---|
| **ID** | FR-20 |
| **Prioritas** | Should |
| **Deskripsi** | Sistem dapat memverifikasi bahwa reviewer benar-benar mengunjungi bisnis (via GPS proximity saat scan QR, WiFi SSID matching, atau receipt OCR). Label "Verified Visit" meningkatkan kepercayaan pembaca [S30]. |
| **Acceptance Criteria** | - GPS: device within 100m of business when scanning QR<br>- Optional: Bluetooth beacon / WiFi SSID<br>- Badge "Verified" di ulasan<br>- Cannot spoof: server-side validation |
| **Traceability** | [S22], [S30] |

### FR-21: Kebijakan Privasi & Persetujuan Data

| Atribut | Detail |
|---|---|
| **ID** | FR-21 |
| **Prioritas** | Must |
| **Deskripsi** | Privacy-by-design: consent management untuk collection data lokasi, foto, teks. Compliant UU PDP (Perlindungan Data Pribadi) Indonesia dan GDPR (jika target EU users). |
| **Acceptance Criteria** | - Consent banner: granular (lokasi, notifikasi, marketing)<br>- Data retention: ulasan disimpan selama bisnis aktif; akun deleted → ulasan anonymized<br>- Right to deletion: GDPR Art. 17 / UU PDP equivalent<br>- Privacy Policy page accessible from app footer |
| **Traceability** | [S17], [S27], [S30] |

### FR-22: Rate Limiting & Anti-Abuse

| Atribut | Detail |
|---|---|
| **ID** | FR-22 |
| **Prioritas** | Must |
| **Deskripsi** | Batasi frekuensi submit ulasan per user per bisnis per periode (misal: 1 ulasan/bisnis/30 hari). Batasi jumlah scan QR dari IP/device yang sama. |
| **Acceptance Criteria** | - Max 1 review/business/user/30 days<br>- Max 20 reviews/user/day globally<br>- CAPTCHA setelah 5 failed attempts<br>- Device fingerprinting untuk detect multi-account |
| **Traceability** | [S27], [S28] |

### FR-23: API Internal untuk Admin & Partner

| Atribut | Detail |
|---|---|
| **ID** | FR-23 |
| **Prioritas** | Could |
| **Deskripsi** | RESTful API internal untuk admin operations (CRUD bisnis, manage users, moderate content, pull analytics). Future: public API untuk partner (POS system, agency). |
| **Acceptance Criteria** | - Auth: API key + JWT<br>- Rate limit: tiered<br>- Documentation: OpenAPI/Swagger<br>- Versioning: /v1/ |
| **Traceability** | [S21] |

### FR-24: Dark Mode & Accessibility (a11y)

| Atribut | Detail |
|---|---|
| **ID** | FR-24 |
| **Prioritas** | Should |
| **Deskripsi** | App support dark mode (follow system setting). Memenuhi WCAG 2.1 AA minimum: contrast ratio 4.5:1, screen reader compatible, touch target min 44x44dp. |
| **Acceptance Criteria** | - Dark/light mode toggle + system follow<br>- Contrast checker pass for all text<br>- TalkBack/VoiceOver tested<br>- Font scaling up to 200% |
| **Traceability** | [S16], [S25] |

### FR-25: Offline Draft Mode

| Atribut | Detail |
|---|---|
| **ID** | FR-25 |
| **Prioritas** | Could |
| **Deskripsi** | Pengguna dapat mulai menulis ulasan offline (setelah scan QR); draft tersimpan locally, auto-submit saat online kembali. |
| **Acceptance Criteria** | - Draft saved in local storage (encrypted)<br>- Sync when connectivity restored<br>- Max 5 drafts pending |
| **Traceability** | [S4] |

---

## 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Kategori | Requirement | Target | Traceability |
|---|---|---|---|---|
| NFR-01 | **Performance** | Time-to-first-byte (API) | < 200 ms (p95) | [S21] |
| NFR-02 | **Performance** | Scan QR → form loaded | < 3 detik | [S4], [S22] |
| NFR-03 | **Performance** | Search query response | < 2 detik | [S3] |
| NFR-04 | **Availability** | Uptime SLA | 99.5% (non-maintenance) | [S21] |
| NFR-05 | **Scalability** | Support concurrent users | 10.000 DAU (MVP), 100.000 (v2) | [S11] |
| NFR-06 | **Security** | Data transit encryption | TLS 1.3 minimum | [S27] |
| NFR-07 | **Security** | Password hashing | bcrypt / Argon2 (cost factor ≥ 12) | [S27] |
| NFR-08 | **Security** | Authentication token | JWT with RS256, expiry 24h (refresh 7d) | [S21] |
| NFR-09 | **Privacy** | Data residency | Server di Indonesia (compliance UU PDP) | [S30] |
| NFR-10 | **Compliance** | Content moderation SLA | High-severity < 1 jam, Normal < 24 jam | [S27], [S28] |
| NFR-11 | **Accessibility** | WCAG 2.1 AA compliance | Pass automated audit | [S16], [S24] |
| NFR-12 | **Observability** | Error tracking & logging | Sentry/Datadog, trace ID per request | [S21] |

---

## 9. Model Data Konseptual

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   USER      │     │   BUSINESS   │     │   REVIEW    │
│─────────────│     │──────────────│     │─────────────│
│ id (PK)     │──┐  │ id (PK)      │──┐  │ id (PK)     │
│ email       │  │  │ name         │  │  │ user_id (FK)│
│ phone       │  │  │ address      │  │  │ business_id │
│ display_name│  │  │ lat/lng      │  │  │ (FK)        │
│ avatar_url  │  │  │ category     │  │  │ rating (1-5)│
│ role        │  │  │ owner_id(FK) │  │  │ text        │
│ points      │  │  │ qr_code      │  │  │ photos[]    │
│ level       │  │  │ created_at   │  │  │ status      │
│ created_at  │  ┘  │ updated_at   │  ┘  │ verified    │
└─────────────┘     └──────────────┘     │ created_at  │
                                         └──────┬──────┘
                                                │
                    ┌──────────────┐     ┌───────┴───────┐
                    │   RESPONSE   │     │    REPORT     │
                    │──────────────│     │───────────────│
                    │ id (PK)      │     │ id (PK)        │
                    │ review_id(FK)│     │ reporter_id    │
                    │ business_    │     │ target_type    │
                    │ owner_id(FK) │     │ target_id(FK)  │
                    │ text         │     │ reason         │
                    │ created_at   │     │ status         │
                    └──────────────┘     │ created_at     │
                                          └───────────────┘
```

**Entitas pendukung:** `Badge`, `Notification`, `Photo`, `AuditLog`, `ModerationAction`, `GamificationEvent`.

---

## 10. Aturan Bisnis & Moderasi Ulasan

### 10.1 Kebijakan Konten (Content Policy)

Berlandaskan FTC Guide for Platforms [S30], TripAdvisor Content Integrity [S28], dan Checkstep UGC risks [S27]:

| Aturan | Detail | Sanksi |
|---|---|---|
| **No fake reviews** | Ulasan harus mencerminkan pengalaman nyata | Reject + ban akun (repeat offender) |
| **No paid-for-positive-only** | Insentif boleh diberikan tapi tidak boleh kondisional positif | Warning → suspend business |
| **No suppression of negative reviews** | Semua ulasan genuine harus dipublikasikan | Audit + penalty |
| **No doxxing** | Info pribadi (no. HP, alamat rumah) tidak boleh | Auto-redact + warn |
| **No spam/duplicate** | Konten copy-paste atau mass-submit | Auto-reject |
| **No profanity/hate speech** | Bahaya, ujaran kebencian | Auto-hide + review |
| **Disclosure mandatory** | Jika reviewer punya hubungan material dengan bisnis, wajib disclose | Label "affiliated" |

### 10.2 Alur Moderasi

```
Submit → Auto-check (rule-based) → ML confidence score
  ├── Score < 0.2 → Auto-publish
  ├── 0.2–0.8 → Human queue
  └── > 0.8 → Auto-reject (with log)
  
Published → Community report → Re-evaluate → Action (keep/hide/remove/ban)
```

### 10.3 Incentive Policy (Anti-Gaming)

- **Boleh:** Poin gamifikasi, badge, recognition, diskon dari bisnis (untuk semua reviewer, tidak hanya yang kasih bintang tinggi) [S30]
- **Dilarang:** Uang tunai / voucher khusus untuk ulasan bintang 4–5 [S30]
- **Transparansi:** Label "incentivized review" jika ada reward apapun [S30]

---

## 11. Kepatuhan Regulasi & Legal

| Regulasi | Relevansi | Action Item |
|---|---|---|
| **UU No. 27/2022 tentang Perlindungan Data Pribadi (PDP)** | Data user (nama, lokasi, foto) | Consent granular, DPO appointment, data mapping |
| **UU ITE (Informasi dan Transaksi Elektronik)** | Konten UGC, defamasi | Moderation SOP, report mechanism, cooperation with law enforcement |
| **FTC Section 5 Principles** (US reference) | Transparansi koleksi/moderasi/publikasi ulasan | Implementasi 3 prinsip FTC [S30] |
| **EU Digital Services Act (DSA)** | Jika target user EU | Transparency report, moderation database submission [S27] |
| **Google Maps Platform ToS** | Penggunaan Places API data | Attribution, no caching > 30 hari tertentu, logo compliance [S16] |
| **Apple App Store Guidelines** | Review gating, child safety | No incentivized-only-positive, age gate 13+ |
| **Google Play Developer Policy** | Deceptive content, permissions | Permission minimization, honest data use |

---

## 12. Integrasi Teknis

| Sistem | Tujuan | Protocol | Priority |
|---|---|---|---|
| **Google Places API (New)** | Autocomplete, place details, photos, review summaries | REST JSON API | Must |
| **Firebase (Auth + FCM)** | Authentication, push notifications | SDK + REST | Must |
| **Cloud Storage (GCS / S3)** | Foto ulasan storage | REST API | Must |
| **SendGrid / AWS SES** | Transactional email | SMTP / API | Must |
| **OpenAI / Gemini API** (optional) | AI draft respons, sentiment analysis | REST API | Should |
| **POS System** (future) | Automatic review request post-transaction | Webhook/API | Could |
| **Social Media APIs** | Share template cards | Deep links | Could |

---

## 13. Monetisasi

Berdasarkan model review platform [S21] dan pricing software restaurant [S19]:

### 13.1 Model Revenue (v1–v2)

| Model | Deskripsi | Estimasi Pricing | Target |
|---|---|---|---|
| **Freemium (Reviewer)** | Gratis untuk reviewer; monetisasi dari bisnis | Rp 0 | User acquisition |
| **Business Basic** | 1 lokasi, dashboard basic, 50 QR/month, email support | **Rp 199.000/bulan** | Indie cafes |
| **Business Pro** | Multi-lokasi, AI responses, analytics lengkap, unlimited QR, priority support | **Rp 499.000/bulan** | Small chains |
| **Enterprise** | Custom, API access, dedicated account manager, SLA 99.9% | **Rp 2.000.000+/bulan** | Large chains/franchises |
| **Advertising** | Promoted listing di search result (labeled "Sponsored") | CPC / CPM model | v2+ |

### 13.2 Unit Economics (Estimasi MVP)

- **CAC (Customer Acquisition Cost — bisnis):** ~Rp 150.000 (digital marketing + sales)
- **LTV (Lifetime Value — bisnis):** Rp 499.000 × 18 bulan (avg retention) = ~Rp 9 juta
- **LTV:CAC target:** ≥ 6:1
- **Break-even:** ~500 bisnis berbayar (mix Basic/Pro)

---

## 14. Metrik Sukses & Analitik

### 14.1 North Star Metric

**"Jumlah ulasan verified per bulan"** — mengukur kedua sisi marketplace: aktivitas reviewer dan partisipasi bisnis.

### 14.2 Funnel Metrics

| Stage | Metric | Tool |
|---|---|---|
| Awareness | Impressions QR scanned / deep link clicked | Analytics |
| Acquisition | Registration completed | Firebase Analytics |
| Activation | First review submitted | Custom event |
| Engagement | Reviews/user/month, session duration | Mixpanel/Amplitude |
| Revenue | Paying businesses, MRR | Stripe/Billing |
| Referral | Share rate, invite-sent | Custom tracking |

### 14.3 Health Metrics

- **Review quality score:** ratio verified / total reviews
- **Response rate:** % ulasan dengan respons pemilik
- **Moderation backlog:** queue depth, avg resolution time
- **App store rating:** target ≥ 4.3 (iOS + Android)
- **Crash-free rate:** ≥ 99.5%

---

## 15. Risiko & Mitigasi

| # | Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | **Chicken-and-egg problem** (sedikit bisnis → sedikit reviewer → sedikit bisnis) | Tinggi | Kritis | Focus geographic: 1 kota dulu (contoh: Jakarta/Bandung); onboard 50–100 bisnis seed sebelum launch public [S21] |
| R2 | **Fake review campaign** oleh pesaing/pemilik usaha | Sedang | Tinggi | ML detection + human moderation + legal clause + public transparency report [S27, S28, S30] |
| R3 | **Google policy change** membatasi akses Places API | Rendah | Tinggi | Fallback: OpenStreetMap + self-managed business database; diversify data source [S16] |
| R4 | **Low retention reviewer** (setelah ulasan pertama, tidak kembali) | Tinggi | Sedang | Gamifikasi + feed + social features + monthly challenges [S14, S15, S26] |
| R5 | **Legal complaint** (defamasi, privasi) | Sedang | Sedang | Terms of Service kuat, insurance, legal counsel, rapid takedown process [S17, S27, S30] |
| R6 | **Adoption resistance** dari pemilik usaha (tech-averse) | Tinggi | Sedang | Onboarding hands-on, video tutorial, WhatsApp support, ROI calculator demo [S10] |
| R7 | **Server cost blowup** dengan scale | Sedang | Sedang | Auto-scaling (GCP/AWS), CDN untuk foto, query optimization, caching strategy [S21] |

---

## 16. Rencana Rilis

### Phase 0: Pre-Launch (Bulan 1–2)
- Finalisasi tech stack & architecture
- Onboarding 50 bisnis seed (kafe Jakarta/Bandung)
- Develop MVP core (FR-01 s.d. FR-10, FR-14, FR-21, FR-22)
- Compliance setup (privacy policy, terms, moderation SOP)

### Phase 1: MVP Private Beta (Bulan 3–4)
- Launch closed beta: 200 reviewer (friends & family + seed bisnis customers)
- Collect feedback: usability, friction points, bug reports
- Iterate onboarding flow & QR experience
- Baseline KPI measurement

### Phase 2: Public Launch v1.0 (Bulan 5–6)
- Public release di Google Play Store + App Store
- Marketing: kolaborasi food blogger/influencer, SEO blog
- Target: 1.000 reviewer aktif, 100 bisnis terdaftar
- Monetisasi: free trial 30 hari untuk Business plan

### Phase 3: v1.1 (Bulan 7–9)
- Add FR-11 s.d. FR-13, FR-16, FR-19, FR-24
- AI-assisted responses (FR-08 enhancement)
- Expand ke 2 kota tambahan
- Target: 5.000 reviewer, 300 bisnis, 50 paying

### Phase 4: v2.0 (Bulan 10–12)
- Full monetization (all tiers live)
- Advertising platform (promoted listings)
- Advanced analytics & competitor benchmarking
- API partner program (POS integrations)
- Target: 20.000 reviewer, 1.000 bisnis, 200 paying

---

## 17. Asumsi & Pertanyaan Terbuka

### Asumsi
1. Pengguna Indonesia sudah familiar dengan QR code (dari pembayaran QRIS, menu digital).
2. Pemilik kafe/restoran memiliki smartphone dan akses internet dasar.
3. Budget development tersedia untuk tim 4–6 orang (2 backend, 2 frontend/mobile, 1 PM, 1 designer) selama 12 bulan.
4. Google Places API gratis tier cukup untuk MVP (autocomplete + place details).

### Pertanyaan Terbuka (Perlu Validasi)
1. **Apakah pemilik usaha bersedia bayar Rp 199–499 ribu/bulan?** → Perlu customer discovery interview (min 30 bisnis).
2. **Reward apa yang paling efektif motivasi reviewer Indonesia?** (diskon, poin, status sosial?) → A/B test di beta.
3. **Apakah perlu integrasi dua arah dengan Google Maps** (push ulasan kami ke GMB)? → API limitation study.
4. **Model verifikasi kunjungan mana yang paling reliable & privacy-safe?** → Technical PoC.
5. **Nama & branding aplikasi?** → Branding workshop.

---

## 18. Daftar 30 Sumber Riset

| # | Sumber | URL | Mendukung Bagian |
|---|---|---|---|
| S1 | Google Maps Help — Add/edit/delete reviews | https://support.google.com/maps/answer/6230175 | §2.2, FR-03, FR-09 |
| S2 | Google Maps Community — Reviews troubleshooting FAQ | https://support.google.com/maps/community-guide/476314470 | §2.2, FR-09 |
| S3 | Android Police — Google Maps big problem 2026 | https://www.androidpolice.com/google-maps-has-a-big-problem-and-its-getting-worse-in-2026 | §2.1, §2.2, FR-06 |
| S4 | Digifeel — Google Reviews mobile customer journey | https://www.digifeel.io/blogs/infos/google-reviews-on-mobile-customer-journey | §2.2, §6.1, §6.2, FR-02, FR-25 |
| S5 | Search Engine Land — 15 online review statistics | https://searchengineland.com/guide/online-review-stats | §2.1 |
| S6 | Customer Alliance — Online Review Survey 2024 | https://www.customer-alliance.com/en/articles/online-review-survey-2024 | §2.1, §3.1 |
| S7 | Reviews.org — Trust in online reviews survey | https://www.reviews.org/internet-service/trust-in-online-reviews-survey/ | §2.1 |
| S8 | Financesonline — 62 customer reviews statistics | https://financesonline.com/customer-reviews-statistics/ | §2.1 |
| S9 | BrightLocal — Small businesses enough reviews (2026) | https://www.brightlocal.com/research/smb-report-enough-reviews/ | §2.1, §3.1, FR-08 |
| S10 | Vendasta — Reputation management SMB 2026 data | https://www.vendasta.com/blog/reputation-management-for-small-businesses/ | §2.1, §4.2, FR-07, FR-12 |
| S11 | SQ Magazine — Google Maps statistics 2026 | https://sqmagazine.co.uk/google-maps-statistics/ | §2.1, NFR-05 |
| S12 | ScienceDirect — Online reviews literature review (2024) | https://www.sciencedirect.com/science/article/abs/pii/S0167811624000806 | §2.1, §10 |
| S13 | Taylor & Francis — Word of mouse! Motivation to write reviews | https://www.tandfonline.com/doi/full/10.1080/13527266.2023.2230482 | §4.1, FR-04 |
| S14 | SciELO — Factors motivating users to post reviews (factor analysis, n=1,313) | https://www.scielo.org.mx/scielo.php?script=sci_arttext_plus&pid=S2594-01632025000100087 | §4.1, FR-04 |
| S15 | Google for Developers — Places API policies | https://developers.google.com/maps/documentation/places/web-service/policies | §12, FR-14, NFR-11 |
| S16 | Trustpilot — Terms of Use for Consumers | https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/oct-2026 | §4.1, FR-01, FR-21 |
| S17 | Liputan6 — Google vs TripAdvisor vs food apps (Indonesia) | https://www.liputan6.com/amp/8301544/ulasan-google-tripadvisor-dan-aplikasi-pesan-makanan-mana-yang-paling-bisa-diandalkan | §2.1, §4.3 |
| S18 | Praising.ai — Restaurant review software features/pricing | https://www.praising.ai/blog/best-review-management-software-restaurants | §2.1, §7, §13 |
| S19 | Paytronix — 7 Restaurant review apps | https://www.paytronix.com/blog/restaurant-review-apps | §7, FR-07 |
| S20 | Abbacus Technologies — Build review app like Yelp | https://www.abbacustechnologies.com/how-do-i-build-a-review-app-like-yelp/ | §5, §7, §13, §15 |
| S21 | QRStuff — QR codes for review collection | https://www.qrstuff.com/feeds/blog/pros-qr-codes-in-person-review-collection | §2.3, FR-02 |
| S22 | Feedelity — Restaurant QR code reviews | https://www.feedelity.io/blogs/qr-code-reviews-restaurant | §2.3, FR-02, FR-20 |
| S23 | SevenRooms — Restaurant reputation management 5-step | https://sevenrooms.com/blog/restaurant-reputation-management/ | §6.3, FR-08, FR-19 |
| S24 | Asana — Business Requirements Document template | https://asana.com/resources/business-requirements-document-template | §1, §7 (structure) |
| S25 | Google Maps Help — Local Guides points, levels & badging | https://support.google.com/maps/answer/6225851?hl=en | FR-04 (gamification model) |
| S26 | Checkstep — UGC moderation risks & compliance | https://www.checkstep.com/blog/ugc-moderation | §10, FR-09, FR-10, NFR-06, §11 |
| S27 | TripAdvisor — Content Integrity Policy | https://tripadvisor.mediaroom.com/us-content-integrity-policy | §10, FR-09, FR-10 |
| S28 | Universitas Negeri Gorontalo — Digital marketing, online reviews & consumer trust (Indonesia, n=326) | https://ejurnal.ung.ac.id/index.php/jej/article/view/25499/0 | §2.1 (local context) |
| S29 | TrueReview — How to get Google reviews for restaurants | https://www.truereview.co/post/how-to-get-google-reviews-for-restaurants | §2.2, §6.2, §14 |
| S30 | FTC — Featuring Online Customer Reviews: Guide for Platforms | https://www.ftc.gov/business-guidance/resources/featuring-online-customer-reviews-guide-platforms | §10, §11, FR-04, FR-08, FR-21 |

---

*Dokumen ini disusun berdasarkan riset dari 30 sumber (artikel ilmiah, laporan industri, dokumentasi platform, dan regulasi). Setiap klaim data dan requirement memiliki traceability ke sumber melalui kode [Sxx].*

**Disusun oleh:** Hermes Agent (riset otomatis)  
**Untuk:** Firyal — Topik Masalah #9, Kelompok 6 Kecerdasan Bisnis Buatan  
**Repo:** `darianf055/Kelompok-6---Kecerdasan-Bisnis-BuatanB`
