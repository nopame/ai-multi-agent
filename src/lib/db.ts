/**
 * SQLite helpers for contact + guestbook.
 * Lab 05 (OpenCode) implements persistence. Stubs return null until finishe.
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

/** Max lengths mirror the HTML form attributes (server == client, per D7). */
export const LIMITS = {
  contactName: 80,
  contactEmail: 120,
  contactMessage: 2000,
  guestbookName: 80,
  guestbookMessage: 500,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Thrown for user-facing validation failures — safe to expose a generic hint. */
export class ValidationError extends Error {}

function cleanText(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${label} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${label} is required`);
  }
  if (trimmed.length > max) {
    throw new ValidationError(`${label} exceeds ${max} characters`);
  }
  return trimmed;
}

/** Close the cached connection (tests / graceful shutdown). */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/** Validate + insert a contact message. Throws ValidationError on bad input. */
export function insertContact(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const name = cleanText(input?.name, 'name', LIMITS.contactName);
  const email = cleanText(input?.email, 'email', LIMITS.contactEmail);
  if (!EMAIL_RE.test(email)) {
    throw new ValidationError('email is not a valid address');
  }
  const message = cleanText(input?.message, 'message', LIMITS.contactMessage);

  const conn = getDb();
  // Retention (D7): contact data is deleted within 90 days — enforce on insert.
  conn
    .prepare(
      `DELETE FROM contact_messages WHERE created_at < datetime('now', '-90 days')`
    )
    .run();
  const result = conn
    .prepare(
      `INSERT INTO contact_messages (name, email, message)
       VALUES (?, ?, ?)`
    )
    .run(name, email, message);
  const id = Number(result.lastInsertRowid);
  return conn
    .prepare(
      `SELECT id, name, email, message, created_at
       FROM contact_messages WHERE id = ?`
    )
    .get(id) as ContactMessage;
}

/** Newest first, capped at 50. */
export function listGuestbook(): GuestbookEntry[] {
  const conn = getDb();
  return conn
    .prepare(
      `SELECT id, name, message, created_at
       FROM guestbook ORDER BY id DESC LIMIT 50`
    )
    .all() as GuestbookEntry[];
}

/** Validate + insert a guestbook entry. Throws ValidationError on bad input. */
export function insertGuestbook(_input: {
  name: string;
  message: string;
}): GuestbookEntry {
  const name = cleanText(_input?.name, 'name', LIMITS.guestbookName);
  const message = cleanText(_input?.message, 'message', LIMITS.guestbookMessage);

  const conn = getDb();
  const result = conn
    .prepare(
      `INSERT INTO guestbook (name, message)
       VALUES (?, ?)`
    )
    .run(name, message);
  const id = Number(result.lastInsertRowid);
  return conn
    .prepare(
      `SELECT id, name, message, created_at
       FROM guestbook WHERE id = ?`
    )
    .get(id) as GuestbookEntry;
}
