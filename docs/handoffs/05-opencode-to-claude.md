# Handoff: OpenCode (backend) → Claude (frontend)

Timestamp: 2026-09-25 13:00 +07:00
Task: Lab 05 backend — contact + guestbook API / SQLite ตาม API contract (D6 / D7 / D14 / D15)
Status: IMPLEMENTED

## What changed

- `src/lib/db.ts`: implement `insertContact` / `listGuestbook` / `insertGuestbook` จริง — trim ก่อน validate, ห้ามค่าว่าง, เพดาน name 80 / email 120 / message 1000 (guestbook 500), email regex, `ValidationError` แยกประเภท (ข้อความไทยสั้น ปลอดภัย ส่งให้ client ได้), parameterized query + `RETURNING`, `listGuestbook` เรียงใหม่สุดก่อน LIMIT 50, retention ลบ `contact_messages` เก่ากว่า 90 วันทุกครั้งที่ insert (D7/D15)
- `src/lib/rate-limit.ts` (ใหม่): in-memory fixed window ต่อ key `${endpoint}:${ip}` · 5 ครั้ง / 10 นาที · มี `resetRateLimits()` สำหรับ test (D6)
- `src/pages/api/contact.ts`: 201 `{ ok: true }` (ไม่ echo อีเมล) · honeypot `website` มีค่า (หลัง trim) → 201 ไม่บันทึก · rate limit → 429 · `ValidationError` → 400 ข้อความไทย · JSON เสีย → 400 · คง 501 สำหรับ `NOT_IMPLEMENTED` · error อื่น → 500 ข้อความกลาง + log ฝั่ง server (ไม่ส่ง `err.message` ดิบ)
- `src/pages/api/guestbook.ts`: GET 200 `{ entries }` · POST 201 `{ entry }` · honeypot → 201 `{ entry }` ปลอม (id 0) ไม่บันทึก · 400/429/500/501 แบบเดียวกับ contact
- `tests/api.test.ts` (ใหม่, 27 tests): validation/trim, retention 89/91 วัน, เรียงใหม่สุด + cap 50, rate limit unit (limit/window/แยก key), contract ระดับ route (201 shape, honeypot ไม่บันทึก, 400/429, แยก bucket ต่อ IP และต่อ endpoint)

## Files

- `src/lib/db.ts` · `src/lib/rate-limit.ts` (ใหม่) · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `tests/api.test.ts` (ใหม่)
- ไม่ได้แตะ: `src/pages/*.astro`, `src/layouts/`, `src/lib/profile.ts`, `src/lib/site.ts`, `tests/labs/**`, `.env`
- หมายเหตุ: `labs/lab-02-debate/prompts/05-agent-teams-fallback.md` มีการแก้ค้างจากฝั่ง Claude ก่อนหน้า (ไม่ใช่ของ backend) — ฝาก commit รวมหรือแยกตามเห็นสมควร

## Verification

- Unit / smoke: PASS — `npm test` 45/45 (5 files · เดิม 18 → +27 ของ backend)
- Labs (`npm run test:labs`): PASS — 2/2
- Build: PASS — `npm run build` (adapter @astrojs/node)
- Manual / localhost (`npm start` + curl จริง): contact POST 201 `{ ok: true }` · guestbook POST 201 + GET คืน entries shape `{ id, name, message, created_at }` · honeypot 201 ไม่บันทึก · 400 ข้อความไทย · 429 หลังครบ 5 ครั้ง/10 นาที/IP · ข้อมูล smoke ใน `data/` ลบแล้ว (`data/` ถูก gitignore)

## Assumptions to challenge

1. Validation failure กินโควตา rate limit ด้วย (เช็ก rate ก่อน insert) — ตั้งใจให้กันสแปม แต่ผู้ใช้จริงที่กรอกผิดซ้ำ 5 ครั้งใน 10 นาทีจะโดน 429
2. Honeypot ไม่กินโควตา rate limit (ตอบ 201 ก่อนเช็ก) — bot ที่ติด honeypot จะยิงต่อได้เรื่อย ๆ แต่ไม่มีข้อมูลถูกบันทึก
3. Rate limit อยู่ในหน่วยความจำ — รีสตาร์ท container คือรีเซ็ต และไม่ครอบคลุมหลาย instance (รับได้สำหรับ v1 instance เดียว ตาม assumption ใน handoff 04)
4. `created_at` เป็น UTC (`datetime('now')` ของ SQLite) — UI แปลงเป็น th-TH ฝั่ง client อยู่แล้ว

## Contract ที่อาจไม่ตรง UI (ให้ frontend ตรวจ)

1. **`POST /api/contact` ตอบ `{ ok: true }` ไม่ echo row** — UI เช็กแค่ `res.ok` จึงไม่กระทบ แต่ถ้าอนาคตอยากโชว์ข้อมูลที่ส่งต้องอ่านจากฟอร์มเอง
2. **`POST /api/guestbook` ตอบ `{ entry }`** (ไม่ใช่ row ดิบอย่าง stub เดิม) — UI ปัจจุบันไม่อ่าน body ตอนสำเร็จ (เรียก `load()` ใหม่) จึงตรงกัน
3. **UI ส่ง `website` เสมอผ่าน FormData (ค่าว่าง)** — server trim ก่อนเช็ก honeypot แล้ว ค่าว่าง/ช่องว่างล้วนไม่โดนตีเป็น bot
4. **400/429 เท่านั้นที่ UI แสดง `error`** — 500 ของเราเป็นข้อความกลางภาษาไทย ปลอดภัยถ้า UI เผลอแสดง แต่ตาม D6 ฝั่ง UI ใช้ข้อความกลางของตัวเองอยู่แล้ว
5. **429 ไม่มี `Retry-After` header** — มี `retryAfterSec` ใน helper แต่ไม่ได้ใส่ header; ถ้า UI อยากบอกเวลารอ ให้บอกฝั่ง backend เพิ่มได้

## Request to next agent

1. Review ฝั่ง frontend ว่า contract ตรงจริง (ดูหัวข้อด้านบน) แล้ว **commit รวม** (backend ไม่ commit ตามกติกา)
2. Lab 06 QA: เพิ่ม Playwright flow ส่งฟอร์มจริง (contact 201 → "ได้รับข้อความแล้วครับ" · guestbook ลงชื่อแล้วเห็นรายการใหม่) และกรณี 400/429
3. ปิด L4 แล้ว · L8 เหลือเฉพาะส่วนคน (อีเมลตอบกลับจริง + อ่านทุกสัปดาห์) — ส่วนโค้ด (retention 90 วัน + rate limit test) เสร็จแล้ว
4. ห้ามแตะ `src/lib/db.ts`, `src/lib/rate-limit.ts`, `src/pages/api/**` ถ้าต้องแก้ backend ให้ส่ง handoff กลับ

## Canonical state updated

- [x] `docs/STATUS.md`
- [x] `docs/OPEN_LOOPS.md`
- [ ] `docs/DECISIONS.md` (ไม่มี decision ใหม่ — implement ตาม contract เดิม)
- [x] อื่น ๆ: handoff ฉบับนี้

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS = Claude (frontend)
