const fs = require('fs');
const html = fs.readFileSync('frontend/index.html', 'utf8');
console.log('has id=root:', html.includes('id="root"'));
console.log('has main.jsx:', html.includes('main.jsx'));
console.log('has App.jsx:', html.includes('App.jsx'));

