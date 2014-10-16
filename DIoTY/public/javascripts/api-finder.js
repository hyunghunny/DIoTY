if (typeof module !== 'undefined') {
    // script on server side
    myapi = require('./api.ts.js').myapi;
    logger = require('./api.ts.js').logger;
    finder = require('./api.ts.js').finder;    
} else {
    // script on client side
    myapi = new OpenAPIManager();
    finder = new OpenAPIFinder();
}
//logger.flag = 1;

finder.findSensors('192.168.11.*', function (list) {
    console.log('The number of sensors is ' + list.length);
    for (var i = 0; i < list.length; i++) {
        console.log(list[i].id);
    }
    console.log("total sensors: " + finder.nearbySensors.length);
}, function (err) {
    console.log(err);
});
