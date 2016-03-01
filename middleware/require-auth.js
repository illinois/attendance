/**
 * Middleware which sends a 401 error if the request is not authenticated.
 */
module.exports = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).end();
    }
    next();
};
