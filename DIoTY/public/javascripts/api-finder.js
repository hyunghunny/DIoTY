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
if (finder.setGateway('192.168.11.1', 3000)) {
    finder.find(function (list) {
        console.log('The number of sensors is ' + list.length);
        for (var i = 0; i < list.length; i++) {
            console.log(list[i]);
        }
    }, function (err) {
        console.log(err);
    })
} else {
    logger.e('gateway setting fail');
}