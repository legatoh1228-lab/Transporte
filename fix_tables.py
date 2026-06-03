import os
import glob
import re

def main():
    pages_dir = r"c:\Users\Dari\Documents\GitHub\Transporte\frontend\src\pages"
    jsx_files = glob.glob(os.path.join(pages_dir, "*.jsx"))
    
    table_start_pattern = re.compile(r'(<table[^>]*>)', re.IGNORECASE)
    table_end_pattern = re.compile(r'(</table>)', re.IGNORECASE)
    
    modified_count = 0
    for filepath in jsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if already has a div wrapper right before <table (approximate heuristic)
        # Actually, let's just do a naive wrap if it's not wrapped yet
        # A simple way to check if it's wrapped is if we have `overflow-x-auto` near the table, but let's just use string replace.
        # Wait, if we just replace `<table` with `<div className="w-full overflow-x-auto pb-4"><table` and `</table>` with `</table></div>`,
        # what if it's already wrapped? We can look for `className="w-full overflow-x-auto pb-4"><table`.
        
        if '<div className="w-full overflow-x-auto pb-4">' in content:
            print(f"Skipping {os.path.basename(filepath)}, already seems to have wrappers.")
            continue
            
        new_content = table_start_pattern.sub(r'<div className="w-full overflow-x-auto pb-4">\n\1', content)
        new_content = table_end_pattern.sub(r'\1\n</div>', new_content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Modified {os.path.basename(filepath)}")
            
    print(f"Total files modified: {modified_count}")

if __name__ == "__main__":
    main()
