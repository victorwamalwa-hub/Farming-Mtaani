/* ============================================================
   FARMING MTAANI — API LAYER
   Uses JSON Server as the mock REST backend.
   Endpoint base: http://localhost:3000 (local)
             or: https://your-app.onrender.com (deployed)
   ============================================================ */

const API_BASE = window.location.origin;

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
        return { data: prices, source: "JSON Server (live)", error: null };
    } catch (err) {
        console.warn("[api] JSON Server unreachable, using cached data:", err.message);
        return { data: [...PRICES], source: "Cached sample data", error: err.message };
    }
}

/* ---------- FARMS ---------- */
async function fetchFarms() {
    try {
        return await api.get("farms");
    } catch (err) {
        console.warn("[api] Falling back to cached farms:", err.message);
        return [...INITIAL_FARMS];
    }
}

async function createFarm(farm) {
    try {
        return await api.post("farms", farm);
    } catch (err) {
        console.warn("[api] POST failed, saving locally:", err.message);
        const farms = readStorage("fm_farms", INITIAL_FARMS);
        const newFarm = { ...farm, id: Date.now() };
        farms.push(newFarm);
        writeStorage("fm_farms", farms);
        return newFarm;
    }
}

async function updateFarm(id, changes) {
    try {
        return await api.patch("farms", id, changes);
    } catch (err) {
        console.warn("[api] PATCH failed:", err.message);
        throw err;
    }
}

async function replaceFarm(id, farm) {
    try {
        return await api.put("farms", id, farm);
    } catch (err) {
        console.warn("[api] PUT failed:", err.message);
        throw err;
    }
}

async function deleteFarm(id) {
    try {
        return await api.del("farms", id);
    } catch (err) {
        console.warn("[api] DELETE failed:", err.message);
        throw err;
    }
}