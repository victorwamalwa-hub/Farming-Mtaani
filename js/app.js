/* ============================================================
   APPLICATION LOGIC
   ============================================================ */

let farms = readStorage("fm_farms", INITIAL_FARMS);
let currentPrices = PRICES;
let activeDiseaseFilter = "All";

/* ---------- DASHBOARD ANIMATION ---------- */
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function loadDashboardStats() {
    animateValue("stat-counties", 0, COUNTIES.length, 1500);
    animateValue("stat-crops", 0, CROP_CATEGORIES.length - 1, 1500); // -1 to exclude "All"
    animateValue("stat-prices", 0, currentPrices.length, 1500);
    animateValue("stat-diseases", 0, DISEASES.length, 1500);
}

/* ---------- PAGE ROUTING ---------- */
function showPage(pageId) {
    document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === pageId);
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

/* ---------- PRICES FILTERS ---------- */
function populatePriceFilters() {
    // 1. Populate Counties
    const countySelect = document.getElementById("price-county");
    if (countySelect) {
        const availableCounties = [...new Set(currentPrices.map(p => p.county))].sort();
        countySelect.innerHTML = '<option value="">All Counties</option>' + 
            availableCounties.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    }

    // 2. Populate Categories
    const categorySelect = document.getElementById("price-category").innerHTML
    if (categorySelect) {
        categorySelect.innerHTML = CROP_CATEGORIES.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join("");
    }

    // 3. Populate Price Ranges
    const rangeSelect = document.getElementById("price-range");
    if (rangeSelect) {
        rangeSelect.innerHTML = PRICE_RANGES.map((range, index) => 
            `<option value="${index}">${range.label}</option>`
        ).join("");
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
        const matchesSearch = matchesQuery(p.crop, search);
        const matchesCounty = county === "" || p.county === county;
        const matchesCategory = category === "All" || p.category === category;
        const matchesPrice = p.price >= activeRange.min && p.price <= activeRange.max;

        return matchesSearch && matchesCounty && matchesCategory && matchesPrice;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p>No prices match your search.</p>';
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
    
    //Grouping
    /**
 * Groups all prices by crop name, so we can show a comparison view.
 * Example output:
 * {
 *   "Tomatoes": [
 *     { county: "Kiambu", market: "Githurai", price: 120, unit: "kg" },
 *     { county: "Nairobi", market: "Kangemi", price: 130, unit: "kg" }
 *   ],
 *   "Maize": [ ... ],
 *   ...
 * }
 */
function groupPricesByCrop(prices) {
    return prices.reduce((groups, p) => {
        if (!groups[p.crop]) groups[p.crop] = [];
        groups[p.crop].push(p);
        return groups;
    }, {});
}

renderComparisonView()function renderComparisonView() {
     /**
 * Renders the comparison view: for each crop, list the price in every
 * county that sells it, plus min / max / average.
 */
function renderComparisonView() {
    const grid = document.getElementById("price-grid");
    if (!grid) return;

    // Group all prices by crop
    const grouped = groupPricesByCrop(currentPrices);

    // Convert to array of { crop, entries } for iteration
    const cropList = Object.keys(grouped).map(crop => ({
        crop,
        entries: grouped[crop]
    }));

    // Sort crops alphabetically
    cropList.sort((a, b) => a.crop.localeCompare(b.crop));

    if (cropList.length === 0) {
        grid.innerHTML = "<p>No crop data to compare.</p>";
        return;
    }

    grid.innerHTML = cropList.map(({ crop, entries }) => {

        // Calculate the three numbers we want to show per crop
        const pricesOnly = entries.map(e => e.price);
        const minPrice = Math.min(...pricesOnly);
        const maxPrice = Math.max(...pricesOnly);
        const avgPrice = Math.round(
            pricesOnly.reduce((sum, p) => sum + p, 0) / pricesOnly.length
        );

        // Build a small table row for every county that sells this crop
        const countyRows = entries.map(e => `
            <tr>
                <td>${escapeHtml(e.county)}</td>
                <td>${escapeHtml(e.market)}</td>
                <td>${formatKES(e.price)} <small>per ${escapeHtml(e.unit)}</small></td>
            </tr>
        `).join("");

        return `
            <div class="grid-item price-card" style="grid-column: 1 / -1;">
                <h3>${escapeHtml(crop)}</h3>
                <p class="price">${formatKES(avgPrice)} <small>average</small></p>
                <p class="unit">Lowest: ${formatKES(minPrice)} · Highest: ${formatKES(maxPrice)}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #e8f5e9;">
                            <th style="padding: 6px; text-align: left;">County</th>
                            <th style="padding: 6px; text-align: left;">Market</th>
                            <th style="padding: 6px; text-align: left;">Price</th>
                        </tr>
                    </thead>
                    <tbody>${countyRows}</tbody>
                </table>
            </div>
        `;
    }).join("");
}
}

/* ---------- FARMS (No changes) ---------- */
function renderFarms() {
    const grid = document.getElementById("farm-grid");
    if (!grid) return;

    const filter = document.getElementById("farm-search").value;
    const filtered = farms.filter(f => 
        matchesQuery(f.produce, filter) || matchesQuery(f.county, filter)
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p>No farms match your search.</p>';
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
        const isHidden = form.style.display === "none" || form.style.display === "";
        form.style.display = isHidden ? "block" : "none";
        toggleBtn.textContent = isHidden ? "Close Form" : "+ Register Farm";
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
        
        if (!newFarm.name || !newFarm.county || !newFarm.produce) {
            alert("Please fill in all required fields.");
            return;
        }

        farms.push(newFarm);
        writeStorage("fm_farms", farms);
        
        form.reset();
        form.style.display = "none";
        toggleBtn.textContent = "+ Register Farm";
        renderFarms();
    });
}

/* ---------- LESSONS & DISEASE FILTER ---------- */
function renderDiseaseLessons() {
    const filter = document.getElementById("disease-filter")?.value || "All";
    const lessons = document.querySelectorAll(".lesson");

    lessons.forEach(lesson => {
        // Get the title text from the h3 (e.g., "Fall Armyworm (Maize)")
        const title = lesson.querySelector(".lesson-toggle").textContent.toLowerCase();
        
        if (filter === "All") {
            lesson.style.display = "flex";
        } else if (title.includes(filter.toLowerCase())) {
            lesson.style.display = "flex";
        } else {
            lesson.style.display = "none";
        }
    });
}

function setupLessons() {
    // 1. Setup Accordion
    document.querySelectorAll(".lesson-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const lesson = toggle.closest(".lesson");
            const isOpen = lesson.classList.toggle("open");
            toggle.querySelector("span").textContent = isOpen ? "−" : "+";
        });
    });

    // 2. Setup Filter Listener
    const filterSelect = document.getElementById("disease-filter");
    if (filterSelect) {
        filterSelect.addEventListener("change", renderDiseaseLessons);
    }
}

