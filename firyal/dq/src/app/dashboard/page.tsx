"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Alert,
  Card,
  ConfigGuard,
  Logo,
  Spinner,
  buttonClass,
  buttonGhostClass,
} from "@/components/ui";
import { ShopForm } from "@/components/shop-form";
import { errorMessage, getSupabase } from "@/lib/supabase";
import { useOwner } from "@/lib/use-owner";
import { useOrigin } from "@/lib/browser-hooks";
import { todayJakarta, type QueueEntry, type QueueStatus, type Shop } from "@/lib/types";

export default function DashboardPage() {
  return (
    <ConfigGuard>
      <DashboardInner />
    </ConfigGuard>
  );
}

function DashboardInner() {
  const { user, shop, setShop, loading } = useOwner();

  if (loading || !user) return <Spinner />;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar email={user.email ?? ""} />
      {shop ? (
        <QueueManager shop={shop} onShopChange={setShop} ownerId={user.id} />
      ) : (
        <main className="mx-auto w-full max-w-md px-4 py-10">
          <Card>
            <h1 className="text-xl font-semibold">Buat toko kamu</h1>
            <p className="mb-5 mt-1 text-sm text-muted">
              Isi data singkat ini. Setelah itu kamu langsung dapat link dan QR antrean.
            </p>
            <ShopForm ownerId={user.id} onSaved={setShop} />
          </Card>
        </main>
      )}
    </div>
  );
}

function TopBar({ email }: { email: string }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{email}</span>
          <button
            type="button"
            className="font-medium text-brand hover:underline"
            onClick={() => getSupabase().auth.signOut()}
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}

