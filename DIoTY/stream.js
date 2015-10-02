var socketIo = require('socket.io');

exports.connect = function (server, cb) {
    socketServer = socketIo.listen(server);
    
    socketServer.sockets.on('connection', function (socket) {
        console.log('socket connected');
        cb(socket);
    });
}

exports.isConnected = function () {
    if (socketServer) {
        return true;
    } else {
        return false;
    }
}

exports.emit = function (msg, socket) {
    if (socket == null && socketServer != null) {
        socketServer.sockets.emit('update', msg);
    } else if (socket != null) {
        socket.emit('update', msg);
    } else {
        console.log('no socket available. please connect first');
    }
    
}