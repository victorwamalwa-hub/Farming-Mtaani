/* ============================================================
   FARMING MTAANI — APPLICATION LOGIC
   ============================================================ */

let farms = readStorage("fm_farms", INITIAL_FARMS);
let currentPrices = PRICES;
let compareMode = false;

/* ---------- DASHBOARD ---------- */
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function loadDashboardStats() {
    animateValue("stat-counties", 0, COUNTIES.length, 1500);
    animateValue("stat-crops", 0, CROP_CATEGORIES.length - 1, 1500);
    animateValue("stat-prices", 0, currentPrices.length, 1500);
    animateValue("stat-diseases", 0, DISEASES.length, 1500);
}

/* ---------- ROUTING ---------- */
function showPage(pageId) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(pageId);
    if (target) target.classList.add("active");
    document.querySelectorAll(".nav-link").forEach(l => {
        l.classList.toggle("active", l.dataset.page === pageId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindPageNavigation() {
    document.querySelectorAll("[data-page]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            showPage(el.dataset.page);
        });
    });
}

/* ---------- PRICE FILTERS ---------- */
function populatePriceFilters() {
    const countySelect = document.getElementById("price-county");
    if (countySelect) {
        const counties = [...new Set(currentPrices.map(p => p.county))].sort();
        countySelect.innerHTML = '<option value="">All Counties</option>' +
            counties.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    }
    const catSelect = document.getElementById("price-category");
    if (catSelect) {
        catSelect.innerHTML = CROP_CATEGORIES.map(c =>
            `<option value="${c}">${c}</option>`).join("");
    }
    const rangeSelect = document.getElementById("price-range");
    if (rangeSelect) {
        rangeSelect.innerHTML = PRICE_RANGES.map((r, i) =>
            `<option value="${i}">${r.label}</option>`).join("");
    }
}

function renderPrices() {
    const grid = document.getElementById("price-grid");
    if (!grid) return;

    const search = document.getElementById("price-search").value;
    const county = document.getElementById("price-county").value;
    const category = document.getElementById("price-category").value;
    const rangeIndex = document.getElementById("price-range").value;
    const activeRange = PRICE_RANGES[rangeIndex];

    const filtered = currentPrices.filter(p => {
        const matchSearch = matchesQuery(p.crop, search);
        const matchCounty = county === "" || p.county === county;
        const matchCategory = category === "All" || p.category === category;
        const matchPrice = p.price >= activeRange.min && p.price <= activeRange.max;
        return matchSearch && matchCounty && matchCategory && matchPrice;
    });

    if (filtered.length === 0) {
        grid.innerHTML = "<p>No prices match your search.</p>";
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="grid-item price-card">
            <h3>${escapeHtml(p.crop)}</h3>
            <p class="price">${formatKES(p.price)}</p>
            <p class="unit">per ${escapeHtml(p.unit)}</p>
            <p class="meta">📍 ${escapeHtml(p.market)}, ${escapeHtml(p.county)}</p>
        </div>
    `).join("");
}

/* ---------- COMPARISON VIEW ---------- */
function groupPricesByCrop(prices) {
    return prices.reduce((groups, p) => {
        if (!groups[p.crop]) groups[p.crop] = [];
        groups[p.crop].push(p);
        return groups;
    }, {});
}

function renderComparisonView() {
    const grid = document.getElementById("price-grid");
    if (!grid) return;

    const grouped = groupPricesByCrop(currentPrices);
    const cropList = Object.keys(grouped).map(crop => ({ crop, entries: grouped[crop] }));
    cropList.sort((a, b) => a.crop.localeCompare(b.crop));

    if (cropList.length === 0) {
        grid.innerHTML = "<p>No crop data to compare.</p>";
        return;
    }

    grid.innerHTML = cropList.map(({ crop, entries }) => {
        const pricesOnly = entries.map(e => e.price);
        const minPrice = Math.min(...pricesOnly);
        const maxPrice = Math.max(...pricesOnly);
        const avgPrice = Math.round(pricesOnly.reduce((s, p) => s + p, 0) / pricesOnly.length);

        const rows = entries.map(e => `
            <tr>
                <td style="padding:6px; border-bottom:1px solid #e8f5e9;">${escapeHtml(e.county)}</td>
                <td style="padding:6px; border-bottom:1px solid #e8f5e9;">${escapeHtml(e.market)}</td>
                <td style="padding:6px; border-bottom:1px solid #e8f5e9;">${formatKES(e.price)} <small>per ${escapeHtml(e.unit)}</small></td>
            </tr>
        `).join("");

        return `
            <div class="grid-item price-card" style="grid-column: 1 / -1;">
                <h3>${escapeHtml(crop)}</h3>
                <p class="price">${formatKES(avgPrice)} <small>avg</small></p>
                <p class="unit">Low: ${formatKES(minPrice)} · High: ${formatKES(maxPrice)}</p>
                <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.9rem;">
                    <thead><tr style="background:#e8f5e9;">
                        <th style="padding:6px; text-align:left;">County</th>
                        <th style="padding:6px; text-align:left;">Market</th>
                        <th style="padding:6px; text-align:left;">Price</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }).join("");
}

