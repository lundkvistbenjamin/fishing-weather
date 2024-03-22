import { weatherCodes } from "./weatherCodes.js";

const dayNames = document.querySelectorAll(".weather-day-container .day-of-week");
const weatherImages = document.querySelectorAll(".weather-day-container .weather-img");
const minTemps = document.querySelectorAll(".weather-day-container .min-temp");
const maxTemps = document.querySelectorAll(".weather-day-container .max-temp");
const windSpeeds = document.querySelectorAll(".weather-day-container .wind-speed");


var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let today = new Date();

// Update day names
for (let i = 0; i < dayNames.length; i++) {
    dayNames[i].innerHTML = daysOfWeek[(today.getDay() + i) % 7];
}

// Fetch IP and Weather
getIp();

async function getIp() {
    try {
        const resp = await fetch('https://ipapi.co/json/');
        const respJson = await resp.json();
        const lat = respJson.latitude;
        const lon = respJson.longitude;

        fetchWeather(lat, lon);
    } catch (err) {
        console.log("Error getting your IP");
    }
}

async function fetchWeather(lat, lon) {
    try {
        const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&forecast_days=3`);
        const respJson = await resp.json();

        console.log(respJson);

        // Update weather images and temperatures
        for (let i = 0; i < weatherImages.length; i++) {
            weatherImages[i].src = weatherCodes[respJson.daily.weather_code[i]].image;
            minTemps[i].innerHTML = "Min: " + Math.round(respJson.daily.temperature_2m_min[i]) + "°C";
            maxTemps[i].innerHTML = "Max: " + Math.round(respJson.daily.temperature_2m_max[i]) + "°C";
            windSpeeds[i].innerHTML += "Wind: " + Math.round(respJson.daily.wind_speed_10m_max[i] * 0.277778) + " m/s";
        }
    } catch (err) {
        console.log("Error getting weather information");
    }
}



/* 
---- Todo ---- 
- Better error messages, innerHTML perhaps 
- Lure of the day information
- Wind speed
- Placeholder images for weather
- Better fonts
- Loops eventually? 
- Download your own weather image pack? 
- 
- 
*/