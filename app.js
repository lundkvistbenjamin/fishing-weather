import { weatherCodes } from "./weatherCodes.js";

const dayNames = document.querySelectorAll(".weather-day-container .day-of-week");
const likelihood = document.querySelectorAll(".weather-day-container .likelihood");
const weatherImages = document.querySelectorAll(".weather-day-container .weather-img");
const minTemps = document.querySelectorAll(".weather-day-container .min-temp");
const maxTemps = document.querySelectorAll(".weather-day-container .max-temp");
const windSpeeds = document.querySelectorAll(".weather-day-container .wind-speed");
const lureImageContainer = document.querySelectorAll(".lure-img-container");


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
            const fishingScore = calculateFishingScore(weather_code[i], wind_speed_10m_max[i], wind_direction_10m_dominant[i]);

            const scoreColor = calculateFishingScoreColor(fishingScore);

            // Get wind direction
            const windDirection = getWindDirection(wind_direction_10m_dominant[i]);

            weatherImages[i].src = weatherCodes[weather_code[i]].image;
            minTemps[i].innerHTML = `Min: ${Math.round(temperature_2m_min[i])}°C`;
            maxTemps[i].innerHTML = `Max: ${Math.round(temperature_2m_max[i])}°C`;
            windSpeeds[i].innerHTML = `${windDirection} wind: ${Math.round(wind_speed_10m_max[i])} m/s`;
            likelihood[i].innerHTML = `Fishing score: <span style="color:${scoreColor}">${fishingScore}%</span>`;

            // Get lure colors
            const lureColors = getLureColor(weather_code[i]);
            // Clear previous images in the lure image container
            lureImageContainer[i].innerHTML = "";
            // Append lure images to the lure image container
            lureColors.forEach(color => {
                const img = document.createElement("img");
                img.src = `./images/lures/${color}.png`;
                img.alt = color;
                lureImageContainer[i].appendChild(img);
            });

        }
    } catch (err) {
        console.log("Error getting weather information");
    }
}

/* Lure colors */

function getLureColor(weatherCondition) {
    if (weatherCondition > 1 && weatherCondition < 55) { // Cloudy or light drizzle
        return ["Gold", "Black", "Firetiger"];
    } else if (weatherCondition <= 1) { // Sunny
        return ["Silver", "GreenSilver", "Natural"];
    } else {
        return ["Black", "Orange", "Red"];
    }
}

/* Wind direction */

function getWindDirection(windDirection) {
    const directions = [
        "North", "Northeast", "East", "Southeast",
        "South", "Southwest", "West", "Northwest"
    ];
    // Each direction represents 45 degrees
    const segmentSize = 360 / directions.length;
    // Calculate the index of the direction
    const index = Math.floor((windDirection + segmentSize / 2) / segmentSize) % directions.length;
    return directions[index];
}

/* Calculations */

function calculateWeatherScore(weatherCondition) {
    if (weatherCondition > 1 && weatherCondition <= 57) { // Cloudy, drizzle
        return 100;
    } else if (weatherCondition <= 1 || weatherCondition == 61 || (weatherCondition >= 80 && weatherCondition <= 86)) { // Sunny, light rain, rain/snow showers
        return 75;
    } else {
        return 50;
    }
}

function calculateWindScore(windSpeed) {
    if (windSpeed < 8) {
        return 100;
    } else if (windSpeed >= 8 && windSpeed < 12) {
        return 75;
    } else {
        return 50;
    }
}

function calculateWindDirectionScore(windDirectionString) {
    if (windDirectionString == "Southwest" || windDirectionString == "West" || windDirectionString == "South") {
        return 100;
    } else if (windDirectionString == "Northwest" || windDirectionString == "Southeast" || windDirectionString == "East") {
        return 75;
    } else {
        return 50;
    }

}

/* Calculate Fishing Score based on conditions */

function calculateFishingScore(weatherCondition, windSpeedMs, windDirection) {
    // Define weights for each parameter
    const weights = {
        weather: 0.3,
        windSpeed: 0.3,
        windDirection: 0.4
    };

    const windDirectionString = getWindDirection(windDirection);

    // Calculate scores for each parameter
    const weatherScore = calculateWeatherScore(weatherCondition);
    const windSpeedScore = calculateWindScore(windSpeedMs);
    const windDirectionScore = calculateWindDirectionScore(windDirectionString);

    // Calculate overall likelihood percentage
    const overallLikelihood = (weights.weather * weatherScore)
        + (weights.windSpeed * windSpeedScore)
        + (weights.windDirection * windDirectionScore);

    return Math.round(overallLikelihood); // Round to nearest whole number
}

// Change Fishing Score color based on number
function calculateFishingScoreColor(fishingScore) {
    if (fishingScore > 84) {
        return "green";
    } else if (fishingScore >= 60 && fishingScore <= 84) {
        return "orange";
    } else {
        return "red";
    }
}


/* 
---- Todo ---- 
- Better error messages, innerHTML perhaps 
- Placeholder images for weather
- Better fonts
- Loops eventually? (HTML)
- Download your own weather image pack? 
- 
- 
*/