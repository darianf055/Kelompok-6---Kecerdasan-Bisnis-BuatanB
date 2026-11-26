import { Redis } from '@upstash/redis';
import QRCode from 'qrcode';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/* ------------------------------------------------------------------ */
/* TimLog API — Vercel serverless function                              */
/* Endpoint yang dipakai timlog-website.html:                            */
/*   /api/auth/register  /api/auth/login  /api/auth/me                   */
/*   /api/classes        /api/teams/mine  /api/teams  /api/teams/join     */
/*   /api/teams/:id/tasks  /api/tasks/:id/submit  /api/tasks/:id/review   */
/*   /api/teams/:id/report                                               */
/*   /api/payments  /api/payments/:id  /api/payments/order/:orderId       */
/*   /api/payments/confirm  /api/payments/webhook                        */
/* ------------------------------------------------------------------ */

const DB_KEY = 'timlog_db';
const hasRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;
const memory = { db: null };
const AMOUNT = 15000;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return res.end(JSON.stringify(data));
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hex] = String(stored || '').split(':');
  if (!salt || !hex) return false;
  const a = scryptSync(String(password), salt, 64);
  const b = Buffer.from(hex, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

function initialDB() {
  const pw = hashPassword('demo123');
  const users = [
    { id: 'u-andi', name: 'Andi Ramadhan', email: 'ketua@timlog.id', passwordHash: pw, role: 'ketua' },
    { id: 'u-budi', name: 'Budi Santoso', email: 'mahasiswa@timlog.id', passwordHash: pw, role: 'mahasiswa' },
    { id: 'u-citra', name: 'Citra Dewi', email: 'citra@timlog.id', passwordHash: pw, role: 'mahasiswa' },
    { id: 'u-dani', name: 'Dani Pratama', email: 'dani@timlog.id', passwordHash: pw, role: 'mahasiswa' },
    { id: 'u-rina', name: 'Dr. Rina Kusuma', email: 'dosen@timlog.id', passwordHash: pw, role: 'dosen' },
  ];
  const classes = [
    { id: 'c-1', name: 'Sistem Informasi 2026', deadline: '2026-12-10', lecturerId: 'u-rina' },
  ];
  const teams = [
    {
      id: 't-1', name: 'Kelompok A', code: 'TIM-4821',
      leaderId: 'u-andi', memberIds: ['u-andi', 'u-budi', 'u-citra', 'u-dani'],
      classId: 'c-1', paidBy: [],
    },
  ];
  const tasks = [
    { id: 'k-1', teamId: 't-1', title: 'Analisis kebutuhan sistem', assigneeId: 'u-andi', weight: 20, deadline: '2026-11-28', status: 'approved', file: 'analisis-kebutuhan.pdf', note: '' },
    { id: 'k-2', teamId: 't-1', title: 'Desain database (ERD)', assigneeId: 'u-budi', weight: 25, deadline: '2026-12-02', status: 'submitted', file: 'erd-v2.png', note: '' },
    { id: 'k-3', teamId: 't-1', title: 'Implementasi modul login', assigneeId: 'u-citra', weight: 30, deadline: '2026-12-05', status: 'revision', file: 'login-code.zip', note: 'Tambahkan validasi password' },
    { id: 'k-4', teamId: 't-1', title: 'Pengujian & dokumentasi', assigneeId: 'u-dani', weight: 25, deadline: '2026-12-08', status: 'todo', file: '', note: '' },
  ];
  return { users, tokens: {}, classes, teams, tasks, payments: {} };
}

async function readDB() {
  if (redis) {
    const saved = await redis.get(DB_KEY);
    if (saved && typeof saved === 'object') return saved;
    const fresh = initialDB();
    await redis.set(DB_KEY, fresh);
    return fresh;
  }
  if (!memory.db) memory.db = initialDB();
  return memory.db;
}

async function writeDB(db) {
  if (redis) await redis.set(DB_KEY, db);
  else memory.db = db;
}

async function readBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw.trim()) return {};
  try { return JSON.parse(raw); }
  catch { throw new HttpError(400, 'Body JSON tidak valid.'); }
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

function currentUser(req, db) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const uid = db.tokens[token];
  return uid ? db.users.find(u => u.id === uid) || null : null;
}

function requireUser(req, db) {
  const u = currentUser(req, db);
  if (!u) throw new HttpError(401, 'Belum login. Silakan masuk.');
  return u;
}

function requireRole(user, role) {
  if (user.role !== role) throw new HttpError(403, 'Akses ditolak untuk peran ini.');
}

