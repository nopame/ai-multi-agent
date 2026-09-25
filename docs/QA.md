# QA — Personal Site

> E2E / responsive / a11y · Playwright (`npm run test:e2e`) · 2026-09-25 · ตรวจโดย Claude (frontend)

## Responsive (ตรวจทุกหน้า: `/` `/about` `/interests` `/contact` `/guestbook`)

| Viewport | อุปกรณ์ตัวอย่าง | Horizontal overflow | Tap target < 36px | ปุ่ม "ติดต่อผม" บน Home (bottom px / สูงจอ) |
|---|---|---|---|---|
| 320×568 | iPhone SE (รุ่นแรก) | ไม่มี | 0 | 495 / 568 ✅ |
| 360×640 | Android เล็ก | ไม่มี | 0 | 495 / 640 ✅ |
| 375×667 | iPhone SE (2/3) | ไม่มี | 0 | 495 / 667 ✅ |
| 390×844 | iPhone 12–15 | ไม่มี | 0 | 455 / 844 ✅ |
| 430×932 | iPhone Pro Max | ไม่มี | 0 | 385 / 932 ✅ |
| 768×1024 | iPad แนวตั้ง | ไม่มี | 0 | 434 / 1024 ✅ |
| 1024×768 | iPad แนวนอน | ไม่มี | 0 | 434 / 768 ✅ |
| 1366×768 | Laptop | ไม่มี | 0 | 434 / 768 ✅ |
| 1920×1080 | Desktop | ไม่มี | 0 | 434 / 1080 ✅ |

แก้ระหว่างตรวจ:
- 320×568: เดิมปุ่มติดต่ออยู่ที่ 700px (ต้องเลื่อนจอ) → ≤ 480px ยกปุ่มขึ้นก่อนย่อหน้าแนะนำ + ลด padding ของ card
- nav มือถือ: brand แยกแถวบน · ลิงก์สูง ≥ 36px (ลิงก์ nav บน desktop สูง 44px)
- Interests: เดิม grid 3+1 มีใบเดี่ยวค้างแถว → 2×2 ตั้งแต่ 768px · คอลัมน์เดียวบนมือถือ

## Flow ที่ทดสอบกับ backend จริง

- Contact: ส่งแล้วขึ้น "ได้รับข้อความแล้วครับ" · ตัวนับ `n/1000` ทำงาน · อีเมลผิดรูปแบบถูกเตือนตั้งแต่ฝั่ง client
- Contact สถานะ A: API ตอบ 501 → ซ่อนฟอร์มแล้วแสดงช่องทางสำรอง (ตรวจตอนที่ backend ยังเป็น stub)
- Guestbook: ลงชื่อแล้วเห็นรายการใหม่ · payload `<img onerror>` แสดงเป็นข้อความธรรมดา ไม่ถูกรัน (D14)

## Specs

- `playwright/smoke.spec.ts` · `playwright/responsive.spec.ts` (5 viewports × 5 หน้า + CTA above the fold) · `playwright/forms.spec.ts` (เขียนลง dev DB · ห้ามรันกับ production)
- ผลล่าสุด: ผ่านทั้งหมด · `forms.spec.ts` ใช้โควตา rate limit (5 ครั้ง / 10 นาที / IP) ถ้ารันถี่อาจได้ 429

## ยังไม่ได้ตรวจ

- อุปกรณ์จริง (iOS Safari / Android Chrome) — ตรวจแค่ Chromium emulation
- screen reader (NVDA / VoiceOver) · contrast วัดจากค่าสีที่เลือก (ข้อความหลัก #0f172a / #334155 บนพื้นขาว · ปุ่มส้ม #c2410c ตัวอักษรขาว ≈ 5.2:1)
