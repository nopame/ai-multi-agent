/**
 * Profile helpers. Learners fill docs/PROFILE.md in Lab 01.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Profile = {
  name: string;
  headline: string;
  tagline: string;
  bio: string;
  audience: string;
  interests: string[];
  /** `- key: value` lines from `## Contact`; empty / "—" values are dropped. */
  contact: Record<string, string>;
};

/**
 * FALLBACK renders publicly when docs/PROFILE.md is missing or a section is
 * empty — keep it course-free (no lab references); learner hints belong in
 * comments and docs, not in rendered fallback text.
 */
const FALLBACK: Profile = {
  name: 'Your Name',
  headline: 'Personal branding site',
  tagline: '',
  bio: 'This personal site is still being built — content is coming soon.',
  audience: 'Hiring managers / peers / community',
  interests: ['AI agents', 'Web', 'Teaching'],
  contact: {},
};

function profilePath(): string {
  const candidates = [
    join(process.cwd(), 'docs', 'PROFILE.md'),
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'PROFILE.md'),
  ];
  return candidates.find((p) => existsSync(p)) || candidates[0];
}

export function loadProfile(): Profile {
  const path = profilePath();
  if (!existsSync(path)) return FALLBACK;
  return parseProfile(readFileSync(path, 'utf8'));
}

/** Split a section into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** One item per non-empty line, without bullet markers or **bold** / __bold__. */
export function listItems(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s+/, '').replace(/(\*\*|__)(.+?)\1/g, '$2').trim())
    .filter(Boolean);
}

/** `- key: value` items → map · skips blank / "—" / "-" values (D10). */
export function keyValues(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const item of listItems(text)) {
    const m = item.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim();
    if (!value || /^[—–-]+$/.test(value)) continue;
    out[m[1].trim().toLowerCase()] = value;
  }
  return out;
}

/**
 * Headline shown as one <h1> in two visual levels (D1): the role before " ที่",
 * the qualifier after it. No " ที่" → everything is the main line.
 */
export function splitHeadline(headline: string): { main: string; sub: string } {
  const i = headline.indexOf(' ที่');
  if (i <= 0) return { main: headline.trim(), sub: '' };
  return { main: headline.slice(0, i).trim(), sub: headline.slice(i + 1).trim() };
}

/** Interest item "title — one sentence" (D5) → parts; no dash → title only. */
export function splitInterest(item: string): { title: string; detail: string } {
  const m = item.match(/^(.+?)\s+[—–]\s+(.+)$/);
  return m ? { title: m[1].trim(), detail: m[2].trim() } : { title: item.trim(), detail: '' };
}

export function parseProfile(source: string): Profile {
  const raw = source.replace(/\r\n/g, '\n');
  const get = (label: string) => {
    const m = raw.match(new RegExp(`^##\\s*${label}\\s*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm'));
    return (m?.[1] || '').trim();
  };
  const interests = listItems(get('Interests'));
  return {
    name: get('Name') || FALLBACK.name,
    headline: get('Headline') || FALLBACK.headline,
    tagline: get('Tagline'),
    bio: get('Bio') || FALLBACK.bio,
    audience: get('Audience') || FALLBACK.audience,
    interests: interests.length ? interests : FALLBACK.interests,
    contact: keyValues(get('Contact')),
  };
}
