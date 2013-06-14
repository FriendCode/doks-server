var _ = require('underscore');

// Ugly but necessary
function resultsRewriter(req) {
    var prefix = 'http://'+req.headers.host;
    return function(results) {
        return _.map(results, function(result) {
            result.path = prefix + result.path;
            return result;
        });
    };
}

function search(req, res) {
    var query = req.query.q;

    // Docsets to search in
    // Example ?docset=Ruby&docset=PHP&docset=AngularJs ...
    // If none given, will search accross all available docsets
    var docsets = req.query.docset;

    var start = Date.now();
    req.docgroup.search(query, docsets)
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
