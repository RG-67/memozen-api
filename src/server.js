const app = require('./app');
const db = require('./config/db');
const port = process.env.PORT || 5000;


db.connect((err) => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('connected');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});