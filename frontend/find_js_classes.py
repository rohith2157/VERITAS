with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'[\"\']\.?(js-[\w-]+)[\"\']', text)
print('js- classes in theme.js:')
for m in set(matches):
    print("  ", m)
