const schedule = require('node-schedule');
const sendPushNotification = require('./reminderService');

const scheduleReminder = async (deviceToken, title, body, reminderDateTime) => {
    try {
        schedule.scheduleJob(reminderDateTime, async () => {
            await sendPushNotification(deviceToken, title, body);
            console.log('Sending push notification...');
        });
    } catch (e) {
        console.error(e);
    }
}


module.exports = scheduleReminder;