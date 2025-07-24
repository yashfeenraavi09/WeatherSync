from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)

# Get API key from environment
API_KEY = os.getenv("WEATHER_API_KEY")

if not API_KEY:
    raise RuntimeError("WEATHER_API_KEY not found in environment variables.")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/weather", methods=["GET"])
def get_weather():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude are required"}), 400

    try:
        url = f"https://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={lat},{lon}&hours=24"
        response = requests.get(url)
        data = response.json()

        forecast = [
            {
                "time": hour["time"].split(" ")[1],
                "temp": hour["temp_c"],
                "condition": hour["condition"]["text"],
                "icon": hour["condition"]["icon"]
            }
            for hour in data["forecast"]["forecastday"][0]["hour"]
        ]

        return jsonify({
            "location": f"{data['location']['name']}, {data['location']['country']}",
            "temp": data["current"]["temp_c"],
            "condition": data["current"]["condition"]["text"],
            "icon": data["current"]["condition"]["icon"],
            "wind_kph": data["current"]["wind_kph"],
            "rain_prob": data["forecast"]["forecastday"][0]["day"].get("daily_chance_of_rain", 0),
            "forecast": forecast
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
