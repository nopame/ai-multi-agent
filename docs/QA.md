# QA — Personal Site

> Lab 06

## E2E Playwright

- วันที่: 2026-09-25 · ผู้ทดสอบ: Claude (Playwright MCP) · branch `lab-05b-swarm` @ `726f179`
- Target: `http://localhost:4321` (`PORT=4321` ใน `.env`) · `npm run dev` (Astro dev server)
- Demo data: ชื่อ `QA Demo` · อีเมล `demo@example.com`
- รอบนี้ไม่ได้แก้ `src/`

| # | Step | Expected | Result |
|---|---|---|---|
| 1 | เปิด Home `/` | มี displayName + headline จาก `docs/PROFILE.md` | ✅ 200 · `<h1>` = `nopame` · headline "Full-stack developer ที่วางระบบให้ทีม AI agent ส่งงานครบทุกชั้น" ครบ · มี Bio ย่อหน้าแรก + Audience · screenshot `home.png` |
| 2 | ไป About `/about` | ไม่ 404 | ✅ 200 · `<h1>About` · มีเนื้อหา |
| 3 | ไป Interests `/interests` | ไม่ 404 · รายการจาก PROFILE | ✅ 200 · 4 รายการตรง `## Interests` · screenshot `interests.png` |
| 4 | ไป Contact `/contact` | ไม่ 404 · มีฟอร์ม | ✅ 200 · ช่อง ชื่อ/อีเมล/ข้อความ มี label · honeypot `website` เป็น `aria-hidden` |
| 5 | ส่ง Contact ด้วย demo data | success | ✅ `POST /api/contact` → **201** · status "ได้รับข้อความแล้วครับ" · ฟอร์มล้างค่า · screenshot `contact-success.png` |
| 6 | ส่ง Contact อีเมลผิดรูปแบบ (fetch ตรง) | error ที่คาด (400 ปลอดภัย) | ✅ **400** `{"error":"ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง"}` · ไม่มี stack trace |
| 7 | เปิด Guestbook `/guestbook` | โหลดรายการ | ✅ 200 · `GET /api/guestbook` → 200 · payload `<img onerror>` เก่าแสดงเป็นข้อความ (ไม่ execute — XSS fix ยังได้ผล) |
| 8 | ลงชื่อ Guestbook ด้วย demo data | success + เห็น entry ใหม่ | ✅ `POST /api/guestbook` → **201** · status "ขอบคุณที่ฝากข้อความครับ" · entry "QA Demo: ทักทายจาก E2E Playwright" อยู่บนสุด · screenshot `guestbook-success.png` |
| 9 | URL ไม่มีอยู่ `/does-not-exist` | 404 | ✅ 404 (ยืนยันว่าข้อ 2–4 ไม่ใช่ 200 ปลอม) |
| 10 | Console errors ระหว่าง flow ฟอร์ม | 0 | ✅ 0 error (2 error ที่เห็นหลังข้อ 9 มาจาก fetch 400/404 ที่ยิงเองโดยตั้งใจ) |

Screenshots: `docs/screenshots/{home,interests,contact-success,guestbook-success}.png` (full page · dev toolbar ของ Astro ติดในภาพเพราะรันบน dev server)

### ข้อสังเกตจาก E2E → สถานะหลังรอบ a11y

