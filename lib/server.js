// Requires
var restify = require('restify');

var setupRoutes = require('./routes').setupRoutes;

var DocSetGroup = require('./docsetgroup').DocSetGroup;


function Server(folder) {
    this.docgroup = new DocSetGroup(folder);
    this.server = restify.createServer();


    // Pass DocGroup to request
    // (make it accessible to views)
    var that = this;
    this.server.use(function(req, res, next) {
        req.docgroup = that.docgroup;
        return next();
    });

    // Parse QueryString
    this.server.use(restify.queryParser());

    this.server.use(restify.jsonp());

    // Throttle requests
    /*
    this.server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true,
        overrides: {
            '127.0.0.1': {
                rate: 0,        // unlimited
                burst: 0
            }
        }
    }));
    */

    // Setup routes
    setupRoutes(this.server);
}

Server.prototype.open = function() {
    var that = this;
    return this.docgroup.open()
    .then(function() {
        return that;
    });
};

Server.prototype.close = function() {
    return this.docgroup.close();
};

Server.prototype.listen = function() {
    this.server.listen.apply(this.server, arguments);
};

function createServer(folder) {
    return new Server(folder);
}

// Exports
exports.Server = Server;
exports.createServer = createServer;
