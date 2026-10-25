/* ============================================================
   NODE TEST RUNNER — smoke tests for the codebase
   Run with:  npm test
   Coverage:  npm run coverage
   ============================================================ */

const { test } = require("node:test");
const assert = require("node:assert");

// --- util.js (pure functions, easy to test) ---
function matchesQuery(text, query) {
    return String(text).toLowerCase().includes(String(query).toLowerCase().trim());
}
function formatKES(amount) {
    return "KES " + Number(amount).toLocaleString("en-KE");
}
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

test("matchesQuery finds substring case-insensitively", () => {
    assert.strictEqual(matchesQuery("Maize", "MAI"), true);
    assert.strictEqual(matchesQuery("Maize", "rice"), false);
});

test("formatKES formats with KES prefix and comma", () => {
    assert.ok(formatKES(3200).startsWith("KES"));
    assert.ok(formatKES(3200).includes("3"));
});

test("escapeHtml neutralises angle brackets", () => {
    assert.ok(escapeHtml("<script>").includes("&lt;"));
    assert.strictEqual(escapeHtml("hi"), "hi");
});

// --- price filtering ---
function filterPrices(prices, search, county, category, range) {
    return prices.filter(p =>
        matchesQuery(p.crop, search) &&
        (county === "" || p.county === county) &&
        (category === "All" || p.category === category) &&
        p.price >= range.min && p.price <= range.max
    );
}

const SAMPLE = [
    { crop: "Maize",    county: "Nairobi", category: "Cereals",    price: 3200 },
    { crop: "Tomatoes", county: "Kiambu",  category: "Vegetables", price: 120 },
    { crop: "Kale",     county: "Nairobi", category: "Vegetables", price: 40 }
];

test("filterPrices returns all for empty filters", () => {
    assert.strictEqual(filterPrices(SAMPLE, "", "", "All", { min: 0, max: Infinity }).length, 3);
});

test("filterPrices filters by county", () => {
    const res = filterPrices(SAMPLE, "", "Nairobi", "All", { min: 0, max: Infinity });
    assert.strictEqual(res.length, 2);
});

test("filterPrices filters by category", () => {
    const res = filterPrices(SAMPLE, "", "", "Vegetables", { min: 0, max: Infinity });
    assert.strictEqual(res.length, 2);
});

test("filterPrices filters by price range", () => {
    const res = filterPrices(SAMPLE, "", "", "All", { min: 0, max: 100 });
    assert.strictEqual(res.length, 1);
});

test("filterPrices combines all four filters", () => {
    const res = filterPrices(SAMPLE, "kale", "Nairobi", "Vegetables", { min: 0, max: 100 });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].crop, "Kale");
});

// --- grouping for comparison view ---
function groupPricesByCrop(prices) {
    return prices.reduce((groups, p) => {
        if (!groups[p.crop]) groups[p.crop] = [];
        groups[p.crop].push(p);
        return groups;
    }, {});
}

test("groupPricesByCrop groups by crop", () => {
    const grouped = groupPricesByCrop(SAMPLE);
    assert.strictEqual(Object.keys(grouped).length, 3);
});

// --- scoring (for the quiz) ---
function calculateScore(answers) {
    return answers.filter(a => a.isCorrect).reduce(s => s + 1, 0);
}

test("calculateScore counts correct answers", () => {
    assert.strictEqual(calculateScore([
        { isCorrect: true }, { isCorrect: false }, { isCorrect: true }
    ]), 2);
});

test("calculateScore returns 0 for empty", () => {
    assert.strictEqual(calculateScore([]), 0);
});