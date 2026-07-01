from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="Weather Alert Bot API")

# Allow CORS for the frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/weather")
def get_weather(pincode: str):
    try:
        # 1. Convert pincode to latitude and longitude using Nominatim
        geocode_url = "https://nominatim.openstreetmap.org/search"
        geocode_params = {
            "postalcode": pincode,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "WeatherAlertBot/1.0"
        }
        geo_response = requests.get(geocode_url, params=geocode_params, headers=headers)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data:
             raise HTTPException(status_code=404, detail="Could not find location for this pin code")
             
        lat = float(geo_data[0]["lat"])
        lon = float(geo_data[0]["lon"])
        location_name = geo_data[0].get("display_name", "").split(",")[0]

        # 2. Fetch weather from Open-Meteo
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": ["temperature_2m", "weather_code"],
            "daily": ["precipitation_probability_max", "weather_code"],
            "timezone": "auto"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Analyze data
        current_temp = data["current"]["temperature_2m"]
        rain_prob = data["daily"]["precipitation_probability_max"][0]
        
        will_rain = rain_prob > 40  # If > 40% chance of rain, trigger alert
        
        if will_rain:
            alert_message = "Bring an umbrella! ☔"
            sub_message = f"There is a {rain_prob}% chance of rain today."
            theme = "rain"
        else:
            alert_message = "No rain expected! 🌤️"
            sub_message = "Enjoy your day, skies look clear."
            theme = "sunny"

        return {
            "alert": alert_message,
            "sub_message": sub_message,
            "theme": theme,
            "current_temp": current_temp,
            "rain_probability": rain_prob,
            "location_name": location_name
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data from API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
