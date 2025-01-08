const app = require('./app');
const db = require('./config/db');
const port = process.env.PORT || 5000;
const http = require('http');
const initSocket = require('../src/sockets/socket');

const server = http.createServer(app);

initSocket(server);


db.connect((err) => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('connected');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});