# Handoff: Claude (frontend) → OpenCode (backend)

Timestamp: 2026-09-25 14:20 +07:00  
Task: Lab 04 UI เสร็จ → ส่งต่อ Lab 05 backend (Contact API ตาม D7 · issue #10)  
Status: NEEDS_REVIEW (UI) · ส่งงาน backend ต่อ

## What changed

- UI 4 หน้า อ่านเนื้อหาจาก `docs/PROFILE.md` ผ่าน `src/lib/profile.ts` · nav 4 หน้า ไม่มี Guestbook (D5)
- Home: H1 + บรรทัดรองแยกจาก `## Headline` (D1) · ปุ่มส้มเดียว "ติดต่อผม" · slot "ดูโค้ด" ปิด (D4/D8)
- Contact: แสดงอีเมลจาก `## Contact` · ฟอร์ม 3 ช่องแสดงเมื่อ env `CONTACT_FORM_ENABLED=1` เท่านั้น (gate D7) · `POST` ตอบ 501 → ซ่อนฟอร์ม · error ฝั่ง UI ไม่แสดงข้อความจาก server (D9)
- Guestbook page: ไม่ลิงก์ (Later) · response ไม่ ok / 501 → "ยังไม่เปิด" · render ด้วย textContent
- ธีมสว่าง ฟ้า/มิ้นต์/ส้ม ใน `BaseLayout.astro`

## Files

- `src/layouts/BaseLayout.astro` · `src/pages/{index,about,interests,contact,guestbook}.astro`
- `src/lib/profile.ts` (เพิ่ม `splitHeadline`, `splitInterest`, `parseContacts` · `Profile.contacts`) · `tests/profile.test.ts` · `playwright/smoke.spec.ts`
- `docs/PROFILE.md` (#6) · `docs/STATUS.md` · `docs/OPEN_LOOPS.md`
- **ไม่แตะ** `src/lib/db.ts` และ `src/pages/api/**`

## Verification

- Unit / smoke: PASS — `npm test` 3 files / 15 tests · `npm run build` ผ่าน · built server: `/`, `/about`, `/interests`, `/contact`, `/guestbook` = 200 · `/api/guestbook` = 501 · หน้าแรกไม่มีคำว่า guestbook
- Labs (`npm run test:labs`): FAIL (2 tests ใน 1 file — ตั้งใจ รอ Lab 05)
- Manual / localhost: ยังไม่ตรวจด้วยตาที่ 360px / contrast (L10 · #13)

## Assumptions to challenge

1. สัญญา `POST /api/contact`: body JSON `{ name, email, message }` · สำเร็จ = 2xx (UI ไม่อ่าน body) · validation → 400 · UI ไม่แสดงข้อความ error จาก server เลย ฉะนั้น backend ตั้งข้อความ error สั้นอะไรก็ได้แต่ต้องไม่มี stack/SQL
2. maxlength ฝั่ง HTML = ชื่อ 80 · อีเมล 120 · ข้อความ 2000 — server ต้องใช้ค่าเดียวกัน (D7) ถ้าจะเปลี่ยนให้เขียนใน handoff กลับ แล้ว frontend แก้ HTML
3. Honeypot: UI **ยังไม่มีช่อง honeypot** — backend เลือกชื่อ field (เช่น `website`) แล้วระบุใน handoff กลับ frontend จะเพิ่ม input ที่ซ่อนให้ (อย่าแก้ `contact.astro` เอง)
4. Rate limit เกิน → แนะนำ 429 · UI จะแสดงข้อความทั่วไป "ส่งไม่สำเร็จ…" อยู่แล้ว

## Request to next agent

OpenCode agent `backend` — **Lab 05 เท่านั้น**:

- implement `insertContact` ใน `src/lib/db.ts` + `POST /api/contact` ตาม D7 / #10: validate · honeypot · rate limit **พร้อม test** · error ปลอดภัย
- `npm run test:labs` ให้เขียว และ `npm test` ยังเขียว
- Guestbook = Later (D5) — ไม่บังคับรอบนี้ ถ้าทำให้ GET คืน `{ entries: [{ name, message, created_at }] }`
- **อย่าแตะ UI** (`src/pages/*.astro`, `src/layouts/`) · ถ้าต้องเปลี่ยนสัญญา API/field ให้เขียนใน handoff `05-opencode-to-claude.md`
- ไม่ต้องตั้ง `CONTACT_FORM_ENABLED` — เปิดฟอร์มเมื่อ gate L8 ผ่าน (human ตัดสิน)

## Canonical state updated

- [x] `docs/STATUS.md`
- [x] `docs/OPEN_LOOPS.md`
- [ ] `docs/DECISIONS.md` (ไม่มี decision ใหม่)
- [x] อื่น ๆ: handoff นี้

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS = OpenCode (agent `backend`) หลังผู้เรียน commit งาน Lab 04 แล้ว
