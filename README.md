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
2. Install the neural Hindi voice library:

	```powershell
	python -m pip install edge-tts
	```

3. Start the Skyline server:

	```powershell
	python voice_server.py
	```

4. Open [http://localhost:8000](http://localhost:8000) in your browser.

Use a local server instead of opening `index.html` directly so the browser can load the page and external map assets reliably.

## Project Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and external library links |
| `styles.css` | Responsive visual design and animations |
| `app.js` | Weather requests, map behavior, dashboard, and GSAP interactions |
| `weather.py` | Original Python weather script with text-to-speech |
| `voice_server.py` | Local Edge TTS endpoint for the Hindi female neural voice |

## Data Sources

- Weather and geocoding: [Open-Meteo](https://open-meteo.com/)
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/)
- Interactive map: [Leaflet](https://leafletjs.com/)
- Motion: [GSAP](https://gsap.com/)
- Hindi speech: [edge-tts](https://github.com/rany2/edge-tts), using `hi-IN-SwaraNeural`

## Free Vercel Deployment

Vercel deploys the landing page and the Python serverless Hindi voice endpoint in `api/speak.py`.

1. Push the latest project files to GitHub:

	```powershell
	git add .
	git commit -m "add Vercel voice deployment"
	git push
	```

2. Open [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New... -> Project**.
4. Import `spiderman9793-spec/SKYLINE`.
5. Keep the default framework setting, leave the build command empty, and click **Deploy**.
6. Open the free `vercel.app` URL Vercel provides.

The browser calls `/api/speak`, which Vercel maps to the Python function. The voice function may take a few seconds on its first request. A custom domain can be connected later from the Vercel project settings.

## Notes

The browser version uses Open-Meteo directly and does not require an account. The map needs an internet connection to load its tiles, and forecast requests may take a moment depending on network conditions. The voice server uses a network connection to generate the neural Hindi audio. `hi-IN-SwaraNeural` is an Indian female voice; an exact speaker age cannot be selected by the TTS service.