/* ---------- FARMS ---------- */
function renderFarms() {
    const grid = document.getElementById("farm-grid");
    if (!grid) return;
    const filter = document.getElementById("farm-search").value;
    const filtered = farms.filter(f =>
        matchesQuery(f.produce, filter) || matchesQuery(f.county, filter));
    if (filtered.length === 0) {
        grid.innerHTML = "<p>No farms match your search.</p>";
        return;
    }
    grid.innerHTML = filtered.map((f, i) => {
        const img = FARM_IMAGES[i % FARM_IMAGES.length];
        return `
            <div class="grid-item farm-card">
                <img src="${img}" alt="${escapeHtml(f.name)}" onerror="this.style.display='none'">
                <h3>${escapeHtml(f.name)}</h3>
                <p class="meta">📍 ${escapeHtml(f.county)}</p>
                <p>${escapeHtml(f.produce)}</p>
                <p class="contact">📞 ${escapeHtml(f.contact || "Contact not provided")}</p>
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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newFarm = {
            name: document.getElementById("farm-name").value.trim(),
            county: document.getElementById("farm-county").value.trim(),
            produce: document.getElementById("farm-produce").value.trim(),
            contact: document.getElementById("farm-contact").value.trim()
        };

        if (!newFarm.name || !newFarm.county || !newFarm.produce) {
            alert("Please fill in all required fields.");
            return;
        }

        // Loading state
        toggleBtn.disabled = true;
        toggleBtn.textContent = "Saving...";

        try {
            const saved = await createFarm(newFarm);
            farms.push(saved);
            renderFarms();
            form.reset();
            form.style.display = "none";
        } catch (err) {
            alert(`Could not save farm: ${err.message}`);
        } finally {
            toggleBtn.disabled = false;
            toggleBtn.textContent = "+ Register Farm";
        }
    });
}

/* ---------- LESSONS ---------- */
function renderDiseaseLessons() {
    const filter = document.getElementById("disease-filter")?.value || "All";
    document.querySelectorAll(".lesson").forEach(lesson => {
        const title = lesson.querySelector(".lesson-toggle").textContent.toLowerCase();
        const visible = filter === "All" || title.includes(filter.toLowerCase());
        lesson.style.display = visible ? "flex" : "none";
    });
}

function setupLessons() {
    document.querySelectorAll(".lesson-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const lesson = toggle.closest(".lesson");
            const isOpen = lesson.classList.toggle("open");
            toggle.querySelector("span").textContent = isOpen ? "−" : "+";
        });
    });
    const filterSelect = document.getElementById("disease-filter");
    if (filterSelect) filterSelect.addEventListener("change", renderDiseaseLessons);
}

/* ---------- INIT ---------- */
async function initApp() {
    bindPageNavigation();
    loadDashboardStats();
    populatePriceFilters();
    renderPrices();

    // Try to load farms from backend; fall back to localStorage
    try {
        const remoteFarms = await fetchFarms();
        if (Array.isArray(remoteFarms) && remoteFarms.length > 0) {
            farms = remoteFarms;
        }
    } catch (err) {
        console.warn("Using local farms:", err.message);
    }
    renderFarms();

    setupFarmForm();
    setupLessons();

    const ps = document.getElementById("price-search");
    if (ps) ps.addEventListener("input", renderPrices);

    const pc = document.getElementById("price-county");
    if (pc) pc.addEventListener("change", renderPrices);

    const pcat = document.getElementById("price-category");
    if (pcat) pcat.addEventListener("change", renderPrices);

    const pr = document.getElementById("price-range");
    if (pr) pr.addEventListener("change", renderPrices);

    const fs = document.getElementById("farm-search");
    if (fs) fs.addEventListener("input", renderFarms);
}

/* ---------- UPDATE (called by main.js) ---------- */
function updatePrices(prices) {
    if (Array.isArray(prices) && prices.length > 0) {
        currentPrices = prices;
        populatePriceFilters();
        renderPrices();
    }
}