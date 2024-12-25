const authRoutes = require('./routes/authRoutes');
const loggerMiddleware = require('./middlewares/loggerMiddleware');

const express = require('express');
const app = express();


app.use(loggerMiddleware);

app.use('/auth', authRoutes);

module.exports = app;
