with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'querySelector(?:All)?\([\"\']([^\"\']+)[\"\']\)', text)
print('Unique querySelector queries in theme.js:')
for q in set(matches):
    print("  ", q)
