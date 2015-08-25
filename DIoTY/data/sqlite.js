var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();


// inheritance utility
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Sqlite = (function () {
    function Sqlite(type) {
        this.type = type;
        this.dbfile = './data/' + type + '.db';
        this.table = '';
        this.database = null;
    }

    Sqlite.prototype.hasDB = function () {
        var exists = fs.existsSync(this.dbfile);
        return exists;
    };

    Sqlite.prototype.createDB = function () {
        console.log("Creating DB file.");
        fs.openSync(this.dbfile, "w");
        this.database = new sqlite3.Database(this.dbfile);    
    };

    Sqlite.prototype.openDB = function () {
        console.log("Getting DB file.");
        this.database = new sqlite3.Database(this.dbfile);    
    };
    
    Sqlite.prototype.getTableName = function () {
        return this.table;
    };

    Sqlite.prototype.setTableName = function (tableName) {
        this.table = tableName;
    };
    Sqlite.prototype.find = function (callback, condition) {
        this.database.serialize(function () {
            //condition은 사용자에게 입력받은 조건(where절)
            if (typeof condition === 'string') {
                var stmt = "SELECT * from " + table + " where " + condition;
            }
            else {
                var stmt = "SELECT * from " + table;
            }
            database.all(stmt, function (err, rows) {
                if (err) {
                    console.log('find error! : ' + stmt)
                } else {
                    callback(rows);
                }                
            });
        })
    };
    Sqlite.prototype.closeDB = function () { };
    return Sqlite;
})();

var intParamDB = (function (_super) {
    __extends(intParamDB, _super);
    function intParamDB(type, title) {
        _super.call(this, type);
        this.title = title;
    }

    intParamDB.prototype.createTable = function (tableName) {
        var query = "CREATE TABLE IF NOT EXISTS " + tableName +
    " (timestamp DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL," + this.title + " INTEGER NOT NULL)";
        this.database.run(query);
        this.table = tableName;
        console.log(tableName + ' table created: TIMESTAMP | INTEGER');
    };

    intParamDB.prototype.insert = function (timestamp, value) {
        var self = this;
        this.database.serialize(function () {
            var query = "INSERT INTO " + self.table + "(timestamp, " + self.title + ") VALUES (?,?)";
            var stmt = self.database.prepare(query);
            stmt.run(timestamp, value, function () {
                console.log(timestamp + ", " + value);
            });
            stmt.finalize();
        });
    };
    return intParamDB;
})(Sqlite);


var realParamDB = (function (_super) {
    __extends(realParamDB, _super);
    function realParamDB(type, title) {
        _super.call(this, type);
        this.title = title;
    }
    realParamDB.prototype.createTable = function (tableName) {
        var query = "CREATE TABLE IF NOT EXISTS " + tableName +
    " (timestamp DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL," + this.title + " REAL NOT NULL)";
        this.database.run(query);
        this.table = tableName;
        console.log(tableName + ' table created: TIMESTAMP | REAL');
    };
    realParamDB.prototype.insert = function (timestamp, value) {
        var self = this;
        this.database.serialize(function () {
            var query = "INSERT INTO " + self.table + "(timestamp, " + self.title + ") VALUES (?,?)";
            var stmt = self.database.prepare(query);
            stmt.run(timestamp, value, function () {
                console.log(timestamp + ", " + value);
            });
            stmt.finalize();
        });
    };
    return realParamDB;
})(Sqlite);

// for ibeacon DB
var strRealParamsDB = (function (_super) {
    __extends(strRealParamsDB, _super);
    function strRealParamsDB(type, title1, title2) {
        _super.call(this, type);
        this.title1 = title1;
        this.title2 = title2;
    }
    strRealParamsDB.prototype.createTable = function (tableName) {
        var query = "CREATE TABLE IF NOT EXISTS " + tableName +
    " (Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL," + this.title1 + " TEXT NOT NULL," + this.title2 + " REAL NOT NULL)";
        this.database.run(query);
        this.table = tableName;
        console.log(tableName + ' table created: TIMESTAMP | TEXT | REAL');
    };

    strRealParamsDB.prototype.insert = function (timestamp, uuid, distance) {
        var self = this;
        this.database.serialize(function () {
            var query = "INSERT INTO " + self.table + "(timestamp, " + self.title1 + "," + self.title2 + ") VALUES (?,?,?)";
            var stmt = self.database.prepare(query);
            stmt.run(timestamp, uuid, distance, function () {
                console.log(timestamp + ", " + value);
            });
            stmt.finalize();
        });
    };
    return strRealParamsDB;
})(Sqlite);

// for thermo-hygrometer DB
var realrealParamsDB = (function (_super) {
    __extends(realrealParamsDB, _super);
    function realrealParamsDB(type, title1, title2) {
        _super.call(this, type);
        this.title1 = title1;
        this.title2 = title2;
    }
    
    realrealParamsDB.prototype.createTable = function (tableName) {
        var query = "CREATE TABLE IF NOT EXISTS " + tableName +
    " (Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY NOT NULL," + this.title1 + " REAL NOT NULL," + this.title2 + " REAL NOT NULL)";
        this.database.run(query);
        this.table = tableName;
        console.log(tableName + ' table created: TIMESTAMP | REAL | REAL');
    };

    realrealParamsDB.prototype.insert = function (timestamp, temperature, humidity) {
        var self = this;
        this.database.serialize(function () {        
        var query = "INSERT INTO " + self.table + "(timestamp, " + self.title1 + "," + self.title2 + ") VALUES (?,?,?)";
        var stmt = self.database.prepare(query);
        stmt.run(timestamp, temperature, humidity, function () {
            console.log(timestamp + ": " + temperature + ", " + humidity);
        });
        stmt.finalize();
    });
    };
    return realrealParamsDB;
})(Sqlite);



exports.construct = function (type) {
    var dbObj = null;
    switch (type) {
        case 'lux_meter':
            dbObj = new realParamDB(type, 'value');
            break;
        case 'thermo-hygrometer':
            dbObj = new realrealParamsDB(type, 'temperature', 'humidity');
            break;
        default:
            dbObj = new intParamDB(type, 'value');
            break;               
    }
    return dbObj;
}
