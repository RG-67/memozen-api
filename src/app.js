const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const express = require('express');
const app = express();


app.use(loggerMiddleware);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/task', taskRoutes);
app.use('/note', noteRoutes);

app.use(errorMiddleware);

module.exports = app;
