# Handoff: OpenCode (backend) → Claude (frontend)

Timestamp: 2026-09-25 14:35 +07:00  
Task: Lab 05 backend เสร็จ — Contact API ตาม D7 (#10 · L4) + fix ตาม contract check  
Status: DONE (labs เขียว) · ขอ frontend เพิ่ม honeypot field ตอนเปิดฟอร์ม

## What changed (ฝั่ง backend เท่านั้น — ไม่แตะ UI)

- `src/lib/db.ts`: implement จริง — `insertContact` / `listGuestbook` / `insertGuestbook` + validation (trim · maxlength ชื่อ 80 / อีเมล 120 / ข้อความ 2000 · guestbook ข้อความ 500 · email shape) · error = `VALIDATION: <field>` → API ตอบ 400 · ลบข้อความเกิน 90 วันทุกครั้งที่ insert (สัญญาใต้ฟอร์ม D7/L8)
- `src/pages/api/contact.ts`: rate limit **5 ครั้ง/นาที/IP** → **429** · honeypot `website` → 201 แต่ไม่บันทึก · 201 เมื่อเก็บสำเร็จ
- `src/pages/api/guestbook.ts`: db ทำงานแล้ว **แต่ API ปิด** (ตอบ 501) จนกว่าจะตั้ง `GUESTBOOK_ENABLED=1` — เพราะ D5 ยังบอก Later (เปิดรับข้อความ = ต้องมี decision ใหม่) · ถ้าเปิด มี honeypot + rate limit เหมือนกัน
- `src/lib/http.ts` (ใหม่): mapping กลาง — 501 เฉพาะ `NOT_IMPLEMENTED` · `VALIDATION` → 400 ข้อความสั้น · server fault → 500 + log ฝั่ง server · **ไม่มี stack/SQL/API path/ข้อความคอร์สใน response** (D9)
- `src/lib/rate-limit.ts` (ใหม่): in-memory sliding window (พอสำหรับ personal site โปรเซสเดียว)
- `tests/labs/lab05-guards.test.ts` (ใหม่): 7 tests — validation · maxlength · honeypot · 429 · 400 สั้น · guestbook gate ปิด/เปิด

## Verification

- `npm test` — 15/15 เขียว · `npm run build` ผ่าน
- `npm run test:labs` — **9/9 เขียว** (lab05-api 2 + lab05-guards 7) · แดงเดิมจาก template ปิดแล้ว
- สัญญา 501/429/400/500 ตรง `docs/fe-be-contract-check.md` · UI เดิมรองรับครบ (501 → ซ่อนฟอร์ม, 429/400 → generic error)

## Assumptions resolved / decisions ที่ frontend ต้องรู้

1. **Honeypot field = `website`** — เมื่อเปิดฟอร์ม (L8 ผ่าน) ให้ frontend เพิ่มใน `contact.astro`: `<input name="website" ... ซ่อน tabindex="-1" autocomplete="off" aria-hidden="true">` — อย่าใส่ label ให้คนมองเห็น · ค่า non-empty → backend ตอบ 201 หลอก bot แต่ไม่บันทึก
2. **สัญญายืนยันตาม handoff 04 ทุกข้อ:** `{name,email,message}` · 2xx = success · validation → 400 · 429 = ส่งบ่อย · UI ไม่ต้องเปลี่ยนอะไร
3. **Guestbook:** route ยัง 501 (FE แสดง "ยังไม่เปิด" เหมือนเดิม) — การเปิดจริงต้องมี decision ใหม่แทน D5 + ตั้ง `GUESTBOOK_ENABLED=1`
4. maxlength ไม่เปลี่ยน — HTML (80/120/2000) = server ตรงกันแล้ว (D7/L8 ✓)

## Request to next agent

Claude (frontend) — เมื่อ human ตัดสินใจเปิดฟอร์ม (L8 ผ่าน):

1. เพิ่ม honeypot input `website` แบบซ่อนในฟอร์ม Contact (ดูข้อ 1) — ก่อนตั้ง `CONTACT_FORM_ENABLED=1`
2. ไม่ต้องแก้อย่างอื่น — script เดิมจัดการ 429/400/500 เป็น generic error แล้ว

## Files (backend)

`src/lib/db.ts` · `src/lib/http.ts` · `src/lib/rate-limit.ts` · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `tests/labs/lab05-guards.test.ts` · `docs/fe-be-contract-check.md` · handoff นี้

## Canonical state updated

- [ ] `docs/STATUS.md` — **ไม่แตะ** (ผู้เรียนยังไม่ commit Lab 04 · writer ยังเป็น Claude ตาม single-writer note)
- [ ] `docs/OPEN_LOOPS.md` — ไม่แตะ เหตุผลเดียวกัน (L4 ผ่านเกณฑ์แล้ว — ให้ writer คนถัดไปปิด)
- [ ] `docs/DECISIONS.md` — ไม่มี decision ใหม่ (gate `GUESTBOOK_ENABLED` = กลไกเดียวกับ `CONTACT_FORM_ENABLED` · การเปิดต้องมี decision ก่อน)
- [x] อื่น ๆ: handoff นี้ · `docs/fe-be-contract-check.md`

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS ยังเป็น Claude — ให้ปิด **L4** ใน OPEN_LOOPS และอัปเดต STATUS หลังรวมงานนี้เข้า commit ถัดไป