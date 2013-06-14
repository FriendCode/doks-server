function docs(req, res) {
    console.dir(req);

    return res.send(req.docgroup.names());
}

// Exports
exports.docs = docs;
