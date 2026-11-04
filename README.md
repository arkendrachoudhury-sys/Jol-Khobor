# Jol-Khobor (জল খবর)

Crowdsourced, verified, street-level waterlogging dashboard for Kolkata. Working title: Kolkata WaterWatch / Jalkhabar Kolkata.

> **Demo only.** All reports are simulated sample data. Do not use for real travel decisions.

## What it shows
- Schematic map of Behala, Majerhat, Taratala, Alipore, Hastings, Esplanade, Park Circus, Central Avenue, Amherst Street and Thanthania.
- Segment status per travel mode (walk, two-wheeler, car, bus).
- Behala → Esplanade corridor comparison.
- Verification tiers: T0 Unverified, T1 Community confirmed, T2 Field verified.
- Data decay: reports expire faster in rain and in fast-draining zones.

## Principles
- No data is never shown as safe. The best label is "No flooding reported".
- "Flooded" claims go live sooner than "clear" claims.
- Every status shows its tier and age.

## Run locally
No build step. Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Structure
```
index.html        dashboard page
css/style.css     styles (light and dark themes)
js/app.js         sample data, verification and decay logic, rendering
```

## Roadmap
1. WhatsApp Business API webhook for reports
2. Postgres + PostGIS store, rules engine for trust scores and decay
3. OpenStreetMap + MapLibre map and own routing graph
4. B2B API for delivery and logistics fleets

## License
MIT
