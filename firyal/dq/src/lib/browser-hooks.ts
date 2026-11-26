"use client";

import { useSyncExternalStore } from "react";
import { loadTicket } from "@/lib/ticket-storage";
import { todayJakarta } from "@/lib/types";

const noopSubscribe = () => () => {};

/** window.location.origin di browser, string kosong saat prerender di server. */
export function useOrigin(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
}

/** ID tiket hari ini yang tersimpan di browser untuk toko ini (atau null). */
export function useSavedTicket(slug: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => loadTicket(slug, todayJakarta()),
    () => null,
  );
}
