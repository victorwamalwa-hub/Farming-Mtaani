/* ============================================================
   FARMING MTAANI — CACHED SAMPLE DATA
   ============================================================ */

// 1. The 47 Kenyan Counties
const COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Meru", 
    "Nyeri", "Kakamega", "Bungoma", "Kitui", "Kilifi", "Kwale", "Lamu", "Tana River", 
    "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Tharaka Nithi", "Embu", "Kajiado", 
    "Kericho", "Bomet", "Narok", "Kajiado", "Laikipia", "Samburu", "Turkana", "West Pokot", 
    "Trans Nzoia", "Vihiga", "Busia", "Siaya", "Homa Bay", "Migori", "Kisii", "Nyamira", 
    "Murang'a", "Kirinyaga", "Nyandarua", "Nandi", "Elgeyo Marakwet", "Baringo"
];

// 2. Crop Categories
const CROP_CATEGORIES = ["All", "Cereals", "Vegetables", "Fruits", "Legumes", "Cash Crops"];

// 3. Price Ranges (in KES)
const PRICE_RANGES = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under 100 KES", min: 0, max: 100 },
    { label: "100 - 500 KES", min: 100, max: 500 },
    { label: "500 - 2000 KES", min: 500, max: 2000 },
    { label: "2000+ KES", min: 2000, max: Infinity }
];

// 4. Diseases and Counters (Symptom Counter)
const DISEASES = [
    { id: 1, name: "Fall Armyworm (Maize)", crop: "Maize", category: "Pest", severity: "High" },
    { id: 2, name: "Tomato Blight", crop: "Tomatoes", category: "Fungal", severity: "Medium" },
    { id: 3, name: "East Coast Fever", crop: "Cattle", category: "Parasitic", severity: "High" },
    { id: 4, name: "Coffee Berry Disease", crop: "Coffee", category: "Fungal", severity: "Medium" },
    { id: 5, name: "Maize Lethal Necrosis", crop: "Maize", category: "Viral", severity: "High" },
    { id: 6, name: "Banana Xanthomonas Wilt", crop: "Bananas", category: "Bacterial", severity: "High" }
];

// 5. Prices Data (Expanded with Categories)
const PRICES = [
    { id: 1, county: "Nairobi",  market: "Wakulima",       crop: "Maize",              category: "Cereals",   price: 3200, unit: "90kg bag" },
    { id: 2, county: "Nakuru",   market: "Nakuru Market",  crop: "Beans",              category: "Legumes",   price: 8500, unit: "90kg bag" },
    { id: 3, county: "Kiambu",   market: "Githurai",       crop: "Tomatoes",           category: "Vegetables",price: 120,  unit: "kg" },
    { id: 4, county: "Nairobi",  market: "Kangemi",        crop: "Kale (Sukuma Wiki)", category: "Vegetables",price: 40,   unit: "bunch" },
    { id: 5, county: "Meru",     market: "Meru Town",      crop: "Avocado",            category: "Fruits",    price: 90,   unit: "kg" },
    { id: 6, county: "Kisumu",   market: "Kibuye",         crop: "Rice",               category: "Cereals",   price: 180,  unit: "kg" },
    { id: 7, county: "Machakos", market: "Machakos",       crop: "Mangoes",            category: "Fruits",    price: 60,   unit: "kg" },
    { id: 8, county: "Nyeri",    market: "Karatina",       crop: "Potatoes",           category: "Vegetables",price: 55,   unit: "kg" },
    { id: 9, county: "Kericho",  market: "Kericho",        crop: "Tea Leaves",         category: "Cash Crops",price: 25,   unit: "kg" },
    { id: 10,county: "Kakamega", market: "Kakamega",       crop: "Sugarcane",          category: "Cash Crops",price: 4500, unit: "tonne" }
];

const INITIAL_FARMS = [
    { id: 1, name: "Green Valley Farm", county: "Kiambu",   produce: "Vegetables & Kale", contact: "0712 345 678" },
    { id: 2, name: "Rift Agro Hub",     county: "Nakuru",   produce: "Maize & Beans",     contact: "0723 456 789" },
    { id: 3, name: "Mavuno Youth Farm", county: "Machakos", produce: "Mangoes & Avocado", contact: "0734 567 890" }
];

const FARM_IMAGES = [
    "images/feature-farm.avif",
    "images/hero-img.avif",
    "images/feature-prices.jpeg",
    "images/feature-learn.jpeg"
];