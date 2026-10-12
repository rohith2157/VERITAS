const fs = require('fs');

let html = fs.readFileSync('frontend/index.html', 'utf8');

// 1. Add #root and main.jsx right before </body>
if (!html.includes('id="root"')) {
  html = html.replace('</body></html>', '<div id="root"></div>\n<script type="module" src="/src/main.jsx"></script>\n</body></html>');
}

// 2. Remove target="_blank" from #studio / #dashboard links
html = html.replaceAll('href="#studio" target="_blank" rel="noopener"', 'href="#dashboard"');
html = html.replaceAll('Request Access', 'Launch Portal');

// 3. Add Dashboard to header nav
const oldNav = 'section-name="blog"><a class="nav__link js-nav-link" aria-label="Research" href="#manifesto">Research</a></li>';
const newNav = 'section-name="blog"><a class="nav__link js-nav-link" aria-label="Research" href="#manifesto">Research</a></li><li class="nav__item | js-nav-item" section-name="dashboard"><a class="nav__link js-nav-link" aria-label="Dashboard" href="#dashboard">Dashboard</a></li>';

if (!html.includes('section-name="dashboard"')) {
  html = html.replace(oldNav, newNav);
}

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('Successfully updated index.html with React root and Dashboard navigation');

