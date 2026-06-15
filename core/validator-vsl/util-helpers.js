const fs = require('fs');
const path = require('path');

function toKebabCase(str) {
  return str
    .replace(/([a-z]+)([A-Z])/g, '$1-$2') // added + for lowercase
    .replace(/([A-Z])([A-Z][a-z]+)/g, '$1-$2') // added + for lowercase after uppercase
    .toLowerCase();
}

async function writeFileWithDirs(filePath, content) {
  try {
    // Create all necessary directories
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // File doesn't exist, create it
      fs.writeFileSync(filePath, content);
      // console.log(`Created file ${filePath}`);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = {
  toKebabCase,
  writeFileWithDirs,
};
