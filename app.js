/* ============================================================
   APPLICATION LOGIC
   ============================================================ */

let farms = readStorage("fm_farms", INITIAL_FARMS);
let currentPrices = PRICES;

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

function renderPriceCountyOptions(prices) {
    const select = document.getElementById("price-county");
    if (!select) return;
    
    const counties = [...new Set(prices.map(p => p.county))].sort();
    select.innerHTML = '<option value="">All Counties</option>' + 
        counties.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function renderPrices() {
    const grid = document.getElementById("price-grid");
    if (!grid) return;

    const search = document.getElementById("price-search").value;
    const county = document.getElementById("price-county").value;

    const filtered = currentPrices.filter(p => 
        matchesQuery(p.crop, search) && (county === "" || p.county === county)
    );

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
}

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

function setupLessons() {
    document.querySelectorAll(".lesson-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const lesson = toggle.closest(".lesson");
            const isOpen = lesson.classList.toggle("open");
            toggle.querySelector("span").textContent = isOpen ? "−" : "+";
        });
    });
}

function initApp() {
    bindPageNavigation();
    renderPriceCountyOptions(currentPrices);
    renderPrices();
    renderFarms();
    setupFarmForm();
    setupLessons();

    document.getElementById("price-search").addEventListener("input", renderPrices);
    document.getElementById("price-county").addEventListener("change", renderPrices);
    document.getElementById("farm-search").addEventListener("input", renderFarms);
}

function updatePrices(prices) {
    if (Array.isArray(prices) && prices.length > 0) {
        currentPrices = prices;
        renderPriceCountyOptions(currentPrices);
        renderPrices();
    }
}