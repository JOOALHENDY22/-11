import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { globalLimiter, securityHeaders, sanitizeRequestBody } from './middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(securityHeaders);
app.use(globalLimiter);
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeRequestBody);

// Routes
app.use('/api', apiRouter);

// Root test
app.get('/', (_req, res) => {
  res.send('yoRosheta Enterprise Healthcare API is running securely.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`[yoRosheta Secure Backend Server] running on http://localhost:${PORT}`);
});
