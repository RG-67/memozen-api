const app = require('./app');
const db = require('./config/db');


db.connect((err) => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('connected');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});