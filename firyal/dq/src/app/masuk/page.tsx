"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Card,
  ConfigGuard,
  Logo,
  Spinner,
  buttonClass,
  inputClass,
} from "@/components/ui";
import { errorMessage, getSupabase } from "@/lib/supabase";

export default function MasukPage() {
  return (
    <ConfigGuard>
      <Suspense fallback={<Spinner />}>
        <AuthForm />
      </Suspense>
    </ConfigGuard>
  );
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"masuk" | "daftar">(
    params.get("mode") === "daftar" ? "daftar" : "masuk",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Kalau sudah login, langsung ke dashboard.
  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/dashboard");
      });
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = getSupabase();
    try {
      if (mode === "daftar") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo("Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk.");
          setMode("masuk");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <Logo />
      </div>
      <Card>
        <h1 className="text-xl font-semibold">
          {mode === "daftar" ? "Daftarkan toko kamu" : "Masuk ke dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "daftar"
            ? "Buat akun pemilik. Gratis untuk mulai."
            : "Kelola antrean barbershop atau klinik kamu."}
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "daftar" ? "new-password" : "current-password"}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <Alert>{error}</Alert>}
          {info && <Alert tone="info">{info}</Alert>}

          <button type="submit" disabled={busy} className={`${buttonClass} w-full`}>
            {busy ? "Memproses…" : mode === "daftar" ? "Buat akun" : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "daftar" ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            className="font-medium text-brand hover:underline"
            onClick={() => {
              setMode(mode === "daftar" ? "masuk" : "daftar");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "daftar" ? "Masuk" : "Daftar"}
          </button>
        </p>
      </Card>
    </main>
  );
}
