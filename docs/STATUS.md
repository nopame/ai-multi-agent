# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 10:30 +07:00  
Updated by: Claude

## Current goal

- Lab 01 ปิดงาน PROFILE — เนื้อหาจริงแสดงบนเว็บครบทุกหัวข้อ

## Done

- `docs/PROFILE.md` เนื้อหาจริง (nopame) ครบ Name / Headline / Bio / Audience / Interests / Contact / Tone / Privacy
- Parser `src/lib/profile.ts` อ่านหัวข้อหลายบรรทัดได้ + helper `paragraphs` / `listItems` (ตัด bullet และ `**bold**`)
- หน้าแรกแสดง Bio ย่อหน้าแรก + Audience เป็นรายการ · About แสดง Bio ทุกย่อหน้า
- Brainstorm ปรับแล้ว (Must 4 / Nice 7 / Later 3 · About ใช้มุม "ส่งงานได้ครบทุกชั้น") อยู่ท้าย `docs/PROFILE.md` — ยังเป็น Proposed

## In progress

- —

## Blocked

- —

## Next actions

1. Lab 02 Debate — นำ Brainstorm ใน PROFILE ไปถกใน `DEBATE.md` แล้วปิดใน `DECISIONS.md`
2. Lab 03 สร้าง issues จาก Must

## Files changed in latest session

- `src/lib/profile.ts` · `src/pages/index.astro` · `src/pages/about.astro` · `tests/profile.test.ts`

## Notes

- Proposed vs Approved: brainstorm อยู่ใน `DEBATE.md` — สิ่งที่ปิดแล้วอยู่ใน `DECISIONS.md`
- Contact / Tone / Privacy ใน PROFILE ยังไม่ถูก parser อ่าน — ใช้ตอนทำ UI (Lab 04)
