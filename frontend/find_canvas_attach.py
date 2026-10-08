with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for term in ['WebGLRenderer', 'domElement', 'appendChild', 'experience', 'webgl']:
    matches = [m.start() for m in re.finditer(re.escape(term), text)]
    print(f"Term '{term}': {len(matches)} matches")
    for idx in matches[:3]:
        print(f"  Context around {idx}:")
        print(text[max(0, idx - 100):min(len(text), idx + 200)])
        print('-'*40)
