const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // Usually the middleware runs before the request handler, and here we do not want that
    // In some cases, it may happen that the blog is not posted successfully
    await next(); // This line makes sure that the middleware is run after the request handler (blog routes handler in our case)
    clearHash(req.user.id);
}