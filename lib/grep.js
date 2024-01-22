const fs = require("fs");
const path = require("path");

async function grep(pattern, filePath, options = {}) {
  const { ignoreCase, invertMatch } = options;
  const lines = await _readFileLines(filePath);
  const regexFlags = ignoreCase ? "gi" : "g";
  const regex = new RegExp(pattern, regexFlags);
  if (invertMatch) {
    matchingLines = _filterLines(regex, lines, false);
  } else {
    matchingLines = _filterLines(regex, lines, true);
  }
  return { [filePath]: matchingLines };
}

async function grepRecursive(pattern, dirPath, options = {}) {
  let results = {};
  try {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const isSubDir = (await fs.promises.stat(filePath)).isDirectory();
      const result = !isSubDir
        ? await grep(pattern, filePath, options)
        : await grepRecursive(pattern, filePath, options);
      results = { ...results, ...result };
    }
  } catch (err) {
    console.error(err);
  }
  return results;
}

function grepCount(result) {
  return Object.values(result).reduce(
    (count, lines) => count + lines.length,
    0
  );
}

function _filterLines(regexPattern, lines, flag) {
  return lines
    .map((line, lineNumber) => {
      const match = regexPattern.test(line);
      return flag === match ? [lineNumber + 1, line.trim()] : null;
    })
    .filter(Boolean);
}

async function _readFileLines(filePath) {
  try {
    // Read the file asynchronously
    const data = await fs.promises.readFile(filePath, "utf8");
    return data.split("\n");
  } catch (error) {
    console.error("Error reading the file:", error.message);
  }
  return [];
}

module.exports = {
  grep,
  grepCount,
  grepRecursive,
};
