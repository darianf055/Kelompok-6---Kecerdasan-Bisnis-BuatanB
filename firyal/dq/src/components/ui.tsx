import Link from "next/link";
import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-bold ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">DQ</span>
      <span className="text-lg tracking-tight">Digital Queue</span>
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Spinner({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  const styles =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

/** Tampil kalau .env.local belum diisi, supaya tidak muncul error yang membingungkan. */
export function ConfigGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>;
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-16">
      <Card>
        <h1 className="mb-2 text-lg font-semibold">Database belum terhubung</h1>
        <p className="text-sm text-muted">
          Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi URL dan anon key dari
          Supabase, lalu jalankan ulang <code>npm run dev</code>.
        </p>
      </Card>
    </main>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export const buttonClass =
  "inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

export const buttonGhostClass =
  "inline-flex items-center justify-center rounded-xl border border-line px-4 py-2.5 font-medium transition hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10";
