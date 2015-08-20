var express = require('express'),
    serialPort = require('serialport'),
    df = require('./dateformat');

// XXX:Set appropriate serial port properties below
var sp = new serialPort.SerialPort('COM8', {
    baudrate: 9600,
    parser: serialPort.parsers.readline('\n')
}, false);


sp.on('open', function () {
    console.log('serial opened successfully.');

    sp.on('data', function (data) {

        var value = new String(data).trim();
        var now = new Date();
        var timestamp = now.getTime();
        // TODO:save value with timestamp

    });
});


exports.serialToDb = function (mode, cb) {

    if (mode == 'on') {            
        if (recording == "yet") {
            sp.open(function (err) {
                if (err) {
                    // XXX: check if the opened port is reopened.
                    console.log("serial port open fails : " + err.message);
                    cb(false);
                } else {
                    recording = "on";
                    cb(true);
                }
            });
        } else if (recording == "off") {
            recording = "on";
            cb(true);
        }
    } else {
        // stop to write temperatures into database 
        recording = "off";
        cb(true);

    }


};

exports.getTemperatureList = function (callback, queries) {
    console.log("try to retrieve database...");
    try {

        connection.query('select * from tempData',
            function (err, rows, cols) {
                if (err) throw err;
                var tempList = [];

                for (var i = 0; i < rows.length; i++) {

                    var temp = {
                        datePublished:
                            df.dateFormat(rows[i].tempDate, "yyyy-mm-dd'T'HH:MM:ss+09:00"),
                        value: rows[i].tempCelsius,
                        unitOfMeasure: "celsius"
                    }
                    tempList.push(temp);
                }
                
                callback(tempList);

            });
    } catch (err) {
        console.log("DB query error : " + err.message);
        throw new Error('500');
    }
};

exports.getLatestTemperature = function (callback) {
    try {

        connection.query('select * from tempData where tempDate=(select max(tempDate) from tempData)',
            function (err, rows, cols) {
                if (err) throw err;
                
                for (var i = 0; i < rows.length; i++) {
                    var temp = {
                        datePublished:
                            df.dateFormat(rows[i].tempDate, "yyyy-mm-dd'T'HH:MM:ss+09:00"),
                        value: rows[i].tempCelsius,
                        unitOfMeasure: "celsius"
                    }

                    callback(temp);
                }

            });
    } catch (err) {
        console.log("DB query error : " + err.message);
        throw new Error('500');
    }
}