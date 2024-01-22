function grep(pattern, text) {
    const lines = text.split('\n');
    const regex = new RegExp(pattern);
    const matchingLines = lines.filter(line => regex.test(line));
    return matchingLines.map(line => stripLeft(line));
}

function stripLeft(s) {
    // Use the replace method to remove leading spaces and tabs
    return s.replace(/^[ \t]+/, '');
}

module.exports = {
    grep
};