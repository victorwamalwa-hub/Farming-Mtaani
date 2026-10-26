# Farming Mtaani

A web-based MVP that connects Kenyan farmers directly with consumers and buyers, provides up-to-date market prices, and offers eco-friendly guidance on common crop and livestock diseases.

Built as a student project for the MVP demonstration. It is fully functional offline and can be run locally with no API keys or database setup.

---

## Project Overview

Farming Mtaani was created to address three real problems facing Kenyan smallholder farmers:

1. **Market access** — Farmers often do not know the current price of their produce across different counties and markets.
2. **Direct connection** — Buyers (consumers, retailers, restaurants) have no easy way to find farmers growing what they need.
3. **Knowledge gap** — Farmers lack accessible, environmentally-friendly guidance on identifying and treating common crop and livestock diseases.

The MVP delivers a working prototype for each of these problems through three core features.

---

## Features

### Home Dashboard
- Animated statistics showing the number of counties, crop categories, market prices, and diseases tracked.
- Quick navigation to all core features.
- Fully responsive layout that adapts to mobile, tablet, and desktop screens.

### Market Prices (`/prices`)
- Search by crop name.
- Filter by county.
- Filter by crop category (Cereals, Vegetables, Fruits, Legumes, Cash Crops).
- Filter by price range (Under 100 KES, 100–500 KES, 500–2000 KES, 2000+ KES).
- Live status indicator showing whether data is from a live source or cached sample data.

### Find a Farm (`/farms`)
- Browse a directory of 12 farms across Kenya, spanning different counties and produce types.
- Search by county or produce.
- Register a new farm using the built-in form. Data is persisted in the browser's `localStorage`, so registered farms remain after a page refresh.

### Learn (`/learn`)
- Expandable lesson cards covering three common Kenyan farm challenges:
  - Fall Armyworm (Maize)
  - Tomato Blight
  - East Coast Fever (Cattle)
- Each lesson lists symptoms and environmentally-friendly control methods.
- Filter lessons by crop type.

---

## Design & Theme

- **Color palette:** Agriculture green (`#2e7d32`, `#1b5e20`) and white (`#ffffff`), accented with pale green (`#e8f5e9`).
- **Transitions:** All interactive elements use `0.5s` CSS transitions for a smooth, unhurried feel.
- **Page transitions:** Each page fades and slides into view using a custom `@keyframes` animation.
- **Background:** A neutral Kenyan farmland image with a translucent green overlay, so text remains readable on every page.
- **Imagery:** All images are locally hosted Kenyan farming photographs (hero, features, lessons). No external image URLs are used, so the site works fully offline.

---

## Tech Stack

- **HTML5** — Semantic structure, `aria-labelledby` for accessibility, `<section>`, `<article>`, `<form>`.
- **CSS3** — Custom properties (`:root`), CSS Grid, Flexbox, media queries for responsiveness, `@keyframes` animations.
- **Vanilla JavaScript (ES6+)** — No frameworks, no build tools, no dependencies. Uses `const`, `let`, arrow functions, and `async/await`.
- **Browser `localStorage`** — Persists registered farms across page reloads.

There is **no backend server, no database, no authentication, no payment gateway, and no real-time chat.** These were intentionally excluded to keep the MVP focused, simple, and easy to demo.

---

## Project Structure

```
farming-mtaani/
├── index.html              # Main HTML page (all sections in one file)
├── STYLE.css               # Complete stylesheet
├── README.md               # This file
├── js/
│   ├── util.js             # Shared helpers (storage, escaping, formatting)
│   ├── data.js             # Sample data (prices, farms, diseases, counties)
│   ├── api.js              # API layer (KilimoSTAT fetch with fallback)
│   ├── app.js              # Application logic (rendering, filtering, forms)
│   ├── main.js             # Entry point (loads data, initialises app)
│   └── test.utils.js       # In-browser test suite (13 tests)
└── images/
    ├── hero-img.avif
    ├── feature-prices.jpeg
    ├── feature-farm.avif
    ├── feature-learn.jpeg
    ├── bg-kenya-farmland.jpg
    ├── lesson-armyworm.jpeg
    ├── lesson-blight.jpeg
    └── lesson-cattle.jpeg
```

---

## Run and Deploy

The Node server serves the homepage, styles, scripts, images, and JSON API from one origin.

```bash
npm install
npm start
```

Open `http://localhost:3000`. For a Node hosting service, deploy the repository root, use `npm install` as the build/install command, and `npm start` as the start command. Keep `index.html`, `styles.css`, `images/`, and `js/` in the deployed repository alongside `index.js` and `package.json`; the server needs those files to render the complete homepage.

---