function QueueManager({
  shop,
  onShopChange,
  ownerId,
}: {
  shop: Shop;
  onShopChange: (s: Shop) => void;
  ownerId: string;
}) {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const origin = useOrigin();

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("queue_entries")
      .select("*")
      .eq("shop_id", shop.id)
      .eq("queue_date", todayJakarta())
      .order("number");
    if (error) setError(errorMessage(error));
    else setEntries(data as QueueEntry[]);
    setLoading(false);
  }, [shop.id]);

  // Data real-time: setiap ada pelanggan ambil nomor / batal, dashboard ikut terbarui.
  useEffect(() => {
    const supabase = getSupabase();
    // load() hanya mengubah state setelah data dari server tiba (asinkron).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const channel = supabase
      .channel(`queue-${shop.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries", filter: `shop_id=eq.${shop.id}` },
        () => load(),
      )
      .subscribe();
    const fallback = setInterval(load, 30_000); // cadangan kalau koneksi real-time putus
    return () => {
      clearInterval(fallback);
      supabase.removeChannel(channel);
    };
  }, [shop.id, load]);

  const waiting = useMemo(() => entries.filter((e) => e.status === "waiting"), [entries]);
  const serving = useMemo(() => entries.filter((e) => e.status === "serving"), [entries]);
  const doneCount = entries.filter((e) => e.status === "done").length;
  const missedCount = entries.filter((e) => e.status === "skipped" || e.status === "cancelled").length;

  async function callNext() {
    setBusy(true);
    setError(null);
    const { data, error } = await getSupabase().rpc("call_next", { p_shop_id: shop.id });
    if (error) setError(errorMessage(error));
    else if (data === null) setError("Tidak ada pelanggan yang menunggu.");
    await load();
    setBusy(false);
  }

  async function setStatus(entry: QueueEntry, status: QueueStatus) {
    setError(null);
    const patch: Partial<QueueEntry> = { status };
    if (status === "done" || status === "skipped") patch.finished_at = new Date().toISOString();
    if (status === "serving") patch.called_at = new Date().toISOString();
    const { error } = await getSupabase().from("queue_entries").update(patch).eq("id", entry.id);
    if (error) setError(errorMessage(error));
    await load();
  }

  async function toggleOpen() {
    const { data, error } = await getSupabase()
      .from("shops")
      .update({ is_open: !shop.is_open })
      .eq("id", shop.id)
      .select()
      .single();
    if (error) setError(errorMessage(error));
    else onShopChange(data as Shop);
  }

  const publicUrl = `${origin}/antre/${shop.slug}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{shop.name}</h1>
          <p className="text-sm text-muted">Antrean hari ini</p>
        </div>
        <button
          type="button"
          onClick={toggleOpen}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            shop.is_open
              ? "bg-brand-soft text-brand"
              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {shop.is_open ? "● Antrean dibuka" : "● Antrean ditutup"}
          <span className="ml-2 font-normal opacity-70">(ubah)</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Menunggu" value={waiting.length} />
        <Stat label="Dilayani" value={serving.length} />
        <Stat label="Selesai" value={doneCount} />
        <Stat label="Batal/tidak hadir" value={missedCount} />
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <button
            type="button"
            onClick={callNext}
            disabled={busy || waiting.length === 0}
            className={`${buttonClass} w-full py-5 text-xl`}
          >
            {busy
              ? "Memanggil…"
              : waiting.length
                ? `Panggil berikutnya (No. ${waiting[0].number})`
                : "Belum ada yang menunggu"}
          </button>

          <Card>
            <h2 className="mb-3 font-semibold">Sedang dilayani</h2>
            {serving.length === 0 ? (
              <p className="text-sm text-muted">Belum ada.</p>
            ) : (
              <ul className="divide-y divide-line">
                {serving.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <EntryLabel entry={e} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`${buttonGhostClass} px-3 py-1.5 text-sm`}
                        onClick={() => setStatus(e, "skipped")}
                      >
                        Tidak hadir
                      </button>
                      <button
                        type="button"
                        className={`${buttonClass} px-3 py-1.5 text-sm`}
                        onClick={() => setStatus(e, "done")}
                      >
                        Selesai
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Daftar tunggu</h2>
            {loading ? (
              <Spinner />
            ) : waiting.length === 0 ? (
              <p className="text-sm text-muted">Belum ada pelanggan yang menunggu.</p>
            ) : (
              <ul className="divide-y divide-line">
                {waiting.map((e, i) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <EntryLabel entry={e} hint={i === 0 ? "berikutnya" : undefined} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`${buttonGhostClass} px-3 py-1.5 text-sm`}
                        onClick={() => setStatus(e, "skipped")}
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        className={`${buttonGhostClass} px-3 py-1.5 text-sm`}
                        onClick={() => setStatus(e, "serving")}
                      >
                        Panggil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="text-center">
            <h2 className="mb-3 font-semibold">QR antrean</h2>
            <div className="mx-auto w-fit rounded-xl bg-white p-3">
              {origin && <QRCodeSVG value={publicUrl} size={180} />}
            </div>
            <p className="mt-3 break-all text-xs text-muted">{publicUrl}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className={`${buttonGhostClass} px-3 py-1.5 text-sm`}
                onClick={() => navigator.clipboard?.writeText(publicUrl)}
              >
                Salin link
              </button>
              <Link href="/dashboard/qr" className={`${buttonGhostClass} px-3 py-1.5 text-sm`}>
                Cetak QR
              </Link>
              <Link
                href={`/antre/${shop.slug}`}
                target="_blank"
                className={`${buttonGhostClass} px-3 py-1.5 text-sm`}
              >
                Buka
              </Link>
            </div>
          </Card>

          <Card>
            <button
              type="button"
              className="flex w-full items-center justify-between font-semibold"
              onClick={() => setShowSettings((v) => !v)}
              aria-expanded={showSettings}
            >
              Pengaturan toko
              <span className="text-muted">{showSettings ? "−" : "+"}</span>
            </button>
            {showSettings && (
              <div className="mt-4">
                <ShopForm ownerId={ownerId} shop={shop} onSaved={onShopChange} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}

function EntryLabel({ entry, hint }: { entry: QueueEntry; hint?: string }) {
  const time = new Date(entry.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-lg font-bold text-brand">
        {entry.number}
      </span>
      <div>
        <p className="font-medium">
          {entry.customer_name}
          {hint && <span className="ml-2 text-xs font-normal text-brand">{hint}</span>}
        </p>
        <p className="text-xs text-muted">Ambil nomor {time}</p>
      </div>
    </div>
  );
}
