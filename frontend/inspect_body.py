path = r'C:\Users\Rohith\.gemini\antigravity\brain\684f40a3-33b5-48e7-b4ec-de8d5ded58e7\.system_generated\steps\791\content.md'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

import re
body_start = html.find('<body')
body_end = html.find('</body>')
print("Body length:", body_end - body_start)

# Check top-level children of body
m = re.findall(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if m:
    content = m[0]
    top_tags = re.findall(r'<([a-zA-Z0-9]+)[^>]*class=[\"\']([^\"\']+)[\"\']', content)
    print("Top elements in body:")
    for tag, cls in top_tags[:20]:
        print(f"  <{tag} class='{cls}'>")

