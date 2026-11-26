import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes("xxxxxxxx"),
);

let client: SupabaseClient | null = null;

/** Supabase client untuk dipakai di komponen browser. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi. Isi file .env.local terlebih dahulu.");
  }
  if (!client) {
    client = createClient(url!, anonKey!);
  }
  return client;
}

/** Ambil pesan error yang ramah dari error Supabase/Postgres. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: unknown }).message);
    if (msg.includes("duplicate key") && msg.includes("slug")) {
      return "Link toko itu sudah dipakai. Coba link lain.";
    }
    if (msg.includes("Invalid login credentials")) return "Email atau password salah.";
    if (msg.includes("User already registered")) return "Email ini sudah terdaftar. Silakan masuk.";
    if (msg.includes("Password should be")) return "Password minimal 6 karakter.";
    return msg;
  }
  return "Terjadi kesalahan. Coba lagi.";
}
