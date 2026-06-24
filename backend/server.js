const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend folder explicitly (works on Vercel + local)
dotenv.config({ path: path.join(__dirname, '.env') });

const { authConn, ledgerConn, marketConn, villageConn } = require('./db');

const app = express();

// SUPER LOGGER - FIRST THING
app.use((req, res, next) => {
    console.log(`📡 >>> [SERVER LOG] ${req.method} ${req.url}`);
    next();
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'x-auth-token'] }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

console.log('⏳ Isolated Databases are connecting...');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/records', require('./routes/records'));
app.use('/api/village', require('./routes/village'));
app.use('/api/market', require('./routes/market'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/news', require('./routes/news'));
app.use('/api/external', require('./routes/external'));

const PORT = 5003;

app.get('/', (req, res) => {
    res.send('Agro-Master Professional API is running with Isolated Databases...');
});

// 404 CATCH-ALL FOR DEBUGGING (must be AFTER all routes)
app.use((req, res, next) => {
    console.log(`❌ [404 ERROR] Route Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route Not Found', path: req.url, method: req.method });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 [${new Date().toLocaleTimeString()}] Server running on port ${PORT}`);
        console.log('📂 Professional Multi-DB Architecture Active');
    });
}

// Export for Vercel Serverless
module.exports = app;

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Global Server Error:", err);
    res.status(500).json({ msg: 'Something went wrong on the server', error: err.message });
});
