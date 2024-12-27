const admin = require('../config/firebaseConfig');


const sendPushNotification = async (deviceToken, title, body) => {
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            android: {
                priority: 'high'
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default'
                    }
                }
            },
            token: deviceToken
        };
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (e) {
        console.error(e);
    }
}

module.exports = sendPushNotification;