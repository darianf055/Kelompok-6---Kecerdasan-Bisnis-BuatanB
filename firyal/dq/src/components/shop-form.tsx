"use client";

import { useState, type FormEvent } from "react";
import { Alert, buttonClass, inputClass } from "@/components/ui";
import { errorMessage, getSupabase } from "@/lib/supabase";
import { slugify, type Shop } from "@/lib/types";

type Props = {
  ownerId: string;
  /** Kalau diisi → mode edit pengaturan toko. */
  shop?: Shop;
  onSaved: (shop: Shop) => void;
};

export function ShopForm({ ownerId, shop, onSaved }: Props) {
  const editing = Boolean(shop);
  const [name, setName] = useState(shop?.name ?? "");
  const [slug, setSlug] = useState(shop?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [avg, setAvg] = useState(shop?.avg_service_minutes ?? 20);
  const [staff, setStaff] = useState(shop?.staff_count ?? 1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const values = {
      name: name.trim(),
      slug: slugify(slug),
      avg_service_minutes: avg,
      staff_count: staff,
    };
    const supabase = getSupabase();
    const query = editing
      ? supabase.from("shops").update(values).eq("id", shop!.id)
      : supabase.from("shops").insert({ ...values, owner_id: ownerId });
    const { data, error } = await query.select().single();
    setBusy(false);
    if (error) {
      setError(errorMessage(error));
      return;
    }
    setSaved(editing);
    onSaved(data as Shop);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nama toko</span>
        <input
          required
          minLength={2}
          maxLength={80}
          placeholder="Contoh: Barber Jaya"
          className={inputClass}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Link antrean</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-line bg-background focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
          <span className="shrink-0 pl-3 text-sm text-muted">/antre/</span>
          <input
            required
            minLength={3}
            maxLength={40}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Huruf kecil, angka, dan tanda hubung"
            className="w-full bg-transparent px-1 py-2.5 text-base outline-none"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
          />
        </div>
        <span className="mt-1 block text-xs text-muted">
          {editing
            ? "Hati-hati: mengganti link membuat QR lama tidak berlaku."
            : "Huruf kecil, angka, dan tanda hubung. Dipakai di QR code."}
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Rata-rata layanan (menit)</span>
          <input
            type="number"
            required
            min={1}
            max={240}
            className={inputClass}
            value={avg}
            onChange={(e) => setAvg(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Jumlah kapster/dokter</span>
          <input
            type="number"
            required
            min={1}
            max={20}
            className={inputClass}
            value={staff}
            onChange={(e) => setStaff(Number(e.target.value))}
          />
        </label>
      </div>

      {error && <Alert>{error}</Alert>}
      {saved && <Alert tone="info">Pengaturan disimpan.</Alert>}

      <button type="submit" disabled={busy} className={`${buttonClass} w-full`}>
        {busy ? "Menyimpan…" : editing ? "Simpan pengaturan" : "Buat toko"}
      </button>
    </form>
  );
}
