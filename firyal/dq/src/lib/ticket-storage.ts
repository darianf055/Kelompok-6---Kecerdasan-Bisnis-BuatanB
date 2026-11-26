// Menyimpan tiket terakhir pelanggan per toko di browser, supaya kalau
// halaman ditutup lalu QR di-scan lagi, pelanggan bisa kembali ke tiketnya.

type Saved = { id: string; date: string };

const key = (slug: string) => `dq_ticket_${slug}`;

export function saveTicket(slug: string, id: string, date: string) {
  try {
    localStorage.setItem(key(slug), JSON.stringify({ id, date } satisfies Saved));
  } catch {
    /* penyimpanan browser tidak tersedia — abaikan */
  }
}

export function loadTicket(slug: string, today: string): string | null {
  try {
    const raw = localStorage.getItem(key(slug));
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    return saved.date === today ? saved.id : null;
  } catch {
    return null;
  }
}

export function clearTicket(slug: string) {
  try {
    localStorage.removeItem(key(slug));
  } catch {
    /* abaikan */
  }
}