function teamView(db, team) {
  if (!team) return null;
  const tasks = db.tasks.filter(t => t.teamId === team.id);
  const totalWeight = tasks.reduce((s, t) => s + Number(t.weight || 0), 0);
  const approvedWeight = tasks
    .filter(t => t.status === 'approved')
    .reduce((s, t) => s + Number(t.weight || 0), 0);
  const progress = totalWeight ? Math.round(approvedWeight / totalWeight * 100) : 0;
  const members = team.memberIds.map(id => {
    const u = db.users.find(x => x.id === id);
    const mine = tasks.filter(t => t.assigneeId === id);
    const ok = mine
      .filter(t => t.status === 'approved')
      .reduce((s, t) => s + Number(t.weight || 0), 0);
    return {
      id,
      name: u ? u.name : '-',
      isLeader: id === team.leaderId,
      share: totalWeight ? Math.round(ok / totalWeight * 100) : 0,
    };
  });
  return { ...team, members, tasks, totalWeight, progress };
}

function paymentView(p) {
  if (!p) return null;
  return {
    id: p.id,
    orderId: p.orderId,
    amount: p.amount,
    status: p.status,
    expiresAt: p.expiresAt,
    paymentLinkUrl: p.paymentLinkUrl,
    qrDataUrl: p.qrDataUrl,
  };
}

