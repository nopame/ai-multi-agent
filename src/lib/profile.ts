/**
 * Profile helpers. Learners fill docs/PROFILE.md in Lab 01.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  audience: string;
  interests: string[];
  contacts: ContactChannel[];
};

export type ContactChannel = { label: string; value: string };

/**
 * FALLBACK renders publicly when docs/PROFILE.md is missing or a section is
 * empty — keep it course-free (no lab references); learner hints belong in
 * comments and docs, not in rendered fallback text.
 */
const FALLBACK: Profile = {
  name: 'Your Name',
  headline: 'Personal branding site',
  bio: 'This personal site is still being built — content is coming soon.',
  audience: 'Hiring managers / peers / community',
  interests: ['AI agents', 'Web', 'Teaching'],
  contacts: [],
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

/**
 * Split the headline into H1 + sub line at the first " ที่" (D1). The whole
 * sentence stays in PROFILE.md; if there is no split point, sub is empty.
 */
export function splitHeadline(headline: string): { title: string; sub: string } {
  const i = headline.indexOf(' ที่');
  if (i <= 0) return { title: headline.trim(), sub: '' };
  return { title: headline.slice(0, i).trim(), sub: headline.slice(i).trim() };
}

/** Split "หัวข้อ — ประโยค" into topic + detail (D5); detail may be empty. */
export function splitInterest(item: string): { topic: string; detail: string } {
  const [topic, ...rest] = item.split(/\s+[—–]\s+/);
  return { topic: topic.trim(), detail: rest.join(' — ').trim() };
}

/** "- key: value" bullets; placeholder values ("—", "-", empty) are dropped (D9). */
export function parseContacts(text: string): ContactChannel[] {
  return listItems(text)
    .map((line) => {
      const i = line.indexOf(':');
      if (i <= 0) return null;
      return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    })
    .filter((c): c is ContactChannel => !!c && !/^[-—–]*$/.test(c.value));
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
    bio: get('Bio') || FALLBACK.bio,
    audience: get('Audience') || FALLBACK.audience,
    interests: interests.length ? interests : FALLBACK.interests,
    contacts: parseContacts(get('Contact')),
  };
}