/* ---------- INIT ---------- */
function initApp() {
    bindPageNavigation();
    loadDashboardStats();
    populatePriceFilters();
    renderPrices();
    renderFarms();
    setupFarmForm();
    setupLessons();

    // Safe listener binding — only attaches if the element exists
    const priceSearch = document.getElementById("price-search");
    if (priceSearch) priceSearch.addEventListener("input", renderPrices);

    const priceCounty = document.getElementById("price-county");
    if (priceCounty) priceCounty.addEventListener("change", renderPrices);

    const priceCategory = document.getElementById("price-category");
    if (priceCategory) priceCategory.addEventListener("change", renderPrices);

    const priceRange = document.getElementById("price-range");
    if (priceRange) priceRange.addEventListener("change", renderPrices);

    const farmSearch = document.getElementById("farm-search");
    if (farmSearch) farmSearch.addEventListener("input", renderFarms);
}

function updatePrices(prices) {
    if (Array.isArray(prices) && prices.length > 0) {
        currentPrices = prices;
        populatePriceFilters();
        renderPrices();
        if (document.getElementById("stat-prices")) {
            animateValue("stat-prices", 0, currentPrices.length, 1500);
        }
    }
}

// Compare view toggle
let compareMode = false;
const compareBtn = document.getElementById("compare-toggle-btn");
if (compareBtn) {
    compareBtn.addEventListener("click", () => {
        compareMode = !compareMode;
        if (compareMode) {
            compareBtn.textContent = "Back to Filter View";
            renderComparisonView();
        } else {
            compareBtn.textContent = "Compare by Crop Across Counties";
            renderPrices();
        }
    });
}

document.getElementById("price-category").addEventListener("change", renderPrices);
document.getElementById("price-range").addEventListener("change", renderPrices);