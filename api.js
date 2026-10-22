/* ============================================================
   API LAYER (KilimoSTAT Simulation)
   ============================================================ */

async function fetchPricesFromKilimoSTAT() {
    try {
        // Simulate a successful API fetch using local data.
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        return { 
            data: PRICES, 
            source: "KilimoSTAT (Cached Sample)", 
            error: null 
        };
    } catch (err) {
        return { 
            data: PRICES, 
            source: "Cached Sample Data", 
            error: err.message 
        };
    }
}