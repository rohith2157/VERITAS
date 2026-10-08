with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
q = re.findall(r'document\.(?:querySelector|getElementById)\([\"\']([^\"\']+)[\"\']\)', text)
print('Direct document queries in theme.js:', set(q))
