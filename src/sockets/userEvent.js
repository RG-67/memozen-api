


module.exports = (io, socket) => {
    socket.on('notify_user', (notification) => {
        io.to(`user_${notification.userId}`).emit('notification', notification);
        console.log('Notification sent:', notification);
    });
};