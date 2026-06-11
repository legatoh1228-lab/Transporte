import os, re

pages_dir = 'frontend/src/pages'
for f in os.listdir(pages_dir):
    if f.endswith('.jsx'):
        path = os.path.join(pages_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Add custom-scrollbar to overflow-x-auto containers around tables
        content = re.sub(r'className="([^"]*?)overflow-x-auto([^"]*?)"',
                         lambda m: m.group(0) if 'custom-scrollbar' in m.group(0) else f'className="{m.group(1)}overflow-x-auto custom-scrollbar{m.group(2)}"',
                         content)
                         
        # Fix action buttons row wrapping
        content = content.replace('className="flex items-center gap-3 w-full lg:w-auto justify-end"',
                                  'className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start md:justify-end"')
        
        # Fix generic "flex items-center gap-3" action bars to wrap
        content = content.replace('className="flex items-center gap-3"',
                                  'className="flex flex-wrap items-center gap-3"')

        # Replace fixed grid-cols-2 in generic wrappers
        content = re.sub(r'className="([^"A-Za-z]*)grid grid-cols-2([^"A-Za-z]*)"', 
                         r'className="\1grid grid-cols-1 md:grid-cols-2\2"', 
                         content)

        # Fix Dashboard modal or generic modal headers that use fixed columns
        content = re.sub(r'className="([^"A-Za-z]*)grid grid-cols-3([^"A-Za-z]*)"', 
                         r'className="\1grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3\2"', 
                         content)

        # Specific fix for Operadores.jsx grid
        content = content.replace('className="grid grid-cols-1 md:grid-cols-12 gap-8"',
                                  'className="grid grid-cols-1 lg:grid-cols-12 gap-8"')

        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)

print("Patch applied to all views.")
