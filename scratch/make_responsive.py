import os
import re

directories = ['d:/work/cc-app/frontend/src/features', 'd:/work/cc-app/frontend/src/components']
properties_to_scale = [
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical',
    'fontSize', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
    'top', 'bottom', 'left', 'right', 'gap', 'rowGap', 'columnGap'
]

# Pattern to find e.g. "padding: 10" or "width: 20,"
# \1 = property name
# \2 = numeric value
prop_pattern = r'\b(' + '|'.join(properties_to_scale) + r')\s*:\s*(-?\d+(?:\.\d+)?)\b'

import_pattern = r'import\s+.*\{[^}]*\bms\b[^}]*\}.*from\s+[\'"]@theme/responsive[\'"]'
import_statement = "import { ms } from '@theme/responsive';\n"

for d in directories:
    if not os.path.exists(d):
        continue
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Process file
                if re.search(prop_pattern, content):
                    new_content = re.sub(prop_pattern, r'\1: ms(\2)', content)
                    
                    if new_content != content:
                        # Add import if not present
                        if not re.search(import_pattern, new_content):
                            # Insert after last import
                            last_import_match = list(re.finditer(r'^import\s+.*?;?\s*$', new_content, re.MULTILINE))
                            if last_import_match:
                                last_import_end = last_import_match[-1].end()
                                new_content = new_content[:last_import_end] + '\n' + import_statement + new_content[last_import_end:]
                            else:
                                new_content = import_statement + new_content
                                
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {filepath}")
