var voicejs = require('voice.js');
var config = require('./config.js');
var util = require('util');
var events = require('events');

var queueLength = 0;

var SmsService = function () {
    this.client = new voicejs.Client({
        email: config.GOOGLE_USERNAME,
        password: config.GOOGLE_PASSWORD
    });
};

util.inherits(SmsService, events.EventEmitter);

SmsService.prototype.sms = function (to, text, callback) {
    if (this.client) {
        console.log('SmsService sending message "' + text + '" to ' + to);
        queueLength += 1;
        var that = this;
        setTimeout(function() {
            that.client.sms({to: to, text: text}, function (err, res, data) {
                if (callback) callback(null, data);
            });
            queueLength -= 1;
        }, 1000*queueLength);
    } else {
        callback('SMS client not yet initialized');
    }
};

SmsService.prototype.init = function (callback) {
    var that = this;

    that.client = new voicejs.Client({
        email: config.GOOGLE_USERNAME,
        password: config.GOOGLE_PASSWORD
    });

    // This fn will monitor token events until all 3 tokens are retrieved.
    // When all three are retrieved, they will be saved to tokens.json
    function newToken() { // check if the client has all the tokens
        var allRetrieved = true;
        var tokens = that.client.getTokens();

        ['auth', 'gvx', 'rnr'].forEach(function (type) {
            if (!tokens.hasOwnProperty(type)) {
                allRetrieved = false;
            }
        });

        if (allRetrieved) { // save tokens once all have been retrieved
            console.log('All tokens retrieved');
            if (callback) callback(null);
        }
    }


    // Whenever a NEW token is retrieved, the corresponding event is emitted.
    // Note: These events are only emitted when the newly-retrieved token is CHANGED or NEW.
    that.client.on('auth', newToken);
    that.client.on('gvx', newToken);
    that.client.on('rnr', newToken);


    // Get an auth token
    that.client.auth(function (err, token) {
        if (err) {
            if (callback) callback(err);
            return console.log('.auth error: ', err);
        }

        console.log('New auth token:', token);
    });

    // Get an rnr token
    that.client.rnr(function (err, token) {
        if (err) {
            if (callback) callback(err);
            return console.log('.rnr error: ', err);
        }

        console.log('New rnr token:', token);
    });

    // Get a gvx token
    that.client.gvx(function (err, token) {
        if (err) {
            if (callback) callback(err);
            return console.log('.gvx error: ', err);
        }

        console.log('New gvx token:', token);
    });
};

module.exports = new SmsService();
