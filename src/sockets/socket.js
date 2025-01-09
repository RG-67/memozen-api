const { Server } = require('socket.io');
const userEvent = require('./userEvent');


module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*' // update when live
        },
    });

    io.on("connection", (socket) => {
        console.log('User connected', socket.id);

        userEvent(io, socket);

        socket.on('test', (data) => {
            console.log('Received from client', data);

            socket.emit('response', {message: 'Hello from the TestServer'});
        });

        socket.on('disconnect', () => {
            console.log('User disConnected', socket.id);
        });
    });

    return io;

};

