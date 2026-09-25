# Swarm log

## 2026-09-25 · Lab 05b · guestbook/contact ให้ใช้ได้จริง

- Branch: `lab-05b-swarm` · orchestrator: Claude (main session) · skill `public-site-safe`
- เพดาน: 20 turns · **ใช้ครบ 20 turns** · done criteria ครบที่ turn 17 · turn 18–20 = เรียก OpenCode ตรวจสัญญา FE↔BE (ผู้เรียนขอเพิ่ม) · หยุดที่เพดาน

### Done criteria

| เกณฑ์ | ผล |
|---|---|
| `npm run test:labs` เขียว | ✅ 2/2 (เขียวตั้งแต่ก่อนเริ่ม · Lab 05 merged แล้ว) |
| ส่งฟอร์ม guestbook/contact บน localhost ได้ | ✅ ส่งผ่านเบราว์เซอร์จริงที่ `http://127.0.0.1:4321` (Playwright) ด้วย demo data |
| `npm test` / build | ✅ 14/14 · build OK |

### งานที่แบ่ง

| Agent | Owner | ไฟล์ | ผล |
|---|---|---|---|
| frontend #1 | Claude | `src/pages/contact.astro` | microcopy ไทย (D9) · ถอด API path ออก (L9) · honeypot `website` · maxlength 80/120/2000 · ประโยคแจ้งลบข้อมูลใน 90 วัน · รองรับ 400/429/500/501/network error (501 = ซ่อนฟอร์มแล้วแสดงข้อความสำรอง · D6) |
| frontend #2 | Claude | `src/pages/guestbook.astro` | **แก้ stored XSS** (`innerHTML` → `textContent`) · ถอด API path ออก · honeypot · status + จัดการ error · แสดงเวลาแบบไทย (`created_at` เป็น UTC) |
| backend reviewer | OpenCode (`opencode run` one-shot · skill `opencode`) | `docs/fe-be-contract-check.md` (ไฟล์รายงานเดียว) | **ผ่านทั้ง 5 ข้อ** — ชื่อฟิลด์ · maxlength ↔ `LIMITS` · status code/response shape · D9/XSS · ไม่มีตัวบล็อก · ไม่ได้แก้ไฟล์อื่น (ตรวจ `git diff --stat` แล้ว) |

> หมายเหตุ call ข้าม harness: `opencode run` ไม่คืน output และ process ไม่ exit เอง เกิน 10 นาที (ไฟล์รายงานเขียนเสร็จแล้ว) → Claude หยุด process ที่ตัวเองเรียก (PID ของ run นี้เท่านั้น) · ครั้งหน้าควรตั้ง timeout สั้นกว่า และเช็กไฟล์รายงานระหว่างรอ

### การตรวจ (smoke test)

- `curl`: contact 201 / 400 (อีเมลผิดรูปแบบ) / honeypot 201 (ไม่บันทึก) · guestbook POST 201 · GET 200
- เบราว์เซอร์: guestbook ส่งได้ → "ขอบคุณที่ฝากข้อความครับ" · payload `<img onerror>` แสดงเป็นข้อความธรรมดา (สร้าง `<img>` 0 ตัว) · contact ส่งได้ → "ได้รับข้อความแล้วครับ" แล้วฟอร์ม reset
- หน้า `/contact` และ `/guestbook` ไม่มี `/api/` และไม่มี `innerHTML`

### ช่องว่าง (ยังไม่ปิด)

- **Guestbook ยังอยู่ใน nav** (`BaseLayout.astro`) ขัดกับ D5 (Guestbook → Later) — ทำใน Lab 04 redo / issue #8 · รอบนี้ไม่ได้แตะ layout
- Success copy "ได้รับข้อความแล้วครับ" ตาม D7 ใช้ได้**หลัง** gate L8 ผ่าน — ตอนนี้ใช้ได้เฉพาะ demo บน localhost ยังห้าม ship
- ข้อมูลทดสอบ (demo) ถูกเขียนลง `data/site.sqlite` ในเครื่อง (gitignore) — ลบได้ถ้าต้องการ
- ยังไม่มี Playwright spec ใน `playwright/` สำหรับฟอร์ม → Lab 06
- L10 (IP ที่ proxy-aware) ยังค้างฝั่ง OpenCode
- PR #14 (Lab 04 เก่า) ยังเปิดอยู่
- จากรายงาน OpenCode (ไม่บล็อก): `POST /api/guestbook` ยังไม่มี rate limit (OpenCode · L12) · ข้อความ 429 ฝั่ง contact มีคำว่า "ลองใหม่" ซ้ำ (FE ต่อ suffix ท้าย `data.error`) + อาจใช้ `retry-after` (Claude · L13)
