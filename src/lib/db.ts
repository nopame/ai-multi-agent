/**
 * SQLite helpers for contact + guestbook.
 * Lab 05 (OpenCode): validation + persistence implemented per D7 / issue #10.
 * Contract: docs/fe-be-contract-check.md · docs/handoffs/04-claude-to-opencode.md
 *
 * Validation errors throw Error('VALIDATION: <field>') — the API layer maps that
 * prefix to 400 with a short message (D9: no stack/SQL/field internals in responses).
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

// maxlength mirrors the HTML form exactly (D7 · L8): name 80 · email 120 · message 2000.
// The guestbook HTML uses name 80 / message 500.
const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_MESSAGE = 2000;
const MAX_GUESTBOOK_MESSAGE = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/** Trim + length check; throws 'VALIDATION: <label>' so the API answers 400 (short body). */
function cleanField(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string') throw new Error(`VALIDATION: ${label}`);
  const v = value.trim();
  if (v.length === 0 || v.length > max) throw new Error(`VALIDATION: ${label}`);
  return v;
}

/** Retention promise under the form (D7/L8): contact messages live at most 90 days. */
function pruneContact(db: Database.Database): void {
  db.prepare("DELETE FROM contact_messages WHERE created_at < datetime('now', '-90 days')").run();
}

export function insertContact(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const name = cleanField(input?.name, 'name', MAX_NAME);
  const email = cleanField(input?.email, 'email', MAX_EMAIL);
  const message = cleanField(input?.message, 'message', MAX_MESSAGE);
  if (!EMAIL_RE.test(email)) throw new Error('VALIDATION: email');
  const db = getDb();
  pruneContact(db);
  const info = db
    .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
    .run(name, email, message);
  return db
    .prepare('SELECT id, name, email, message, created_at FROM contact_messages WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as ContactMessage;
}

export function listGuestbook(): GuestbookEntry[] {
  return getDb()
    .prepare('SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC')
    .all() as GuestbookEntry[];
}

export function insertGuestbook(input: {
  name: string;
  message: string;
}): GuestbookEntry {
  const name = cleanField(input?.name, 'name', MAX_NAME);
  const message = cleanField(input?.message, 'message', MAX_GUESTBOOK_MESSAGE);
  const db = getDb();
  const info = db
    .prepare('INSERT INTO guestbook (name, message) VALUES (?, ?)')
    .run(name, message);
  return db
    .prepare('SELECT id, name, message, created_at FROM guestbook WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as GuestbookEntry;
}