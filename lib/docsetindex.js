// Requires
var q = require('q');
var _ = require('underscore');

var createDb = require('./sqldb').createDb;


function DocSetIndex(path) {
    this.path = path;
    this.db = null;
    this._isNew = false;

    // Bind methods
    _.bindAll(this);
}

// Class constants
DocSetIndex.prototype.QUERIES = {
    // These queries are quite ugly ...
    searchOld: [
        "select",
            "ZTOKENNAME as name,",
            "ZPATH as path,",
            "ZTYPENAME as type",
        "from ZTOKEN",
        "inner join ZTOKENMETAINFORMATION",
            "on ZTOKEN.Z_PK = ZTOKENMETAINFORMATION.ZTOKEN",
        "inner join ZFILEPATH",
            "on ZTOKENMETAINFORMATION.ZFILE = ZFILEPATH.Z_PK",
        "inner join ZTOKENTYPE",
            "on ZTOKENTYPE.Z_PK = ZTOKEN.ZTOKENTYPE",
        "where ZTOKEN.ZTOKENNAME like '%' || ? || '%';"
    ].join(' '),

    searchNew: [
        "select",
            "name, path, type",
        "from searchIndex",
        "where name like '%' || ? || '%';"
    ].join(' '),

    allTables: [
        "select",
            "name",
        "from sqlite_master",
        "where type='table';"
    ].join(' ')
};

DocSetIndex.prototype.open = function() {
    var that = this;
    // Open SQLite index
    return createDb(this.path).then(function(db) {
        // Add database
        that.db = db;
        // Check if new or old type
        return that.isNew()
        .then(function(isNew) {
            that._isNew = isNew;
            return that;
        });
    });
};

DocSetIndex.prototype.close = function() {
    var that = this;
    return this.db.close()
    .then(function() {
        that.db = null;
        that._isNew = null;
    });
};

DocSetIndex.prototype._searchOld = function(name) {
    return this.db.all(this.QUERIES.searchOld, name);
};

DocSetIndex.prototype._searchNew = function(name) {
    return this.db.all(this.QUERIES.searchNew, name);
};

DocSetIndex.prototype.search = function(name) {
    if(this._isNew) {
        return this._searchNew(name);
    }
    return this._searchOld(name);
};

DocSetIndex.prototype.allTables = function() {
    return this.db.all(this.QUERIES.allTables)
    .then(function(tables) {
        return _.pluck(tables, 'name');
    });
};

DocSetIndex.prototype.isNew = function() {
    return this.allTables()
    .then(function(tables) {
        return tables.length == 1 && tables[0] == 'searchIndex';
    });
};


// Exports
module.exports.DocSetIndex = DocSetIndex;
