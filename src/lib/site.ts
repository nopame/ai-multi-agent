/**
 * Site-level switches for UI (frontend-owned).
 * D8 (docs/DECISIONS.md): the GitHub link and the "ตรวจสอบได้" claim stay hidden
 * until the repo + profile audit passes. Turn on with SHOW_GITHUB_LINK=true at
 * runtime — the URL itself comes from `## Contact` in docs/PROFILE.md.
 */
import type { Profile } from './profile';

export function githubLinkEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.SHOW_GITHUB_LINK === 'true';
}

/** GitHub profile URL when the D8 switch is on and PROFILE has an https github.com link. */
export function githubProfileUrl(
  profile: Pick<Profile, 'contact'>,
  env: Record<string, string | undefined> = process.env,
): string | null {
  if (!githubLinkEnabled(env)) return null;
  const url = profile.contact.github;
  return url && /^https:\/\/github\.com\/[\w.-]+\/?$/.test(url) ? url : null;
}
