google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(requestData);

function requestData() {
    // Add below code to get latest temperature of a sensor.
    var myapi = new OpenAPIManager();
    var mySensor;
    myapi.sensors.retrieve(function (sensors) {
        logger.i('sensors are successfully retrieved.');
        logger.i('number of sensors: ' + sensors.length);
        
        if (sensors.length > 0 && sensors[0].type == 'thermometer') {
            // show the 1st thermometer's all temperatures
            mySensor = sensors[0];
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
            cb();
        }, function (err) {
            cb();
        });
    }
}

function drawChart(temperatures) {
    console.log('drawChart is invoked.');
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