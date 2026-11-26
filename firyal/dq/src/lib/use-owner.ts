"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import type { Shop } from "@/lib/types";

/**
 * Memastikan pemilik sudah login (kalau belum → /masuk) dan memuat tokonya.
 * shop = null berarti pemilik belum membuat toko.
 */
export function useOwner() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShop = useCallback(async (uid: string) => {
    const { data } = await getSupabase()
      .from("shops")
      .select("*")
      .eq("owner_id", uid)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    setShop((data as Shop | null) ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/masuk");
        return;
      }
      setUser(data.session.user);
      await loadShop(data.session.user.id);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/masuk");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router, loadShop]);

  const reloadShop = useCallback(() => (user ? loadShop(user.id) : Promise.resolve()), [user, loadShop]);

  return { user, shop, setShop, loading, reloadShop };
}
