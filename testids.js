const fs = require('fs');
const txt = fs.readFileSync('assets/index-BpXjABDZ.js', 'utf8');
const matches = txt.match(/"data-testid":"[^"]+"/g) || [];
console.log(Array.from(new Set(matches)));
