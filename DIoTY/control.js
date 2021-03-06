var express = require('express'),
    mysql = require('mysql'),
    serialPort = require('serialport'),
    df = require('./dateformat');

// XXX:Set appropriate serial port properties below
var sp = new serialPort.SerialPort('COM7', {
    baudrate: 19200,
    parser: serialPort.parsers.readline('\n')
}, false);

// XXX:Set appropriate login information below
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'q1w2e3',
    database: 'temps'
});

// to pause or resume DB record
var recording = "yet";

sp.on('open', function () {
    console.log('serial opened successfully.');

    sp.on('data', function (data) {

        var temp = new String(data).trim();
        var dateString = df.dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss");
        if (recording == "on") {
            // write a temperature into DB  
            connection.query('insert into tempData(tempDate, tempCelsius) values(?, ?)',
            [dateString, temp],
                function (err) {
                    if (err) throw err;
                });
        }

    });
});

connection.connect(function (err) {
    if (err) {
        // internal server error
        console.log("database connection error: " + err.message);
        throw new Error('500');
    }
    console.log("database connected successfully");
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