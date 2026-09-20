const form = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const statusText = document.querySelector('#status');
const dashboard = document.querySelector('#side-dashboard');
const dashboardClose = document.querySelector('#dashboard-close');
const dashboardCity = document.querySelector('#dashboard-city');
const safetyMessage = document.querySelector('#safety-message');
const safetyRibbon = document.querySelector('#safety-ribbon');
const mapCity = document.querySelector('#map-city');
const mapCoordinates = document.querySelector('#map-coordinates');
const voiceToggle = document.querySelector('#voice-toggle');
let dashboardOpen = false;
let map;
let mapMarker;
let voiceEnabled = true;
let currentAudio;

function refreshIcons() {
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}

const weatherLabels = {
  0: ['Clear sky', '☀'],
  1: ['Mainly clear', '◐'],
  2: ['Partly cloudy', '◒'],
  3: ['Overcast', '☁'],
  45: ['Foggy', '≋'],
  48: ['Rime fog', '≋'],
  51: ['Light drizzle', '╌'],
  53: ['Drizzle', '╌'],
  55: ['Heavy drizzle', '╌'],
  61: ['Light rain', '☂'],
  63: ['Rain', '☂'],
  65: ['Heavy rain', '☂'],
  71: ['Light snow', '❄'],
  73: ['Snow', '❄'],
  75: ['Heavy snow', '❄'],
  80: ['Rain showers', '☂'],
  81: ['Rain showers', '☂'],
  82: ['Heavy showers', '☂'],
  95: ['Thunderstorm', 'ϟ'],
  96: ['Storm with hail', 'ϟ'],
  99: ['Storm with hail', 'ϟ']
};

const getWeatherLabel = (code) => weatherLabels[code] || ['Changing skies', '◌'];
const formatDay = (date, index) => index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
const round = (value) => Math.round(value);
const hindiConditions = {
  'Clear sky': 'साफ आसमान',
  'Mainly clear': 'ज्यादातर साफ आसमान',
  'Partly cloudy': 'आंशिक रूप से बादल',
  'Overcast': 'बादल छाए हुए हैं',
  'Foggy': 'कोहरा',
  'Light drizzle': 'हल्की बूंदाबांदी',
  'Drizzle': 'बूंदाबांदी',
  'Heavy drizzle': 'तेज़ बूंदाबांदी',
  'Light rain': 'हल्की बारिश',
  'Rain': 'बारिश',
  'Heavy rain': 'तेज़ बारिश',
  'Rain showers': 'बारिश की बौछारें',
  'Heavy showers': 'तेज़ बौछारें',
  'Light snow': 'हल्की बर्फबारी',
  'Snow': 'बर्फबारी',
  'Heavy snow': 'तेज़ बर्फबारी',
  'Thunderstorm': 'आंधी और बारिश'
};
const hindiSafetyNotes = {
  'Clear sky': 'धूप से बचने के लिए पानी पीते रहें।',
  'Mainly clear': 'बाहर जाते समय पानी साथ रखें।',
  'Partly cloudy': 'बाहर निकलने के लिए मौसम आरामदायक है।',
  'Overcast': 'बाहर जाते समय हल्का जैकेट साथ रखें।',
  'Foggy': 'कोहरे में धीरे और सावधानी से यात्रा करें।',
  'Light drizzle': 'हल्की बारिश के लिए छाता साथ रखें।',
  'Drizzle': 'छाता साथ रखें और फिसलन वाली जगहों से सावधान रहें।',
  'Heavy drizzle': 'तेज़ बूंदाबांदी में सावधानी से बाहर निकलें।',
  'Light rain': 'छाता साथ रखें और फिसलन से सावधान रहें।',
  'Rain': 'छाता साथ रखें और फिसलन वाली जगहों से सावधान रहें।',
  'Heavy rain': 'तेज़ बारिश में सुरक्षित जगह पर रहें।',
  'Rain showers': 'बाहर निकलते समय छाता साथ रखें।',
  'Heavy showers': 'तेज़ बौछारों में बाहर जाने से बचें।',
  'Light snow': 'गर्म कपड़े पहनें और सावधानी से चलें।',
  'Snow': 'गर्म कपड़े पहनें और बर्फीली जगहों से सावधान रहें।',
  'Heavy snow': 'भारी बर्फबारी में घर के अंदर सुरक्षित रहें।',
  'Thunderstorm': 'आंधी के दौरान घर के अंदर सुरक्षित रहें।'
};
const safetyNotes = {
  clear: 'Clear skies ahead. Protect your eyes and stay hydrated.',
  cloud: 'A calm day outside. Keep a light layer close by.',
  rain: 'Rain is nearby. Carry an umbrella and watch slippery paths.',
  storm: 'Storm conditions possible. Stay indoors and avoid open spaces.',
  snow: 'Cold conditions ahead. Wear warm layers and watch for ice.',
  fog: 'Visibility may be low. Travel slowly and stay alert.'
};

