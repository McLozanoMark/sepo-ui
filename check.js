const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let segments = html.split('class="card-item p-2 d-flex align-items-center shadow-sm mb-2"');
for (let i = 1; i < segments.length; i++) {
  if (segments[i].includes('PR-PSI-005')) {
     console.log('--- PR-PSI-005 ---');
     let m = segments[i].match(/>ORDEN<\/label/g);
     console.log('Matches found for ORDEN:', m ? m.length : 0);
  }
}
