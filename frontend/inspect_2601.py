with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('2601:function')
if idx != -1:
    print("=== Module 2601 ===")
    print(text[idx:idx + 2000])
