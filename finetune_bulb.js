const fs = require('fs');
let code = fs.readFileSync('c:/TTProject/frontend/public/scripts/theme.js', 'utf8');

// Fine-tune morph window to e: 1.5 -> 1.95 so it's 100% formed by the time section 2 (manifesto intro) is centered at e: 2.0
code = code.replace(
  'zt(Ut(e,1.8,2.2,0,.5*Math.PI),0,.5*Math.PI)',
  'zt(Ut(e,1.5,1.95,0,.5*Math.PI),0,.5*Math.PI)'
);
code = code.replace(
  'zt(Ut(e,1.8,2.2,0,-.489),-.489,0)',
  'zt(Ut(e,1.5,1.95,0,-.489),-.489,0)'
);
code = code.replace(
  'const o=zt(Ut(e,1.8,2.2,0,1),0,1)',
  'const o=zt(Ut(e,1.5,1.95,0,1),0,1)'
);

fs.writeFileSync('c:/TTProject/frontend/public/scripts/theme.js', code);
console.log('Fine-tuned lightbulb completion window to e: 1.5 - 1.95');

