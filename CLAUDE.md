# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Claude Code — seed คอร์ส (อย่าลบตอน /init)

หลัง Lab 00 ให้ `/init` **merge** — เก็บกฎด้านล่างไว้เสมอ

## สี่เสา (ย่อ)

1. Multi-Agent แยกหน้าที่/ความจำ · 2. Sub-Agent ใช้แล้วทิ้ง · 3. ประสานผ่าน docs/PR · 4. Swarm เพดาน **20 turns**

## Ownership (บังคับ)

| Artifact | Owner |
|---|---|
| UI | Claude · `.claude/agents/frontend.md` |
| API + SQLite | OpenCode · `.opencode/agents/backend.md` |
| docs PROFILE / DEBATE / DECISIONS | Claude (Lab 01–02) |
| Hot state STATUS / OPEN_LOOPS | ผู้ถืองานรอบนั้น (single-writer) |

## Canonical context (อ่านก่อน · อย่าคัดลอกซ้ำในไฟล์นี้)

ก่อนลงมือ:

1. `docs/STATUS.md`
2. `docs/OPEN_LOOPS.md`
3. handoff ล่าสุดใน `docs/handoffs/` (ถ้ามี)
4. ตามงาน: `docs/PROFILE.md` · `docs/DECISIONS.md`

สรุป Goal / Latest D-id / Open loops / Blockers **ไม่เกิน 8 บรรทัด**  
ห้ามสมมุติจากแชท OpenCode ถ้าไม่มีใน `docs/`  
จบงานที่เปลี่ยนสถานะ → อัปเดต STATUS / OPEN_LOOPS · สลับ harness → เขียน handoff จาก [`docs/handoffs/TEMPLATE.md`](docs/handoffs/TEMPLATE.md)

## กฎสั้น

- Root เท่านั้น · plugin **project scope**
- Skill **`public-site-safe`**
- Agent ถาวรใช้ `memory: project` (harness) — ตรวจใน Lab 00 · ห้ามสร้าง memory bus เอง
- **Ownership: Frontend = Claude · Backend = OpenCode** — ห้ามแก้ `src/lib/db.ts` / `src/pages/api/**` จากฝั่ง Claude
- MCP ไม่ใช่ท่อ Claude ↔ OpenCode — **ห้ามใช้ MCP เป็นท่อส่งงาน** · Cross-CLI เฉพาะ Lab 07
- ห้าม commit `.env` · PR เข้า learner repo เท่านั้น
- Swarm: หยุดเมื่อ done หรือครบ 20 turns
- STATUS/OPEN_LOOPS = single-writer · commit ก่อนสลับ harness

## Commands (จาก /init)

Node ≥ 22.12 · Windows/PowerShell เป็นหลัก

```powershell
npm run dev                  # Astro dev server :4321 (host: true)
npm test                     # Vitest — tests/**/*.test.ts ยกเว้น tests/labs/** (ต้องเขียวเสมอ · CI รันตัวนี้ + build)
npm run test:labs            # Vitest labs config — tests/labs/** · RED โดยตั้งใจจนกว่า Lab 05 เสร็จ
npx vitest run tests/smoke.test.ts            # รันไฟล์เดียว
npx vitest run -t "rendered markup"           # รันตามชื่อ test
npx vitest run -c vitest.labs.config.ts tests/labs/lab05-api.test.ts   # ไฟล์ใน tests/labs ต้องใส่ -c
.\scripts\preflight.ps1      # ตรวจเครื่องมือ (node/git/gh/claude/opencode/bun) ก่อนเริ่ม
npm run test:e2e             # Playwright (playwright/) · ต้องมี server รันที่ PLAYWRIGHT_BASE_URL (default http://127.0.0.1:4321)
npm run build; npm start     # build → node ./dist/server/entry.mjs
```

ไม่มี lint script · CI (`.github/workflows/ci.yml`) = `npm ci` → `npm test` → `npm run build`

## Architecture (ภาพรวม)

- **Astro SSR** (`output: 'server'`, `@astrojs/node` standalone) — ทุกหน้าและ API ใช้ `prerender = false` · `SITE_URL` จาก env
- **Profile เป็น content source:** `src/lib/profile.ts` parse `docs/PROFILE.md` ตามหัวข้อ `## Name` / `## Headline` / `## Bio` / `## Audience` / `## Interests` (bullet list) → ใช้ในหน้า `.astro` และ `GET /api/interests` · หัวข้อว่าง/ไฟล์หายจะใช้ `FALLBACK` — ข้อความ FALLBACK ต้องไม่มีคำเกี่ยวกับคอร์ส · Docker copy `docs/` เข้า image เพราะเหตุนี้ (เปลี่ยนรูปแบบหัวข้อ PROFILE = ต้องแก้ parser)
- **SQLite:** `src/lib/db.ts` — `getDb()` lazy singleton สร้าง `${DATA_DIR || ./data}/site.sqlite` + ตาราง `contact_messages`, `guestbook` · `insertContact` / `listGuestbook` / `insertGuestbook` เป็น stub ที่ throw `NOT_IMPLEMENTED…` (งาน OpenCode Lab 05) · singleton จับ `DATA_DIR` ตอนเรียกครั้งแรก — ตั้ง env ก่อน import/`getDb()` · labs test ใช้ `data/vitest-lab/` (อยู่ใต้ `data/` ที่ gitignore)
- **API routes** (`src/pages/api/{contact,guestbook,interests}.ts`) map error: ข้อความขึ้นต้น `NOT_IMPLEMENTED` → **501**, validation error อื่น → 400 (GET guestbook → 500) · หน้า UI ต้องรับมือ 501 ได้ก่อน backend เสร็จ
- **Guard test ห้ามข้อความคอร์สหลุด:** `tests/public-site.test.ts` สแกน `.astro`/`.html` ใน `src/` (ตัด frontmatter + HTML comment) ด้วย regex `lab <n>` / `แล็บ` — อ้าง Lab ได้เฉพาะในคอมเมนต์หรือไฟล์ `.ts`
- **UI:** `src/layouts/BaseLayout.astro` ถือ global styles (CSS vars `--bg`, `--card`, `--accent` …) + nav · `lang="th"`
- **Docker:** multi-stage `node:22-bookworm-slim` (ต้องมี python3/make/g++ เพื่อ build `better-sqlite3`) · runtime `DATA_DIR=/data` เป็น volume · `SITE_URL` ส่งเป็น build arg
- **Claude harness ในโปรเจกต์:** agents `.claude/agents/{frontend,reviewer}.md` (ทั้งคู่ `memory: project` → `.claude/agent-memory/<name>/` commit ได้ · `.claude/agent-memory-local/` ถูก gitignore) · skills `.claude/skills/{public-site-safe,opencode}` (`opencode` = เรียก `opencode run` headless, ท่อ = ไฟล์ใน `docs/`) · `.claude/settings.json.example`, `.mcp.json.example` เป็นแม่แบบ (`.mcp.json` และ `.claude/settings.local.json` ถูก gitignore)
- Hot state (`docs/STATUS.md`, `docs/OPEN_LOOPS.md`) เริ่มจาก `*.example` — ถ้ายังไม่มีไฟล์จริงให้ copy จาก example

## Labs

ดู [`labs/README.md`](labs/README.md) · เริ่ม [`lab-00-project-init`](labs/lab-00-project-init/README.md)
