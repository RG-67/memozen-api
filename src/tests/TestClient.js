const { Socket } = require('socket.io');

const io = require('socket.io-client');

const socket = io(process.env.BASE_URL);


socket.on('connect', () => {
    console.log('Connect with server');

    socket.emit('test', {message: 'Hello from the TestClientTest2'});

    socket.on('response', (data) => {
        console.log('Receive response from server', data);
        // socket.disconnect();
    });
});

socket.on('disconnect', () => {
    console.log('Disconnect from server');
});