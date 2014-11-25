﻿google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(requestData);

var dateDiv = document.getElementById('date');
var dateString = dateDiv.innerHTML;
var loading = document.getElementById('loading');

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
                    loading.style.visibility = "hidden";
                    if (temperatures != null & temperatures.length > 0) {
                        drawChart(temperatures);
                    }                    
                }, function (err) {
                    console.log('error on getting temperature list: ' + err);
                }, { "date" : dateString });
            });
        }
    });
}

function turnOnSensor(sensor, cb) {
    console.log('try to turn on... from ' + JSON.stringify(sensor));
    if (sensor.mode === 'off') {
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
    var title = ['time',  'humidity', 'temperature',];
    var trendArray = [ title ];
    
    for (var i = 0; i < temperatures.length; i++) {
        var temperature = temperatures[i];
        var tempArray = [];
        
        tempArray.push(temperature.datePublished); 
        tempArray.push(temperature.humidity);
        tempArray.push(temperature.value);

        trendArray.push(tempArray);    
    }

    var data = google.visualization.arrayToDataTable(trendArray);
    var options = {
        //width : 2048,
        title: 'Temperatures & Humidity trend',
        legend: { position: 'bottom' },
        // orientation: 'vertical',
        curveType: 'function',
        fontSize: 9,
        chartArea: { left:30, top:30, botton:10, right:30, width:'80%', height:'80%'}
        
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);    
    
}