import { describe, it, expect } from 'vitest';
import {
  parseProfile,
  paragraphs,
  listItems,
  keyValues,
  splitHeadline,
  splitInterest,
} from '../src/lib/profile';

const raw = [
  '# PROFILE',
  '',
  '## Name',
  'Demo',
  '',
  '## Bio',
  'Paragraph one.',
  '',
  'Paragraph two.',
  '',
  '## Audience',
  '- first group',
  '- second group',
  '',
  '## Interests',
  '- one',
  '- two',
  '- three',
  '',
  '## Contact',
  '- email: demo@example.com',
  '- linkedin: —',
  '',
  '## Tagline',
  'Short proof line',
  '',
].join('\r\n');

describe('parseProfile', () => {
  it('keeps every line of a section, not just the first', () => {
    const p = parseProfile(raw);
    expect(p.bio).toBe('Paragraph one.\n\nParagraph two.');
    expect(p.audience).toBe('- first group\n- second group');
  });

  it('reads all interest bullets and stops at the next section', () => {
    expect(parseProfile(raw).interests).toEqual(['one', 'two', 'three']);
  });

  it('reads the last section through end of file', () => {
    expect(parseProfile('## Interests\n- a\n- b').interests).toEqual(['a', 'b']);
  });

  it('falls back for missing sections', () => {
    const p = parseProfile('## Name\nDemo');
    expect(p.name).toBe('Demo');
    expect(p.headline).toBeTruthy();
    expect(p.interests.length).toBeGreaterThan(0);
  });
});

describe('paragraphs', () => {
  it('splits on blank lines and drops empties', () => {
    expect(paragraphs('one\n\n two \n\n\n')).toEqual(['one', 'two']);
  });
});

describe('listItems', () => {
  it('strips bullets and markdown emphasis', () => {
    expect(listItems('- **Main:** recruiters\n* __peers__\n\nplain line')).toEqual([
      'Main: recruiters',
      'peers',
      'plain line',
    ]);
  });
});

describe('tagline and contact', () => {
  it('reads Tagline and Contact sections', () => {
    const p = parseProfile(raw);
    expect(p.tagline).toBe('Short proof line');
    expect(p.contact).toEqual({ email: 'demo@example.com' });
  });

  it('keyValues drops empty and dash-only values', () => {
    expect(keyValues('- github: https://x.test\n- linkedin: —\n- phone:\n- note')).toEqual({
      github: 'https://x.test',
    });
  });
});

describe('splitHeadline', () => {
  it('splits role from qualifier at " ที่"', () => {
    expect(splitHeadline('Full-stack developer ที่วางระบบให้ทีม')).toEqual({
      main: 'Full-stack developer',
      sub: 'ที่วางระบบให้ทีม',
    });
  });

  it('keeps a headline without qualifier whole', () => {
    expect(splitHeadline('Personal branding site')).toEqual({ main: 'Personal branding site', sub: '' });
  });
});

describe('splitInterest', () => {
  it('splits "title — detail"', () => {
    expect(splitInterest('DevOps — ship with Docker')).toEqual({ title: 'DevOps', detail: 'ship with Docker' });
  });

  it('returns title only without a dash', () => {
    expect(splitInterest('Full-stack')).toEqual({ title: 'Full-stack', detail: '' });
  });
});
