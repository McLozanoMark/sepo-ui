const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<div\s+class="icon-box"[\s\S]*?<\/div>)\s*(<div class="flex-grow-1[\s\S]*?<\/div>\s*<\/div>)\s*(<div class="d-flex align-items-center gap-4 flex-shrink-0">\s*<div\s+class="d-flex align-items-center gap-3 text-muted"[\s\S]*?<\/div>)\s*(<div class="d-flex flex-column align-items-center gap-1"[^>]*>[\s\S]*?ORDEN[\s\S]*?<\/div>)/g;

let matches = 0;
html = html.replace(regex, function(match, iconBox, titleBox, rightBoxStart, ordenBox) {
    if(!ordenBox.includes('ORDEN')) return match; 
    matches++;
    // SWAP
    return iconBox + '\n              ' + ordenBox + '\n              ' + titleBox + '\n              ' + rightBoxStart;
});

console.log('Replaced', matches, 'cards');
fs.writeFileSync('index.html', html, 'utf8');
