# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 +07:00  
Updated by: Claude

## Current goal

- Lab 04 UI เสร็จ → ส่งต่อ OpenCode ทำ Lab 05 backend ตาม handoff `docs/handoffs/04-claude-to-opencode.md`

## Done

- `docs/PROFILE.md` เนื้อหาจริง (nopame) · parser `src/lib/profile.ts` อ่านหัวข้อหลายบรรทัด · Home/About แสดง Bio + Audience
- `docs/DEBATE.md` ครบ Brand / UX / Devil (5 รอบ) + ตารางความขัดแย้ง
- `docs/DECISIONS.md` D1–D13 (ฉบับใหม่ — ไฟล์ D1–D9 เดิมหาไม่พบ) · PROFILE: Headline + Tagline ตาม D1/D2
- Lab 04 UI: Home / About / Interests / Contact / Guestbook ตาม D1–D17 · ธีมสว่าง · Contact สลับเป็นสถานะ A เมื่อได้ 501 · parser อ่าน Tagline / Contact · PROFILE Bio + Interests ใหม่ (ปิด L6)
- `DECISIONS.md` D14–D17 + API contract
- Debate agents ถาวร `.claude/agents/{brand-strategist,ux-critic,devils-advocate}.md` (`memory: project`) + `.claude/agent-memory/<name>/MEMORY.md`

## In progress

- —

## Blocked

- ก่อน ship: audit repo/GitHub (D8) · ฟอร์ม Contact สถานะ B ต้องมีอีเมลตอบกลับจริง + retention (D7) · ต้องมีช่องติดต่อใช้ได้ ≥ 1 (D9)

## Next actions

1. OpenCode: Lab 05 backend ตาม API contract ใน DECISIONS → `test:labs` เขียว
2. Lab 03 issues (ข้ามไปก่อน เพราะ GitHub MCP เชื่อมต่อไม่ได้) · Lab 06 Playwright · Lab 08 ship gate

## Files changed in latest session

- `src/layouts/BaseLayout.astro` · `src/pages/*.astro` · `src/lib/{profile,site}.ts` · tests · `docs/{PROFILE,DECISIONS}.md` · handoff 04

## Notes

- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
