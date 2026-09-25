# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 +07:00  
Updated by: OpenCode

## Current goal

- Lab 05 backend เสร็จ (test ทั้งสองชุดเขียว + build ผ่าน) → ส่งต่อ Claude review/QA ตาม handoff `docs/handoffs/05-opencode-to-claude.md`

## Done

- Lab 05 backend: `db.ts` (validate/trim/retention 90 วัน) + `rate-limit.ts` (5 ครั้ง/10 นาที/IP) + routes ตาม API contract (201/400/429/500/501 + honeypot) + `tests/api.test.ts` 27 tests · `npm test` 45/45 · `npm run test:labs` 2/2 · `npm run build` ผ่าน · smoke ผ่าน curl จริง
- `docs/PROFILE.md` เนื้อหาจริง (nopame) · parser `src/lib/profile.ts` อ่านหัวข้อหลายบรรทัด · Home/About แสดง Bio + Audience
- `docs/DEBATE.md` ครบ Brand / UX / Devil (5 รอบ) + ตารางความขัดแย้ง
- `docs/DECISIONS.md` D1–D13 (ฉบับใหม่ — ไฟล์ D1–D9 เดิมหาไม่พบ) · PROFILE: Headline + Tagline ตาม D1/D2
- Lab 04 UI: Home / About / Interests / Contact / Guestbook ตาม D1–D17 · ธีมสว่าง · Contact สลับเป็นสถานะ A เมื่อได้ 501 · parser อ่าน Tagline / Contact · PROFILE Bio + Interests ใหม่ (ปิด L6)
- `DECISIONS.md` D14–D17 + API contract
- Debate agents ถาวร `.claude/agents/{brand-strategist,ux-critic,devils-advocate}.md` (`memory: project`) + `.claude/agent-memory/<name>/MEMORY.md`

## In progress

- —

## Blocked

- ก่อน ship: audit repo/GitHub (D8) · ฟอร์ม Contact สถานะ B ขาดเฉพาะส่วนคน — อีเมลตอบกลับจริง + อ่าน ≥ สัปดาห์ละครั้ง (D7) · ต้องมีช่องติดต่อใช้ได้ ≥ 1 (D9)

## Next actions

1. Claude: review contract เทียบ UI + commit รวม (backend ไม่ commit) · Lab 06 Playwright flow ฟอร์มจริง · Lab 03 issues เมื่อ MCP ใช้ได้ · Lab 08 ship gate
2. —

## Files changed in latest session

- `src/lib/db.ts` · `src/lib/rate-limit.ts` (ใหม่) · `src/pages/api/{contact,guestbook}.ts` · `tests/api.test.ts` (ใหม่) · handoff 05 · STATUS/OPEN_LOOPS

## Notes

- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
