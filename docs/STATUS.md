# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 +07:00  
Updated by: Claude

## Current goal

- Lab 02 ปิดแล้ว (Agent Teams 3 บทบาท · 5 รอบ) → `DECISIONS.md` D1–D13 · ถัดไป Lab 03 issues จาก Must (D12)

## Done

- `docs/PROFILE.md` เนื้อหาจริง (nopame) · parser `src/lib/profile.ts` อ่านหัวข้อหลายบรรทัด · Home/About แสดง Bio + Audience
- `docs/DEBATE.md` ครบ Brand / UX / Devil (5 รอบ) + ตารางความขัดแย้ง
- `docs/DECISIONS.md` D1–D13 (ฉบับใหม่ — ไฟล์ D1–D9 เดิมหาไม่พบ) · PROFILE: Headline + Tagline ตาม D1/D2
- Debate agents ถาวร `.claude/agents/{brand-strategist,ux-critic,devils-advocate}.md` (`memory: project`) + `.claude/agent-memory/<name>/MEMORY.md`

## In progress

- —

## Blocked

- ก่อน ship: audit repo/GitHub (D8) · ฟอร์ม Contact สถานะ B ต้องมีอีเมลตอบกลับจริง + retention (D7) · ต้องมีช่องติดต่อใช้ได้ ≥ 1 (D9)

## Next actions

1. Lab 03 สร้าง issues จาก Must (D12)
2. ก่อน Lab 04: Bio ใหม่ (D3) + Interests "หัวข้อ — ประโยคเดียว" (D5) + parser อ่าน Tagline

## Files changed in latest session

- `docs/DEBATE.md` · `docs/DECISIONS.md` (ใหม่) · `docs/PROFILE.md` · `.claude/agents/*` (3 ใหม่) · `.claude/agent-memory/*`

## Notes

- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
