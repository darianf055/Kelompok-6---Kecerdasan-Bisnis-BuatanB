import Link from "next/link";
import { Card, Logo, buttonClass, buttonGhostClass } from "@/components/ui";

const steps = [
  {
    title: "Scan QR di toko",
    text: "Pelanggan scan QR di meja kasir atau link di Instagram. Tanpa install aplikasi.",
  },
  {
    title: "Ambil nomor & pantau",
    text: "Pelanggan langsung dapat nomor, posisi antrean, dan perkiraan waktu tunggu.",
  },
  {
    title: "Datang tepat waktu",
    text: "Pelanggan tidak perlu duduk lama di lokasi. Pemilik cukup tekan “Panggil berikutnya”.",
  },
];

const features = [
  "Nomor antrean otomatis, reset setiap hari",
  "Perkiraan waktu tunggu berdasarkan jumlah kapster/dokter",
  "Dashboard pemilik real-time dari HP atau laptop",
  "QR code unik untuk setiap toko, siap dicetak",
  "Buka/tutup antrean kapan saja",
  "Data pelanggan tiap toko terpisah dan aman",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <Link href="/masuk" className="text-sm font-medium text-brand hover:underline">
          Masuk pemilik
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-12 sm:py-20">
          <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            Untuk barbershop & klinik
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Pelanggan tidak perlu lagi menunggu lama di tempat.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            DQ adalah antrean online: pelanggan ambil nomor lewat QR, memantau giliran dari HP, dan
            datang saat gilirannya hampir tiba.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/masuk?mode=daftar" className={buttonClass}>
              Daftarkan toko gratis
            </Link>
            <Link href="/masuk" className={buttonGhostClass}>
              Saya sudah punya akun
            </Link>
          </div>
        </section>

        <section className="pb-12">
          <h2 className="mb-4 text-xl font-semibold">Cara kerjanya</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.title}>
                <div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-brand-soft font-semibold text-brand">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <h2 className="mb-4 text-xl font-semibold">Fitur</h2>
          <Card>
            <ul className="grid gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <span className="text-brand" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        © 2026 DQ – Digital Queue
      </footer>
    </div>
  );
}
