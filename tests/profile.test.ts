import { describe, it, expect } from 'vitest';
import { parseProfile, paragraphs, listItems, splitHeadline, splitInterest, parseContacts } from '../src/lib/profile';

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

describe('splitHeadline', () => {
  it('splits H1 and sub line at the first " ที่"', () => {
    expect(splitHeadline('Full-stack developer ที่วางระบบ ที่ดี')).toEqual({
      title: 'Full-stack developer',
      sub: 'ที่วางระบบ ที่ดี',
    });
  });

  it('keeps the whole headline as title when there is no split point', () => {
    expect(splitHeadline('Web developer')).toEqual({ title: 'Web developer', sub: '' });
  });
});

describe('splitInterest', () => {
  it('splits topic and one-line detail on an em dash', () => {
    expect(splitInterest('DevOps — ใช้ Docker')).toEqual({ topic: 'DevOps', detail: 'ใช้ Docker' });
  });

  it('keeps topic-only items', () => {
    expect(splitInterest('Teaching')).toEqual({ topic: 'Teaching', detail: '' });
  });
});

describe('parseContacts', () => {
  it('reads key: value bullets and drops placeholder channels', () => {
    expect(parseContacts('- email: a@b.test\n- github: https://github.com/x\n- linkedin: —')).toEqual([
      { label: 'email', value: 'a@b.test' },
      { label: 'github', value: 'https://github.com/x' },
    ]);
  });

  it('is read into the profile from ## Contact', () => {
    expect(parseProfile(raw).contacts).toEqual([{ label: 'email', value: 'demo@example.com' }]);
  });
});
