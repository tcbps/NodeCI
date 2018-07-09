const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;

const redis = require('redis');
const CONFIG = require('../config/keys');
const redisClient = redis.createClient(CONFIG.REDIS_URL);

const util = require('util');
redisClient.hget = util.promisify(redisClient.hget);


mongoose.Query.prototype.useCache = function(options = {}) {
    this._useCache = true;
    this._hashParentKey = JSON.stringify(options.parentKey || '');
    return this;
};


mongoose.Query.prototype.exec = async function() {
    if (!this._useCache) {
console.log('Returned fresh result, bypassing cache');
        return exec.apply(this, arguments);
    }

    try {
        const hashChildKey = this.mongooseCollection.name + JSON.stringify(this.getQuery());
        let cachedResult = await redisClient.hget(this._hashParentKey, hashChildKey);

        if (cachedResult) {
            cachedResult = JSON.parse(cachedResult);

            if (Array.isArray(cachedResult)) {
console.log('Served array of cached results with keys ', this._hashParentKey, hashChildKey);
                return cachedResult.map(cachedItem => new this.model(cachedItem));
            }

console.log('Served single cached result with keys ', this._hashParentKey, hashChildKey);
            return new this.model(cachedResult);
        }

        const result = await exec.apply(this, arguments);
        redisClient.hset(this._hashParentKey, hashChildKey, JSON.stringify(result)/*, 'EX', 10*/);
console.log('Stored fresh result with keys ', this._hashParentKey, hashChildKey);
        return result;
    } catch(error) {
        return null;
    }
};


module.exports = {
    clearHash(parentKey) {
        redisClient.del(JSON.stringify(parentKey));
    }
};