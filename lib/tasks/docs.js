function docs(req, res) {
    return res.send(req.docgroup.names());
}

// Exports
exports.docs = docs;
