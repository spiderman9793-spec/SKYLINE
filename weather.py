

import requests
import pyttsx3

city = "Delhi"

location = requests.get(
    "https://geocoding-api.open-meteo.com/v1/search",
    params={"name": city, "count": 1, "language": "en", "format": "json"}
).json()

place = location["results"][0]
latitude = place["latitude"]
longitude = place["longitude"]

weather = requests.get(
    "https://api.open-meteo.com/v1/forecast",
    params={
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        "timezone": "auto"
    }
).json()

current = weather["current"]

forecast = (
    f"Weather in {city}: "
    f"{current['temperature_2m']}°C, "
    f"humidity {current['relative_humidity_2m']}%, "
    f"wind speed {current['wind_speed_10m']} km/h"
)

print(forecast)
engine = pyttsx3.init()
engine.say(forecast)
engine.runAndWait()

