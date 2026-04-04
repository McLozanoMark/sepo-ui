const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// The marker where screen-orden starts
const startIdx = html.indexOf('id="screen-orden"');
const endIdx = html.indexOf('id="screen-perfiles"', startIdx); // or end of file
const subset = html.substring(startIdx, endIdx !== -1 ? endIdx : html.length);

// Inside screen-orden, find all card-items
// Each card item might have the ORDEN div.
// The ORDEN div usually looks like: <div class="d-flex flex-column align-items-center gap-1" style="width: 70px;">\s*<label ...>ORDEN</label> ... </div>
// and it's currently inside the right-hand d-flex gap-4 container.

const regexCardItem = /<div\s+class="card-item p-2 d-flex align-items-center shadow-sm mb-2"[\s\S]*?<!-- Card \d+? -->|<!--/g;

let modifiedSubset = subset;

const cardSplit = subset.split(/<!-- Card .*? -->/g);
for (let i=0; i<cardSplit.length; i++) {
   let card = cardSplit[i];
   if (!card.includes('ORDEN</label>')) continue;

   // extract the ORDEN block 
   const ordenMatch = card.match(/(<div class="d-flex flex-column align-items-center gap-1"(?: style="width: 70px;")?>[\s\S]*?<label[\s\S]*?>ORDEN<\/label>[\s\S]*?<\/div>\s*)/);
   if (!ordenMatch) continue;

   let ordenHTML = ordenMatch[1];
   
   if (!card.includes(ordenHTML)) {
     continue; // sanity check
   }

   // Remove the ORDEN block from its current location
   let newCard = card.replace(ordenHTML, '');

   // Insert it right after the icon-box.
   // icon box usually ends with flex-shrink: 0; }"> ... </div>
   // We find <div class="flex-grow-1
   
   newCard = newCard.replace(/(<div class="flex-grow-1 d-flex flex-column".*?>)/, ordenHTML + '');

   modifiedSubset = modifiedSubset.replace(card, newCard);
}

const finalHtml = html.substring(0, startIdx) + modifiedSubset + html.substring(endIdx !== -1 ? endIdx : html.length);
fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Modified index.html');
