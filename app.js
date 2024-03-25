import { weatherCodes } from "./weatherCodes.js";

const dayNames = document.querySelectorAll(".weather-day-container .day-of-week");
const likelihood = document.querySelectorAll(".weather-day-container .likelihood");
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
        const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant&wind_speed_unit=ms&forecast_days=3`);
        const respJson = await resp.json();

        // Update weather images and temperatures
        for (let i = 0; i < weatherImages.length; i++) {
            const { weather_code, wind_speed_10m_max, wind_direction_10m_dominant, temperature_2m_min, temperature_2m_max } = respJson.daily;

            weatherImages[i].src = weatherCodes[weather_code[i]].image;
            minTemps[i].innerHTML = `Min: ${Math.round(temperature_2m_min[i])}°C`;
            maxTemps[i].innerHTML = `Max: ${Math.round(temperature_2m_max[i])}°C`;
            windSpeeds[i].innerHTML = `Wind: ${Math.round(wind_speed_10m_max[i])} m/s`;
            likelihood[i].innerHTML = `Fishing score: ${calculateLikelihood(weather_code[i], wind_speed_10m_max[i], wind_direction_10m_dominant[i])}`;
        }
    } catch (err) {
        console.log("Error getting weather information");
    }
}


/* Calculations */

function calculateWeatherScore(weatherCondition) {
    if (weatherCondition > 1 && weatherCondition < 55) {
        return 100;
    } else if (weatherCondition < 2) {
        return 75;
    } else {
        return 50;
    }
}

function calculateWindScore(windSpeed) {
    if (windSpeed < 4) {
        return 100;
    } else if (windSpeed >= 4 && windSpeed < 6) {
        return 75;
    } else {
        return 50;
    }
}

function calculateWindDirectionScore(windDirection) {
    if (windDirection > 130 && windDirection < 250) {
        return 100; // Wind coming from south or southwest
    } else if (windDirection > 310 || windDirection < 50) {
        return 50;  // Wind coming from north
    } else {
        return 75;
    }
}

function calculateLikelihood(weatherCondition, windSpeedMs, windDirection) {
    // Define weights for each parameter
    const weights = {
        weather: 0.3,
        windSpeed: 0.3,
        windDirection: 0.4
    };

    // Calculate scores for each parameter
    const weatherScore = calculateWeatherScore(weatherCondition);
    const windSpeedScore = calculateWindScore(windSpeedMs);
    const windDirectionScore = calculateWindDirectionScore(windDirection);

    // Calculate overall likelihood percentage
    const overallLikelihood = (weights.weather * weatherScore)
        + (weights.windSpeed * windSpeedScore)
        + (weights.windDirection * windDirectionScore);

    return Math.round(overallLikelihood); // Round to nearest whole number
}


/* 
---- Todo ---- 
- Better error messages, innerHTML perhaps 
- Lure of the day information
- Placeholder images for weather
- Better fonts
- Loops eventually? 
- Download your own weather image pack? 
- 
- 
*/