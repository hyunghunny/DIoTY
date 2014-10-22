google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(requestData);

function requestData() {
    // Add below code to get latest temperature of a sensor.
    var myapi = new OpenAPIManager();
    myapi.sensors.retrieve(function (sensors) {
        logger.i('number of sensors: ' + sensors.length);
        console.log(sensors[0].type);
        if (sensors.length > 0 && sensors[0].type === 'thermometer') {
            // show the 1st thermometer's all temperatures
            var mySensor = sensors[0];
            console.log('getting thermometer is successful. ');
            turnOnSensor(mySensor, function () {
                mySensor.getTempList(function (temperatures) {
                    drawChart(temperatures);
                });
            });
        }
    });
}

function turnOnSensor(sensor, cb) {

    if (sensor.status === 'off') {
        sensor.turnOn(function () {
            console.log('sensor is on');
            cb();
        }, function (err) {
            console.log('sensor is off');
            cb();
        });
    }
    cb();
}

function drawChart(temperatures) {

    // transform temperatures to appropriate array
    var title = ['time', 'celsius'];
    var trendArray = [ title ];
    
    for (var i = 0; i < temperatures.length; i++) {
        var temperature = temperatures[i];
        var tempArray = [];
        
        tempArray.push(temperature.datePublished);
        tempArray.push(temperature.value);

        trendArray.push(tempArray);    
    }

    var data = google.visualization.arrayToDataTable(trendArray);
    var options = {
        title: 'All temperatures',
        legend: { position: 'bottom' },
        curveType: 'function'
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}