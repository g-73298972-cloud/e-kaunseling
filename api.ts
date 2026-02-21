const API_BASE = "https://e-kaunseling-api.g-73298972.workers.dev";

export async function saveEntry(module: string, dataObj: any) {
  const res = await fetch(`${API_BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module, data: dataObj }),
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out?.error || "Save failed");
  return out;
}

export async function getEntries(module?: string) {
  const url = module
    ? `${API_BASE}/entries?module=${encodeURIComponent(module)}`
    : `${API_BASE}/entries`;

  const res = await fetch(url);
  const out = await res.json();
  if (!res.ok) throw new Error(out?.error || "Load failed");
  return out.results || [];
}
