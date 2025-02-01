const { Server } = require('socket.io');
const userEvent = require('./userEvent');
const db = require('../config/db');


module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*' // update when live
        },
    });

    io.on("connection", (socket) => {
        console.log('User connected', socket.id);

        socket.on('joinRoom', ({ userId }) => {
            socket.join(userId);
            console.log(`User ${socket.id} join room ${userId}`);
        });

        socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
            try {
                console.log(`Message send from ${senderId} to ${receiverId}, message: ${message}`);
                const query = "INSERT INTO user_to_user_messages(sender_id, receiver_id, message) values($1, $2, $3) RETURNING *";
                const result = await db.query(query, [senderId, receiverId, message]);
                const savedMessage = result.rows[0];
                io.to(receiverId).emit('chatMessage', savedMessage);
                io.to(senderId).emit('chatMessage', savedMessage);
            } catch (error) {
                console.error(`Database Error: ${error}`);
            }
        });

        /* socket.emit('serverMessage', { message: 'Welcome to the Server!' });

        socket.broadcast.emit('serverMessage', { message: 'A new user has joined!' }); */


        // userEvent(io, socket);

        /* socket.on('test', (data) => {
            console.log('Received from client', data);

            socket.emit('response', {message: 'Hello from the TestServer'});
        }); */

        /* socket.on('assignTask', ({ userId, task }) => {
            console.log(`Task assign to user ${userId}: `, task);
            io.to(userId).emit('taskAssigned', task);
        });

        socket.on('updateTask', ({ userId, taskId, status }) => {
            console.log(`${taskId} updated by user ${userId} to status ${status}`);
            io.to(userId).emit('taskUpdated', { taskId, status });
        }) */

        socket.on('disconnect', () => {
            console.log('User disConnected', socket.id);
            // socket.broadcast.emit('serverMessage', { message: 'A user has left the chat!' });
        });
    });

    return io;

};