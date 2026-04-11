const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find all occurrences of ORDEN blocks and move them
const cards = html.split('<div\n              class="card-item ');
let newHtml = cards[0];

for (let i = 1; i < cards.length; i++) {
  let card = '<div\n              class="card-item ' + cards[i];
  
  if (card.includes('>ORDEN</label>')) {
     const matchDivStart = card.indexOf('<div class="d-flex flex-column align-items-center gap-1"');
     if (matchDivStart !== -1) {
       const divEndStr = '</div>';
       let divsOpen = 1;
       let curr = matchDivStart + '<div'.length;
       while (divsOpen > 0 && curr < card.length) {
         let nextOpen = card.indexOf('<div', curr);
         let nextClose = card.indexOf('</div>', curr);
         
         if (nextClose === -1) break;
         
         if (nextOpen !== -1 && nextOpen < nextClose) {
           divsOpen++;
           curr = nextOpen + 4;
         } else {
           divsOpen--;
           curr = nextClose + 6;
         }
       }
       
       let matchDivEnd = curr;
       let ordenBlock = card.substring(matchDivStart, matchDivEnd);
       
       // check if it's already directly after icon-box by checking if it's before flex-grow-1
       let flexIdx = card.indexOf('<div class="flex-grow-1');
       if (flexIdx !== -1 && matchDivStart > flexIdx) {
          // Remove from current pos
          card = card.substring(0, matchDivStart) + card.substring(matchDivEnd);
          
          flexIdx = card.indexOf('<div class="flex-grow-1');
          
          card = card.substring(0, flexIdx) + ordenBlock + '\n              ' + card.substring(flexIdx);
       }
     }
  }
  
  newHtml += card;
}

fs.writeFileSync('index.html', newHtml, 'utf8');
