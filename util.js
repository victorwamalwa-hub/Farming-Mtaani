/* ============================================================
   UTILITY HELPERS
   ============================================================ */

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function matchesQuery(text, query) {
  return String(text)
    .toLowerCase()
    .includes(String(query).toLowerCase().trim());
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatKES(amount) {
  return "KES " + Number(amount).toLocaleString("en-KE");
}
