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

            io.emit('chatMessage', {...data, sender: socket.id});
        });

        socket.on('joinRoom', ({userId}) => {
            socket.join(userId);
            console.log(`User ${socket.id} join room ${userId}`);
        });

        socket.on('assignTask', ({userId, task}) => {
            console.log(`Task assign to user ${userId}: `, task);
            io.to(userId).emit('taskAssigned', task);
        });

        socket.on('updateTask', ({userId, taskId, status}) => {
            console.log(`${taskId} updated by user ${userId} to status ${status}`);
            io.to(userId).emit('taskUpdated', {taskId, status});
        })

        socket.on('disconnect', () => {
            console.log('User disConnected', socket.id);

            socket.broadcast.emit('serverMessage', {message: 'A user has left the chat!'});
        });
    });

    return io;

};

