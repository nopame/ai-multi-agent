# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 15:10 +07:00

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L6 | Bio ใหม่ ≤ 3 ย่อหน้า ไม่มีตัวเลขปี (D3) + Interests "หัวข้อ — ประโยคเดียว" (D5) | Claude | P1 | ก่อน Lab 04 | เกณฑ์ใน DECISIONS |
| L7 | Audit repo + โปรไฟล์ GitHub 5 ข้อ (D8) ก่อนวางลิงก์/คำว่า "ตรวจสอบได้" | human | P1 | ก่อน ship (Lab 08) | ไม่ผ่าน = ถอดลิงก์ + คำเคลม |
| L8 | ฟอร์ม Contact สถานะ B: อีเมลตอบกลับจริง · อ่าน ≥ สัปดาห์ละครั้ง (D7/D11) | human | P1 | ก่อนเปิดฟอร์ม | rate limit มี test แล้ว (`tests/contact-api.test.ts`) · retention 90 วัน ทำฝั่ง server แล้ว · ถ้าไม่ผ่านทั้ง L7/L8 = ห้าม ship (D9) |
| L3 | ใช้ Contact / Tone จาก PROFILE ในหน้า UI (ธีมฟ้า/มิ้นต์/ส้ม) | Claude | P1 | Lab 04 (redo) | parser ยังไม่อ่านสองหัวข้อนี้ · ส้มเฉพาะปุ่มติดต่อ (D4) · contrast = Must (D11) |
| L9 | ฟอร์ม Contact/Guestbook เพิ่ม hidden honeypot input `website` + ถอด `<code>POST /api/contact</code>` ออกจากหน้า | Claude | P2 | Lab 04 (redo) | API พร้อมรับ honeypot แล้ว · maxlength ในฟอร์ม (80/120/2000 · 500) ต้องตรง `LIMITS` ใน `db.ts` |
| L10 | Proxy-aware client IP (`x-forwarded-for` โดน spoof ได้) + bucket pruning ก่อน ship | OpenCode | P3 | ก่อน ship (Lab 08) | ต่อยอดจาก Lab 05 — in-memory limiter พอสำหรับ v1 instance เดียว |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| L4 | `insertContact` + guestbook helpers ใน `db.ts` + API (honeypot + rate limit ตาม D6/D7) | 2026-09-25 (Lab 05 · test:labs เขียว) |
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | 2026-09-25 |
| L2 | ถก Brainstorm ใน `DEBATE.md` → ปิดใน `DECISIONS.md` | 2026-09-25 |
| L5 | DEBATE ครบ Brand / UX / Devil (Agent Teams 5 รอบ · D1–D13) | 2026-09-25 |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
