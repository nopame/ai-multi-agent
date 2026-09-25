# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 +07:00

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L4 | `insertContact` ใน `db.ts` + `POST /api/contact` ตาม D7: honeypot + rate limit (มี test) · maxlength ชื่อ 80 / อีเมล 120 / ข้อความ 2000 ให้ตรง HTML · error สั้นไม่หลุด stack/SQL · guestbook = Later (D5) | OpenCode | P1 | Lab 05 (#10) | ดู `docs/handoffs/04-claude-to-opencode.md` · ตอนนี้ตอบ 501 |
| L9 | สร้างอีเมล alias ของนามแฝงที่ตอบได้จริง → แก้ `## Contact` + กฎ Privacy (D11) | human | P1 | ก่อน ship (#12) | demo@example.com ไม่นับ · ไม่มี = ห้าม ship (D6) |
| L7 | Audit repo + โปรไฟล์ GitHub 5 ข้อ (D8) ก่อนวางลิงก์/คำว่า "ตรวจสอบได้" | human | P1 | ก่อน ship (#11 · Lab 08) | ผ่านแล้ว → เปิด slot "ดูโค้ด" ใน `index.astro` + เพิ่ม `github` ใน `contact.astro` |
| L8 | Gate ฟอร์ม Contact (D7): inbox nopame · อ่าน ≥ สัปดาห์ละครั้ง · ลบ 90 วัน · rate limit + honeypot มี test · maxlength ตรง HTML | human + OpenCode | P1 | ก่อนเปิดฟอร์ม | ผ่านแล้วตั้ง `CONTACT_FORM_ENABLED=1` · ship ได้แม้ฟอร์มซ่อน ถ้า L9 ผ่าน |
| L10 | ตรวจด้วยตาที่ 360px: บรรทัดรอง ≤ 2 บรรทัด ไม่ตัดกลางคำ · ปุ่มติดต่อในจอแรก · contrast (D1/D4/D10) | Claude | P2 | Lab 06 (#13) | Playwright spec มีแล้วใน `playwright/smoke.spec.ts` |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | 2026-09-25 |
| L2 | ถก Brainstorm ใน `DEBATE.md` → ปิดใน `DECISIONS.md` | 2026-09-25 |
| L5 | DEBATE ถกใหม่ Brand / UX / Devil (subagents 2 รอบ · D1–D11) | 2026-09-25 |
| L6 | PROFILE Bio / Tagline / "5 ปี" / Interests (D2/D3/D5 · #6) | 2026-09-25 |
| L3 | UI ตาม D4/D5/D9 (#7/#8/#9) · Lab 04 | 2026-09-25 |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
