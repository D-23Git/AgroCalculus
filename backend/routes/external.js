const express = require('express');
const router = express.Router();

// Get real-time weather data
router.get('/weather', async (req, res) => {
    const { lat, lon, city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        let latToUse = lat;
        let lonToUse = lon;
        let cityName = city || 'Pune';

        // If lat/lon are not provided, we need to geocode the city name first
        if (!lat || !lon) {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            
            if (geoData.results && geoData.results.length > 0) {
                latToUse = geoData.results[0].latitude;
                lonToUse = geoData.results[0].longitude;
                cityName = geoData.results[0].name;
            } else {
                return res.status(404).json({ error: 'City not found' });
            }
        }

        // Fetch real-time weather from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latToUse}&longitude=${lonToUse}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        if (weatherRes.ok) {
            // Map Open-Meteo WMO codes to descriptions roughly
            const code = weatherData.current.weather_code;
            let desc = "Clear";
            if (code >= 1 && code <= 3) desc = "Partly Cloudy";
            if (code >= 51 && code <= 67) desc = "Rain";
            if (code >= 71 && code <= 77) desc = "Snow";
            if (code >= 95) desc = "Thunderstorm";

            res.json({
                temp: Math.round(weatherData.current.temperature_2m),
                humidity: Math.round(weatherData.current.relative_humidity_2m),
                wind: Math.round(weatherData.current.wind_speed_10m),
                description: desc,
                city: cityName
            });
        } else {
            res.status(weatherRes.status).json({ error: "Weather API failed" });
        }
    } catch (err) {
        console.error("Weather fetch error:", err);
        res.status(500).json({ error: 'Failed to fetch real weather' });
    }
});

module.exports = router;
