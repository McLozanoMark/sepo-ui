const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find every <div ... > ORDEN ... </div> and move it out of the gap-4 container.
let matches = 0;
while (true) {
   let idx = html.indexOf('>ORDEN</label');
   if (idx === -1) idx = html.indexOf('>ORDEN\n');
   if (idx === -1) idx = html.indexOf('>ORDEN\r\n');
   if (idx === -1) {
     // Search manually 
     let m = html.match(/>\s*ORDEN\s*<\/label>/i);
     if (m) idx = m.index;
   }
   
   if (idx === -1) break;

   // search backwards for the div parent
   let divStart = html.lastIndexOf('<div class="d-flex flex-column align-items-center gap-1"', idx);
   if (divStart === -1) break; // Should not happen
   
   let divEnd = html.indexOf('</div>', idx) + 6;
   let block = html.substring(divStart, divEnd);
   
   // find the flex-grow-1 that contains the title
   let cardStart = html.lastIndexOf('class="card-item', divStart);
   let flexGrow = html.indexOf('<div class="flex-grow-1', cardStart);
   
   if (flexGrow < divStart) {
      // it means it's still on the right.
      html = html.substring(0, divStart) + html.substring(divEnd);
      // need to re-find flexGrow
      flexGrow = html.indexOf('<div class="flex-grow-1', cardStart);
      html = html.substring(0, flexGrow) + block + '\n              ' + html.substring(flexGrow);
      matches++;
   } else {
      // already moved!
      // Replace ORDEN with something else temporarily so we don't find it again
      html = html.substring(0, idx) + '>O-R-D-E-N' + html.substring(idx + 6);
   }
}

// Restore O-R-D-E-N back to ORDEN
html = html.replace(/>O-R-D-E-N/g, '>ORDEN');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Moved', matches, 'boxes');
