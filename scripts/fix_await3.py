import re
with open('src/server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make all route callbacks async
content = re.sub(r'(app|router)\.(get|post|put|delete|patch)\(([^,]+),\s*(authService\.requireAdminAuth\s*,\s*)?(req:\s*Request,\s*res:\s*Response)\s*=>\s*\{', r'\1.\2(\3, \4async (\5) => {', content)
content = re.sub(r'(app|router)\.(get|post|put|delete|patch)\(([^,]+),\s*(authService\.requireAdminAuth\s*,\s*)?\(req:\s*Request,\s*res:\s*Response\)\s*=>\s*\{', r'\1.\2(\3, \4async (req: Request, res: Response) => {', content)
content = re.sub(r'(app|router)\.(get|post|put|delete|patch)\(([^,]+),\s*(authService\.requireAdminAuth\s*,\s*)?\(req,\s*res\)\s*=>\s*\{', r'\1.\2(\3, \4async (req, res) => {', content)
content = re.sub(r'(app|router)\.(get|post|put|delete|patch)\(([^,]+),\s*(authService\.requireAdminAuth\s*,\s*)?req\s*=>\s*\{', r'\1.\2(\3, \4async req => {', content)

# Fix await length issue
content = content.replace("clinicsRegistry.getAll().length", "(await clinicsRegistry.getAll()).length")

# Fix missing async for the specific lines
content = re.sub(r'app\.get\(\'/admin/clinics\', authService\.requireAdminAuth, \(req: Request, res: Response\) => \{', r'app.get(\'/admin/clinics\', authService.requireAdminAuth, async (req: Request, res: Response) => {', content)

with open('src/server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
