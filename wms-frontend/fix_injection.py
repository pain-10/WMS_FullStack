import re, sys, os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if file has constructor injection for our services
    if 'constructor(' not in content:
        return False
    
    # Add 'inject' to Angular imports if not present
    if 'inject' not in content:
        content = content.replace(
            "from '@angular/core';",
            ", inject } from '@angular/core';",
            1
        )
        # Fix double import braces
        content = content.replace('{ Component, inject }', '{ Component, inject }')
        content = content.replace('{ Component, OnInit, inject }', '{ Component, OnInit, inject }')
    
    # Find constructor and extract parameters
    constructor_match = re.search(
        r'constructor\(\s*([\s\S]*?)\)\s*\{([\s\S]*?)\n\s*\}',
        content
    )
    
    if constructor_match:
        params_str = constructor_match.group(1)
        body = constructor_match.group(2).strip()
        
        # Parse parameters: "private someService: SomeType,"
        params = re.findall(r'(?:private|public|protected)\s+(\w+)\s*:\s*(\w+)', params_str)
        
        if params:
            # Build inject() declarations
            inject_lines = []
            for name, type_name in params:
                # Skip FormBuilder - it's from @angular/forms
                inject_lines.append(f'  private {name} = inject({type_name});')
            
            inject_block = '\n'.join(inject_lines)
            
            # Remove the constructor entirely
            full_constructor = constructor_match.group(0)
            
            # If body has content beyond assignments, keep it in ngOnInit or similar
            # For now, check if body only has this.x = this.y assignments
            remaining_body = body
            for name, _ in params:
                remaining_body = re.sub(rf'this\.{name}\s*=\s*this\.\w+\.currentUserValue;?\s*', '', remaining_body)
            remaining_body = remaining_body.strip()
            
            if remaining_body and 'this.' in remaining_body:
                # Has non-trivial body, keep constructor with remaining
                content = content.replace(full_constructor, inject_block + '\n\n  constructor() {\n    ' + remaining_body + '\n  }')
            else:
                content = content.replace(full_constructor, inject_block)
    
    with open(filepath, 'w') as f:
        f.write(content)
    return True

# Process files that need fixing
base = '/Users/mrunal/Developement/frontend/wms-frontend/src/app'
files = [
    'attendance/attendance.component.ts',
    'auth/login/login.component.ts', 
    'employees/employee-list/employee-list.component.ts',
    'leaves/leave-list/leave-list.component.ts',
    'departments/department-list/department-list.component.ts',
    'projects/project-list/project-list.component.ts',
    'shared/layout/layout.component.ts',
]

for f in files:
    path = os.path.join(base, f)
    if os.path.exists(path):
        fix_file(path)
        print(f"Fixed: {f}")
    else:
        print(f"Not found: {f}")
