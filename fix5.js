const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const occurences = html.match(/>ORDEN<\/label>/g);
console.log('Occurrences of ORDEN:', occurences ? occurences.length : 0);

// Let's do a simple regex that matches the whole card-content specifically:
// 1. icon-box (from <div class="icon-box" to </div>)
// 2. flex-grow-1 box (from <div class="flex-grow-1" to </div></div>)
// 3. Right container (from <div class="d-flex align-items-center gap-4 flex-shrink-0"> to ORDEN parent div)
const regex = /(<div\s+class="icon-box"[\s\S]*?<\/div>)\s*(<div class="flex-grow-1[\s\S]*?<\/div>\s*<\/div>)\s*(<div class="d-flex align-items-center gap-4 flex-shrink-0">\s*<div\s+class="d-flex align-items-center gap-3 text-muted"[\s\S]*?<\/div>)\s*(<div class="d-flex flex-column align-items-center gap-1"[^>]*>[\s\S]*?>ORDEN<\/label>\s*<input[\s\S]*?<\/div>)/g;

let matches = 0;
html = html.replace(regex, function(match, iconBox, titleBox, rightBoxStart, ordenBox) {
    matches++;
    // SWAP: iconBox + ordenBox + titleBox + rightBoxStart
    return iconBox + '\n              ' + ordenBox + '\n              ' + titleBox + '\n              ' + rightBoxStart;
});

console.log('Replaced', matches, 'cards');
fs.writeFileSync('index.html', html, 'utf8');
