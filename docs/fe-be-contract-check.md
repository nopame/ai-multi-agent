# FE ↔ BE Contract Check — Contact / Guestbook

> ตรวจโดย OpenCode (agent `backend`) ก่อน Lab 05 · 2026-09-25 · **อ่านอย่างเดียว — ไม่แก้ `src/`**  
> อ้างอิง: D5 / D6 / D7 / D9 · OPEN_LOOPS L4 · issue #10 · `docs/handoffs/04-claude-to-opencode.md`

**สถานะหลังแก้ (2026-09-25 · อัปเดตหลังรอบแรก):** Mismatch ข้อ 1–2 และ 4 ของ Contact + ข้อ 1 ของ Guestbook **แก้แล้ว** ด้วย `src/lib/http.ts` (helper กลาง) — 501 เฉพาะ `NOT_IMPLEMENTED` · body parse fail → 400 · server fault → 500 พร้อมข้อความสั้น · ไม่มี SQL/stack/ข้อความคอร์สใน response · ผลตรวจ: `npm test` 15/15 · `npm run build` ผ่าน · labs ยังแดง 2 test ตามที่ template กำหนด (รอ implement จริง)  
**อัปเดตรอบที่สอง (Lab 05 implement จริง · 2026-09-25):** `insertContact` + validation + honeypot (`website`) + rate limit (5/นาที/IP → 429) + ลบข้อมูลเกิน 90 วัน — เสร็จ · `npm run test:labs` **9/9 เขียว** · guestbook db พร้อมแต่ API ยังปิด (501) จนกว่าจะตั้ง `GUESTBOOK_ENABLED=1` พร้อม decision ใหม่แทน D5 · รายละเอียดใน `docs/handoffs/05-opencode-to-claude.md`  
**คงเหลือ:** honeypot field ในฟอร์ม HTML (ฝั่ง FE · ทำก่อนเปิดฟอร์มตาม L8) — รายละเอียดใน handoff 05

## สิ่งที่ตรวจ

