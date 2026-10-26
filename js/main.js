/* ============================================================
   ENTRY POINT
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialise UI immediately with local data.
  initApp();

  // 2. Try fetching from the API layer.
  const response = await fetchPricesFromKilimoSTAT();

  // 3. Update the UI with the API data (or fallback data).
  updatePrices(response.data);

  // 4. Update the status message on the Prices page.
  const statusEl = document.getElementById("api-status");
  if (statusEl) {
    if (response.error) {
      statusEl.textContent = `⚠️ Live API unavailable (${response.error}). Showing cached sample data.`;
      statusEl.style.color = "#b45309";
    } else {
      statusEl.textContent = `✅ Prices loaded from ${response.source}`;
      statusEl.style.color = "#2e7d32";
    }
  }
});