function getSafetyNote(code) {
  if ([95, 96, 99].includes(code)) return safetyNotes.storm;
  if ([61, 63, 65, 80, 81, 82].includes(code)) return safetyNotes.rain;
  if ([71, 73, 75].includes(code)) return safetyNotes.snow;
  if ([45, 48].includes(code)) return safetyNotes.fog;
  if ([0, 1].includes(code)) return safetyNotes.clear;
  return safetyNotes.cloud;
}

function getHindiSafetyNote(condition, temperature) {
  if (temperature >= 40) return 'बहुत गर्मी है। धूप से बचें और पानी पीते रहें।';
  return hindiSafetyNotes[condition] || 'बाहर जाते समय सावधानी बरतें।';
}

function createHindiMessage(place, current, condition) {
  const hindiCondition = hindiConditions[condition] || 'बदलता मौसम';
  const safetyNote = getHindiSafetyNote(condition, current.temperature_2m);
  return `नमस्ते। ${place.name} में अभी तापमान ${round(current.temperature_2m)} डिग्री सेल्सियस है। मौसम ${hindiCondition} है। सावधानी: ${safetyNote} धन्यवाद।`;
}

async function speakWeather(place, current, condition) {
  if (!voiceEnabled) return;
  const message = createHindiMessage(place, current, condition);
  statusText.textContent = 'Weather loaded. Preparing Hindi voice...';
  if (currentAudio) currentAudio.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('TTS server unavailable');
    currentAudio = new Audio(URL.createObjectURL(await response.blob()));
    await currentAudio.play();
    statusText.textContent = `Hindi forecast ready for ${place.name}.`;
  } catch (error) {
    statusText.textContent = window.location.protocol === 'file:'
      ? 'Voice needs the server. Open http://localhost:8000.'
      : 'Forecast ready, but the Hindi female voice is temporarily unavailable.';
  } finally {
    window.clearTimeout(timeout);
  }
}

