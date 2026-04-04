const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let segments = html.split('class="card-item p-2 d-flex align-items-center shadow-sm mb-2"');
for (let i = 1; i < segments.length; i++) {
  let card = segments[i];
  // check if it has ORDEN
  if (!card.includes('>ORDEN</label') && !card.includes('>ORDEN\n')) continue;
  
  // Find the flex-grow-1 div
  let flexStart = card.indexOf('<div class="flex-grow-1 d-flex flex-column"');
  if (flexStart === -1) flexStart = card.indexOf('<div\n                class="flex-grow-1 d-flex flex-column"');
  if (flexStart === -1) continue;
  
  // Find the ORDEN block
  let ordenRegex = /(<div\s+class="d-flex flex-column align-items-center gap-1"[\s\S]*?>ORDEN[\s\S]*?<\/div>)/;
  let ordenMatch = card.match(ordenRegex);
  if (!ordenMatch) continue;
  
  let block = ordenMatch[1];
  
  // is it already before flexStart?
  let blockStart = card.indexOf(block);
  if (blockStart < flexStart) continue; // already moved
  
  // Cut block
  let newCard = card.substring(0, blockStart) + card.substring(blockStart + block.length);
  
  // Paste before flex-grow-1
  // we have to find flexStart again because we cut the block out, BUT since blockStart > flexStart, flexStart hasn't changed.
  
  newCard = newCard.substring(0, flexStart) + block + '\n              ' + newCard.substring(flexStart);
  
  segments[i] = newCard;
}

html = segments.join('class="card-item p-2 d-flex align-items-center shadow-sm mb-2"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Done moving ORDEN to the left using pure Javascript!');
