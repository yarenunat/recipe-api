const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('dark:')) {
    const newContent = content.replace(/dark:[a-zA-Z0-9\-\/\[\]:]+/g, '').replace(/  +/g, ' ');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Cleaned', file);
  }
});
console.log('Done!');
