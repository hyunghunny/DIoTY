var socketIo = require('socket.io');

var socketServer = null;

exports.connect = function (server, cb) {
    socketServer = socketIo.listen(server);
    
    socketServer.sockets.on('connection', function (socket) {
        console.log('socket connected');
        if (cb) {
            cb(socket);
        }
    });
}

exports.isConnected = function () {
    if (socketServer) {
        return true;
    } else {
        return false;
    }
}

exports.emit = function (type, msg, socket) {
    if (socket == null && socketServer != null) {
        socketServer.sockets.emit(type, msg);
    } else if (socket != null) {
        socket.emit(type, msg);
    } else {
        console.log('no socket available. please connect first');
    }
    
}