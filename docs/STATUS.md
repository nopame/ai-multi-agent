# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 +07:00  
Updated by: Claude (agent `frontend` · Lab 04)

## Current goal

- Lab 04 เสร็จฝั่ง UI (#6–#9) บน branch `lab-04-frontend` · ถัดไป Lab 05 = OpenCode `backend` ทำ `insertContact` + API ตาม D7 (#10) · ดู `docs/handoffs/04-claude-to-opencode.md`

## Done

- Lab 01–03: PROFILE · DEBATE · DECISIONS D1–D11 · issues #6–#13
- #6 PROFILE: Bio 3 ย่อหน้า (Role statement นำ) · ไม่มี `## Tagline` · ไม่มี "5 ปี" · Interests "หัวข้อ — ประโยคเดียว"
- #7 Home: H1 "Full-stack developer" + บรรทัดรอง (แยกจาก `## Headline`) · ปุ่มส้มเดียว "ติดต่อผม" · slot "ดูโค้ด" ปิด · ไม่มี Audience
- #8 IA: nav 4 หน้า (ไม่มี Guestbook) · Interests หน้าแยก · About แสดงหัวข้อ + ลิงก์
- #9 Contact: ช่องอีเมลจาก `## Contact` · ฟอร์มซ่อนจนกว่า `CONTACT_FORM_ENABLED=1` (gate D7) · 501 → ซ่อนฟอร์ม · ไม่มี API path · error ไม่โชว์รหัส
- Guestbook page (ไม่ลิงก์ · D5 Later): 501/error → ข้อความ "ยังไม่เปิด" · render ด้วย textContent · ไม่มี API path
- ธีมสว่าง ฟ้า/มิ้นต์/ส้ม ใน `BaseLayout.astro` · `npm test` 15/15 · `npm run build` ผ่าน

## In progress

- —

## Blocked

- ก่อน ship: audit GitHub 5 ข้อ (D8 · L7) · อีเมล alias จริง (D11 · L9 — demo ไม่นับ) · gate ฟอร์ม (D7 · L8)

## Next actions

1. ผู้เรียน: commit + เปิด PR `lab-04-frontend` → main ของ `nopame/ai-multi-agent` (body อยู่ในรายงาน Lab 04)
2. OpenCode `backend` (Lab 05): #10 honeypot + rate limit + maxlength (มี test) · `npm run test:labs` ให้เขียว · ไม่แตะ UI
3. ตรวจด้วยตา 360px + contrast (#13) ก่อน ship

## Files changed in latest session

- Lab 04: `src/layouts/BaseLayout.astro` · `src/pages/{index,about,interests,contact,guestbook}.astro` · `src/lib/profile.ts` (`splitHeadline` / `splitInterest` / `parseContacts`) · `tests/profile.test.ts` · `playwright/smoke.spec.ts` · `docs/PROFILE.md` · `docs/handoffs/04-claude-to-opencode.md`

## Notes

- Proposed vs Approved: ความเห็นใน `DEBATE.md` — คำตัดสินใน `DECISIONS.md` · memory ของ debate agent ขัดกับ DECISIONS → ยึด DECISIONS
- คำขอ "ลิงก์ Guestbook ใน nav" ขัดกับ D5 (approved) → ยึด D5: route `/guestbook` มีอยู่แต่ไม่ลิงก์ · จะเปิดลิงก์ต้องมี decision ใหม่ · ผู้เรียนยืนยันยึด D5 แล้ว (2026-09-25)
- เปิดฟอร์ม Contact: ตั้ง env `CONTACT_FORM_ENABLED=1` หลัง L8 ผ่านเท่านั้น
