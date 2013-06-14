// Requires
var Q = require('q');
var _ = require('underscore');

var fs = require('fs');
var path = require('path');

var openDocSet = require('./docset').openDocSet;

var ranker = require('./ranker');

function DocSetGroup(path) {
    // Path containing multiple docset packages
    // ->
    // x1.docset/
    // x2.docset/
    // ...
    this.path = path;
    this.docsets = {};

    // Bind methods
    _.bindAll(this);

    // Memoize
    this.names = _.memoize(this.names);
    this._doSearch = _.memoize(this._doSearch, this._doSearchHasher);
}

DocSetGroup.prototype.isDocSet = function(subpath) {
    return path.extname(subpath) == '.docset';
};

DocSetGroup.prototype.docsetPaths = function() {
    var resolver = _.partial(
        path.resolve,
        this.path
    );
    return _.map(
        _.filter(
            fs.readdirSync(this.path),
            this.isDocSet
        ),
        resolver
    );
};

DocSetGroup.prototype.open = function() {
    var that = this;
    return Q.all(
        _.map(
            this.docsetPaths(),
            function(path) {
                // Handle failure opening docsets
                return openDocSet(path).fail(function(err) {
                    if(err.code == 'SQLITE_CANTOPEN') {
                        console.log('Error with DocSet =', path);
                        return null;
                    }
                    throw err;
                });
            }
        )
    )
    .then(function(docsets) {
        // Map of docsets
        // name -> DocSet object
        docsets = _.compact(docsets);
        if(_.isEmpty(docsets)) {
            throw(new Error("No Docsets"));
        }
        that.docsets = _.object(_.map(
            // Remove unopened docsets
            docsets,
            function(docset) {

                return [
                    docset.name(),
                    docset
                ];
            }
        ));
    });
};

DocSetGroup.prototype.close = function() {
    var that = this;
    return Q.all(
        // Close each docset
        _.map(
            this.docsets,
            function(docset) {
                return docset.close();
            }
        )
    )
    .then(function() {
        // Empty docset list
        that.docsets = {};
    });
};


DocSetGroup.prototype.names = function() {
    return _.keys(this.docsets);
};


DocSetGroup.prototype.hasDocSet = function(name) {
    return _.has(this.docsets, name);
};

DocSetGroup.prototype.getDocSet = function(name) {
    return this.docsets[name];
};

DocSetGroup.prototype.getDocSets = function(names) {
    return _.compact(
        _.map(names, this.getDocSet)
    );
};

// Normalizes a list of input sets
// String, undefined or an Array
// Outputs an array of acceptable sets
DocSetGroup.prototype._normalizeSearchArgs = function(query, setsNameOrList) {
    var selectedNames = setsNameOrList || [];
    var names = this.names();

    if(_.isEmpty(selectedNames)) {
        return [query, names];
    } else if(_.isString(selectedNames)) {
        selectedNames = [selectedNames];
    }

    return [
        query,
        _.intersection(selectedNames, names)
    ];
};

DocSetGroup.prototype._doSearchHasher = function(query, selectedSets) {
    return [
        query,
        selectedSets.join(',')
    ].join(':');
};

DocSetGroup.prototype.search = function(query, selectedSets) {
    return this._doSearch.apply(this,
        this._normalizeSearchArgs(query, selectedSets)
    );
};

DocSetGroup.prototype._doSearch = function(query, selectedSets) {
    var docsets = this.getDocSets(selectedSets);
    return Q.all(_.map(
        docsets,
        function(docset) {
            return docset.search(query);
        }
    ))
    .then(_.flatten)
    .then(ranker.rankWith(query));
};

// Exports
exports.DocSetGroup = DocSetGroup;
