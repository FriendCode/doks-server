var _ = require('underscore');

// Ugly but necessary
function resultsRewriter(req) {
    var prefix = 'http://'+req.headers.host;
    return function(results) {
        return _.map(results, function(result) {
            var newResult = _.clone(result);
            newResult.path = prefix + result.path;
            return newResult;
        });
    };
}

function paginator(p, n) {
    return function(list) {
        var start = Math.max(
            p * n,
            0
        );
        var end = Math.min(
            (p + 1) * n,
            list.length
        );
        return list.slice(start, end);
    };
}

function search(req, res) {
    var query = req.query.q;

    // Pagination
    var p = req.query.p || 0;
    var n = req.query.n || 20;

    // Docsets to search in
    // Example ?docset=Ruby&docset=PHP&docset=AngularJs ...
    // If none given, will search accross all available docsets
    var docsets = req.query.docset;

    var start = Date.now();
    req.docgroup.search(query, docsets)
    .then(paginator(p, n))
    .then(resultsRewriter(req))
    .then(function(results) {

        // Stats about the request
        var _stats = {
            // Diff in miliseconds
            time: (Date.now() - start)
        };
        return res.send({
            results: results,
            _stats: _stats
        });
    })
    .done();
}

// Exports
exports.search = search;
