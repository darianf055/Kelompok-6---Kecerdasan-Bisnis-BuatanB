"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ConfigGuard, Spinner, buttonClass, buttonGhostClass } from "@/components/ui";
import { useOwner } from "@/lib/use-owner";
import { useOrigin } from "@/lib/browser-hooks";

export default function CetakQrPage() {
  return (
    <ConfigGuard>
      <PrintQr />
    </ConfigGuard>
  );
}

function PrintQr() {
  const { shop, loading } = useOwner();
  const origin = useOrigin();

  if (loading || !origin) return <Spinner />;
  if (!shop) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p>Buat toko dulu di dashboard.</p>
        <Link href="/dashboard" className={`${buttonClass} mt-4`}>
          Ke dashboard
        </Link>
      </main>
    );
  }

  const url = `${origin}/antre/${shop.slug}`;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10 text-center">
      <div className="no-print mb-6 flex gap-2">
        <Link href="/dashboard" className={buttonGhostClass}>
          ← Kembali
        </Link>
        <button type="button" onClick={() => window.print()} className={buttonClass}>
          Cetak
        </button>
      </div>

      <div className="w-full rounded-3xl border-2 border-line bg-white p-8 text-black">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
          Antrean online
        </p>
        <h1 className="mt-1 text-3xl font-bold">{shop.name}</h1>
        <div className="my-6 flex justify-center">
          <QRCodeSVG value={url} size={240} marginSize={1} />
        </div>
        <p className="text-lg font-semibold">Scan untuk ambil nomor antrean</p>
        <p className="mt-1 text-sm text-gray-600">
          Pantau giliranmu dari HP, tidak perlu menunggu di sini.
        </p>
        <p className="mt-4 break-all text-xs text-gray-500">{url}</p>
        <p className="mt-6 text-xs text-gray-400">DQ – Digital Queue</p>
      </div>
    </main>
  );
}
