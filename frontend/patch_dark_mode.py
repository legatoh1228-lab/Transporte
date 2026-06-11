import os

file_path = 'src/pages/Asignaciones.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded light mode styles with responsive dark mode styles
replacements = {
    # Cards
    "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]": "bg-white dark:bg-surface-container-lowest shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)]",
    
    # Empty states
    "bg-surface-container/30 rounded-[20px]": "bg-surface-container/30 dark:bg-surface-container-low/50 rounded-[20px] dark:border dark:border-outline-variant/20",
    
    # Images borders
    "border-[3px] border-white shadow-md": "border-[3px] border-white dark:border-surface-container-lowest shadow-md dark:shadow-black/50",
    
    # Vehicle empty image
    "bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20": "bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/5 border border-secondary/20 dark:border-secondary/30",
    
    # Vehicle nested container
    "bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30": "bg-surface-container-lowest dark:bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 dark:border-outline-variant/10 shadow-sm dark:shadow-none",
    
    # Placa badge
    "bg-surface-container text-on-surface font-black px-2 py-0.5 rounded text-sm border border-outline-variant/50 shadow-sm": "bg-surface-container dark:bg-surface-container-high text-on-surface font-black px-2 py-0.5 rounded text-sm border border-outline-variant/50 dark:border-outline-variant/30 shadow-sm dark:shadow-black/40",
    
    # Icon containers
    "bg-gradient-to-br from-tertiary/20 to-tertiary/5": "bg-gradient-to-br from-tertiary/20 to-tertiary/5 dark:from-tertiary/30 dark:to-tertiary/10",
    "bg-gradient-to-br from-primary/20 to-primary/5": "bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10",
    "bg-gradient-to-br from-success/20 to-success/5": "bg-gradient-to-br from-success/20 to-success/5 dark:from-success/30 dark:to-success/10",
    
    # Map empty state
    "bg-tertiary/5 border border-tertiary/20 text-tertiary": "bg-tertiary/5 dark:bg-tertiary/10 border border-tertiary/20 dark:border-tertiary/30 text-tertiary dark:text-tertiary-container",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dark mode patched successfully")
