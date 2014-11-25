var img;
var currentTemperature;

function getRatio(iTemp) {
	/* The image is not in proportion this the gauge to pixel 
	 * ratio need slight adjustment
	 */

	var iRatio;

	if (iTemp > 0) {
		iRatio = 7.1;
	} else if (iTemp <= 0) {
		iRatio = 6.9;
	} else if (iTemp < -20) {
		iRatio = 6.77;
	}

	return iRatio;
}

function convertTempToScreenCoord(iRatio, iTemp) {
	/* Algorithm to convert the temperature to the correct x screen coord.
	 * Odd, but works!
	 */
	var iMAX_TEMP = 50,
		iSTART_Y_POS = 147;

	return iSTART_Y_POS + (iRatio * (iMAX_TEMP - iTemp));
}

function drawLiquid(ctx, iTempToYCoord) {
	/* Draw red rectangle to represent the fluid in the glass tube
	 * Coordinates you Y and are fixed!
	 * TODO: Calculare Y coord base on image X,Y
	 */

	var iX_POS = 111,
		iY_POS = 7,
		iY_OFFSET = 686,
		iWIDTH = 35;

	ctx.fillStyle = "rgb(200,0,0)";

	// Draw rectangle from -30 to iTempToYCoord
	ctx.fillRect(iX_POS, iTempToYCoord, iY_POS, iY_OFFSET - iTempToYCoord);

	// Draw rectangle from botton to -30
	ctx.fillRect(iX_POS, iY_OFFSET, iY_POS, iWIDTH);

	ctx.stroke();
}

function imgOnLoaded() {
	/* Simply grabs a handle to the canvas element and
	 * check the context (Canvas support). 
	*/

	var canvas = document.getElementById('thermometer'),
		ctx = null,
		iTemp = 0,
		iRatio  = 0,
		iTempToYCoord = 0;

	// Canvas supported?
	if (canvas.getContext) {

		ctx = canvas.getContext('2d');
		iTemp = currentTemperature;
		iRatio = getRatio(iTemp);
		iTempToYCoord = convertTempToScreenCoord(iRatio, iTemp);

		// Draw the loaded image onto the canvas
		ctx.drawImage(img, 0, 0);

		// Draw the liquid level
		drawLiquid(ctx, iTempToYCoord);

	} else {
		alert("Canvas not supported!");
	}
}

function draw() {

	/* Main entry point got the thermometer Canvas example
	 * Simply grabs a handle to the canvas element and
	 * check the conect (Canvas support). 
	 */

	var canvas = document.getElementById('thermometer');

	// Create the image resource
	img = new Image();

	// Canvas supported?
	if (canvas.getContext) {
		// Setup the onload event
		img.onload = imgOnLoaded;

		// Load the image
		img.src = 'images/thermometer-template.png';
	} else {
		alert("Canvas not supported!");
	}
}

// Add below code to get latest temperature of a sensor.
var myapi = new OpenAPIManager();
var mySensor;
myapi.sensors.retrieve(function (sensors) {
    logger.i('sensors are successfully retrieved.');
    logger.i('number of sensors: ' + sensors.length);
    
    if (sensors.length > 0 && sensors[0].type == 'thermometer') {
        // show the 1st thermometer's latest temperature
        mySensor = sensors[0];
        turnOnSensor(mySensor, function () {
            // update UI per 5 secs
            setInterval(function () {
                console.log('update event fired');
                getLatestTemperature(mySensor);
            }, 5000);
        });
    }
});

function turnOnSensor(sensor, cb) {
    console.log('try to turn on... from ' + JSON.stringify(sensor));
    if (sensor.mode === 'off') {
        sensor.turnOn(function () {
            cb();
        }, function (err) {
            cb();
        });
    }
    cb();
}

function getLatestTemperature(sensor) {
    sensor.getLatestTemp(function (temp) {
        logger.i('latest temperature is ' + temp.value + ' ' + temp.unitOfMeasure);
        currentTemperature = temp.value;
        timeWidget = document.getElementById('timeWidget');
        timeWidget.innerHTML = new Date(temp.datePublished).toLocaleTimeString();
        humidityWidget = document.getElementById('humidityWidget');
        humidityWidget.innerHTML = temp.humidity + "%";

        draw();        
    });
}