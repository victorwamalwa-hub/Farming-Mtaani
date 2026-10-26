/* ============================================================
   FARMING MTAANI — API LAYER
   Uses JSON Server as the mock REST backend.
   Endpoint base: http://localhost:3000 (local)
             or: https://your-app.onrender.com (deployed)
   ============================================================ */

const configuredApiBase = document.querySelector('meta[name="api-base-url"]')?.content.trim();
const API_BASE = (configuredApiBase || window.location.origin).replace(/\/+$/, "");

/* ---------- CORE REQUEST HANDLER ---------- */
async function request(method, path, body) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return res.status === 204 ? null : res.json();
}

/* ---------- RESTFUL METHODS ---------- */
const api = {
    // GET — read a collection or single item
    get: (resource, id) => request("GET", id ? `/${resource}/${id}` : `/${resource}`),

    // POST — create a new item
    post: (resource, data) => request("POST", `/${resource}`, data),

    // PUT — replace an existing item completely
    put: (resource, id, data) => request("PUT", `/${resource}/${id}`, data),

    // PATCH — update some fields of an existing item
    patch: (resource, id, data) => request("PATCH", `/${resource}/${id}`, data),

    // DELETE — remove an item
    del: (resource, id) => request("DELETE", `/${resource}/${id}`)
};

/* ---------- PRICES (with graceful fallback) ---------- */
async function fetchPricesFromKilimoSTAT() {
    try {
        const prices = await api.get("prices");
        if (!Array.isArray(prices) || prices.length === 0) {
            throw new Error("JSON Server returned no price records");
        }
        return { data: prices, source: "JSON Server", error: null };
    } catch (err) {
        console.warn("[api] JSON Server unreachable, using cached data:", err.message);
        return { data: [...PRICES], source: "Cached sample data", error: err.message };
    }
}

/* ---------- FARMS ---------- */
function getStoredFarms() {
    const storedFarms = readStorage("fm_farms", INITIAL_FARMS);
    return Array.isArray(storedFarms) ? storedFarms : [...INITIAL_FARMS];
}

function storeFarms(farms) {
    writeStorage("fm_farms", farms);
    return farms;
}

async function fetchFarms() {
    try {
        const farms = await api.get("farms");
        if (!Array.isArray(farms)) throw new Error("Invalid farms response");
        storeFarms(farms);
        return farms;
    } catch (err) {
        console.warn("[api] Falling back to cached farms:", err.message);
        return getStoredFarms();
    }
}

async function createFarm(farm) {
    try {
        const savedFarm = await api.post("farms", farm);
        storeFarms([...getStoredFarms(), savedFarm]);
        return savedFarm;
    } catch (err) {
        console.warn("[api] POST failed, saving locally:", err.message);
        const farms = getStoredFarms();
        const newFarm = { ...farm, id: Date.now() };
        farms.push(newFarm);
        storeFarms(farms);
        return newFarm;
    }
}

async function updateFarm(id, changes) {
    try {
        return await api.patch("farms", id, changes);
    } catch (err) {
        console.warn("[api] PATCH failed:", err.message);
        const farms = getStoredFarms();
        const index = farms.findIndex(farm => String(farm.id) === String(id));
        if (index === -1) throw err;
        farms[index] = { ...farms[index], ...changes };
        storeFarms(farms);
        return farms[index];
    }
}

async function replaceFarm(id, farm) {
    try {
        return await api.put("farms", id, farm);
    } catch (err) {
        console.warn("[api] PUT failed:", err.message);
        const farms = getStoredFarms();
        const index = farms.findIndex(item => String(item.id) === String(id));
        if (index === -1) throw err;
        farms[index] = farm;
        storeFarms(farms);
        return farm;
    }
}

async function deleteFarm(id) {
    try {
        return await api.del("farms", id);
    } catch (err) {
        console.warn("[api] DELETE failed:", err.message);
        const farms = getStoredFarms();
        const remainingFarms = farms.filter(farm => String(farm.id) !== String(id));
        if (remainingFarms.length === farms.length) throw err;
        storeFarms(remainingFarms);
        return null;
    }
}