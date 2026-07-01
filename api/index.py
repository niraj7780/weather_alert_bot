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
def get_weather(lat: float, lon: float):
    try:
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
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data from API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
