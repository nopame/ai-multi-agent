# Brand Strategist — MEMORY

## บทบาท
- persona ใน debate (Lab 02) ดูแลเรื่อง positioning / headline vs tagline / audience / โทน ของเว็บ nopame
- read-only ต่อ docs/ · เขียนได้เฉพาะไฟล์นี้ · มติสุดท้ายอยู่ที่ docs/DECISIONS.md (facilitator เป็นผู้ตั้ง D-id) ไม่ต้องคัดลอกมาไว้ที่นี่

## ถกใหม่ 2026-09-25 (DEBATE/DECISIONS ถูกลบ · รอบ 1–2)
- ข้อเสนอรอบ 1: B1 headline สองชั้น · B2 คำหลักต้องมีหลักฐาน · B3 Bio ≤3 ย่อหน้า (คุณค่า→หลักฐาน→CTA) · B4 ตัดช่อง "—" + GitHub คือตัวตนหลัก (หลัง audit)
- ถ้อยคำที่เสนอรอบ 2:
  - H1 "Full-stack developer"
  - บรรทัดรอง "ที่วางระบบให้ทีม AI agent ส่งงานได้ตั้งแต่ UI ถึงฐานข้อมูล" (เติม "ถึง deploy" ได้เมื่อ URL ตอบ 200 แล้วเท่านั้น)
  - Role statement (เป็นประโยคแรกของ Bio ไม่ใช่ tagline): "ผมเขียน spec และ review ทุก PR ส่วน agent แยกกันเขียน frontend และ backend"
- ตอบ UX: 5 วินาทีแรกคือ H1 + บรรทัดรอง ส่วน role statement อยู่ช่วง 10–30 วินาที → รวม role statement เข้า Bio ไม่ต้องเพิ่ม ## Tagline ใน parser
- ยอมรับ R1 (ตัด 5 ปี) · R2 (ไม่ใช้ "ครบทุกชั้น" เดี่ยว ๆ ให้ใช้ช่วงที่จับต้องได้แทน) · R8 (Bio ห้ามเล่า workflow แบบการบ้าน)
- ยังไม่ยอม: ตัดหลักฐานทิ้งถ้า audit ไม่ผ่าน (ต้องแก้ audit ไม่ใช่ตัดจุดขาย) · ต้องมี CTA หลักแค่ปุ่มเดียว ลิงก์ repo เป็นลิงก์รองได้เมื่อ audit ผ่านแล้วเท่านั้น · demo@example.com ไม่นับเป็นช่องทางติดต่อ
- Audience หน้าแรก: recruiter / hiring manager เท่านั้น · รายการ Audience เป็นโน้ตภายใน (เห็นด้วยกับ U4)
- Tone: สีสนุก ถ้อยคำนิ่ง

## เช็กในเซสชันถัดไป
- อ่าน docs/DECISIONS.md ว่า facilitator ปิด D-id ไหนแล้ว ถ้าปิดแล้วอย่าเปิดถกซ้ำโดยไม่มีเหตุผลใหม่
- Audit GitHub (git log / author / โปรไฟล์ / CI) ผ่านหรือยัง ก่อนใช้คำว่า "ตรวจสอบได้" หรือลิงก์ repo
- URL ตอบ 200 หรือยัง ก่อนใช้คำว่า "ถึง deploy"
