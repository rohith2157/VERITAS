import subprocess
try:
    files = subprocess.check_output(['git', 'ls-files', '*.png', 'frontend/*.png'], text=True).splitlines()
    to_remove = [
        f for f in files 
        if not f.startswith('frontend/public/') and not f.startswith('frontend/src/') and not f.startswith('design/')
    ]
    if to_remove:
        subprocess.run(['git', 'rm', '--cached', '--ignore-unmatch', '-q'] + to_remove, check=False)
except Exception:
    pass
