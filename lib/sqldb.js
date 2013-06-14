// Requires
var Q = require('q');
var _ = require('underscore');

var sqlite3 = require('sqlite3');

// List of functions to patch
var patchFunctions = [
    'reset',
    'map',
    'all',
    'run',
    'finalize',
    'exec',
    'bind',
    'get',
    'each',
    'close'
];

// Patcher
// return object with methods patched for object
function patchQ(oldObj) {
    var obj = {};

    var toPatch = _.intersection(
        _.methods(oldObj),
        patchFunctions
    );

    _.each(toPatch, function(methodName) {
        obj[methodName] = function() {
            return Q.ninvoke.apply(Q,
                [oldObj, methodName].concat(_.toArray(arguments))
            );
        };
    });

    return obj;
}

// A wrapper around sqlite databases using promises
function SqlDb(path, callback) {
    var that = this;
    this._db = new sqlite3.Database(path, callback);
    this._patch();
    return this;
}


SqlDb.prototype._patch = function() {
    // Extend this with a patched version of sqlitedb
    _.extend(this, patchQ(this._db));
    _.bindAll(this);
};

SqlDb.prototype.prepare = function() {
    var stmt = this._db.prepare.apply(this._db, arguments);
    return patchQ(stmt);
};

// Wraps db creation and returns promise
function createDb(path) {
    var d = Q.defer();
    var db = new SqlDb(path, function(err) {
        if(err) {
            return d.reject(err);
        }
        return d.resolve(db);
    });
    return d.promise;
}


// Exports
exports.SqlDb = SqlDb;
exports.createDb = createDb;