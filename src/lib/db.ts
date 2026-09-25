/**
 * SQLite helpers for contact + guestbook.
 * Validation rules mirror the API contract in docs/DECISIONS.md:
 * trim first, reject empty, length caps (name 80 / email 120 / message 1000,
 * guestbook message 500), parameterized queries only.
 */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

/**
 * Input validation failure. `message` is a short, user-safe Thai string —
 * routes may send it to the client as-is (400). Never put SQL/stack in it.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const LIMITS = {
  name: 80,
  email: 120,
  contactMessage: 1000,
  guestbookMessage: 500,
} as const;

/** Contact messages are kept for reply only and deleted after 90 days (D7). */
const CONTACT_RETENTION_DAYS = 90;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function requireText(value: unknown, max: number, message: string): string {
  const text = asTrimmedString(value);
  if (!text || text.length > max) throw new ValidationError(message);
  return text;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dir = process.env.DATA_DIR || join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  db = new Database(join(dir, 'site.sqlite'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

/** Validate + persist a contact message; enforces the 90-day retention on insert. */
export function insertContact(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const name = requireText(input?.name, LIMITS.name, 'กรุณากรอกชื่อ (ไม่เกิน 80 ตัวอักษร)');
  const email = asTrimmedString(input?.email);
  if (!email || email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    throw new ValidationError('กรุณากรอกอีเมลที่ถูกต้อง (ไม่เกิน 120 ตัวอักษร)');
  }
  const message = requireText(
    input?.message,
    LIMITS.contactMessage,
    'กรุณากรอกข้อความ (ไม่เกิน 1000 ตัวอักษร)',
  );

  const conn = getDb();
  // Retention (D7): keep contact messages for reply only, delete after 90 days.
  conn
    .prepare(`DELETE FROM contact_messages WHERE created_at < datetime('now', ?)`)
    .run(`-${CONTACT_RETENTION_DAYS} days`);

  return conn
    .prepare(
      `INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)
       RETURNING id, name, email, message, created_at`,
    )
    .get(name, email, message) as ContactMessage;
}

/** Newest first, capped at 50 entries (D14). */
export function listGuestbook(): GuestbookEntry[] {
  return getDb()
    .prepare(`SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT 50`)
    .all() as GuestbookEntry[];
}

/** Validate + persist a guestbook entry (no email collected, D14). */
export function insertGuestbook(input: {
  name: string;
  message: string;
}): GuestbookEntry {
  const name = requireText(input?.name, LIMITS.name, 'กรุณากรอกชื่อ (ไม่เกิน 80 ตัวอักษร)');
  const message = requireText(
    input?.message,
    LIMITS.guestbookMessage,
    'กรุณากรอกข้อความ (ไม่เกิน 500 ตัวอักษร)',
  );

  return getDb()
    .prepare(
      `INSERT INTO guestbook (name, message) VALUES (?, ?)
       RETURNING id, name, message, created_at`,
    )
    .get(name, message) as GuestbookEntry;
}