function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function createSumopodPayment({ orderId, amount, teamId, userId }) {
  const apiKey = process.env.SUMOPOD_API_KEY;
  if (!apiKey) throw new HttpError(500, 'SUMOPOD_API_KEY belum dikonfigurasi di server.');

  const base = (process.env.SUMOPOD_BASE_URL || 'https://api-pay-sandbox.sumopod.com/api/v1').replace(/\/$/, '');
  const site = siteUrl();
  const payload = {
    order_id: orderId,
    amount: Number(amount),
    currency: 'IDR',
    payment_method_type_code: 'QRIS',
    expires_in_hours: 1,
    success_return_url: `${site}/?payment=success&order_id=${encodeURIComponent(orderId)}`,
    cancel_return_url: `${site}/?payment=cancel&order_id=${encodeURIComponent(orderId)}`,
  };

  let response;
  try {
    response = await fetch(`${base}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new HttpError(502, 'Tidak dapat terhubung ke Sumopod. Coba lagi.');
  }

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

  if (!response.ok) {
    throw new HttpError(502, `Sumopod menolak permintaan (${response.status}): ${data.message || data.error || 'unknown error'}`);
  }

  const id = data.payment_id || data.id || orderId;
  const paymentLinkUrl = data.payment_link_url || data.payment_link || '';
  const qrSource = data.payment_code || data.qr_string || data.qr_content || paymentLinkUrl;
  let qrDataUrl = '';
  if (qrSource) {
    try {
      qrDataUrl = await QRCode.toDataURL(String(qrSource), {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#172554', light: '#FFFFFF' },
      });
    } catch { /* QR tetap opsional kalau generator gagal */ }
  }

  return {
    id: String(id),
    orderId,
    userId,
    teamId,
    amount: Number(data.amount || amount),
    status: data.status || 'pending',
    expiresAt: data.expires_at || data.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    paymentLinkUrl,
    qrDataUrl,
    createdAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  try {
    const db = await readDB();
    const url = new URL(req.url, 'http://localhost');
    const path = (url.pathname.replace(/^\/api/, '') || '/').replace(/\/$/, '') || '/';
    const method = req.method || 'GET';
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(req) : {};

    /* ---------------- AUTH ---------------- */
    if (path === '/auth/register' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const password = String(body.password || '');
      if (!name || !email || password.length < 6) {
        throw new HttpError(400, 'Nama, email, dan password minimal 6 karakter wajib diisi.');
      }
      if (db.users.some(u => u.email === email)) {
        throw new HttpError(400, 'Email sudah terdaftar. Silakan masuk.');
      }
      const role = ['mahasiswa', 'ketua', 'dosen'].includes(body.role) ? body.role : 'mahasiswa';
      const user = { id: randomUUID(), name, email, passwordHash: hashPassword(password), role };
      db.users.push(user);
      const token = randomUUID();
      db.tokens[token] = user.id;
      await writeDB(db);
      return json(res, 200, { token, user: publicUser(user) });
    }

    if (path === '/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const user = db.users.find(u => u.email === email);
      if (!user || !verifyPassword(body.password, user.passwordHash)) {
        throw new HttpError(401, 'Email atau password salah.');
      }
      const token = randomUUID();
      db.tokens[token] = user.id;
      await writeDB(db);
      return json(res, 200, { token, user: publicUser(user) });
    }

    if (path === '/auth/me' && method === 'GET') {
      return json(res, 200, publicUser(requireUser(req, db)));
    }

    /* ---------------- KELAS ---------------- */
    if (path === '/classes' && method === 'GET') {
      requireUser(req, db);
      return json(res, 200, db.classes);
    }

    if (path === '/classes' && method === 'POST') {
      const user = requireUser(req, db);
      requireRole(user, 'dosen');
      const name = String(body.name || '').trim();
      if (!name) throw new HttpError(400, 'Nama kelas wajib diisi.');
      const kelas = {
        id: randomUUID(), name,
        deadline: body.deadline || '',
        lecturerId: user.id,
      };
      db.classes.push(kelas);
      await writeDB(db);
      return json(res, 200, kelas);
    }

    /* ---------------- KELOMPOK ---------------- */
    if (path === '/teams/mine' && method === 'GET') {
      const user = requireUser(req, db);
      const team = db.teams.find(t => t.memberIds.includes(user.id));
      return json(res, 200, teamView(db, team));
    }

    if (path === '/teams' && method === 'POST') {
      const user = requireUser(req, db);
      requireRole(user, 'ketua');
      const name = String(body.name || '').trim();
      if (!name) throw new HttpError(400, 'Nama kelompok wajib diisi.');
      let code;
      do { code = `TIM-${Math.floor(1000 + Math.random() * 9000)}`; }
      while (db.teams.some(t => t.code === code));
      const team = {
        id: randomUUID(), name, code,
        leaderId: user.id,
        memberIds: [user.id],
        classId: body.classId || null,
        paidBy: [],
      };
      db.teams.push(team);
      await writeDB(db);
      return json(res, 200, teamView(db, team));
    }

    if (path === '/teams/join' && method === 'POST') {
      const user = requireUser(req, db);
      const code = String(body.code || '').trim().toUpperCase();
      const team = db.teams.find(t => t.code === code);
      if (!team) throw new HttpError(404, 'Kode undangan tidak ditemukan.');
      if (!team.memberIds.includes(user.id)) {
        team.memberIds.push(user.id);
        await writeDB(db);
      }
      return json(res, 200, teamView(db, team));
    }

    let m;
    if ((m = path.match(/^\/teams\/([^/]+)\/tasks$/)) && method === 'POST') {
      const user = requireUser(req, db);
      const team = db.teams.find(t => t.id === m[1]);
      if (!team) throw new HttpError(404, 'Kelompok tidak ditemukan.');
      if (team.leaderId !== user.id) throw new HttpError(403, 'Hanya ketua yang bisa membagi tugas.');
      const title = String(body.title || '').trim();
      const weight = Number(body.weight);
      if (!title || !Number.isInteger(weight) || weight <= 0) {
        throw new HttpError(400, 'Nama tugas dan bobot yang valid wajib diisi.');
      }
      const used = db.tasks.filter(t => t.teamId === team.id).reduce((s, t) => s + Number(t.weight || 0), 0);
      if (used + weight > 100) {
        throw new HttpError(400, `Total bobot melebihi 100%. Sisa: ${100 - used}%.`);
      }
      db.tasks.push({
        id: randomUUID(), teamId: team.id, title,
        assigneeId: String(body.assigneeId || user.id),
        weight, deadline: body.deadline || '',
        status: 'todo', file: '', note: '',
      });
      await writeDB(db);
      return json(res, 200, teamView(db, team));
    }

    if ((m = path.match(/^\/tasks\/([^/]+)\/submit$/)) && method === 'POST') {
      const user = requireUser(req, db);
      const task = db.tasks.find(t => t.id === m[1]);
      if (!task) throw new HttpError(404, 'Tugas tidak ditemukan.');
      if (task.assigneeId !== user.id) throw new HttpError(403, 'Ini bukan tugas Anda.');
      if (!['todo', 'revision'].includes(task.status)) {
        throw new HttpError(400, 'Tugas ini tidak bisa diunggah.');
      }
      const file = String(body.file || '').trim();
      if (!file) throw new HttpError(400, 'Nama file bukti wajib diisi.');
      task.file = file;
      task.status = 'submitted';
      task.note = '';
      await writeDB(db);
      return json(res, 200, teamView(db, db.teams.find(t => t.id === task.teamId)));
    }

    if ((m = path.match(/^\/tasks\/([^/]+)\/review$/)) && method === 'POST') {
      const user = requireUser(req, db);
      const task = db.tasks.find(t => t.id === m[1]);
      if (!task) throw new HttpError(404, 'Tugas tidak ditemukan.');
      const team = db.teams.find(t => t.id === task.teamId);
      if (!team || team.leaderId !== user.id) throw new HttpError(403, 'Hanya ketua yang bisa memverifikasi.');
      if (task.status !== 'submitted') throw new HttpError(400, 'Tugas belum menunggu verifikasi.');
      if (body.action === 'approve') {
        task.status = 'approved';
        task.note = '';
      } else if (body.action === 'revise') {
        const note = String(body.note || '').trim();
        if (!note) throw new HttpError(400, 'Catatan revisi wajib diisi.');
        task.status = 'revision';
        task.note = note;
      } else {
        throw new HttpError(400, 'Aksi tidak dikenal.');
      }
      await writeDB(db);
      return json(res, 200, teamView(db, team));
    }

    if ((m = path.match(/^\/teams\/([^/]+)\/report$/)) && method === 'GET') {
      const user = requireUser(req, db);
      const team = db.teams.find(t => t.id === m[1]);
      if (!team) throw new HttpError(404, 'Kelompok tidak ditemukan.');
      const paid = (team.paidBy || []).includes(user.id) || user.role === 'dosen';
      if (!paid) throw new HttpError(403, 'Laporan belum dibeli.');
      return json(res, 200, { ok: true, team: teamView(db, team) });
    }

    /* ---------------- PEMBAYARAN SUMOPOD ---------------- */
    if (path === '/payments' && method === 'POST') {
      const user = requireUser(req, db);
      const orderId = `TIMLOG-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const payment = await createSumopodPayment({
        orderId,
        amount: AMOUNT,
        teamId: body.teamId || null,
        userId: user.id,
      });
      db.payments[payment.id] = payment;
      await writeDB(db);
      return json(res, 200, paymentView(payment));
    }

    if ((m = path.match(/^\/payments\/order\/([^/]+)$/)) && method === 'GET') {
      requireUser(req, db);
      const payment = Object.values(db.payments).find(p => p.orderId === m[1]);
      if (!payment) throw new HttpError(404, 'Pembayaran tidak ditemukan.');
      return json(res, 200, paymentView(payment));
    }

    if (path === '/payments/confirm' && method === 'POST') {
      requireUser(req, db);
      const payment = Object.values(db.payments).find(p => p.orderId === String(body.orderId || ''));
      return json(res, 200, payment ? paymentView(payment) : { status: 'pending' });
    }

    if ((m = path.match(/^\/payments\/([^/]+)$/)) && method === 'GET') {
      requireUser(req, db);
      const payment = db.payments[m[1]];
      if (!payment) throw new HttpError(404, 'Pembayaran tidak ditemukan.');
      if (payment.status === 'pending' && payment.expiresAt && new Date(payment.expiresAt).getTime() < Date.now()) {
        payment.status = 'expired';
        await writeDB(db);
      }
      return json(res, 200, paymentView(payment));
    }

    if ((path === '/payments/webhook' || path === '/webhook') && method === 'POST') {
      const expected = process.env.SUMOPOD_WEBHOOK_TOKEN;
      if (!expected) throw new HttpError(500, 'SUMOPOD_WEBHOOK_TOKEN belum dikonfigurasi.');
      if (!safeEqual(req.headers['x-webhook-token'], expected)) {
        throw new HttpError(401, 'Webhook token tidak valid.');
      }

      const type = body.event_type || body.type || '';
      const data = body.data || body;
      const paymentId = data.payment_id || data.paymentId;
      const orderId = data.order_id || data.orderId;
      const payment = (paymentId && db.payments[paymentId])
        || Object.values(db.payments).find(p => p.orderId === orderId);

      if (payment) {
        if (type === 'payment.completed') {
          payment.status = 'paid';
          const team = db.teams.find(t => t.id === payment.teamId);
          if (team && payment.userId) {
            team.paidBy = Array.from(new Set([...(team.paidBy || []), payment.userId]));
          }
        } else if (type === 'payment.failed') {
          payment.status = 'failed';
        } else if (type === 'payment.expired') {
          payment.status = 'expired';
        }
        await writeDB(db);
      }

      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'Endpoint tidak ditemukan.' });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError
      ? err.message
      : 'Terjadi kesalahan pada server.';
    if (!(err instanceof HttpError)) console.error('[timlog-api]', err);
    return json(res, status, { error: message });
  }
}
