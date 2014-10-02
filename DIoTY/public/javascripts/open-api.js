var httpRequest; 

function OpenAPI() {
    httpRequest = new XMLHttpRequest();
    var APIs = {
        ipAddress: '127.0.0.1:3000',
        id: 'thermometer1'
    };
    return APIs;
}

APIs.prototype.getSensors = function (callback, options) {
    if (options.ipAddress) {
        this.ipAddress = options.ipAddress;
    }
    try {
        if (!httpRequest) {
            throw new Error('AJAX object is not initialized.');
        }
        var url = this.ipAddress + '\api\sensors';
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    //callback the body message
                    callback(httpRequest.responseText);
                } else {
                    throw new Error('There was a problem with the request: ' + httpRequest.status);
                }
            }          
        };
        httpRequest.open('GET', url);
        httpRequest.send();
    } catch (error) {
        console.log('ERROR: ' + error.message);
    }
}

//TODO:how to get a specific sensor for thermometer?