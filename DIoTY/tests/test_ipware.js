var get_ip = require('ipware')().get_ip;
var os = require('os');

var server = require('http').createServer(function (req, res) {
    var ip_info = get_ip(req);
    console.log(ip_info);
    var networks = os.getNetworkInterfaces();
    console.log(networks);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to Node.JS Server!</h1><hr/><p>Hi! ' + ip_info.clientIp + ',<br/> I\'m ' + networks['Wi-Fi'][1].address +'</p>');

});

server.listen(52273, function () {
    console.log('Server is running at port 52273');
});

