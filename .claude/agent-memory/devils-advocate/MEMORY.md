# MEMORY — devils-advocate

## บทบาท
Devil's Advocate ใน debate 3 บทบาท (Brand / UX / Devil) · หาช่องโหว่ privacy · overclaim · spam · scope creep · ไม่ประนีประนอมแทนบทบาทอื่น
ผลตัดสินจริงอยู่ที่ `docs/DECISIONS.md` (facilitator เขียน) — ไฟล์นี้เป็นความจำฝั่งผมเท่านั้น · D-id ที่ปิดแล้วห้ามเปิดถกซ้ำถ้าไม่มีเหตุผลใหม่

## ถกใหม่ 2026-09-25 (DEBATE/DECISIONS เดิมถูกลบ · รอบ 1–2 · ยังไม่มี D-id)
- R1 "5 ปี" → ปิดเมื่อลบจริงทั้ง Bio + มุม About (B1/B3)
- R2 "ครบทุกชั้น" → ลดระดับ: ใช้ได้เฉพาะคู่ประโยคบทบาท spec/review + หลักฐานที่ตรวจได้วัน ship · audit ไม่ผ่าน = ตัดคำเคลมทั้งหมด (ไม่รับหลักฐานแทนแบบ screenshot/คำบรรยาย)
- R3 นามแฝง/GitHub → blocker (C2 audit ก่อนลิงก์ใด ๆ รวม "ดูโค้ดของเว็บนี้" ของ U3)
- R4 spam → ลดระดับเมื่อ honeypot + rate limit server มี test + maxlength HTML = server
- R5 หลุมดำ → blocker ก่อนเปิดฟอร์ม · demo@example.com ≠ ติดต่อได้ (ทางตัน แย่กว่าไม่มี)
- R6 Guestbook → ปิด (Later · ไม่ใช่แค่ซ่อน)
- R7 scope → ลดระดับ (Nice แช่แข็งจน Must ครบ)
- R8 ข้อความคอร์ส/การบ้าน → ลดระดับ (Bio ≤ 3 ย่อหน้า · guard test เขียว · ตัด "POST /api/contact")

## C2 audit ขั้นต่ำ
1. `git log --all` ไม่มี .env / PAT / webhook  2. author ทุก commit = นามแฝง/noreply  3. โปรไฟล์ GitHub ไม่มีชื่อจริง/บริษัท/รูปหน้า  4. CI main เขียว  5. README = ผลงาน ไม่ใช่การบ้าน · ข้อใดไม่ผ่าน = ถอดลิงก์ + คำเคลม

## Gate
(a) ก่อน Lab 04: ล็อก H1/บรรทัดรอง/success copy · ลิงก์ GitHub + คำ "ตรวจสอบได้" เป็น slot เปิดปิด ห้ามฝัง URL ก่อน audit · UI รับ 501 = ซ่อนฟอร์ม + ช่องสำรองที่ตอบได้จริง (ห้ามอีเมล demo) · maxlength ตรง server
(b) ก่อน ship: C2 ครบ · R5 (เจ้าของ nopame / อ่าน ≥ สัปดาห์ละครั้ง / ลบ 90 วัน / ช่องตอบกลับจริง) · rate limit มี test · URL 200 + guard test เขียว · ต้องมีช่องติดต่อใช้ได้ ≥ 1 ไม่งั้นห้าม ship
