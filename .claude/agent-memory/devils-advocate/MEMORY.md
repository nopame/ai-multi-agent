# MEMORY — devils-advocate

## บทบาท
Devil's Advocate ใน debate 3 บทบาท (Brand / UX / Devil) · หาช่องโหว่ privacy · overclaim · spam · scope creep · ไม่ประนีประนอมแทนบทบาทอื่น
ผลตัดสินจริงอยู่ที่ `docs/DECISIONS.md` (facilitator เป็นผู้เขียน) — ไฟล์นี้เป็นแค่ความจำฝั่งผม · D-id ที่ปิดแล้วห้ามเปิดถกซ้ำถ้าไม่มีเหตุผลใหม่

## สถานะ R สุดท้าย (debate รอบ 1–5 · 2026-09-25)
- R1 overclaim "5 ปี" → ปิด (ตัดตัวเลขออก headline/Bio)
- R2 "ครบทุกชั้น" vs agent เขียน backend → ลดระดับ (ใช้ได้เฉพาะคู่ประโยคบทบาท spec/review · ห้ามใช้คำเดี่ยว)
- R3 นามแฝง / GitHub โยงตัวตนจริง → blocker ก่อน ship (audit C2)
- R4 spam ฟอร์ม → ลดระดับ (honeypot + rate limit server + ตัวนับ 0/1000 · rate limit ต้องมี test)
- R5 ฟอร์มหลุมดำ → blocker ก่อนเปิดฟอร์ม (ฟอร์มซ่อนได้ ship ได้)
- R6 Guestbook → ปิด (ออกจาก Must · Later)
- R7 scope creep → ลดระดับ (Must เหลือ 4 ข้อ · ห้ามเพิ่ม Nice ก่อน Must ครบ)
- R8 Bio เหมือนการบ้าน → ปิด (Bio ≤ 3 ย่อหน้า พูดผลลัพธ์)

## C2 audit ขั้นต่ำ (ก่อนลิงก์ GitHub / คำว่า "ตรวจสอบได้")
1. `git log --all` ไม่มี .env / PAT / webhook ทุก commit
2. author name/email ทุก commit = นามแฝงหรือ noreply
3. โปรไฟล์ GitHub ไม่มีชื่อจริง / บริษัท / รูปหน้า
4. CI บน main เขียว
5. README บอกว่าเป็นผลงาน ไม่ใช่การบ้าน
ข้อใดไม่ผ่าน = ถอดลิงก์ + คำเคลม

## Gate
(a) ก่อน Lab 04: ล็อก headline / success copy / ตัด dropdown ใน DECISIONS · ลิงก์ GitHub + "ตรวจสอบได้" เป็น slot เปิดปิด ห้ามฝัง URL จริงก่อน audit · UI รับ 501 (ซ่อนฟอร์ม + ช่องสำรอง)
(b) ก่อน ship Lab 08: C2 ครบ 5 ข้อ · R5 (เจ้าของ nopame / อ่าน ≥ สัปดาห์ละครั้ง / ลบ 90 วัน / อีเมลตอบกลับจริง) ก่อนเปิดฟอร์ม · rate limit server มี test · URL 200 + guard test เขียว · "ถึง deploy" ในข้อความต้องจริงวัน ship
จุดยืนคงไว้: ต้องมีช่องติดต่อใช้ได้ ≥ 1 วัน ship ไม่งั้นห้าม ship

## สิ่งที่ยอม
- ใช้คำ "ครบทุกชั้น" ได้เมื่อมีประโยคบทบาทกำกับ (C1)
- ธีมสี: ชื่อสีไม่ขวาง ship แต่ contrast/อ่านง่ายอยู่ Must (ตาม UX)
- ฟอร์ม Contact ไม่ต้องเป็น Must — ship แบบซ่อนได้
- Headline แยก H1 + บรรทัดรอง (X1) โดยบรรทัดรองห้ามซ่อนบนมือถือ
- Interests คงหน้าเดิมแบบสั้น (X3) · ห้ามลบ /api/interests (ownership backend)
