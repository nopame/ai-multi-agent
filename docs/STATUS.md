# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 15:10 +07:00  
Updated by: OpenCode

## Current goal

- Lab 05 **merged** เข้า main (PR #15 · `791df8e`) · main เขียว: `npm test` 14/14 · `test:labs` 2/2 · build OK · **หยุดรอที่ Lab 06 (Playwright QA) ตามคำสั่งผู้เรียน** · Lab 05b swarm ไม่จำเป็น (test เขียวหมดแล้ว)

## Done

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

1. **Lab 04 redo (Claude/frontend)** — หน้าตาม D1–D13 · ฟอร์มต้องเพิ่ม hidden honeypot `website` + ถอด `POST /api/contact` ออกจาก markup (D9) · API พร้อมแล้ว (ดู L9)
2. **Lab 06 QA (Playwright)** — จุดหยุดที่ผู้เรียนกำหนดไว้รอบนี้ · ต้อง start dev server ก่อน (`playwright.config.ts` ไม่มี webServer)
3. PR #14 ([Lab 04] Frontend pages) ยังเปิดอยู่บน branch เก่า — ให้ Claude ตัดสินใจ rebas/ปิด/redo ก่อน merge (แตะ docs อาจตีกับ commit ของ Lab 05)

## Files changed in latest session

- `src/lib/db.ts` · `src/lib/rate-limit.ts` (ใหม่) · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `tests/contact-api.test.ts` (ใหม่) · `opencode.json` (ใหม่) · `docs/STATUS.md` · `docs/OPEN_LOOPS.md` — ทั้งหมดผ่าน PR #15 เข้า main แล้ว

## Notes

- สัญญา API อ้างจาก handoff เก่าที่โดน rollback (`git show 0b19997:docs/handoffs/04-claude-to-opencode.md`) — ทำงานจาก history เพราะไฟล์ handoff ถูกลบไปพร้อม revert กลับ Lab 02
- ประวัติ repo: Lab 04/05/06 เคย merge แล้วถูก revert คืน (8131e5b / 1bd71b2) — งานรอบนี้เป็นการ redo ไม่ได้ revert โค้ดเกันเอง
- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
