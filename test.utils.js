/* ============================================================
   TESTS
   ============================================================ */

(() => {
  let passed = 0;
  let failed = 0;

  const test = (name, condition) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  console.log("🧪 Running Farming Mtaani tests...\n");

  // Util Tests
  test(
    "matchesQuery is case-insensitive",
    matchesQuery("Maize", "MAI") === true,
  );
  test(
    "matchesQuery returns false for non-match",
    matchesQuery("Maize", "rice") === false,
  );
  test(
    "formatKES formats with KES prefix",
    formatKES(3200).indexOf("KES") === 0,
  );
  test(
    "escapeHtml escapes angle brackets",
    escapeHtml("<script>").indexOf("&lt;") > -1,
  );

  // LocalStorage Tests
  const testKey = "__fm_test__";
  writeStorage(testKey, { hello: "world" });
  const back = readStorage(testKey, null);
  test("writeStorage/readStorage round-trip", back && back.hello === "world");
  localStorage.removeItem(testKey);

  // Data Structure Tests
  test(
    "PRICES is a non-empty array",
    Array.isArray(PRICES) && PRICES.length > 0,
  );
  test(
    "Every price has crop, county, price, unit",
    PRICES.every(
      (p) => p.crop && p.county && typeof p.price === "number" && p.unit,
    ),
  );
  test(
    "INITIAL_FARMS has required fields",
    INITIAL_FARMS.every((f) => f.name && f.county && f.produce),
  );

  // DOM Tests
  test("Price grid exists", document.getElementById("price-grid") !== null);
  test("Farm grid exists", document.getElementById("farm-grid") !== null);
  test(
    "Exactly 3 lessons rendered",
    document.querySelectorAll(".lesson").length === 3,
  );

  // Logic Tests
  const filterPrices = (list, search, county) => {
    return list.filter(
      (p) =>
        matchesQuery(p.crop, search) && (county === "" || p.county === county),
    );
  };

  test(
    "Filter 'maize' returns at least 1 result",
    filterPrices(PRICES, "maize", "").length >= 1,
  );
  test(
    "Filter by county 'Nairobi' returns only Nairobi",
    filterPrices(PRICES, "", "Nairobi").every((p) => p.county === "Nairobi"),
  );

  const total = passed + failed;
  console.log(`\n📋 Results: ${passed} / ${total} passed, ${failed} failed.`);
  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.warn("⚠️ Some tests failed.");
  }
})();
