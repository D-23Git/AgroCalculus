const express = require('express');
const router = express.Router();

// Get real-time weather data
router.get('/weather', async (req, res) => {
    const { lat, lon, city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        let url = '';
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        } else {
            const cityName = city || 'Pune';
            url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            res.json({
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                description: data.weather[0].description,
                city: data.name
            });
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

module.exports = router;