| ข้อสังเกต | สถานะ |
|---|---|
| Guestbook: ข้อความกับเวลาติดกันใน a11y tree | ✅ แก้แล้ว — `<time datetime>` + ตัวคั่นสำหรับ screen reader |
| Guestbook อยู่ใน nav + การ์ด Home (D5 · L11) | ✅ ถอดแล้ว (หน้า `/guestbook` ยังเปิดได้ตรง ๆ) |
| ธีมพื้นเข้ม ไม่ตรง Tone ใน PROFILE (L3) | ⏸ ไม่แก้รอบนี้ — เป็นงาน redesign ของ Lab 04 redo · contrast ปัจจุบันผ่าน AA แล้ว (D10: contrast = Must, ชื่อสีไม่ขวาง ship) |
| Home มี eyebrow "Personal branding site" + รายการ Audience | ⏸ Lab 04 redo (#7 · D4) |
| DB dev (`data/`) มีข้อความทดสอบค้าง | ⏸ ยังไม่ลบ — รอผู้เรียนยืนยัน (L14) |

## A11y

- เครื่องมือ: axe-core 4.10.2 (ฉีดผ่าน Playwright MCP · WCAG 2 A/AA + best-practice) + ตรวจมือ (keyboard, reflow 360px, meta)
- Viewport 360×740 · ไม่รวม dev toolbar ของ Astro

| # | Check | ก่อนแก้ | หลังแก้ |
|---|---|---|---|
| 1 | axe violations (5 หน้า) | 0 | ✅ 0 (passes 27–36 rule/หน้า) |
| 2 | Color contrast | ต่ำสุดที่วัดได้ 6.62:1 (ผ่าน AA) · nav 6 จุด axe ตัดสินไม่ได้เพราะพื้นหลัง gradient — ค่าสี `#a5b4d4` บนพื้นเข้ม > 7:1 | เหมือนเดิม ✅ |
| 3 | Reflow 360px (ไม่มี scroll แนวนอน) | ✅ | ✅ |
| 4 | Focus มองเห็นได้ทุก element | ✅ ใช้ outline ของเบราว์เซอร์ | ✅ |
| 5 | Skip link (WCAG 2.4.1) | ❌ ไม่มี | ✅ Tab แรก = "ข้ามไปเนื้อหาหลัก" · Enter → focus `main#main` |
| 6 | `<meta description>` | ❌ 4 หน้าหลุดข้อความเกี่ยวกับคอร์ส (ค่า default ใน `BaseLayout`) — guard test ไม่เห็นเพราะอยู่ใน frontmatter | ✅ ใช้ headline จาก PROFILE · เพิ่ม test ใน `tests/public-site.test.ts` สแกน string ใน frontmatter |
| 7 | `<title>` สม่ำเสมอ | ❌ contact/guestbook ไม่มีชื่อเว็บ | ✅ "ติดต่อ · nopame" / "Guestbook · nopame" |
| 8 | Guestbook อ่านโดย screen reader | ❌ "hi25 ก.ย. 2569" ติดกัน | ✅ "…Playwright — 25 ก.ย. 2569 15:56" |
| 9 | Contact error microcopy (L13) | ❌ "…ลองอีกครั้ง — ลองใหม่อีกครั้งนะครับ" ซ้ำ | ✅ แสดงข้อความจาก server อย่างเดียว |
| 10 | Microcopy "ผม" (D9) | ❌ การ์ด Contact ใช้ "ฉัน" | ✅ "ส่งข้อความถึงผม" |

Verify หลังแก้: `npm test` 15/15 · `npm run test:labs` 2/2 · `npm run build` OK

## a11y Debate

> Input: ตาราง E2E + A11y ด้านบน + หน้า `/contact` (วัดเพิ่มด้วย Playwright MCP บน dev server · 2026-09-25) · facilitator: Claude · อ้างอิง D4 / D6 / D9 / D10 ใน `DECISIONS.md`

หลักฐานที่วัดเพิ่มบนหน้า Contact (axe ไม่ครอบคลุมข้อเหล่านี้):

| สิ่งที่วัด | ค่า | เกณฑ์ |
|---|---|---|
| ข้อความ label / h1 บน card | 12.35:1 | 1.4.3 ≥ 4.5 ✅ |
| ข้อความ `.note` (opacity 0.8) | 4.82:1 | ≥ 4.5 ✅ (เฉียด) |
| ตัวอักษรบนปุ่ม `ส่งข้อความ` | 7.34:1 | ✅ |
| **ขอบช่องกรอก `#243056` เทียบ card** | **1.07:1** | 1.4.11 ≥ 3 ❌ |
| พื้นช่องกรอก `#0f1528` เทียบ card | 1.32:1 | 1.4.11 ≥ 3 ❌ |
| Focus ring ปุ่ม (Tab) | outline `auto` ของเบราว์เซอร์ ~1px · เห็นได้แต่บาง (`docs/screenshots/contact-focus-button.png`) | 2.4.7 ✅ · ไม่ถึงแนว 2.4.13 |
| **Focus หลังกดส่ง** (mock `fetch` 201 ไม่เขียน DB) | ระหว่างส่ง + หลังส่ง = `BODY` | 2.4.3 ❌ — ปุ่มถูก `disabled` ขณะมี focus |
| Label ฟอร์ม | ครบ 3 ช่อง (`for`/`id`) · honeypot อยู่ใน `aria-hidden` + `tabindex=-1` | 1.3.1 / 4.1.2 ✅ |
| คำแนะนำก่อนกรอก | ทุกช่อง `required` แต่ไม่มีข้อความบอก · `.note` 90 วัน ไม่ถูกผูกกับฟอร์ม | 3.3.2 ⚠️ |
| ข้อความ error | server ตอบรวม "ข้อมูลไม่ถูกต้อง…" ไม่บอกว่าช่องไหน · แสดงใน `role=status` | 3.3.1 ⚠️ |
| Heading order | `/contact` = h1 เดียว · Home = h1 → h2 (การ์ด) · ไม่ข้ามระดับ | ✅ |

### Advocate

1. **ช่องกรอกแทบมองไม่เห็นขอบ** — 1.07:1 คือขอบ "ไม่มีอยู่จริง" สำหรับคนสายตาเลือนราง ผู้ใช้เห็นกล่องจากสีพื้นที่ต่างกัน 1.32:1 เท่านั้น ฟอร์มนี้คือ CTA เดียวของ recruiter (D4) ถ้าหาช่องกรอกไม่เจอ journey จบตรงนั้น D10 บอกว่า contrast = Must จึงต้องนับว่า**ขวาง ship**
2. **Focus หลุดหลังกดส่ง** — คนใช้ keyboard / screen reader กดส่งแล้วตำแหน่งกลับไปต้นหน้า ต้อง Tab ใหม่ตั้งแต่ nav ถึงจะรู้ว่าส่งแล้ว (ถึงแม้ `role=status` จะประกาศ แต่ตำแหน่งหายไป) เป็นการผิด 2.4.3 ตรง ๆ
3. **Focus ring บางเกิน** — ring อัตโนมัติของเบราว์เซอร์บนพื้นเข้มเหลือเส้นเดียวประมาณ 1px ควรมี `:focus-visible` ของเว็บเอง 2–3px
4. **ไม่บอกว่าทุกช่องจำเป็น และ error ไม่ชี้ช่อง** — ควรมีบรรทัด "กรอกให้ครบทุกช่อง" ผูก `aria-describedby` และเมื่อ 400 ควรบอกว่าช่องไหนผิดพร้อมย้าย focus ไปช่องนั้น
5. ขอให้ใส่การตรวจ axe + 1.4.11 ลงชุด Playwright ถาวร ไม่ใช่วัดมือครั้งเดียว

### Pragmatist

1. **เห็นด้วยว่า 1 เป็น P0** — แก้ได้ในบรรทัดเดียว (สีขอบ input) ใช้ไม่ถึง 5 นาที และ D10 ล็อกไว้แล้วว่า contrast คือ Must ไม่มีเหตุผลให้เลื่อน
2. **2 เป็น P0 เช่นกัน** — Contact เป็นช่องทางเดียวที่ recruiter ใช้ (D6) และแก้ได้โดยไม่แตะ API: คืน focus ให้ปุ่มใน `finally` หรือใช้ `aria-disabled` แทน `disabled` ใช้ประมาณ 10 นาที
3. **3 เป็น P1** — ring ปัจจุบัน*มองเห็นได้* จึงผ่าน 2.4.7 แล้ว แต่เพิ่ม `:focus-visible` global แค่ 3 บรรทัดใน `BaseLayout` ทำพร้อมกันได้ใน 30 นาทีเดียวกัน
4. **4 แยกเป็นสองส่วน** — บรรทัด "กรอกให้ครบทุกช่อง" + `aria-describedby` = P1 (ฝั่ง FE ล้วน) · error รายช่องจาก server = **P2 หลัง ship** เพราะต้องเปลี่ยนสัญญา API กับ OpenCode (ownership) และ native validation กันเคสทั่วไปไว้ให้แล้วก่อนถึง server
5. **5 เป็น P2** — ต้องเพิ่ม dependency (`@axe-core/playwright`) และ E2E ยังไม่อยู่ใน CI · ตอนนี้ใช้ผลวัดมือใน QA.md ไปก่อน
6. ธีมสว่างตาม Tone (L3) อยู่นอกรอบนี้ แต่**ต้องวัด 1.4.11 ใหม่ทั้งหมด**เมื่อเปลี่ยนธีม มิฉะนั้นจะแก้ไปฟรี

**ข้อสรุป:** P0 สองข้อ (ขอบ input · focus หลังส่ง) ต้องเสร็จก่อน ship · P1 สองข้อทำในรอบ 30 นาทีเดียวกัน · ที่เหลือหลัง ship

## a11y Action items (prioritized P0/P1/P2)

| ID | Priority | Action | WCAG | ไฟล์ | Owner | ประมาณ | ก่อน/หลัง ship |
|---|---|---|---|---|---|---|---|
| A1 ✅ | **P0** | ขอบ input/textarea เป็น `#7385b8` (3.79:1 เทียบ card · 4.99:1 เทียบพื้นช่อง) — ไม่แตะ `--border` ที่ card/nav ใช้ | 1.4.11 | `src/layouts/BaseLayout.astro` | Claude | 5 นาที | ก่อน |
| A2 ✅ | **P0** | หลังส่ง (ทั้ง success/error) คืน focus ให้ปุ่มส่งใน `finally` — ทำทั้ง contact และ guestbook | 2.4.3 | `src/pages/contact.astro` · `guestbook.astro` | Claude | 10 นาที | ก่อน |
| A3 ✅ | **P1** | `:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px }` แบบ global (accent เทียบ card 5.29:1) | 2.4.7 (→2.4.13) | `BaseLayout.astro` | Claude | 5 นาที | ก่อน |
| A4 ✅ | **P1** | เพิ่ม "กรอกให้ครบทุกช่อง" เหนือฟอร์ม + ผูกข้อความนั้นและ `.note` 90 วันด้วย `aria-describedby` | 3.3.2 | `contact.astro` | Claude | 10 นาที | ก่อน |
| A5 | P2 | Error รายช่อง: API ส่ง `field` กลับ → FE ชี้ช่อง + ย้าย focus | 3.3.1 / 3.3.3 | API (OpenCode) + `contact.astro` | OpenCode → Claude | — | หลัง |
| A6 | P2 | เพิ่ม `@axe-core/playwright` + test 1.4.11 ใน `playwright/` | — | `playwright/` · `package.json` | either | — | หลัง |
| A7 | P2 | วัด contrast + 1.4.11 ใหม่ทั้งเว็บหลังเปลี่ยนธีมตาม Tone (L3) | 1.4.3 / 1.4.11 | ทั้งเว็บ | Claude | — | เมื่อทำ L3 |

รวม A1–A4 ≈ 30 นาที

### Diff A1 (ผู้เรียนยืนยันแล้ว · ✅ แก้แล้ว 2026-09-25)

```diff
--- a/src/layouts/BaseLayout.astro
+++ b/src/layouts/BaseLayout.astro
@@ .. @@
       input, textarea, button {
         font: inherit; border-radius: 10px; border: 1px solid var(--border);
         background: #0f1528; color: var(--text); padding: 0.7rem 0.9rem; width: 100%;
       }
+      /* WCAG 1.4.11: field edge ≥ 3:1 against card (3.79:1) and field bg (4.99:1) */
+      input, textarea { border-color: #7385b8; }
       button { background: var(--accent); color: #081018; font-weight: 700; cursor: pointer; width: auto; }
```

ผลหลังแก้ (Playwright MCP): ขอบ name / email / message = `rgb(115,133,184)` → **3.79:1** เทียบ card · **4.99:1** เทียบพื้นช่อง ✅ 1.4.11 · ขอบ card/ปุ่มไม่เปลี่ยน (`#243056`) · axe 0 violation · `npm test` 15/15 · build OK · screenshot `docs/screenshots/contact-form-a1.png`

### A2–A4 (ผู้เรียนยืนยัน "ok" · ✅ แก้แล้ว 2026-09-25)

| ID | แก้ | ผลตรวจ (Playwright MCP · mock `fetch` ไม่เขียน DB) |
|---|---|---|
| A2 | `finally` คืน focus ให้ปุ่มส่ง — `contact.astro` + `guestbook.astro` | contact 201 → focus `#contact-submit` · contact 400 → focus `#contact-submit` · guestbook 201 → focus `#gb-submit` (เดิม = `BODY`) |
| A3 | `:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px }` ใน `BaseLayout.astro` | Tab ไปปุ่มเห็น ring 3px ชัด (`docs/screenshots/contact-focus-button.png`) |
| A4 | `<p id="form-hint">กรอกให้ครบทุกช่องนะครับ</p>` + `aria-describedby="form-hint retention-note"` บนฟอร์ม | อ้าง id ครบทั้ง 2 ตัว ไม่มี id หาย |

หลังแก้: axe 0 violation ทั้ง 5 หน้า · ไม่มี scroll แนวนอนที่ 360px · `npm test` 15/15 · `npm run test:labs` 2/2 · `npm run build` OK
