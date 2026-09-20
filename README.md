# SKYLINE

Skyline is a focused weather landing page that helps you understand the sky before you step outside. Search for any city to see live conditions, a five-day forecast, safety guidance, and an animated map that flies to the selected location.

## Features

- City search powered by the Open-Meteo geocoding and forecast APIs
- Current temperature, humidity, wind, feels-like temperature, and daily highs/lows
- Five-day weather forecast
- Leaflet map with OpenStreetMap tiles
- Animated map fly-to transition and pulsing location marker
- GSAP hero, footer, dashboard, and ribbon animations
- Left-edge hover dashboard with live weather details
- Floating safety ribbon with condition-aware guidance
- Responsive layout for desktop and mobile screens

## Run Locally

No API key or build step is required.

1. Open PowerShell in this project folder.
2. Start a local web server:

	```powershell
	python -m http.server 8000
	```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.

Use a local server instead of opening `index.html` directly so the browser can load the page and external map assets reliably.

## Project Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and external library links |
| `styles.css` | Responsive visual design and animations |
| `app.js` | Weather requests, map behavior, dashboard, and GSAP interactions |
| `weather.py` | Original Python weather script with text-to-speech |
| `problem1.py` | Python practice file |
| `problem3.py` | Python joke and text-to-speech practice file |

## Data Sources

- Weather and geocoding: [Open-Meteo](https://open-meteo.com/)
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/)
- Interactive map: [Leaflet](https://leafletjs.com/)
- Motion: [GSAP](https://gsap.com/)

## Notes

The browser version uses Open-Meteo directly and does not require an account. The map needs an internet connection to load its tiles, and forecast requests may take a moment depending on network conditions.