## Automated Tests

The project includes a lightweight, dependency-free test suite that runs in the browser's console every time the page loads.

Open the browser developer console (`F12` → **Console** tab) after loading the site. You should see:

```
🧪 Running Farming Mtaani tests...

✅ PASS: matchesQuery is case-insensitive
✅ PASS: matchesQuery returns false for non-match
✅ PASS: formatKES formats with KES prefix
✅ PASS: escapeHtml escapes angle brackets
✅ PASS: writeStorage/readStorage round-trip
✅ PASS: PRICES is a non-empty array
✅ PASS: Every price has crop, county, price, unit
✅ PASS: INITIAL_FARMS has required fields
✅ PASS: Price grid exists
✅ PASS: Farm grid exists
✅ PASS: Exactly 3 lessons rendered
✅ PASS: Filter 'maize' returns at least 1 result
✅ PASS: Filter by county 'Nairobi' returns only Nairobi

📋 Results: 13 / 13 passed, 0 failed.
🎉 All tests passed!
```

The tests cover:
- Utility functions (`matchesQuery`, `formatKES`, `escapeHtml`, `readStorage`/`writeStorage`).
- Data integrity (`PRICES` and `INITIAL_FARMS` shapes).
- DOM rendering (`#price-grid`, `#farm-grid`, `.lesson` cards).
- Filtering logic (search and county filtering).

---

## API Integration (Honest Disclosure)

The project attempts to integrate with **KilimoSTAT**, the official market statistics platform run by Kenya's Ministry of Agriculture.

However, **KilimoSTAT does not expose a free, public, unauthenticated REST endpoint.** Access to its data feeds requires registering for an API key through the official portal (`statistics.kilimo.go.ke`).

Because of this constraint, the MVP:
1. Contains a fully written `fetchPricesFromKilimoSTAT()` function in `js/api.js` that follows the documented endpoint pattern.
2. Falls back gracefully to **cached sample data** stored in `js/data.js` if the live API is unavailable.
3. Displays an honest status message on the Prices page (`#api-status`) so users know whether they are viewing live data or cached data.

To enable live data in a production version:
1. Register for a KilimoSTAT API key.
2. Add your key to the `headers` object in `fetchPricesFromKilimoSTAT()`.
3. Replace the fallback with the authenticated endpoint.

This approach keeps the MVP honest, fully demo-able, and easy to extend.

---

### HTTP Methods in Use

| Method | Endpoint | Where it is triggered |
|---|---|---|
| GET | `/prices` | Prices page loads |
| GET | `/farms` | Farms page loads |
| POST | `/farms` | "Save Farm" button in the register form |
| PATCH | `/farms/:id` | "Edit" button on a farm card |
| PUT | `/farms/:id` | "Replace" button on a farm card |
| DELETE | `/farms/:id` | "Delete" button on a farm card |

To verify each method during review:
1. Open the Farms page.
2. Press F12 → Network tab.
3. Click Edit → observe a `PATCH` request.
4. Click Replace → observe a `PUT` request.
5. Click Delete → observe a `DELETE` request.

![PATCH, PUT, DELETE in the Network tab](presentation/crud-network-proof.png)

## Known Limitations

This is a student MVP, not a production system. The following are intentional scope decisions:

- **No authentication.** Anyone can register a farm. There are no login screens or passwords.
- **No real-time chat.** Farmers' phone numbers are displayed so buyers can contact them directly.
- **No payment gateway.** There is no money transfer functionality.
- **Data is local.** Farms registered by the user are saved in `localStorage` and are only visible on that browser. They are not shared with other users.
- **Sample prices.** Prices are cached sample data, not live market feeds (see API section above).

---

## What Could Come Next (Future Roadmap)

Given more time, the following features would meaningfully improve the platform:

1. **Real backend + database** — Share registered farms across all users, not just the local browser.
2. **Authenticated KilimoSTAT integration** — Replace cached prices with real-time market data by registering for an API key.
3. **Farmer verification badges** — Confirm that registered farms are genuine.
4. **Weather integration** — Add rainfall and temperature context by county.
5. **SMS notifications** — Allow farmers to receive price alerts without a smartphone.
6. **Disease image diagnosis** — Allow farmers to upload photos of affected crops or animals for AI-based identification.

---

## Credits

- **Developer:** [Victor Wamalwa]
- **Course:** [Software Developer]
- **Institution:** [Moringa School]
- **Year:** 2026
- **Images:** Kenyan farming photographs (locally hosted)
- **Sample data:** Compiled from public Kenyan agricultural market reports

---

## License

This project was created for educational purposes as part of a course MVP submission. It is not intended for commercial use in its current form.