| ฝั่ง | ไฟล์ |
|---|---|
| FE ฟอร์ม | `src/pages/contact.astro` · `src/pages/guestbook.astro` |
| BE stub | `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `src/pages/api/interests.ts` · `src/lib/db.ts` |
| สัญญา | `tests/labs/lab05-api.test.ts` · `playwright/smoke.spec.ts` |

---

## 1. Contact — `POST /api/contact`

### ✅ Match (ตรงกันแล้ว)

| ประเด็น | ฝั่ง FE | ฝั่ง BE stub |
|---|---|---|
| Method + path | `fetch('/api/contact', { method: 'POST' })` | `export const POST` บน route เดียวกัน |
| Content type | ส่ง `application/json` + `JSON.stringify(payload)` | `request.json()` ตรงกัน |
| ชื่อ field | `{name, email, message}` จาก `FormData` | `insertContact(input: {name, email, message})` — ชื่อตรงทั้ง 3 ช่อง |
| maxlength HTML | ชื่อ 80 / อีเมล 120 / ข้อความ 2000 | ตรงโควตาใน L4 (server ยังต้อง enforce — ดูข้อแนะนำ) |
| สัญญา 501 | `res.status === 501` → ซ่อนฟอร์ม (D6) | stub โยน `NOT_IMPLEMENTED: …` → API map เป็น 501 — ตรงกัน |
| สัญญาความสำเร็จ | `res.ok` → แสดง success copy, `form.reset()` (ไม่อ่าน body) | ตอบ `201` + `JSON.stringify(row)` — FE ไม่พึ่งรูปร่าง body จึงปลอดภัย |
| error ที่ FE แสดง | ไม่แสดงข้อความจาก server เลย (D9) — generic ทุกกรณี | ใช้ `role="status"` + ข้อความกลาง — UI ไม่ render `error` ที่ส่งมา |
| Rate limit (อนาคต) | 429 จะตกเข้าสาขา generic error อยู่แล้ว | ไม่ต้องเพิ่มอะไรฝั่ง FE |

### ❌ Mismatch / ความเสี่ยง (ให้ Lab 05 แก้ฝั่ง BE เท่านั้น)

1. **Error response หลุดข้อความดิบออกสาย** — `api/contact.ts` ทำ `JSON.stringify({ error: message })` โดย `message` คือ `err.message` ดิบ ถ้า `insertContact` โยน error จาก `better-sqlite3` ข้อความ SQL/stack จะหลุดออกไปใน response body แม้ FE จะไม่แสดงก็ตาม — ขัด D9 ("error สั้น ไม่หลุด stack/SQL") และเสี่ยงถูกดึงไปโชว์ที่หน้าอื่นภายหลัง
2. **สถานะ error ผิดคลาส** — เงื่อนไขเป็น `message.startsWith('NOT_IMPLEMENTED') ? 501 : 400` ทำให้ DB error จริง (server fault) ถูกตอบเป็น **400** (client error) แทน 500 และ `request.json()` ที่ parse ไม่ผ่าน (SyntaxError) ก็ตอบ 400 พร้อมข้อความ parser ดิบ
3. **Honeypot ยังไม่มีช่องกับดักในฟอร์ม** — D7/L4 กำหนด honeypot ฝั่ง server แต่ HTML ไม่มี hidden field เลย ถ้า backend ตรวจ "field มีค่า = bot" โดยที่ฟอร์มไม่มี field ให้ bot กรอก กับดักไม่ทำงาน (human ผ่านทุกกรณี แต่ bot ก็ผ่านหมด)
4. **ข้อความคอร์สหลุดใน 501 body** — stub โยน `'NOT_IMPLEMENTED: insertContact — Lab 05 OpenCode'` แล้ว API ส่งข้อความนั้นเป็น `error` ออกสาย — ยังไม่ render บนหน้าเว็บ (guard test ผ่าน) แต่ใคร curl ดูจะเห็นว่าเว็บมาจากคอร์ส ขัดจิตวิญญาณของกฎ "ผู้ชมเว็บต้องไม่เห็นว่าเว็บมาจากคอร์ส"

### 💡 ข้อแนะนำ (Lab 05 ฝั่ง backend)

- Map error ให้ครบ: `NOT_IMPLEMENTED*` → 501 · JSON parse / validation → 400 · ที่เหลือ (DB, ไม่ทราบสาเหตุ) → 500 และตอบ `{ error: 'ส่งข้อความไม่สำเร็จ' }` แบบสั้นเสมอ — ข้อความ error จริง log ฝั่ง server เท่านั้น
- Stub ใน `db.ts` เปลี่ยนข้อความเป็น `NOT_IMPLEMENTED` เปล่า ๆ (ไม่มีคำ "Lab 05 / OpenCode") ตอน implement จริงก็หายไปเอง
- ตอน implement validation: enforce บังคับ server ชื่อ ≤ 80 / อีเมล ≤ 120 / ข้อความ ≤ 2000 (trim + ตรวจ email รูปแบบคร่าว ๆ) ให้เท่ากับ maxlength ใน HTML ตาม D7 — ปล่อยขาด = ผ่าน HTML แต่โดน DB ตบ (SQLite TEXT ไม่บังคับความยาว)
- Honeypot ให้ backend ออกแบบรับ "field มีชื่ออะไรก็ได้ที่ FE จะเพิ่นให้ภายหลัง (เช่น `website`)" — มีค่า non-empty → ตอบ 201 เสมอ (หลอก bot) แต่ไม่บันทึก ถ้าต้องการให้กับดักทำงานจริง ต้องแจ้ง FE เพิ่ม hidden field ตอนเปิดฟอร์ม (งาน frontend — คุยผ่าน handoff ก่อน)

---

## 2. Guestbook — `GET` + `POST /api/guestbook`

### ✅ Match

| ปรเด็น | ฝั่ง FE | ฝั่ง BE stub |
|---|---|---|
| GET รูปร่าง response | `data.entries` ต้องเป็น array, ใช้ `name` / `message` / (`created_at` ไม่ใช้) | `{ entries: rows }` + type `GuestbookEntry` มีครบ — ตรง |
| POST field | `{name, message}` | `insertGuestbook({name, message})` — ตรง |
| 501 ทั้งสอง method | `!res.ok` หรือ 501 → `showClosed()` (ข้อความ "ยังไม่เปิด") | stub โยน `NOT_IMPLEMENTED` → 501 ทั้ง GET/POST — ตรง |
| XSS | render ด้วย `textContent` เท่านั้น | เก็บ string ดิบ — ไม่มีช่องโหว่ฝั่งสัญญา |

### ❌ Mismatch / ความเสี่ยง

1. **Error body หลุดข้อความดิบ** — รูปแบบเดียวกับ Contact (ทั้ง GET และ POST) และ GET ตอบ **500** สำหรับ error อื่นพร้อมข้อความจริง — แม้ FE จะ fallback เงียบ ๆ แต่สายยังส่ง SQL/stack ออกไป
2. **maxlength ฝั่ง guestbook ไม่มีในสัญญา** — HTML กำหนด ชื่อ 80 / ข้อความ 500 แต่ L4 เขียน maxlength เฉพาะ contact — ตอน implement จริงต้อง enforce 800/500 ที่ server ด้วย (ตอนนี้ guestbook = Later ตาม D5 จึงไม่ด่วน)
3. **เงื่อนไขเปิดฟอร์มของ guestbook ผูกกับ GET 200** — พอ backend เขียน `listGuestbook` เสร็จ (200 + `entries: []`) ฟอร์มจะโผล่ทันทีเอง แม้ยังไม่ผ่าน gate ใด ๆ — ตรงกับที่ D5 บอก "Later" หรือไม่ ต้องตัดสินใจชัดว่าจะเปิดเมื่อไหร่ (ตอนนี้ stub โยน NOT_IMPLEMENTED จึงยังปลอดภัย)

### 💡 ข้อแนะนำ

- ใช้รูปแบบ error mapping เดียวกับ contact (501 / 400 / 500 + ข้อความสั้น) — อย่าโยน `err.message` ดิบ
- ก่อน implement guestbook จริง ให้มี decision ใหม่มาแทน D5 ก่อน (D5 = approved ปัจจุบันบอก Later) — อย่าเพิ่งเขียน `insertGuestbook` จริงเฉย ๆ เพราะ test ใน labs มีอยู่แล้วทำให้เขียว แต่ขัด decision

---

## 3. `GET /api/interests` (อ้างอิง — ไม่มีฟอร์มผูก)

- คืน `{ interests, source: 'profile' }` จาก `loadProfile()` — ไม่มี input จากผู้ใช้ จึงไม่มี contract ที่ต้องแก้
- หน้า `interests.astro` render static จาก profile เดียวกัน — API เสริม ไม่ได้ใช้ใน flow ติดต่อ
- **ข้อแนะนำ:** ปล่อยตามเดิม · ถ้าจะให้เป็น 501-style stub เหมือน guestbook ก็ได้ แต่ไม่จำเป็น

---

## 4. สรุปก่อน Lab 05 (สัญญาที่ backend ต้องรักษา)

1. **`POST /api/contact`** — รับ JSON `{name, email, message}` · ตอบ 201 + row → success · 501 เฉพาะตอนยังไม่ implement · validation error → 400 · server fault → 500 · ข้อความ error สั้นเสมอ (ไม่มี SQL / stack / ชื่อ lab)
2. **`GET /api/guestbook`** — ตอบ 200 + `{entries: [{id, name, message, created_at}]}` เมื่อเปิด · 501 ตอนยังไม่เปิด (FE แสดง "ยังไม่เปิด" เอง)
3. **`POST /api/guestbook`** — `{name, message}` → 201 + row · error ตามรูปแบบเดียวกัน
4. **`db.ts`** — `insertContact` / `listGuestbook` / `insertGuestbook` ต้อง implement จริง + validation + honeypot + rate limit ที่มี test ใน `tests/labs/lab05-api.test.ts` (ปัจจุบัน RED — โยน `NOT_IMPLEMENTED` ทั้งหมด)
5. **ข้อห้ามฝั่ง BE:** อย่าแตะ `src/pages/*.astro` · อย่าแสดง API path / รหัส error ใน response ที่ส่งกลับ (D9) · อย่าใส่ข้อความคอร์สใน response body

> ทุก mismatch ข้างบนแก้ได้ใน `src/lib/db.ts` + `src/pages/api/*.ts` เท่านั้น — ไม่ต้องแตะ UI เลย ฟอร์มฝั่ง FE เข้ากับสัญญาปัจจุบันอยู่แล้ว (มีเพียง honeypot field ที่ต้องหารือคืนฝั่ง frontend ตอนเปิดฟอร์มจริง)