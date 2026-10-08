with open(r'C:\TTProject\frontend\public\scripts\theme.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('document.querySelector("canvas")')
if idx == -1:
    idx = text.find("document.querySelector('canvas')")
if idx != -1:
    print(text[max(0, idx - 150):min(len(text), idx + 350)])
else:
    print("Not found exact query for canvas, searching canvas...")
    import re
    for m in re.finditer(r'canvas', text):
        pos = m.start()
        print(text[max(0, pos-50):min(len(text), pos+100)])
