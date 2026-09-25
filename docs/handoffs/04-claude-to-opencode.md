# Handoff: Claude (frontend) → OpenCode (backend)

Timestamp: 2026-09-25 12:30 +07:00
Task: Lab 04 UI เสร็จ → Lab 05 implement contact + guestbook API / SQLite
Status: IMPLEMENTED (UI) · ส่งต่อ backend

## What changed

- หน้า Home / About / Interests / Contact / Guestbook ใหม่ตาม D1–D17 · ธีมสว่าง ฟ้า/มิ้นต์ และส้มเฉพาะปุ่มติดต่อ
- `src/lib/profile.ts` อ่าน `## Tagline` และ `## Contact` ได้ · เพิ่ม `splitHeadline` / `splitInterest` / `keyValues`
- `src/lib/site.ts`: สวิตช์ลิงก์ GitHub (D8 / D17) ค่าเริ่มต้นคือซ่อน
- ฟอร์ม Contact: ช่อง `name` / `email` / `message` + honeypot `website` · ถ้าได้ 501 หรือเชื่อมต่อไม่ได้ จะซ่อนฟอร์มและแสดงช่องทางสำรอง (D7 / D15)
- ฟอร์ม Guestbook: ช่อง `name` / `message` + honeypot `website` · render รายการด้วย `textContent` (D14)
- `docs/DECISIONS.md`: D14–D17 + ตาราง **API contract**
- `docs/PROFILE.md`: Bio ใหม่ (D3 / D16) · Interests แบบ "หัวข้อ — ประโยคเดียว" (D5)

## Files

- `src/layouts/BaseLayout.astro` · `src/pages/{index,about,interests,contact,guestbook}.astro`
- `src/lib/profile.ts` · `src/lib/site.ts` · `tests/profile.test.ts` · `tests/site.test.ts` · `playwright/smoke.spec.ts`

## Verification

- Unit / smoke: PASS — `npm test` 18/18 · `npm run build` ผ่าน
- Labs (`npm run test:labs`): FAIL (คาดไว้แล้ว เพราะ `db.ts` ยังเป็น stub)
- Manual / localhost: Home บนจอ 360px: H1 แสดง 2 ระดับ ปุ่ม "ติดต่อผม" อยู่ในจอแรก · Contact ส่งแล้วได้ 501 → สลับเป็นสถานะ A ถูกต้อง

## Assumptions to challenge

1. เพดานความยาวใน UI (name 80 / email 120 / message 1000 / guestbook message 500) ต้องตรงกับ validation ฝั่ง server
2. Rate limit ในหน่วยความจำต่อ IP พอสำหรับ v1 ที่รัน instance เดียวใน Docker

## Request to next agent

**Implement backend ตาม `docs/DECISIONS.md` → "API contract" + D6 / D7 / D14 / D15** ในไฟล์ ownership ของ backend เท่านั้น (`src/lib/db.ts`, `src/pages/api/**`, helper ใหม่ใต้ `src/lib/` ที่ backend ใช้ และ test ฝั่ง backend ใน `tests/`)

1. `insertContact` / `listGuestbook` / `insertGuestbook`: trim + validate (throw error ที่แยกประเภท validation ได้) · parameterized query · `listGuestbook` เรียงใหม่สุดก่อน ≤ 50 รายการ
2. Retention: ลบ `contact_messages` ที่เก่ากว่า 90 วัน (เช่น ตอน insert)
3. Routes: map validation → 400 พร้อมข้อความไทยสั้น ๆ · rate limit → 429 · honeypot `website` มีค่า → 201 แต่ไม่บันทึก · error อื่น → 500 ข้อความกลาง (**ห้ามส่ง `err.message` ดิบ**) · คง 501 ไว้สำหรับ `NOT_IMPLEMENTED`
4. `POST /api/contact` ตอบ `201 { ok: true }` (ไม่ echo อีเมลกลับ)
5. Rate limit ต่อ IP (`clientAddress`) + test ใน `tests/` (D6)
6. `npm run test:labs` และ `npm test` ต้องเขียว · ห้ามแก้ `tests/labs/**`
7. **ห้ามแตะ** `src/pages/*.astro`, `src/layouts/`, `src/lib/profile.ts`, `src/lib/site.ts`
8. จบงาน: อัปเดต `docs/STATUS.md` + `docs/OPEN_LOOPS.md` และเขียน `docs/handoffs/05-opencode-to-claude.md` จาก TEMPLATE

## Canonical state updated

- [x] `docs/STATUS.md`
- [x] `docs/OPEN_LOOPS.md`
- [x] `docs/DECISIONS.md` (D14–D17 + API contract)
- [x] อื่น ๆ: `docs/PROFILE.md`

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS = OpenCode (backend)
