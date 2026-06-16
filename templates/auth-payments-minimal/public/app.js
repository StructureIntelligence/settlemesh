// Tiny client. Talks ONLY to this app's /api/* — never to SettleMesh directly, never sees a key.
const $ = (id) => document.getElementById(id);
let spent = 0;

async function refresh() {
  const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({ logged_in: false }));
  $("price").textContent = me.estimate_aev != null ? `≈ ${me.estimate_aev} Aev` : "";
  $("signin").hidden = !!me.logged_in;
  $("app").hidden = !me.logged_in;
}

async function run() {
  $("run").disabled = true;
  $("err").hidden = true;
  $("out").hidden = true;
  try {
    const r = await fetch("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // TODO(you): send whatever your chosen capability needs in the body.
      body: JSON.stringify({}),
    });
    const data = await r.json();

    if (r.status === 401) {
      // Session expired or never signed in — show the sign-in branch again.
      location.href = data.login || "/__settle/login";
      return;
    }
    if (!r.ok || !data.ok) {
      $("err").textContent = "Action failed — nothing was charged. " + (data.error || "");
      $("err").hidden = false;
      return;
    }

    // Show the ACTUAL charge if the platform reported one, else the estimate (with ≈).
    const charged = data.cost_aev != null ? data.cost_aev : data.estimate_aev;
    spent += Number(charged) || 0;
    $("spentval").textContent = (Math.round(spent * 100) / 100).toString();
    $("spent").hidden = false;
    $("out").textContent = JSON.stringify(data.result, null, 2);
    $("out").hidden = false;
  } catch (e) {
    $("err").textContent = "Network error: " + (e && e.message);
    $("err").hidden = false;
  } finally {
    $("run").disabled = false;
  }
}

$("run").addEventListener("click", run);
refresh();
