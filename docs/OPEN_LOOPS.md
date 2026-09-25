# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 +07:00

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L6 | Bio ใหม่ ≤ 3 ย่อหน้า ไม่มีตัวเลขปี (D3) + Interests "หัวข้อ — ประโยคเดียว" (D5) + parser อ่าน `## Tagline` (D2) | Claude | P1 | ก่อน Lab 04 | เกณฑ์ใน DECISIONS |
| L7 | Audit repo + โปรไฟล์ GitHub 5 ข้อ (D8) ก่อนวางลิงก์/คำว่า "ตรวจสอบได้" | human | P1 | ก่อน ship (Lab 08) | ไม่ผ่าน = ถอดลิงก์ + คำเคลม |
| L8 | ฟอร์ม Contact สถานะ B: อีเมลตอบกลับจริง · อ่าน ≥ สัปดาห์ละครั้ง · ลบ 90 วัน (D7) · rate limit มี test (D6) | human + OpenCode | P1 | ก่อนเปิดฟอร์ม | ถ้าไม่ผ่านทั้ง L7/L8 = ห้าม ship (D9) |
| L3 | ใช้ Contact / Tone จาก PROFILE ในหน้า UI (ธีมฟ้า/มิ้นต์/ส้ม) | Claude | P1 | Lab 04 | parser ยังไม่อ่านสองหัวข้อนี้ · ส้มเฉพาะปุ่มติดต่อ (D4) · contrast = Must (D11) |
| L4 | `insertContact` ใน `db.ts` + API (honeypot + rate limit ตาม D6) · guestbook = Later (D12) | OpenCode | P1 | Lab 05 | ตอนนี้ตอบ 501 · UI ซ่อนฟอร์มตอน 501 (D7) |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | 2026-09-25 |
| L2 | ถก Brainstorm ใน `DEBATE.md` → ปิดใน `DECISIONS.md` | 2026-09-25 |
| L5 | DEBATE ครบ Brand / UX / Devil (Agent Teams 5 รอบ · D1–D13) | 2026-09-25 |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
