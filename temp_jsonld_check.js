const fs = require('fs');
const html = fs.readFileSync('textTools/texttoslug.html', 'utf8');
const re = /<script[^>]*type=['\"]application\/ld\+json['\"][^>]*>([\s\S]*?)<\/script>/gi;
let match;
let idx = 0;
while ((match = re.exec(html)) !== null) {
  idx++;
  const block = match[1].trim();
  try {
    JSON.parse(block);
    console.log('block', idx, 'ok');
  } catch (err) {
    console.log('block', idx, 'error', err.message);
  }
}
