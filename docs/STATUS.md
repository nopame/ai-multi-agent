# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 16:50 +07:00  
Updated by: Claude

## Current goal

- Lab 05b + 06 + follow-up L10/L12 อยู่บน main แล้ว (PR #16 + #17) · ถัดไป = Lab 07 Review

## Done

- PR #17 merged (rebase บน main หลัง #16): `src/lib/client-ip.ts` (entry ขวาสุดของ `x-forwarded-for` + fallback `x-real-ip`) · bucket pruning ใน `rate-limit.ts` · guestbook 429 + `retry-after` · `tests/guestbook-api.test.ts` — ปิด L10/L12 · ข้อแก้จากรีวิว → L16
- PR #16 merged (`cbc0e96`): Lab 05b ฟอร์ม + Lab 06 E2E/a11y (`aa9f1ed`)

- Lab 06 E2E (Playwright MCP): 10/10 step ผ่าน — Home/About/Interests/Contact/Guestbook 200 · contact + guestbook POST 201 · invalid → 400 · ผล + screenshots ใน `docs/QA.md` / `docs/screenshots/` · ถัดไป = a11y
- Lab 06 a11y: axe 0 violation ทุกหน้า · แก้ meta description หลุดคำคอร์ส (+ guard test ใหม่) · skip link · title · guestbook `<time>` · ถอด Guestbook จาก nav/การ์ด (L11) · error ซ้ำ (L13) · npm test 15/15 · test:labs 2/2 · build OK
- Lab 06 a11y debate (Advocate/Pragmatist) → action items A1–A4 (P0/P1) แก้ครบ + verify แล้ว · A5–A7 = P2 หลัง ship
- Lab 05b: `contact.astro` + `guestbook.astro` — microcopy ไทย · honeypot `website` · ถอด API path · รับมือ 400/429/500/501 · แก้ stored XSS ใน guestbook · ตรวจผ่านเบราว์เซอร์ + curl · npm test 14/14 · test:labs 2/2 · build OK
- Lab 05 ปิดสมบูรณ์: PR #15 merged → main · issue #10 ปิดอัตโนมัติ · branch `lab-05-backend` ลบแล้ว · ตรวจซ้ำบน main แล้ว (npm test 14/14 · test:labs 2/2 · build OK)

- Lab 05: `src/lib/db.ts` (validate + insert + retention 90 วัน + cap 50) · `src/lib/rate-limit.ts` · `src/pages/api/{contact,guestbook}.ts` (honeypot `website` · 429 · error ปลอดภัย D9) · `tests/contact-api.test.ts` 5 test (D6: rate limit มี test) · `opencode.json` (GitHub MCP ผ่าน `{env:GITHUB_PAT}` จาก `.env`)
- Lab 02 ปิดแล้ว (Agent Teams 3 บทบาท · 5 รอบ) → `DECISIONS.md` D1–D13 · Lab 03 issues #6–#13 สร้างแล้ว
- `docs/PROFILE.md` เนื้อหาจริง (nopame) · parser `src/lib/profile.ts` อ่านหัวข้อหลายบรรทัด · Home/About แสดง Bio + Audience
- `docs/DEBATE.md` ครบ Brand / UX / Devil (5 รอบ) + ตารางความขัดแย้ง
- Debate agents ถาวร `.claude/agents/{brand-strategist,ux-critic,devils-advocate}.md` (`memory: project`) + `.claude/agent-memory/<name>/MEMORY.md`

## In progress

- —

## Blocked

- ก่อน ship: audit repo/GitHub (D8) · ฟอร์ม Contact สถานะ B ต้องมีอีเมลตอบกลับจริง (D7/D11) · ต้องมีช่องติดต่อใช้ได้ ≥ 1 (D9)

## Next actions

1. **OpenCode:** L16 (`clientAddress` แทน fallback `'local'` ใน `client-ip.ts`)
2. PR #14 ([Lab 04] branch เก่า) — แนะนำปิด: แก้ `db.ts`/`api/**` ผิด ownership · ชนกับ main 6 ไฟล์ · ถูกแทนด้วย #15/#16 · เช็ก `profile.ts`/`profile.test.ts`/`playwright/smoke.spec.ts` ก่อนปิดว่ายังต้องใช้ไหม
3. PR #5 — ปิดแล้ว (โค้ดเหมือนกับที่อยู่บน main แล้ว)
4. ถัดไป = Lab 07 Review

## Files changed in latest session

- Lab 06: `src/layouts/BaseLayout.astro` · `src/pages/{index,contact,guestbook}.astro` · `tests/public-site.test.ts` · `docs/QA.md` · `docs/screenshots/` · `.gitignore` (`aa9f1ed` · branch `lab-05b-swarm`)

## Notes

- สัญญา API อ้างจาก handoff เก่าที่โดน rollback (`git show 0b19997:docs/handoffs/04-claude-to-opencode.md`) — ทำงานจาก history เพราะไฟล์ handoff ถูกลบไปพร้อม revert กลับ Lab 02
- ประวัติ repo: Lab 04/05/06 เคย merge แล้วถูก revert คืน (8131e5b / 1bd71b2) — งานรอบนี้เป็นการ redo ไม่ได้ revert โค้ดเกันเอง
- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
