import { describe, it, expect } from 'vitest';
import { githubLinkEnabled, githubProfileUrl } from '../src/lib/site';

const profile = { contact: { github: 'https://github.com/nopame' } };

describe('GitHub link switch (D8)', () => {
  it('stays hidden unless SHOW_GITHUB_LINK=true', () => {
    expect(githubLinkEnabled({})).toBe(false);
    expect(githubProfileUrl(profile, {})).toBeNull();
    expect(githubProfileUrl(profile, { SHOW_GITHUB_LINK: '1' })).toBeNull();
  });

  it('returns the PROFILE github URL when switched on', () => {
    expect(githubProfileUrl(profile, { SHOW_GITHUB_LINK: 'true' })).toBe('https://github.com/nopame');
  });

  it('rejects non-github or non-https values', () => {
    const on = { SHOW_GITHUB_LINK: 'true' };
    expect(githubProfileUrl({ contact: { github: 'http://github.com/x' } }, on)).toBeNull();
    expect(githubProfileUrl({ contact: { github: 'javascript:alert(1)' } }, on)).toBeNull();
    expect(githubProfileUrl({ contact: {} }, on)).toBeNull();
  });
});
