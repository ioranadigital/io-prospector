// backend/utils/fetch-with-retry.js
// Reintenta con backoff exponencial ante bloqueos transitorios (403/429).
// No reintenta otros errores (4xx/5xx que no sean de rate-limit) para no
// convertir la prospección en fuerza bruta contra el sitio objetivo.
export async function fetchWithRetry(url, options = {}, { retries = 2, baseDelayMs = 800 } = {}) {
  let lastRes;
  for (let attempt = 0; attempt <= retries; attempt++) {
    lastRes = await fetch(url, options);
    if (lastRes.status !== 429 && lastRes.status !== 403) return lastRes;
    if (attempt === retries) return lastRes;
    const delay = baseDelayMs * 2 ** attempt + Math.random() * 300;
    await new Promise(r => setTimeout(r, delay));
  }
  return lastRes;
}

export default { fetchWithRetry };
