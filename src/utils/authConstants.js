const bcrypt = require('bcrypt');

async function setPassword(password) {
    const hashPass = await bcrypt.hash(password, 10);
    return hashPass;
}

async function comparePassword(password, hash) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}


module.exports = { setPassword, comparePassword };