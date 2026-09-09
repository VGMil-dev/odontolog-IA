import re
import glob

for filepath in glob.glob('tests/**/*.ts', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove async from describe
    content = re.sub(r'describe\(([^,]+),\s*async \(\)\s*=>\s*\{', r'describe(\1, () => {', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("done")
