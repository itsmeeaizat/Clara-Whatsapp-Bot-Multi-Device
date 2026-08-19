// CLARA WHATSAPP MULTIDEVICE, AIZAT, MADE IN INDONESIA
const POPCAT_BASE = "https://api.popcat.xyz";

function buildUrl(endpoint, params = {}) {
  const cleanEndpoint = String(endpoint).replace(/^\//, "");
  const url = new URL(`${POPCAT_BASE}/${cleanEndpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function popcatGet(endpoint, params = {}) {
  try {
    const url = buildUrl(endpoint, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Popcat API error: ${res.status} for ${endpoint}`);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

async function popcatImage(endpoint, params = {}) {
  try {
    const url = buildUrl(endpoint, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Popcat API error: ${res.status} for ${endpoint}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Expected image, got ${ct}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf;
  } catch (error) {
    throw error;
  }
}

async function popcatJSON(endpoint, params = {}) {
  try {
    const url = buildUrl(endpoint, params);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Popcat API error: ${res.status} for ${endpoint}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export { popcatGet, popcatImage, popcatJSON, buildUrl, POPCAT_BASE };
