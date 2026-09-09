import re
import glob

for filepath in glob.glob('tests/**/*.ts', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add async to it/describe callbacks if missing but await is inside
    content = re.sub(r'(it|describe|test)\(([^,]+),\s*\(\)\s*=>\s*\{', r'\1(\2, async () => {', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("done")
