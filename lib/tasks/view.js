// Requires
var _ = require('underscore');

var serveStatic = require('restify').serveStatic;


function view(req, res, next) {
    var lang = req.params[0];
    var path = req.params[1];

    // Normalize lang
    lang = decodeURIComponent(lang);

    if(_.isEmpty(lang) || !req.docgroup.hasDocSet(lang)) {
        return res.send(404, 'Language/Framework not supported');
    }

    // Get the docset's directory
    var directory = req.docgroup.getDocSet(lang).docsPath();

    // Rewrite URL path
    // Kind of hackish
    req._path = path;

    var staticView = serveStatic({
          directory: directory
    });

    return staticView(req, res, next);
}

// Exports
exports.view = view;