# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 +07:00

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L7 | Audit repo + โปรไฟล์ GitHub 5 ข้อ (D8) ก่อนวางลิงก์/คำว่า "ตรวจสอบได้" | human | P1 | ก่อน ship (Lab 08) | ไม่ผ่าน = ถอดลิงก์ + คำเคลม |
| L8 | ฟอร์ม Contact สถานะ B: เหลือเฉพาะส่วนคน — อีเมลตอบกลับจริง + อ่าน ≥ สัปดาห์ละครั้ง (D7) | human | P1 | ก่อนเปิดฟอร์ม | ส่วนโค้ดเสร็จแล้ว: retention 90 วัน + rate limit พร้อม test (D6) · ถ้า L7/L8 ไม่ผ่าน = ห้าม ship (D9) |
| L9 | Lab 03 issues จาก DECISIONS (MCP + gh) | Claude | P2 | เมื่อ GitHub MCP เชื่อมต่อได้ | ตอนนี้ MCP error: Authorization header |
| L11 | Rate limit: หลัง proxy (Coolify/Traefik) `clientAddress` = IP ของ proxy → ทุกคนแชร์โควตาเดียว · ต้องอ่าน IP จาก `X-Forwarded-For` ของ proxy ที่เชื่อถือได้ + ล้าง bucket ที่หมดอายุ (Map โตไม่จำกัด) | OpenCode | P1 | ก่อน ship (Lab 08) | พบจาก review ของ Claude บน PR Lab 05 |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| L4 | contact + guestbook ใน `db.ts` + API ตาม API contract (D6/D7/D14/D15) | 2026-09-25 |
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | 2026-09-25 |
| L2 | ถก Brainstorm ใน `DEBATE.md` → ปิดใน `DECISIONS.md` | 2026-09-25 |
| L6 | Bio / Interests / parser Tagline | 2026-09-25 |
| L3 | UI ใช้ Tone / Contact จาก PROFILE (Lab 04) | 2026-09-25 |
| L10 | Review contract Lab 05 + commit · Playwright flow ฟอร์มจริง + responsive (docs/QA.md) | 2026-09-25 |
| L5 | DEBATE ครบ Brand / UX / Devil (Agent Teams 5 รอบ · D1–D13) | 2026-09-25 |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
