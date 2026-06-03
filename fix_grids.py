import os
import glob
import re

def main():
    pages_dir = r"c:\Users\Dari\Documents\GitHub\Transporte\frontend\src\pages"
    jsx_files = glob.glob(os.path.join(pages_dir, "*.jsx"))
    
    pat_2 = re.compile(r'(?<=["\'\s])grid-cols-2\b')
    pat_3 = re.compile(r'(?<=["\'\s])grid-cols-3\b')
    pat_4 = re.compile(r'(?<=["\'\s])grid-cols-4\b')
    
    modified_count = 0
    for filepath in jsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = pat_2.sub('grid-cols-1 sm:grid-cols-2', content)
        new_content = pat_3.sub('grid-cols-1 md:grid-cols-3', new_content)
        new_content = pat_4.sub('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', new_content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Modified {os.path.basename(filepath)}")
            
    print(f"Total files modified: {modified_count}")

if __name__ == "__main__":
    main()
