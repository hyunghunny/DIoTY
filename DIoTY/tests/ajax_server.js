var xhr = null;
var util = require('util');

// to load the XMLHttpRequest in node.js
if (typeof module !== 'undefined') {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

function Sensor(id, type) {

}

function OpenAPI() {
    xhr = new XMLHttpRequest();
    var APIs = {
        ipAddress: 'http://127.0.0.1:3000',
        id: 'thermometer1',
        sensors: {
            /**
             * \brief Get all sensors or a specific sensor with id.
             * \param callback RetrieveSensorsCallback callback = function (Sensor sensorObj)
             * \param id DOMString sensorId
             */
            getSensors: function (callback, id) {
                var url = this.ipAddress + '/api/sensors';
                if (id != null) {
                    url = url + '/' + id;
                }
                try {
                    if (!xhr) {
                        throw new Error('AJAX object is not initialized.');
                    }
                    
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                //callback the body message
                                var jsonObj = JSON.parse(xhr.responseText);
                                var ret;
                                if (jsonObj.sensors) {
                                    // the array of sensors are returned
                                    for (var i = 0; i < jsonObj.sensors.length ; i++) {
                                        var sensor = jsonObj.sensors[i];
                                        switch (sensor.type) {
                                            case 'thermometer':
                                                //TODO:create a sensor object
                                                break;
                                            default:
                                                throw new Error('Unsupported sensor type');
                                                break;
                                        }
                                    }
                                } else if (jsonObj.sensor) {
                                    // a sensor is returned
                                } else {
                                    throw new Error('Mismatched JSON type returned.');
                                }
                                callback(ret);
                            } else {
                                throw new Error('There was a problem with the request: ' + xhr.status);
                            }
                        }
                    };
                    xhr.open('GET', url);
                    xhr.send();
                } catch (error) {
                    console.log('ERROR: ' + typeof error);
                }
            }
        },

        toObject: function (jsonObj) {

        }
    }

    return APIs;
}

//TODO:how to get a specific sensor for thermometer?

var apis = new OpenAPI();
apis.getSensors(function (data) {
    data = JSON.parse(data);
    console.log(util.inspect(data));
})
