import re
with open('src/server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make all route callbacks async
content = re.sub(r'(\brouter\.(get|post|put|delete|patch)\(.*?,[\s]*)(req.*?)=> {', r'\1async \3=> {', content)
content = re.sub(r'(app\.(get|post|put|delete|patch)\(.*?,[\s]*)(req.*?)=> {', r'\1async \3=> {', content)

with open('src/server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
