# FE ↔ BE Contract Check — Contact / Guestbook

> Reviewer: OpenCode (backend) · 2026-09-25 · read-only review
> ไฟล์ที่ตรวจ: `src/pages/contact.astro`, `src/pages/guestbook.astro`, `src/pages/api/contact.ts`, `src/pages/api/guestbook.ts`, `src/lib/db.ts`, `src/lib/rate-limit.ts` · อ้างอิง D6/D7/D9

## ตารางผลตรวจ

| # | หัวข้อ | Contact | Guestbook | หมายเหตุ |
|---|--------|---------|-----------|----------|
| 1 | ชื่อฟิลด์ฟอร์ม ↔ API/db.ts (รวม honeypot `website`) | ผ่าน | ผ่าน | ตรงทุกฟิลด์ |
| 2 | maxlength HTML ↔ `LIMITS` ใน db.ts (D7) | ผ่าน | ผ่าน | 80/120/2000 และ 80/500 ตรงเป๊ะ |
| 3 | ฟอร์มรับ status code + response shape ครบ | ผ่าน | ผ่าน | รายละเอียดข้อ 3 |
| 4 | ไม่มี error/รายละเอียดภายในหลุด (D9) · ไม่มี XSS | ผ่าน | ผ่าน | รายละเอียดข้อ 4 |
| 5 | ข้อเสนอแนะ | — | — | ข้อ 5 (ไม่บล็อก) |

**สรุป: ผ่านทั้ง 5 ข้อ — สัญญา FE ↔ BE ตรงกัน ไม่มีตัวบล็อก**

## รายละเอียด

### 1. ชื่อฟิลด์
- Contact: ฟอร์มส่ง `name`, `email`, `message`, `website` → API อ่าน `body.website` (honeypot) และ `insertContact()` อ่าน `name/email/message` ตรงกัน
- Guestbook: ฟอร์มส่ง `name`, `message`, `website` → API อ่าน `body.website` และ `insertGuestbook()` อ่าน `name/message` ตรงกัน

### 2. maxlength ↔ LIMITS
| ฟิลด์ | HTML | LIMITS | ตรง |
|---|---|---|---|
| contact name | 80 | `contactName: 80` | ✓ |
| contact email | 120 | `contactEmail: 120` | ✓ |
| contact message | 2000 | `contactMessage: 2000` | ✓ |
| guestbook name | 80 | `guestbookName: 80` | ✓ |
| guestbook message | 500 | `guestbookMessage: 500` | ✓ |

### 3. Status code / response shape
- **Contact API ตอบจริง:** 201 `{ok:true}` (ทั้ง honeypotและจริง) · 400 `{error}` · 429 `{error}` + `retry-after` · 500 `{error}` — ฟอร์มรับครบ: 201/`res.ok` → ข้อความสำเร็จ, 501 → ซ่อนฟอร์ม+fallback (ตาม D6, API ปัจจุบันไม่ตอบ 501 แล้ว แต่ FE รับไว้เป็น defensive ดีแล้ว), 400/429/500 → โชว์ `data.error`, network fail → ข้อความเชื่อมต่อ
- **Guestbook API ตอบจริง:** GET 200 `{entries:[{id,name,message,created_at}]}` / 500 `{error}` · POST 201 (honeypot `{ok:true}` / จริงเป็น row) · 400/500 `{error}` — ฟอร์มเช็ก `Array.isArray(data.entries)` ก่อน render, POST รับ `res.ok`/501/`data.error`/generic ครบ
- shape `created_at` ("YYYY-MM-DD HH:MM:SS" UTC) ↔ `formatDate()` ฝั่ง FE ตีความเป็น UTC ถูกต้อง

### 4. D9 / XSS
- ข้อความ error ทุกตัวฝั่ง API เป็น static string ภาษาไทย (SAFE_*) ไม่มี stack/SQL/path · `console.error` อยู่ฝั่ง server เท่านั้น
- FE render entries ผ่าน `textContent`/`createTextNode`/`replaceChildren` ทั้งหมด ไม่มี `innerHTML` → ไม่มี XSS จากข้อมูล guestbook
- honeypot ตอบ 201 `{ok:true}` เหมือนสำเร็จจริง บอทแยกไม่ออก (spam drop เงียบ) ✓
- หน้าเว็บไม่มี API path / รหัส error หลุด ✓

### 5. ข้อเสนอแนะ (ไม่บล็อก)

**งาน OpenCode (backend):**
1. `POST /api/guestbook` ยังไม่มี rate limit (มีแค่ honeypot) — D7 บังคับเฉพาะ Contact แต่ endpoint นี้ live อยู่ แนะนำใส่ `checkRateLimit('guestbook:'+ip)` แบบเดียวกัน
2. `x-forwarded-for` เชื่อค่าจาก client โดยตรง → spoof หลบ rate limit ได้; พอรับได้สำหรับเว็บส่วนตัว single-node แต่ควรจดไว้
3. rate limiter เป็น in-memory → reset ทุกครั้งที่ restart; รับได้ตามคอมเมนต์ในไฟล์ แค่ยืนยันว่าตั้งใจ

**งาน Claude (frontend):**
1. Contact ตอนโดน 429 จะได้ข้อความ "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่ — ลองใหม่อีกครั้งนะครับ" (คำว่า "ลองใหม่" ซ้ำ) — พิจารณาตัด suffix เมื่อ error มาจาก server
2. อาจใช้ header `retry-after` ของ 429 บอกเวลารอให้ผู้ใช้ (optional)
