// Requires
var _ = require('underscore');

// Matcher
var prefixMatcher = function(prefix, item) {
    var index = item.indexOf(prefix);
    return index === 0 ? 1 : 0;
};

var fuzzyPrefixMatcher = function(prefix, item) {
    var index = item.toLowerCase().indexOf(prefix.toLowerCase());
    return index === 0 ? 1 : 0;
};

var fuzzyMatcher = function (prefix, item) {
    return ~item.toLowerCase().indexOf(prefix.toLowerCase());
};


function Ranker() {
    _.bindAll(this);
}

Ranker.prototype.rank = function(term, results) {
    return _.sortBy(
        results,
        _.partial(this.distance, term)
    );
};

Ranker.prototype.distance = function(term, result) {
    // TODO match chunks
    var name = result.name;
    var rank = -(
        (prefixMatcher(term, name) << 16) +
        (fuzzyPrefixMatcher(term, name) << 8) +
        (fuzzyMatcher(term, name))
    );
    return rank;
};

Ranker.prototype.rankWith = function(term) {
    return _.partial(this.rank, term);
};

// Exports
exports.Ranker = Ranker;
exports.ranker = new Ranker();
exports.rank = exports.ranker.rank;
exports.rankWith = exports.ranker.rankWith;
