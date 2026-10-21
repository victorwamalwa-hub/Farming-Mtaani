/* ============================================================
   FARMING MTAANI — APPLICATION LOGIC
   Plain JavaScript. No frameworks, no auth, no chat, no payments.
   ============================================================ */

/* ---------- STATE ---------- */
let farms = loadFarms();

/* ---------- LOCALSTORAGE (simple persistence) ---------- */
function loadFarms() {
    try {
        const saved = JSON.parse(localStorage.getItem("fm_farms"));
        return Array.isArray(saved) && saved.length ? saved : [...INITIAL_FARMS];
    } catch {
        return [...INITIAL_FARMS];
    }
}
function saveFarms() {
    localStorage.setItem("fm_farms", JSON.stringify(farms));
}

/* ---------- PAGE ROUTING (tab switching) ---------- */
function showPage(pageId) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
    document.getElementById(pageId)?.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(a => {
        a.classList.toggle("active", a.dataset.page === pageId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Any element with data-page switches tabs. */
function bindPageNavigation() {
    document.querySelectorAll("[data-page]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            showPage(el.dataset.page);
        });
    });
}

/* ---------- PRICES ---------- */
function renderPriceCountyOptions() {
    const select = document.getElementById("price-county");
    if (!select) return;
    const counties = [...new Set(PRICES.map(p => p.county))].sort();
    select.innerHTML =
        `<option value="">All Counties</option>` +
        counties.map(c => `<option value="${c}">${c}</option>`).join("");
}

function renderPrices() {
    const grid = document.getElementById("price-grid");
    if (!grid) return;

    const search = document.getElementById("price-search").value.toLowerCase().trim();
    const county = document.getElementById("price-county").value;

    const filtered = PRICES.filter(p =>
        p.crop.toLowerCase().includes(search) &&
        (county === "" || p.county === county)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<p>No prices match your search.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="grid-item price-card">
            <h3>${p.crop}</h3>
            <p class="price">KES ${p.price.toLocaleString()}</p>
            <p class="unit">per ${p.unit}</p>
            <p class="meta">📍 ${p.market}, ${p.county}</p>
        </div>
    `).join("");
}

/* ------------------------------------------------------------
   HOW TO SWAP IN A REAL API (uncomment to use):
   ------------------------------------------------------------
   async function fetchPrices() {
       const res = await fetch("https://example-agri-api.com/prices");
       const data = await res.json();
       PRICES.length = 0;
       PRICES.push(...data);
       renderPrices();
   }
   Then call fetchPrices() once on page load.
   ------------------------------------------------------------ */

/* ---------- FARMS ---------- */
function renderFarms() {
    const grid = document.getElementById("farm-grid");
    if (!grid) return;

    const filter = document.getElementById("farm-search").value.toLowerCase().trim();
    const filtered = farms.filter(f =>
        f.produce.toLowerCase().includes(filter) ||
        f.county.toLowerCase().includes(filter)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<p>No farms match your search.</p>`;
        return;
    }

    grid.innerHTML = filtered.map((f, i) => {
        const img = FARM_IMAGES[i % FARM_IMAGES.length];
        return `
            <div class="grid-item farm-card">
                <img src="${img}" alt="${f.name}" onerror="this.style.display='none'">
                <h3>${f.name}</h3>
                <p class="meta">📍 ${f.county}</p>
                <p>${f.produce}</p>
                <p class="contact">📞 ${f.contact || "Contact not provided"}</p>
            </div>
        `;
    }).join("");
}

function setupFarmForm() {
    const form = document.getElementById("farm-form");
    const toggleBtn = document.getElementById("toggle-form-btn");
    if (!form || !toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
        const hidden = form.style.display === "none" || form.style.display === "";
        form.style.display = hidden ? "block" : "none";
        toggleBtn.textContent = hidden ? "Close Form" : "+ Register Farm";
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newFarm = {
            id: Date.now(),
            name: document.getElementById("farm-name").value.trim(),
            county: document.getElementById("farm-county").value.trim(),
            produce: document.getElementById("farm-produce").value.trim(),
            contact: document.getElementById("farm-contact").value.trim()
        };
        if (!newFarm.name || !newFarm.county || !newFarm.produce) return;

        farms.push(newFarm);
        saveFarms();
        form.reset();
        form.style.display = "none";
        toggleBtn.textContent = "+ Register Farm";
        renderFarms();
    });
}

/* ---------- LESSONS (accordion) ---------- */
function setupLessons() {
    document.querySelectorAll(".lesson-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const lesson = toggle.closest(".lesson");
            const isOpen = lesson.classList.toggle("open");
            toggle.querySelector("span").textContent = isOpen ? "−" : "+";
        });
    });
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
    bindPageNavigation();
    renderPriceCountyOptions();
    renderPrices();
    renderFarms();
    setupFarmForm();
    setupLessons();

    document.getElementById("price-search")?.addEventListener("input", renderPrices);
    document.getElementById("price-county")?.addEventListener("change", renderPrices);
    document.getElementById("farm-search")?.addEventListener("input", renderFarms);
});