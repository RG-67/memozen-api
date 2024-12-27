const admin = require('firebase-admin');
const serviceAccount = require('../services/service_cred.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = admin;