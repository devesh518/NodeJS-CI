const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')
const keys = require("../config/keys")

const client = redis.createClient(keys.redisURL)

client.hget = util.promisify(client.hget)
// client.set = util.promisify(client.set)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '')
    return this;
}

mongoose.Query.prototype.exec = async function () {
    // If useCache is false, we do not want to implement all the caching logic in our function
    if(!this.useCache){
        return exec.apply(this, arguments)
    }

    console.log("I am about to run a query");
    // console.log(this.getQuery());
    // console.log(this.mongooseCollection.name);  

    // We are trying to create a new object Cache key
    // We are combining the result of this.getQuery() and the collection name
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    // See if we have a value for the cache key (key) in Redis
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, we will return that
    if(cacheValue){
        const doc = JSON.parse(cacheValue)

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
        // return doc;
        // console.log(cacheValue);
        // return JSON.parse(cacheValue);
    }

    // If not, we will issue the query and store the results in Redis
    const result = await exec.apply(this, arguments)
    client.hset(this.hashKey, key, JSON.stringify(result),'EX', 10)
    console.log(result.validate);
    // console.log(key);
}

module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
};