
function DBManager(dbType, tableName, sensorType) {
    
    this.database = require('./' + dbType + '.js').construct(sensorType);
    
    if (!this.database.hasDB()) {
        this.database.createDB(); // data base file creation
    } else {
        this.database.openDB();
    }
    this.setTable(sensorType, tableName);
    this.sensorType = sensorType;

}

DBManager.prototype.setTable = function (sensorType, tableName) {
    switch (sensorType) {
        case 'distance':
            this.database.createTable(tableName, 'cm'); 
            break;
        case 'ibeacon':
            this.database.createTable(tableName, 'uuid', 'meter'); 
            break;
        case 'thermo-hygrometer':
            this.database.createTable(tableName, 'temperature', 'humidity');
            break;
        default:
            this.database.createTable(tableName, 'value');
            break;
    }
    
    this.database.setTableName(tableName);
}

DBManager.prototype.save = function (timestamp, obj) {
    // check database is ready
    if (this.database.getTableName() == '') {
        return false;
    }
    if (this.sensorType == 'ibeacon') {
        this.database.insert(timestamp, obj.uuid, obj.accuracy);
    } 
    else if (this.sensorType == 'thermo-hygrometer') {
        this.database.insert(timestamp, obj.temperature, obj.humidity);
    }    
    else {
        this.database.insert(timestamp, obj);
    }
    return true;
}


DBManager.prototype.inquire = function (condition, cb) {
    // check database is ready
    if (this.database.getTableName() == '') {
        cb(false);
        return;
    }
    // TODO:creating appropriate condition required
    
    if (typeof condition === 'string') {
        this.database.find(function (rows) {
            cb(rows);
        }, condition);
    } else {
        this.database.find(function (rows) {
            cb(rows);
        });
    }

}
DBManager.prototype.close = function () {
    this.database.closeDB();
    console.log('database closed');
}

exports.construct = function (dbType, tableName, sensorType) {
    return new DBManager(dbType, tableName, sensorType);
}