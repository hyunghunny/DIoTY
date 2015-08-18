
// load xmlhttprequest module if it is used in server side.
if (typeof module !== 'undefined') {
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

// logger
var LogFlag;
(function (LogFlag) {
    LogFlag[LogFlag["All"] = 0] = "All";
    LogFlag[LogFlag["Critical"] = 1] = "Critical";
    LogFlag[LogFlag["Major"] = 2] = "Major";
})(LogFlag || (LogFlag = {}));
;
var logger = {
    flag: 1 /* Critical */,
    e: function (message) {
        console.log('[ERROR] ' + message);
        if (message.stack) {
            console.log(message.stack);
        }
    },
    w: function (message) {
        if (this.flag != 1 /* Critical */)
            console.log('[WARN] ' + message);
    },
    i: function (message) {
        if (this.flag == 0 /* All */)
            console.log('[INFO] ' + message);
    }
};
logger.flag = 0 /* All */;

var RESTTransmitter = (function () {
    function RESTTransmitter(baseUrl) {
        this.baseUrl = baseUrl;
        this.apis = [];
        this.islogin = false;
        if (baseUrl.indexOf('/', baseUrl.length - 1) !== -1) {
            this.baseUrl = baseUrl.substring(0, baseUrl.length - 1);
            //console.log(baseUrl);
        }
    }
    RESTTransmitter.prototype.createAuthKey = function (id, password) {
        // XXX:hard coded for testing only
        return 'KeepYourEyesOnly';
    };

    RESTTransmitter.prototype.login = function (id, password, cb) {
        this.id = id;
        this.password = password;
        this.authKey = this.createAuthKey(id, password);
        var ajajson = new AJAJSONManager(this.baseUrl);
        ajajson.setAuthKey(this.authKey);
        var self = this;
        ajajson.get('/' + id, function (returnObj) {
            logger.i(JSON.stringify(returnObj)); // shows available APIs
            if (returnObj.api) {
                self.apis = returnObj.api;
            }
            self.islogin = true;
            cb(self); // return myself to keep going to next stage
        }, function (err) {
            logger.e(JSON.stringify(err));
            self.islogin = false;
            cb(null); // return null to stop it
        });
    };

    RESTTransmitter.prototype.getSensorUri = function (userId, sensorId) {
        var targetUri = '/' + userId + '/' + sensorId;
        for (var i = 0; i < this.apis.length; i++) {
            var api = this.apis[i];
            if (api.href == targetUri) {
                return targetUri;
            }
        }
        return "";
    };

    RESTTransmitter.prototype.emit = function (sensorId, observations, cb) {
        if (!this.islogin) {
            cb(new Error('login required before transmitting.'));
            return;
        }
        var uri = this.getSensorUri(this.id, sensorId);
        if (uri == "") {
            cb(new Error('invalid sensor Id.'));
            return;
        }

        // TODO:look up to check each observations is valid
        var content = { "observations": [] };
        for (var i = 0; i < observations.length; i++) {
            var obs = observations[i];
            var datePublished = new Date(obs.datePublished);
            if (datePublished instanceof Date) {
                var observation = {
                    "timestamp": datePublished.getTime(),
                    "value": obs.value
                };
                content.observations.push(observation);
            } else {
                console.log('invalid date type: ' + datePublished);
            }
        }
        var self = this;
        var ajajson = new AJAJSONManager(this.baseUrl);
        ajajson.setAuthKey(this.authKey);
        ajajson.post(uri, content, function () {
            cb(true);
        }, function (err) {
            logger.e(JSON.stringify(err));
            cb(false);
        });
    };
    return RESTTransmitter;
})();

// AJAX utility
var AJAJSONManager = (function () {
    // XXX: baseUrl SHOULD NOT be ended with '/'
    function AJAJSONManager(baseUrl) {
        this.baseUrl = baseUrl;
        this.xhr = null;
        this.authKey = null;
        this.xhr = new XMLHttpRequest();
        if (!this.xhr) {
            logger.e('XMLHttpRequest object is not supported in this platform.');
        }
    }
    AJAJSONManager.prototype.setHeaders = function () {
        this.xhr.setRequestHeader('Authorization', this.authKey);
        this.xhr.setRequestHeader('Content-Type', 'application/json');
    };

    AJAJSONManager.prototype.setAuthKey = function (authKey) {
        // TODO:validate it if possible
        this.authKey = authKey;
        return true;
    };

    AJAJSONManager.prototype.get = function (uri, scb, ecb) {
        if (!this.xhr) {
            var err = new Error('XMLHttpRequest object is not supported in this platform.');
            ecb(err);
        }
        var self = this;

        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 200) {
                    scb(JSON.parse(self.xhr.responseText));
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('GET REQUEST: ' + this.baseUrl + uri);

        this.xhr.open('GET', this.baseUrl + uri);
        this.setHeaders();
        this.xhr.send();
    };

    AJAJSONManager.prototype.put = function (uri, content, scb, ecb) {
        if (!this.xhr) {
            var err = new Error('AJAX object is not supported.');
            ecb(err);
        }
        var self = this;
        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 202) {
                    scb(self.xhr);
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('PUT REQUEST: ' + this.baseUrl + uri);
        this.xhr.open('PUT', this.baseUrl + uri);
        this.setHeaders();
        this.xhr.send(JSON.stringify(content));
    };
    AJAJSONManager.prototype.post = function (uri, content, scb, ecb) {
        if (!this.xhr) {
            var err = new Error('AJAX object is not supported.');
            ecb(err);
        }
        var self = this;
        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 202) {
                    scb(self.xhr);
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('POST REQUEST: ' + this.baseUrl + uri);
        this.xhr.open('POST', this.baseUrl + uri);
        this.setHeaders();
        this.xhr.send(JSON.stringify(content));
    };

    AJAJSONManager.prototype.delete = function (uri, scb, ecb) {
        if (!this.xhr) {
            var err = new Error('XMLHttpRequest object is not supported in this platform.');
            ecb(err);
        }
        var self = this;

        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState === 4) {
                if (self.xhr.status === 200) {
                    scb(JSON.parse(self.xhr.responseText));
                } else {
                    var err = new Error('Unexpected response: ' + self.xhr.status);
                    logger.w(err);
                    ecb(err);
                }
            }
        };
        logger.i('DELETE REQUEST: ' + this.baseUrl + uri);

        this.xhr.open('DELETE', this.baseUrl + uri);
        this.setHeaders();
        this.xhr.send();
    };
    return AJAJSONManager;
})();
;

// exposes API if the script executes on server side.
if (typeof module !== 'undefined') {
exports.transmitter = new RESTTransmitter('http://localhost:3000');
//exports.logger = logger;
}

//# sourceMappingURL=api.js.map
