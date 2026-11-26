# TimLog Web + QRIS (Sumopod)

Website TimLog lengkap dengan backend serverless di Vercel dan payment gateway QRIS **Sumopod Managed Payment**.

## 🌐 Website sudah live

**https://timlog-web.vercel.app**

- Deploy production di Vercel (akun: `akmalramadh-8290`, project: `timlog-web`)
- Deployment ID terakhir: `dpl_Fs8NqTEYwrtJpvvaERfMuYojJ8Pq`
- QRIS sudah terhubung ke **Sumopod Managed Payment (Sandbox)** — QR asli per transaksi, nominal Rp15.000
- Penyimpanan data memakai **Upstash Redis** yang terhubung ke project Vercel
- Webhook: `https://timlog-web.vercel.app/api/payments/webhook`

> Status: **Sandbox**. QRIS berfungsi penuh untuk demo, tetapi belum menerima uang sungguhan. Untuk Live access, Sumopod memerlukan NPWP/NIB dan persetujuan usaha.

## Struktur

```
timlog-web/
├── index.html              # frontend (halaman utama)
├── api/index.js            # semua endpoint /api (di-rewrite dari /api/*)
├── vercel.json             # rewrite /api/* → /api/index
├── package.json
└── .env.example
```

## Akun demo

| Peran | Email | Password |
|---|---|---|
| Ketua | `ketua@timlog.id` | `demo123` |
| Mahasiswa | `mahasiswa@timlog.id` | `demo123` |
| Dosen | `dosen@timlog.id` | `demo123` |

## Deploy ke Vercel

1. Install CLI (sekali saja):

   ```powershell
   npm.cmd i -g vercel
   ```

2. Masuk ke akun Vercel Anda:

   ```powershell
   vercel login
   ```

3. Dari folder `akmal/timlog-web`, jalankan:

   ```powershell
   vercel link
   vercel --prod
   ```

   Atau import repo GitHub ini di dashboard Vercel dengan **Root Directory = `akmal/timlog-web`**.

## Storage (wajib)

Data users/team/tugas/pembayaran disimpan di Redis.

1. Di project Vercel, buka **Storage → Marketplace → Redis (Upstash)** lalu **Create**.
2. Integrasi akan otomatis menambahkan env var `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL`, `REDIS_URL` (atau `UPSTASH_REDIS_REST_*` kalau pakai Upstash langsung). Kode mendukung keduanya — tidak perlu diisi manual.
3. Tambahkan env var berikut di **Settings → Environment Variables**:

| Nama | Nilai |
|---|---|
| `SUMOPOD_API_KEY` | API Key project Sumopod (Sandbox/Live) |
| `SUMOPOD_BASE_URL` | `https://api-pay-sandbox.sumopod.com/api/v1` (sandbox) |
| `SUMOPOD_WEBHOOK_TOKEN` | Webhook Token `whtok_...` dari Sumopod |
| `SUMOPOD_WEBHOOK_SECRET` | Signing Secret `whsec_...` (opsional, cadangan) |
| `SITE_URL` | `https://timlog-web.vercel.app` |

> Jangan pernah menaruh API key / token di file yang di-commit ke GitHub.

## Webhook Sumopod

1. Buka **Sumopod Dashboard → Managed Payment → Settings → Webhook**.
2. Isi endpoint URL:

   ```
   https://<domain-vercel-anda>/api/payments/webhook
   ```

3. Di halaman yang sama akan terlihat dua secret: `whtok_...` (**Webhook Token**, dipakai di sini) dan `whsec_...` (**Signing Secret**, alternatif verifikasi signature — tidak dipakai). Klik **Reveal** pada Webhook Token, lalu salin ke `SUMOPOD_WEBHOOK_TOKEN`.
4. Klik **Save & Test**.
5. Pastikan mode Sandbox dan Live dikonfigurasi terpisah (API key & webhook berbeda).

## Alur QRIS

1. User membuka tab **Laporan** → klik **Beli Laporan · Rp15.000**.
2. Server memanggil `POST {SUMOPOD_BASE_URL}/payments` dengan `X-Api-Key`.
3. Server membuat QR dari `payment_code` (atau `payment_link_url` bila kode tidak dikirim) dan mengembalikannya ke modal website.
4. User scan QRIS.
5. Sumopod mengirim webhook `payment.completed` ke `/api/payments/webhook`.
6. Server menandai pembayaran `paid` dan membuka laporan PDF untuk user tersebut.

Catatan: tanpa Redis, data hanya tersimpan di memori dan akan reset saat serverless function cold start. Untuk demo singkat masih bisa, tapi untuk kenyataan tetap pasang Redis.

## Live / uang sungguhan

Sandbox = data uji. Untuk menerima pembayaran asli, di Sumopod harus daftar **Register for Live Access** dan disetujui (proses verifikasi usaha memerlukan NPWP dan NIB). Setelah disetujui:

1. Toggle **Live** di Managed Payment, lalu salin API Key dan Webhook Token Live yang **berbeda** dari sandbox.
2. Update `SUMOPOD_API_KEY`, `SUMOPOD_WEBHOOK_TOKEN`, dan `SUMOPOD_BASE_URL` di Vercel.
3. Daftarkan ulang webhook URL di mode Live.
4. Deploy ulang (`vercel --prod`) dan uji satu transaksi kecil.

Catatan fee: biarkan **Charge fee to customer** mati agar mahasiswa membayar tepat Rp15.000; fee 0,7% + Rp300 dipotong dari saldo merchant.
