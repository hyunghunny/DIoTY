
function DBManager(dbType, tableName, sensorType) {

    this.database = require('./' + dbType + '.js').construct(sensorType);

    if (!this.database.hasDB()) {
    this.database.createFile(); // data base file creation
    } else {
    this.database.openFile();
    }
    this.setTable(tableName);
    this.sensorType = sensorType;

}

DBManager.prototype.setTable = function (tableName) {

    this.database.createTable(tableName); // data base table creation if not exists
    this.database.setTableName(tableName);
}

DBManager.prototype.save = function (timestamp, obj) {
  // check database is ready
  if (this.database.getTableName() == '') {
    return false;
  }
  if (this.sensorType == 'ibeacon') {
        this.database.insert(timestamp, obj.uuid, obj.accuracy);
  } else {
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

exports.createDB = function (dbType, tableName, sensorType) {
    return new DBManager(dbType, tableName, sensorType);
}