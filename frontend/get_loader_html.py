path = r'C:\Users\Rohith\.gemini\antigravity\brain\684f40a3-33b5-48e7-b4ec-de8d5ded58e7\.system_generated\steps\791\content.md'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('js-site-loader')
if idx != -1:
    print("=== js-site-loader in HTML ===")
    print(html[idx - 50:idx + 1500])
