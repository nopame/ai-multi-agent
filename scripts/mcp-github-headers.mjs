// headersHelper สำหรับ GitHub MCP (.mcp.json) — พิมพ์ JSON headers ออก stdout
// ใช้ GITHUB_PERSONAL_ACCESS_TOKEN จาก process env ก่อน ถ้าไม่มีอ่านจาก .env ที่ root
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = 'GITHUB_PERSONAL_ACCESS_TOKEN';

function fromDotEnv() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
  try {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*GITHUB_PERSONAL_ACCESS_TOKEN\s*=\s*(.*)\s*$/);
      if (m) return m[1].replace(/^(['"])(.*)\1$/, '$2').trim();
    }
  } catch {}
  return '';
}

const token = (process.env[KEY] || '').trim() || fromDotEnv();
if (!token) {
  console.error(`${KEY} not set (process env or .env)`);
  process.exit(1);
}
process.stdout.write(JSON.stringify({ Authorization: `Bearer ${token}` }));
