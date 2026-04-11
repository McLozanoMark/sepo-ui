const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const strToFind = '>ORDEN</label>';
let pos = 0;
while (true) {
  pos = html.indexOf(strToFind, pos);
  if (pos === -1) break;

  // find start of the div container
  let divStart = html.lastIndexOf('<div class="d-flex flex-column align-items-center gap-1"', pos);
  if (divStart === -1 || pos - divStart > 200) {
     pos += strToFind.length;
     continue;
  }
  
  // find end of the div container
  let divEnd = html.indexOf('</div>', pos);
  if (divEnd === -1) {
     pos += strToFind.length;
     continue;
  }
  divEnd += 6; // include '</div>'

  let ordenHTML = html.substring(divStart, divEnd);

  // find where this item belongs. We need to go back to the start of this card-item
  let cardStart = html.lastIndexOf('class="card-item', divStart);
  if (cardStart === -1) {
     pos = divEnd;
     continue;
  }
  
  // check if ordenHTML is ALREADY directly after the icon-box.
  // The icon-box ends. Then flex-grow-1 starts.
  let flexGrowStart = html.indexOf('<div class="flex-grow-1', cardStart);
  if (flexGrowStart > divStart) {
     // ORDEN is before flex-grow-1, meaning it's already on the left!
     pos = divEnd;
     continue;
  }

  // Remove ordenHTML from current position
  html = html.substring(0, divStart) + html.substring(divEnd);
  
  // We need to re-find flexGrowStart because string modified!
  flexGrowStart = html.indexOf('<div class="flex-grow-1', cardStart);
  
  html = html.substring(0, flexGrowStart) + ordenHTML + '\n              ' + html.substring(flexGrowStart);

  // Restart search from cardStart
  pos = cardStart;
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done moving ORDEN to the left.');
