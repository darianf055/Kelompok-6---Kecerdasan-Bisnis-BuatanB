"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Card,
  ConfigGuard,
  Spinner,
  buttonClass,
  buttonGhostClass,
  inputClass,
} from "@/components/ui";
import { errorMessage, getSupabase } from "@/lib/supabase";
import { formatMinutes, todayJakarta, type ShopPublic } from "@/lib/types";
import { saveTicket } from "@/lib/ticket-storage";
import { useSavedTicket } from "@/lib/browser-hooks";

const REFRESH_MS = 10_000;

export default function AntrePage() {
  return (
    <ConfigGuard>
      <Suspense fallback={<Spinner />}>
        <TakeTicket />
      </Suspense>
    </ConfigGuard>
  );
}

function TakeTicket() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [shop, setShop] = useState<ShopPublic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTicket = useSavedTicket(slug);
  // Hanya tampilkan "kamu sudah punya nomor" kalau tiketnya masih menunggu / sedang dilayani.
  const [existingTicket, setExistingTicket] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (savedTicket) {
      const { data: t } = await supabase.rpc("get_ticket_status", { p_ticket_id: savedTicket });
      const status = (t as { status: string }[] | null)?.[0]?.status;
      setExistingTicket(status === "waiting" || status === "serving" ? savedTicket : null);
    }
    const { data, error } = await supabase.rpc("get_shop_public", { p_slug: slug });
    if (error) {
      setError(errorMessage(error));
    } else if (!data || data.length === 0) {
      setNotFound(true);
    } else {
      setShop(data[0] as ShopPublic);
    }
    setLoading(false);
  }, [slug, savedTicket]);

  useEffect(() => {
    // load() hanya mengubah state setelah data dari server tiba (asinkron).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [slug, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await getSupabase().rpc("take_ticket", {
      p_slug: slug,
      p_name: name.trim(),
    });
    if (error) {
      setError(errorMessage(error));
      setBusy(false);
      return;
    }
    const id = data as string;
    saveTicket(slug, id, todayJakarta());
    router.push(`/tiket/${id}`);
  }

  if (loading) return <Spinner />;

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <Card>
          <h1 className="text-lg font-semibold">Toko tidak ditemukan</h1>
          <p className="mt-1 text-sm text-muted">
            Periksa kembali link atau QR code yang kamu scan.
          </p>
        </Card>
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <Alert>{error ?? "Gagal memuat data toko."}</Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="text-sm text-muted">Antrean online</p>
      <h1 className="text-2xl font-bold">{shop.name}</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted">Sedang dilayani</p>
          <p className="mt-1 text-3xl font-bold text-brand">
            {shop.now_serving.length ? shop.now_serving.join(", ") : "–"}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted">Menunggu</p>
          <p className="mt-1 text-3xl font-bold">{shop.waiting_count}</p>
        </Card>
      </div>

      <p className="mt-3 text-center text-sm text-muted">
        Kalau ambil nomor sekarang, perkiraan dipanggil:{" "}
        <strong className="text-foreground">{formatMinutes(shop.estimated_wait_minutes)}</strong>
      </p>

      {existingTicket && (
        <div className="mt-5">
          <Alert tone="info">
            Kamu sudah punya nomor antrean hari ini.{" "}
            <Link href={`/tiket/${existingTicket}`} className="font-semibold underline">
              Lihat tiket saya
            </Link>
          </Alert>
        </div>
      )}

      <Card className="mt-5">
        {shop.is_open ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Nama kamu</span>
              <input
                required
                maxLength={40}
                placeholder="Contoh: Budi"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="mt-1 block text-xs text-muted">
                Dipakai kasir untuk memanggil kamu.
              </span>
            </label>
            {error && <Alert>{error}</Alert>}
            <button type="submit" disabled={busy} className={`${buttonClass} w-full text-lg`}>
              {busy ? "Mengambil nomor…" : "Ambil nomor antrean"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="font-semibold">Antrean sedang ditutup</p>
            <p className="mt-1 text-sm text-muted">Coba lagi nanti saat toko sudah buka.</p>
            <button type="button" onClick={load} className={`${buttonGhostClass} mt-4`}>
              Cek lagi
            </button>
          </div>
        )}
      </Card>

      <p className="mt-8 text-center text-xs text-muted">
        Didukung oleh <Link href="/" className="font-semibold text-brand">DQ – Digital Queue</Link>
      </p>
    </main>
  );
}
