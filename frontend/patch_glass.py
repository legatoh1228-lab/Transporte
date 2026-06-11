import os

file_path = 'src/pages/Asignaciones.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Replace solid dark background with Glassmorphism
    "dark:bg-surface-container-lowest shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]": "dark:bg-[#1A1C1E]/70 dark:backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
    
    # Improve border in dark mode for glass effect
    "dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)]' : 'bg-surface-container-lowest/50 border-outline-variant/50 border-dashed'}": "dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] dark:hover:border-white/10' : 'bg-surface-container-lowest/50 dark:bg-surface-container-lowest/20 dark:backdrop-blur-md border-outline-variant/50 dark:border-white/5 border-dashed'}",
    
    # Nested blocks
    "dark:bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 dark:border-outline-variant/10 shadow-sm dark:shadow-none": "dark:bg-white/5 p-4 rounded-2xl border border-outline-variant/30 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:backdrop-blur-lg",
    
    # Inner containers / badges
    "bg-surface-container dark:bg-surface-container-high text-on-surface font-black px-2 py-0.5 rounded text-sm border border-outline-variant/50 dark:border-outline-variant/30 shadow-sm dark:shadow-black/40": "bg-surface-container dark:bg-[#000000]/40 dark:backdrop-blur-xl text-on-surface font-black px-2 py-0.5 rounded text-sm border border-outline-variant/50 dark:border-white/10 shadow-sm dark:shadow-inner",
    
    # Images
    "dark:border-surface-container-lowest": "dark:border-white/10",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Glassmorphism patched successfully")
