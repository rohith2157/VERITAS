import re

path = r'C:\Users\Rohith\.gemini\antigravity\brain\684f40a3-33b5-48e7-b4ec-de8d5ded58e7\.system_generated\steps\791\content.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

scripts = re.findall(r'<script[^>]*src=\"([^\"]+)\"', text)
print('Scripts in Dala content.md:', scripts)

for tag in re.findall(r'<script[^>]*>.*?</script>', text, re.DOTALL):
    if len(tag) < 300:
        print('Inline script:', tag)
