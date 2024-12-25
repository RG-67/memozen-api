const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({status: false, message: 'Internal server error', data: {}});
}

module.exports = errorMiddleware;