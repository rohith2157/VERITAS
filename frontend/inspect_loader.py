with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('.js-site-loader')
if idx != -1:
    print(text[max(0, idx - 200):min(len(text), idx + 800)])
