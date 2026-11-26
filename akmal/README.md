# Kontribusi — Akmal

## Website TimLog (sudah live)

🔗 **https://timlog-web.vercel.app**

- Deploy production di Vercel: `akmalramadh-8290/timlog-web`
- Source code: [`akmal/timlog-web/`](timlog-web/)
- Backend: serverless API di `api/index.js`, rewrite `/api/*` → `/api/index`
- Database: Upstash Redis (terhubung lewat Vercel Marketplace)
- Payment gateway: **Sumopod Managed Payment**, QRIS dinamis Rp15.000 (mode **Sandbox**)
- Webhook: `https://timlog-web.vercel.app/api/payments/webhook`

Akun demo:

| Peran | Email | Password |
|---|---|---|
| Ketua | `ketua@timlog.id` | `demo123` |
| Mahasiswa | `mahasiswa@timlog.id` | `demo123` |
| Dosen | `dosen@timlog.id` | `demo123` |

> QRIS sudah asli dari Sumopod dan dibuat per transaksi, tetapi masih Sandbox — belum menerima uang sungguhan. Mode Live memerlukan NPWP/NIB dan persetujuan Sumopod.

## File lain

- [`timlog-website.html`](timlog-website.html) — versi HTML mandiri (sebelum dipisah ke project Vercel)
- [`10masalah-akmal.md`](10masalah-akmal.md), [`akmalmasalah.md`](akmalmasalah.md) — catatan riset/masalah
- [`Gemini_Generated_Image_b1jjulb1jjulb1jj.jpg`](Gemini_Generated_Image_b1jjulb1jjulb1jj.jpg) — aset gambar
