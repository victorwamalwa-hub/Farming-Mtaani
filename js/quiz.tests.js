/* ============================================================
   FARMING MTAANI — QUIZ TESTS
   Runs in the browser console. Adds 8 tests to the existing suite.
   ============================================================ */

window.addEventListener("load", () => {
    let passed = 0, failed = 0;

    const test = (name, condition) => {
        if (condition) { console.log(`✅ PASS: ${name}`); passed++; }
        else { console.error(`❌ FAIL: ${name}`); failed++; }
    };

    console.log("\n🧪 Running Farming Mtaani QUIZ tests...\n");

    // Data integrity
    test("QUESTIONS is a non-empty array",
        Array.isArray(QUESTIONS) && QUESTIONS.length >= 3
    );
    test("Every question has id, question, answer, hint",
        QUESTIONS.every(q => q.id && q.question && q.answer && q.hint)
    );

    // Normalisation
    test("normaliseAnswer strips case and spaces",
        normaliseAnswer("  Kericho  ") === "kericho"
    );
    test("normaliseAnswer strips punctuation",
        normaliseAnswer("East Coast Fever!") === "east coast fever"
    );

    // Scoring
    const sampleAnswers = [
        { id: 1, userAnswer: "Kericho", correctAnswer: "Kericho", isCorrect: true },
        { id: 2, userAnswer: "IPM",     correctAnswer: "Integrated Pest Management", isCorrect: false },
        { id: 3, userAnswer: "Maize",   correctAnswer: "Maize",   isCorrect: true }
    ];
    test("calculateScore returns correct count",
        calculateScore(sampleAnswers) === 2
    );
    test("calculateScore returns 0 for empty array",
        calculateScore([]) === 0
    );
    test("calculateScore returns full count when all correct",
        calculateScore([
            { isCorrect: true },
            { isCorrect: true },
            { isCorrect: true }
        ]) === 3
    );

    // DOM sanity
    test("Quiz section exists in DOM",
        document.getElementById("challenge") !== null
    );

    const total = passed + failed;
    console.log(`\n📋 Quiz Results: ${passed} / ${total} passed, ${failed} failed.`);
    if (failed === 0) {
        console.log("🎉 All quiz tests passed!");
    } else {
        console.warn("⚠️ Some quiz tests failed.");
    }
});