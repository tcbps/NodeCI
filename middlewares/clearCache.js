const { clearHash } = require('../services/cache');

module.exports = clearCache = async (req, res, next) => {
    await next();

    clearHash(req.user.id);
};