// Requires
var q = require('q');
var _ = require('underscore');

var path = require('path');
var querystring = require('querystring');

var defaults = require('./defaults.json');

var DocSetIndex = require('./docsetindex').DocSetIndex;


function DocSet(path) {
    // Path of X.docset
    this.path = path;

    // Setup index
    this.idx = new DocSetIndex(this.idxPath());

    // Bind methods
    _.bindAll(this);

    // Memoize
    this.name = _.memoize(this.name);
    this.search = _.memoize(this.search);
}

DocSet.prototype.name = function() {
    return path.basename(
        this.path,
        '.docset'
    );
};

DocSet.prototype.idxPath = function() {
    return path.resolve(
        this.path,
        'Contents/Resources/docSet.dsidx'
    );
};

DocSet.prototype.docsPath = function() {
    return path.resolve(
        this.path,
        'Contents/Resources/Documents'
    );
};

DocSet.prototype.open = function() {
    var that = this;
    return this.idx.open()
    .then(function() {
        return that;
    });
};

DocSet.prototype.close = function() {
    return this.idx.close();
};

DocSet.prototype.normalizeResult = function(result) {
    // Normalize the type
    result.type = defaults.typeMap[result.type] || result.type;
    result.lang = this.name();
    result.path = '/view/'+encodeURIComponent(this.name())+'/'+result.path;
    return result;
};

DocSet.prototype.normalizeResults = function(results) {
    return _.map(results, this.normalizeResult);
};

DocSet.prototype.search = function(query) {
    var that = this;
    return this.idx.search(query).then(this.normalizeResults);
};

function openDocSet(path) {
    var docset = new DocSet(path);
    return docset.open();
}

// Exports
exports.DocSet = DocSet;
exports.openDocSet = openDocSet;
