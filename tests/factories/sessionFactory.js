const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip')
const keys = require('../../config/keys')
const keygrip = new Keygrip([keys.cookieKey])
module.exports = (user) => {        
    const sessionObject = {
        passport : {
            // We need to convert the id to string because Mongoose stores id as a javascript object
            user: user._id.toString()
        }
    }
    
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
    const sig = keygrip.sign('session=' + session)

    return { session, sig };
}