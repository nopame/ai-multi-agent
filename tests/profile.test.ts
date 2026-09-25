import { describe, it, expect } from 'vitest';
import { parseProfile } from '../src/lib/profile';

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
