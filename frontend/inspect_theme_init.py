with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Check DOMContentLoaded, init, document.querySelector, canvas, asscroll
print("Looking for initialization hooks in theme.js...")
for term in ['DOMContentLoaded', 'window.addEventListener', 'document.addEventListener', 'asscroll', 'canvas', 'new ']:
    matches = [m.start() for m in re.finditer(re.escape(term), text)]
    print(f"Term '{term}': {len(matches)} matches")

# Let's inspect the very end of theme.js
print("\n--- Last 500 characters of theme.js ---")
print(text[-500:])
