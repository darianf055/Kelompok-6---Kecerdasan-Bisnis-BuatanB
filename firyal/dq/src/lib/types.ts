export type Shop = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  avg_service_minutes: number;
  staff_count: number;
  is_open: boolean;
  created_at: string;
};

export type QueueStatus = "waiting" | "serving" | "done" | "skipped" | "cancelled";

export type QueueEntry = {
  id: string;
  shop_id: string;
  queue_date: string;
  number: number;
  customer_name: string;
  status: QueueStatus;
  created_at: string;
  called_at: string | null;
  finished_at: string | null;
};

export type ShopPublic = {
  shop_id: string;
  name: string;
  is_open: boolean;
  avg_service_minutes: number;
  staff_count: number;
  now_serving: number[];
  waiting_count: number;
  estimated_wait_minutes: number;
};

export type TicketStatus = {
  number: number;
  customer_name: string;
  status: QueueStatus;
  shop_name: string;
  shop_slug: string;
  people_ahead: number;
  estimated_wait_minutes: number;
  now_serving: number[];
};

/** Tanggal hari ini di zona waktu WIB, format YYYY-MM-DD. */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatMinutes(min: number): string {
  if (min <= 0) return "sebentar lagi";
  if (min < 60) return `±${min} menit`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `±${h} jam ${m} menit` : `±${h} jam`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
