function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

async function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherInfo = document.getElementById("weather-info");
    weatherInfo.innerHTML = `<p class="text-center fw-bold">Fetching weather data...</p>`;
    weatherInfo.classList.remove("d-none");

    try {
        const response = await fetch(`/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error("Weather API error");

        const data = await response.json();
        if (!data || !data.forecast || !Array.isArray(data.forecast)) {
            throw new Error("Malformed weather data");
        }

        // Forecast table
        const forecastTable = `
            <h4 class="mt-4 mb-3">Next 24 Hours Forecast</h4>
            <div class="table-responsive">
                <table class="table table-striped table-bordered align-middle text-center">
                    <thead class="table-light">
                        <tr>
                            <th>Time</th>
                            <th>Condition</th>
                            <th>Temp (°C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.forecast.map(hour => `
                            <tr>
                                <td>${hour.time}</td>
                                <td>
                                    <img src="${hour.icon}" class="weather-icon me-2" />
                                    ${hour.condition}
                                </td>
                                <td>${hour.temp}°C</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

        // Main weather summary
        weatherInfo.innerHTML = `
            <h3 class="mb-3 fw-semibold">${data.location}</h3>
            <img src="${data.icon}" class="weather-icon mb-3" />
            <p><strong>Temperature:</strong> ${data.temp}°C</p>
            <p><strong>Condition:</strong> ${data.condition}</p>
            <p><strong>Wind Speed:</strong> ${data.wind_kph} km/h</p>
            <p><strong>Rain Probability:</strong> ${data.rain_prob}%</p>
            ${forecastTable}
        `;

        // Send notification
        sendNotification(data.condition, data.temp);

    } catch (err) {
        console.error("Error fetching weather:", err);
        weatherInfo.innerHTML = `<p class="text-danger">Unable to retrieve weather data. Please try again later.</p>`;
    }
}

function error() {
    alert("Unable to retrieve your location.");
}

// 🔔 Request Notification Permission
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
            }
        });
    }
}

function getWeatherIcon(condition) {
    const map = {
        "Clear": "https://fonts.gstatic.com/s/i/materialicons/weather_sunny/v11/24px.svg",
        "Cloudy": "https://fonts.gstatic.com/s/i/materialicons/cloud/v15/24px.svg",
        "Rain": "https://fonts.gstatic.com/s/i/materialicons/grain/v13/24px.svg",
        "Snow": "https://fonts.gstatic.com/s/i/materialicons/ac_unit/v14/24px.svg"
    };
    return map[condition] || "https://fonts.gstatic.com/s/i/materialicons/weather_partly_cloudy/v11/24px.svg";
}

function sendNotification(condition, temp) {
    if (Notification.permission === "granted") {
        const iconUrl = getWeatherIcon(condition);
        new Notification("Weather Update", {
            body: `Current Weather: ${condition}, Temp: ${temp}°C`,
            icon: iconUrl
        });
    }
}


// Run on load
document.addEventListener("DOMContentLoaded", requestNotificationPermission);
