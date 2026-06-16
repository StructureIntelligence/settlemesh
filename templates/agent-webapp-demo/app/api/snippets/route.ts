// Managed-database CRUD for snippets.
// GET  /api/snippets        -> list the signed-in user's snippets
// POST /api/snippets        -> create a snippet { title, body }
//
// The table is created lazily on first call. SettleMesh's managed SQLite is
// reached server-side via lib/settlemesh.ts (dbQuery), never from the browser.

import { dbQuery, extractPayerToken } from "@/lib/settlemesh";

export const dynamic = "force-dynamic";

// The end user's session token doubles as a stable per-user key for scoping
// rows. In a real app you'd verify it against /__settle/me; for this demo we
// scope by the token (or "anonymous" when signed out).
function ownerKey(req: Request): string {
  return extractPayerToken(req) || "anonymous";
}

async function ensureTable() {
  await dbQuery(
    `create table if not exists snippets (
       id integer primary key autoincrement,
       owner text not null,
       title text not null,
       body text not null,
       created_at text not null default (datetime('now'))
     )`
  );
}

export async function GET(req: Request) {
  await ensureTable();
  const owner = ownerKey(req);
  const result = await dbQuery(
    "select id, title, body, created_at from snippets where owner = ? order by id desc limit 100",
    [owner]
  );
  if (result.error) {
    return Response.json({ error: result.error, snippets: [] }, { status: 200 });
  }
  return Response.json({ snippets: result.payload });
}

export async function POST(req: Request) {
  await ensureTable();
  const owner = ownerKey(req);
  let body: { title?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const title = (body.title || "").trim().slice(0, 200);
  const text = (body.body || "").trim().slice(0, 10000);
  if (!title || !text) {
    return Response.json({ error: "title and body are required" }, { status: 400 });
  }
  const result = await dbQuery(
    "insert into snippets (owner, title, body) values (?, ?, ?)",
    [owner, title, text]
  );
  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  return Response.json({ ok: true });
}
