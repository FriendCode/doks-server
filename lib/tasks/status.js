function status(req, res) {
    res.send({
        status: "ok",
        uptime: process.uptime()
    });
    res.end();
}

// Exports
exports.status = status;
