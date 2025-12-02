#!/usr/bin/env python3
"""
Script to update all HTML files with hCaptcha protection for contact information
"""
import re
import os
from pathlib import Path

# Contact information to protect
PHONE = "(858) 259-9286"
EMAIL = "info@QualifiedMachine.com"

# Test hCaptcha key to replace
TEST_SITEKEY = "10000000-ffff-ffff-ffff-000000000001"

def update_html_file(filepath):
    """Update a single HTML file with CAPTCHA protection"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Replace test hCaptcha sitekey with dynamic loading
    # Find and replace static sitekey with a placeholder that will be replaced by JavaScript
    content = re.sub(
        r'data-sitekey="10000000-ffff-ffff-ffff-000000000001"',
        'data-sitekey="" class="h-captcha-dynamic"',
        content
    )
    
    # 2. Add contact-protection.js script if not already present
    if 'contact-protection.js' not in content:
        # Add before closing </body> tag
        content = content.replace(
            '</body>',
            '    <script src="js/contact-protection.js"></script>\n</body>'
        )
    
    # 3. Replace direct phone number displays with protected buttons
    # Pattern 1: <span class="phone-number">(858) 259-9286</span>
    content = re.sub(
        r'<span class="phone-number">\(858\) 259-9286</span>',
        '<button class="reveal-phone">Click to reveal phone</button>',
        content
    )
    
    # Pattern 2: <a href="tel:...">...</a>
    content = re.sub(
        r'<a href="tel:\+?1?8582599286"[^>]*>\(858\) 259-9286</a>',
        '<button class="reveal-phone">Click to reveal phone</button>',
        content
    )
    
    # Pattern 3: Direct phone number text
    content = re.sub(
        r'(?<!["\'>])\(858\) 259-9286(?!["\'])',
        '<button class="reveal-phone">Click to reveal phone</button>',
        content
    )
    
    # 4. Replace direct email displays with protected buttons
    # Pattern 1: <span class="email-address">info@QualifiedMachine.com</span>
    content = re.sub(
        r'<span class="email-address">info@QualifiedMachine\.com</span>',
        '<button class="reveal-email">Click to reveal email</button>',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 2: <a href="mailto:...">...</a>
    content = re.sub(
        r'<a href="mailto:info@qualifiedmachine\.com"[^>]*>info@qualifiedmachine\.com</a>',
        '<button class="reveal-email">Click to reveal email</button>',
        content,
        flags=re.IGNORECASE
    )
    
    # Pattern 3: Direct email text
    content = re.sub(
        r'(?<!["\'>])info@QualifiedMachine\.com(?!["\'])',
        '<button class="reveal-email">Click to reveal email</button>',
        content,
        flags=re.IGNORECASE
    )
    
    # 5. Add hCaptcha script if not present
    if 'hcaptcha.com' not in content:
        # Add before closing </head> tag
        head_close = content.find('</head>')
        if head_close != -1:
            content = content[:head_close] + '    <script src="https://js.hcaptcha.com/1/api.js" async defer></script>\n' + content[head_close:]
    
    # 6. Add captcha.css if not present
    if 'captcha.css' not in content:
        # Add before closing </head> tag
        head_close = content.find('</head>')
        if head_close != -1:
            content = content[:head_close] + '    <link rel="stylesheet" href="css/captcha.css">\n' + content[head_close:]
    
    # Only write if content changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath}")
        return True
    else:
        print(f"  - No changes needed for {filepath}")
        return False

def main():
    """Update all HTML files in the current directory"""
    html_files = list(Path('.').glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files to process\n")
    
    updated_count = 0
    for html_file in sorted(html_files):
        if update_html_file(html_file):
            updated_count += 1
    
    print(f"\n✓ Complete! Updated {updated_count} files.")

if __name__ == '__main__':
    main()
