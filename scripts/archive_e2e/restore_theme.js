const fs = require('fs');
let code = fs.readFileSync('c:/TTProject/frontend/live_theme.js', 'utf8');

// Add window.u = u; right after u definition
code = code.replace(
  'enableLogs:new URLSearchParams(window.location.search).has("logs")};',
  'enableLogs:new URLSearchParams(window.location.search).has("logs")};window.u=u;'
);

fs.writeFileSync('c:/TTProject/frontend/public/scripts/theme.js', code);
console.log('Successfully updated frontend/public/scripts/theme.js from live_theme.js');

