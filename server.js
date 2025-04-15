require('dotenv').config();
const cds = require('@sap/cds');
const cors = require('cors'); // Import CORS
const express = require('express'); // Import Express

cds.on('bootstrap', (app) => {
    // Enable CORS for frontend
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }));

    // Handle preflight CORS requests
    app.options('*', cors());
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        await cds.disconnect();
        console.log('All connections closed.');
    } catch (error) {
        console.error('Error during shutdown:', error.message);
    }
    process.exit(0);
});

module.exports = cds.server;
