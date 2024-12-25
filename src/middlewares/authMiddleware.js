const authMiddleware = (req, res, next) => {
    const projectKey = process.env.PROJECT_KEY;
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer')) {
        return res.status(401).json({status: false, message: 'Unauthorized token', data: {}});
    }
    const token = authorization.split(' ')[1];
    if (token !== projectKey) {
        return res.status(401).json({status: false, message: 'Unauthorized access', data: {}});
    }
    next();
}

module.exports = authMiddleware;