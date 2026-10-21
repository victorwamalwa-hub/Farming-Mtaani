/* ============================================================
   FARMING MTAANI — SIMPLE TESTS
   Open the browser console (F12) after loading the page.
   Each test logs PASS or FAIL. A summary is printed at the end.
   ============================================================ */

(function runTests() {
    let passed = 0;
    let failed = 0;

    function test(name, condition) {
        if (condition) {
            console.log(`✅ PASS: ${name}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${name}`);
            failed++;
        }
    }

    console.log("🧪 Running Farming Mtaani tests...\n");

    /* --- Data layer --- */
    test("PRICES is an array", Array.isArray(PRICES));
    test("PRICES has at least 5 items", PRICES.length >= 5);
    test("Every price has crop, county, price, unit",
        PRICES.every(p => p.crop && p.county && typeof p.price === "number" && p.unit)
    );
    test("INITIAL_FARMS has at least 3 farms", INITIAL_FARMS.length >= 3);
    test("Every farm has name, county, produce",
        INITIAL_FARMS.every(f => f.name && f.county && f.produce)
    );

    /* --- DOM: tabs exist --- */
    test("Home section exists", !!document.getElementById("home"));
    test("Prices section exists", !!document.getElementById("prices"));
    test("Farms section exists", !!document.getElementById("farms"));
    test("Learn section exists", !!document.getElementById("learn"));

    /* --- DOM: price grid populated --- */
    const priceGrid = document.getElementById("price-grid");
    test("Price grid has rendered cards", priceGrid && priceGrid.children.length > 0);

    /* --- DOM: farm grid populated --- */
    const farmGrid = document.getElementById("farm-grid");
    test("Farm grid has rendered cards", farmGrid && farmGrid.children.length > 0);

    /* --- Summary --- */
    console.log(`\n📝 Test summary: ${passed} passed, ${failed} failed.`);
})();   