function regexQuote(str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

// Exports
exports.regexQuote = regexQuote;
