const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The marker where screen-orden starts
const startIdx = html.indexOf('id="screen-orden"');
const endIdx = html.indexOf('id="screen-perfiles"', startIdx);
let subset = html.substring(startIdx, endIdx !== -1 ? endIdx : html.length);

const labelStr = '>ORDEN</label>';
let pos = 0;
while (true) {
  pos = subset.indexOf(labelStr, pos);
  if (pos === -1) break;

  let divStart = subset.lastIndexOf('<div', pos);
  // keep looking backward until we find the start of the d-flex flex-column parent
  while (divStart !== -1 && !subset.substring(divStart, pos).includes('flex-column align-items-center')) {
      divStart = subset.lastIndexOf('<div', divStart - 1);
  }
  
  if (divStart === -1) { pos += labelStr.length; continue; }
  
  let divEnd = subset.indexOf('</div>', pos) + 6;
  
  let cardStart = subset.lastIndexOf('class="card-item', divStart);
  if (cardStart === -1) { pos = divEnd; continue; }
  
  let iconBoxEnd = subset.indexOf('</div>', subset.indexOf('icon-box', cardStart) + 8) + 6;
  // wait, icon-box has inner <i>! so iconBoxEnd would be the wrong </div>!
  // It's safer to find flex-grow-1
  let flexGrowStart = subset.indexOf('<div class="flex-grow-1', cardStart);
  if (flexGrowStart === -1 || flexGrowStart > divStart) {
     pos = divEnd; continue; // already before flex-grow-1!
  }
  
  let ordenBlock = subset.substring(divStart, divEnd);
  
  // Remove from old pos
  subset = subset.substring(0, divStart) + subset.substring(divEnd);
  
  // Need to re-find flexGrowStart because subset changed
  flexGrowStart = subset.indexOf('<div class="flex-grow-1', cardStart);
  
  // Insert at flexGrowStart
  subset = subset.substring(0, flexGrowStart) + ordenBlock + '\n              ' + subset.substring(flexGrowStart);
  
  // Continue after the inserted block, which is near cardStart
  pos = cardStart;
}

html = html.substring(0, startIdx) + subset + html.substring(endIdx !== -1 ? endIdx : html.length);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed');
