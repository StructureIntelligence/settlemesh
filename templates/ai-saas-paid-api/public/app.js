// Front-end SPA. Talks ONLY to this app's own /api/* routes — never to SettleMesh directly, and never
// sees the runtime key. The server forwards the signed-in user's session as X-Settle-Payer so the
// logged-in user's Aev wallet is charged (end-user-pays).

const $ = (s) => document.querySelector(s);
const runBtn = $("#runBtn");
const statusEl = $("#status");
const resultPanel = $("#resultPanel");
const resultEl = $("#result");
const costTag = $("#costTag");

const state = { loggedIn: false, estimate: 2 };

const fmt = (n) => (Math.round(n * 100) / 100).toString();

function updateRunEnabled() {
  runBtn.disabled = !(state.loggedIn && $("#prompt").value.trim().length > 0);
}

function setStatus(msg, kind) {
  statusEl.textContent = msg || "";
  statusEl.className = "status" + (kind ? " " + kind : "");
}

async function loadMe() {
  try {
    const j = await (await fetch("/api/me")).json();
    state.loggedIn = !!j.logged_in;
    if (typeof j.estimate_aev === "number") { state.estimate = j.estimate_aev; $("#estVal").textContent = fmt(j.estimate_aev); }
    const chip = $("#authChip");
    if (state.loggedIn) { chip.textContent = "✓ Signed in"; chip.className = "chip ok"; $("#loginBanner").hidden = true; }
    else { chip.textContent = "Not signed in"; chip.className = "chip chip-muted"; $("#loginBanner").hidden = false; }
  } catch { /* ignore */ }
  updateRunEnabled();
}

async function run() {
  if (runBtn.disabled) return;
  const prompt = $("#prompt").value.trim();
  if (!prompt) return;

  runBtn.classList.add("busy");
  runBtn.disabled = true;
  setStatus(`Running… (≈ ${fmt(state.estimate)} Aev, billed to your wallet)`, "");

  try {
    const r = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const j = await r.json();

    if (r.status === 401) {
      state.loggedIn = false;
      $("#loginBanner").hidden = false;
      setStatus("Please sign in with SettleMesh to run.", "err");
      return;
    }
    if (r.status === 402) {
      // Out of Aev — point the user to the hosted top-up checkout, then they can come back and run.
      setStatus(j.message || "Not enough Aev.", "err");
      if (j.topup) {
        const a = document.createElement("a");
        a.href = j.topup; a.className = "btn btn-primary topup-link"; a.textContent = "Add Aev";
        statusEl.appendChild(document.createTextNode(" "));
        statusEl.appendChild(a);
      }
      return;
    }
    if (!r.ok || !j.ok) {
      setStatus(j.message || j.error || "The call failed — you were not charged.", "err");
      return;
    }

    // Show the result and the ACTUAL amount charged when the server reported it, else the estimate.
    resultPanel.hidden = false;
    resultEl.textContent = j.text || "(empty response)";
    const actual = (typeof j.cost_aev === "number" && j.cost_aev > 0) ? j.cost_aev : state.estimate;
    const exact = typeof j.cost_aev === "number" && j.cost_aev > 0;
    costTag.textContent = `${exact ? "" : "≈ "}${fmt(actual)} Aev charged`;
    setStatus(`Done · ${exact ? "" : "≈ "}${fmt(actual)} Aev charged to your wallet.`, "ok");
  } catch {
    setStatus("Network error — please try again. You were not charged.", "err");
  } finally {
    runBtn.classList.remove("busy");
    updateRunEnabled();
  }
}

runBtn.addEventListener("click", run);
$("#prompt").addEventListener("input", updateRunEnabled);
$("#prompt").addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
});

loadMe();
