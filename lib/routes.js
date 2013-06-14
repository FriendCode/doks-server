// Requires
var _ = require('underscore');

var tasks = require('./tasks/');


var ROUTES = [
    // Server Status
    ['get', '/', tasks.status.status],
    ['get', '/status', tasks.status.status],

    // Search
    ['get', '/search', tasks.search.search],

    // List of available docs
    ['get', '/docs', tasks.docs.docs],

    // View a documentation's static files
    ['get', /\/view\/([^\/]+)\/?(.*)/, tasks.view.view]
];


function setupRoutes(server) {
    _.each(ROUTES, function(route) {
        var method = route[0];
        var url = route[1];
        var view = route[2];

        server[method].call(server, url, view);
    });
}

// Exports
exports.setupRoutes = setupRoutes;
