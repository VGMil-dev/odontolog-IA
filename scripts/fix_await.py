import re
import os

files_to_check = [
    'src/server.ts',
    'src/agent/core.ts',
    'src/agent/tools.ts',
    'src/services/calendar.service.ts',
    'src/channels/whatsapp.ts'
]

for file_path in files_to_check:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add await to method calls
    methods = ['getAll', 'getById', 'getDefault', 'save', 'delete', 'addDoctor', 'updateDoctor', 'deleteDoctor', 'toggleDoctorStatus', 'updateInventory', 'addTreatment', 'updateTreatment', 'deleteTreatment', 'seedSuggestedTreatments', 'findByPhoneNumberId']
    
    for method in methods:
        pattern = r'(?<!await\s)clinicsRegistry\.' + method + r'\('
        replacement = r'await clinicsRegistry.' + method + '('
        content = re.sub(pattern, replacement, content)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Replacements done.")
