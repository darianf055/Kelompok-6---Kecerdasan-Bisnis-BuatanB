"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Card, ConfigGuard, Spinner, buttonGhostClass } from "@/components/ui";
import { errorMessage, getSupabase } from "@/lib/supabase";
import { formatMinutes, type TicketStatus } from "@/lib/types";
import { clearTicket } from "@/lib/ticket-storage";

const REFRESH_MS = 8_000;

export default function TiketPage() {
  return (
    <ConfigGuard>
      <Suspense fallback={<Spinner />}>
        <Ticket />
      </Suspense>
    </ConfigGuard>
  );
}

function Ticket() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const lastStatus = useRef<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase().rpc("get_ticket_status", { p_ticket_id: id });
    if (error) {
      setError(errorMessage(error));
    } else if (!data || data.length === 0) {
      setError("Tiket tidak ditemukan.");
    } else {
      const t = data[0] as TicketStatus;
      // HP bergetar saat nomor dipanggil (kalau browser mendukung).
      if (lastStatus.current === "waiting" && t.status === "serving") {
        try {
          navigator.vibrate?.([300, 150, 300]);
        } catch {
          /* tidak didukung */
        }
      }
      lastStatus.current = t.status;
      setTicket(t);
      setError(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // load() hanya mengubah state setelah data dari server tiba (asinkron).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  async function cancel() {
    if (!ticket || !confirm("Batalkan nomor antrean ini?")) return;
    setCancelling(true);
    const { error } = await getSupabase().rpc("cancel_ticket", { p_ticket_id: id });
    if (error) setError(errorMessage(error));
    else clearTicket(ticket.shop_slug);
    await load();
    setCancelling(false);
  }

  if (loading) return <Spinner />;
  if (!ticket) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <Alert>{error ?? "Tiket tidak ditemukan."}</Alert>
      </main>
    );
  }

  const isWaiting = ticket.status === "waiting";
  const isServing = ticket.status === "serving";
  const isClosed = !isWaiting && !isServing;
  const almost = isWaiting && ticket.people_ahead <= 1;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="text-sm text-muted">Tiket antrean</p>
      <h1 className="text-xl font-bold">{ticket.shop_name}</h1>

      <Card
        className={`mt-5 text-center ${isServing ? "border-brand bg-brand-soft" : ""}`}
      >
        <p className="text-sm text-muted">Nomor kamu</p>
        <p className="my-2 text-7xl font-bold tracking-tight text-brand">{ticket.number}</p>
        <p className="text-sm">a.n. {ticket.customer_name}</p>

        <div className="mt-4 rounded-xl bg-background px-3 py-3">
          {isServing && (
            <p className="text-lg font-semibold text-brand">Giliran kamu! Silakan menuju kasir.</p>
          )}
          {isWaiting && (
            <>
              <p className="text-lg font-semibold">
                {ticket.people_ahead === 0
                  ? "Kamu berikutnya"
                  : `${ticket.people_ahead} orang di depan kamu`}
              </p>
              <p className="text-sm text-muted">
                Perkiraan dipanggil: {formatMinutes(ticket.estimated_wait_minutes)}
              </p>
            </>
          )}
          {ticket.status === "done" && <p className="font-semibold">Selesai. Terima kasih!</p>}
          {ticket.status === "skipped" && (
            <p className="font-semibold">Nomor ini dilewati karena tidak hadir saat dipanggil.</p>
          )}
          {ticket.status === "cancelled" && <p className="font-semibold">Nomor ini dibatalkan.</p>}
        </div>
      </Card>

      {almost && (
        <div className="mt-4">
          <Alert tone="info">Giliranmu hampir tiba. Mohon segera menuju lokasi.</Alert>
        </div>
      )}

      <Card className="mt-4 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">Sedang dilayani</p>
        <p className="mt-1 text-2xl font-bold">
          {ticket.now_serving.length ? ticket.now_serving.join(", ") : "–"}
        </p>
      </Card>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {isWaiting && (
          <button type="button" onClick={cancel} disabled={cancelling} className={buttonGhostClass}>
            {cancelling ? "Membatalkan…" : "Batalkan antrean"}
          </button>
        )}
        {isClosed && (
          <Link href={`/antre/${ticket.shop_slug}`} className={buttonGhostClass}>
            Ambil nomor baru
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Halaman ini diperbarui otomatis. Simpan atau bookmark halaman ini untuk memantau giliranmu.
      </p>
    </main>
  );
}
