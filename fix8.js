const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Just match the whole card HTML and do precision slicing
const cardRegex = /<div\s+class="card-item p-2 d-flex align-items-center shadow-sm mb-2"[\s\S]*?(?=<!-- Card |\n\s*<\/div>\s*<\/div>\s*<\/div>)/g;

let matches = 0;
let modifiedHtml = html.replace(cardRegex, function(card) {
  // Find ORDEN label
  if (!card.includes('>ORDEN</label') && !card.includes('>ORDEN\n')) return card;
  
  // Find the exact start of the d-flex align-items-center gap-1 containing ORDEN
  let regexDiv = /(<div class="d-flex flex-column align-items-center gap-1"[^>]*>[\s\S]*?>ORDEN[\s\S]*?<\/div>)/;
  let blockMatch = card.match(regexDiv);
  if (!blockMatch) return card;
  
  let block = blockMatch[1];
  
  let tempCard = card.replace(block, '');
  
  let iconRegex = /<div\s+class="icon-box"[^>]*>[\s\S]*?<\/div>\s*/;
  let matchIcon = tempCard.match(iconRegex);
  if (!matchIcon) return card; // Should not happen
  
  let idxToInsert = matchIcon.index + matchIcon[0].length;
  
  // Check if block is ALREADY at idxToInsert
  // actually if we already replaced it, it's just text manipulation
  let finalCard = tempCard.substring(0, idxToInsert) + block + '\n              ' + tempCard.substring(idxToInsert);
  matches++;
  return finalCard;
});

fs.writeFileSync('index.html', modifiedHtml, 'utf8');
console.log('Moved', matches, 'cards');