function animatePage() {
  if (!window.gsap) return;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.nav', { y: -18, opacity: 0, duration: 0.7 })
    .from('.hero-copy > *', { y: 22, opacity: 0, duration: 0.65, stagger: 0.08 }, '-=0.35')
    .from('.map-card', { scale: 0.92, opacity: 0, y: 18, duration: 1.1 }, '-=0.8')
    .from('.weather-panel', { y: 30, opacity: 0, duration: 0.75 }, '-=0.7')
    .from('footer', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35')
    .from('.safety-ribbon', { y: 24, opacity: 0, duration: 0.65 }, '-=0.25');
  gsap.to('.safety-ribbon', { y: -5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
  gsap.to('.brand-mark', { rotation: 90, duration: 2.8, repeat: -1, repeatDelay: 4, ease: 'back.inOut(2)' });
  gsap.to('.map-status-dot', { scale: 1.45, opacity: 0.55, duration: 1.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.utils.toArray('.details > div, .hourly-item, .forecast-day').forEach((element) => {
    element.addEventListener('mouseenter', () => gsap.to(element, { y: -4, duration: 0.2, ease: 'power2.out' }));
    element.addEventListener('mouseleave', () => gsap.to(element, { y: 0, duration: 0.25, ease: 'power2.out' }));
  });
}

function initializeMap() {
  if (!window.L) return;
  map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([28.6139, 77.209], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  mapMarker = L.marker([28.6139, 77.209], {
    icon: L.divIcon({ className: 'map-pin-wrap', html: '<span class="map-pin-pulse"></span><span class="map-pin"></span>', iconSize: [34, 34], iconAnchor: [17, 17] })
  }).addTo(map);
  document.querySelector('#map-zoom-in').addEventListener('click', () => map.zoomIn());
  document.querySelector('#map-zoom-out').addEventListener('click', () => map.zoomOut());
}

function animateMapTo(place) {
  if (!map || !mapMarker) return;
  const coordinates = [place.latitude, place.longitude];
  mapCity.textContent = `${place.name}${place.country_code ? `, ${place.country_code}` : ''}`;
  mapCoordinates.textContent = `${Math.abs(place.latitude).toFixed(2)}° ${place.latitude >= 0 ? 'N' : 'S'} · ${Math.abs(place.longitude).toFixed(2)}° ${place.longitude >= 0 ? 'E' : 'W'}`;
  mapMarker.setLatLng(coordinates);
  map.flyTo(coordinates, 9, { duration: 1.8, easeLinearity: 0.18 });
  if (window.gsap) {
    gsap.fromTo('.map-pin-wrap', { scale: 0.2, opacity: 0, rotation: -20 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.75, delay: 1.25, ease: 'back.out(2)' });
    gsap.fromTo('.map-location', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 1.35, ease: 'power3.out' });
  }
}

function setDashboard(open) {
  if (!window.gsap || open === dashboardOpen) return;
  dashboardOpen = open;
  gsap.to(dashboard, { x: open ? 0 : -320, duration: 0.55, ease: 'power3.out' });
}

window.addEventListener('pointermove', (event) => {
  if (event.clientX <= 28) setDashboard(true);
});
dashboard.addEventListener('pointerleave', () => setDashboard(false));
dashboardClose.addEventListener('click', () => setDashboard(false));
voiceToggle.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  if (!voiceEnabled) {
    if (currentAudio) currentAudio.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
  voiceToggle.setAttribute('aria-pressed', String(voiceEnabled));
  voiceToggle.setAttribute('aria-label', voiceEnabled ? 'Turn Hindi weather voice off' : 'Turn Hindi weather voice on');
  voiceToggle.innerHTML = `<i data-lucide="${voiceEnabled ? 'volume-2' : 'volume-x'}"></i> Hindi voice ${voiceEnabled ? 'on' : 'off'}`;
  refreshIcons();
});

animatePage();
initializeMap();
refreshIcons();

async function getForecast(city, announceVoice = false) {
  statusText.textContent = `Looking up ${city}...`;

  const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!locationResponse.ok) throw new Error('Could not find that location.');
  const locationData = await locationResponse.json();
  if (!locationData.results?.length) throw new Error(`We couldn't find “${city}”.`);

  const place = locationData.results[0];
  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);
  if (!forecastResponse.ok) throw new Error('The forecast is unavailable right now.');
  const data = await forecastResponse.json();
  renderWeather(place, data);
  animateMapTo(place);
  if (announceVoice) speakWeather(place, data.current, getWeatherLabel(data.current.weather_code)[0]);
}

function renderWeather(place, data) {
  const current = data.current;
  const [condition, symbol] = getWeatherLabel(current.weather_code);
  const currentDate = new Date(`${current.time.replace('Z', '')}`);

  document.querySelector('#location-name').textContent = `${place.name}${place.country_code ? `, ${place.country_code}` : ''}`;
  document.querySelector('#temperature').textContent = round(current.temperature_2m);
  document.querySelector('#weather-symbol').textContent = symbol;
  document.querySelector('#condition').textContent = condition;
  document.querySelector('#high-low').textContent = `High ${round(data.daily.temperature_2m_max[0])}° / Low ${round(data.daily.temperature_2m_min[0])}°`;
  document.querySelector('#humidity').textContent = `${current.relative_humidity_2m}%`;
  document.querySelector('#wind').textContent = `${round(current.wind_speed_10m)} km/h`;
  document.querySelector('#feels-like').textContent = `${round(current.apparent_temperature)}°`;
  document.querySelector('#updated-time').textContent = `Updated ${currentDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  dashboardCity.textContent = `${place.name}${place.country_code ? `, ${place.country_code}` : ''}`;
  document.querySelector('#dashboard-temperature').textContent = `${round(current.temperature_2m)}°`;
  document.querySelector('#dashboard-condition').textContent = condition;
  document.querySelector('#dashboard-humidity').textContent = `${current.relative_humidity_2m}%`;
  document.querySelector('#dashboard-wind').textContent = `${round(current.wind_speed_10m)} km/h`;
  document.querySelector('#dashboard-feels').textContent = `${round(current.apparent_temperature)}°`;
  safetyMessage.textContent = `${getHindiSafetyNote(condition, current.temperature_2m)} धन्यवाद।`;
  safetyRibbon.dataset.weather = condition.toLowerCase().replaceAll(' ', '-');
  statusText.textContent = `Showing the latest forecast for ${place.name}.`;

  document.querySelector('#forecast').innerHTML = data.daily.time.map((date, index) => {
    const [label, icon] = getWeatherLabel(data.daily.weather_code[index]);
    return `<div class="forecast-day"><span>${formatDay(date, index)}</span><span class="forecast-icon" title="${label}">${icon}</span><strong>${round(data.daily.temperature_2m_max[index])}° / ${round(data.daily.temperature_2m_min[index])}°</strong></div>`;
  }).join('');

  const hourlyStart = Math.max(0, data.hourly.time.findIndex((time) => time >= current.time));
  document.querySelector('#hourly-forecast').innerHTML = data.hourly.time.slice(hourlyStart, hourlyStart + 24).map((time, index) => {
    const [hourLabel, icon] = getWeatherLabel(data.hourly.weather_code[hourlyStart + index]);
    const hour = index === 0 ? 'Now' : time.slice(11, 16);
    return `<div class="hourly-item"><span>${hour}</span><span class="hourly-icon" title="${hourLabel}">${icon}</span><strong>${round(data.hourly.temperature_2m[hourlyStart + index])}°</strong></div>`;
  }).join('');
  refreshIcons();
  if (window.gsap) {
    gsap.fromTo('.weather-panel h2, .temperature-wrap, .condition-wrap, .details > div, .hourly-item, .forecast-day', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.025, ease: 'power2.out' });
    gsap.fromTo('.weather-symbol', { scale: 0.6, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2)' });
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    statusText.textContent = 'Enter a city to check its weather.';
    cityInput.focus();
    return;
  }
  getForecast(city, true).catch((error) => {
    statusText.textContent = error.message;
  });
});

getForecast(cityInput.value).catch((error) => {
  statusText.textContent = error.message;
});
