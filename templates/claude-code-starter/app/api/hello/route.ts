export const dynamic = "force-dynamic";

const BASE = (process.env.SETTLEMESH_BASE_URL || "https://api.settlemesh.io").replace(/\/+$/, "");

// Example server route that touches the managed database.
// SettleMesh injects SETTLEMESH_PROJECT_ID and SETTLEMESH_PROJECT_SERVER_KEY
// into the runtime when the app declares a database in settlemesh.json.
async function dbQuery(sql: string) {
  const projectId = process.env.SETTLEMESH_PROJECT_ID;
  const serverKey = process.env.SETTLEMESH_PROJECT_SERVER_KEY;
  if (!projectId || !serverKey) {
    return { error: "database env not injected (SETTLEMESH_PROJECT_ID / SETTLEMESH_PROJECT_SERVER_KEY missing)" };
  }
  const res = await fetch(`${BASE}/v1/projects/${projectId}/database/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${serverKey}`, "content-type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {}
  return { status: res.status, payload };
}

export async function GET() {
  const result = await dbQuery("select 1 as ok");
  return new Response(
    JSON.stringify({ message: "hello from claude-code-starter", db: result }),
    { headers: { "content-type": "application/json" } }
  );
}
