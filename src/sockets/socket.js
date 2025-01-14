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

        socket.emit('serverMessage', { message: 'Welcome to the Server!' });

        socket.broadcast.emit('serverMessage', { message: 'A new user has joined!' });


        // userEvent(io, socket);

        /* socket.on('test', (data) => {
            console.log('Received from client', data);

            socket.emit('response', {message: 'Hello from the TestServer'});
        }); */

        socket.on('sendMessage', (data) => {
            console.log('Message received from client:', data);

            io.emit('chatMessage', data);
        });

        socket.on('disconnect', () => {
            console.log('User disConnected', socket.id);

            socket.broadcast.emit('serverMessage', {message: 'A user has left the chat!'});
        });
    });

    return io;

};

