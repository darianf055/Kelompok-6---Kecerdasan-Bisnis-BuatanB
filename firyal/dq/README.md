# DQ – Digital Queue

Antrean online untuk barbershop dan klinik. Pelanggan scan QR, ambil nomor, lalu pantau giliran dari HP. Pemilik toko mengelola antrean lewat dashboard.

## Halaman

| Halaman | Untuk | Fungsi |
|---|---|---|
| `/` | Umum | Landing page produk |
| `/masuk` | Pemilik | Daftar / masuk akun |
| `/dashboard` | Pemilik | Buat toko, panggil antrean, buka/tutup antrean, pengaturan, QR |
| `/dashboard/qr` | Pemilik | Poster QR siap cetak |
| `/antre/[slug]` | Pelanggan | Ambil nomor antrean (tujuan QR) |
| `/tiket/[id]` | Pelanggan | Nomor, posisi, perkiraan waktu, batalkan |

## Teknologi
Next.js + Tailwind CSS, Supabase (database Postgres, login, real-time).

## Cara menjalankan

1. **Buat project Supabase** di https://supabase.com (gratis).
2. **Buat tabel:** Supabase → *SQL Editor* → *New query* → tempel isi `supabase/schema.sql` → *Run*.
3. **(Opsional, untuk uji coba)** Supabase → *Authentication* → *Sign In / Providers* → *Email* → matikan *Confirm email*, supaya daftar akun tidak perlu konfirmasi email.
4. **Isi koneksi:** salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari Supabase → *Project Settings* → *API*.
5. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
   Buka http://localhost:3000

## Keamanan data
- Row Level Security aktif: pemilik hanya bisa melihat dan mengubah toko serta antreannya sendiri.
- Pelanggan tidak punya akses langsung ke tabel; mereka hanya memakai fungsi `get_shop_public`, `take_ticket`, `get_ticket_status`, dan `cancel_ticket`, sehingga nama pelanggan lain tidak terlihat.
- Nomor antrean diambil dengan mengunci baris toko, jadi dua pelanggan tidak bisa mendapat nomor yang sama. Nomor kembali ke 1 setiap hari (WIB).

## Rencana berikutnya (belum ada di MVP)
- Layar antrean untuk TV
- Notifikasi WhatsApp
- Laporan bulanan
- Pilih kapster/layanan tertentu
