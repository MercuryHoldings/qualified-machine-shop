#!/usr/bin/env python3
"""
Complete hCaptcha Protection Implementation
Adds CAPTCHA protection to ALL email and phone instances across ALL pages
"""

import re
import os

# All HTML files to update
HTML_FILES = [
    'index.html',
    'about.html',
    'services.html',
    'cnc-milling.html',
    'cnc-turning.html',
    'fogbuster.html',
    'capabilities.html',
    'industries.html',
    'aerospace-machining.html',
    'portfolio.html',
    'contact.html',
    'quote.html',
    'privacy-policy.html',
    'terms-conditions.html'
]

def ensure_captcha_scripts(html_content):
    """Ensure hCaptcha scripts and contact-protection.js are included"""
    
    # Check if hCaptcha script is already present
    if 'hcaptcha.com/1/api.js' not in html_content:
        # Add hCaptcha script before </head>
        html_content = html_content.replace(
            '</head>',
            '    <script src="https://js.hcaptcha.com/1/api.js" async defer></script>\n</head>'
        )
    
    # Check if contact-protection.js is already present
    if 'contact-protection.js' not in html_content:
        # Add contact-protection.js before </body>
        html_content = html_content.replace(
            '</body>',
            '    <script src="js/contact-protection.js"></script>\n</body>'
        )
    
    # Ensure captcha.css is included
    if 'captcha.css' not in html_content:
        html_content = html_content.replace(
            '</head>',
            '    <link rel="stylesheet" href="css/captcha.css">\n</head>'
        )
    
    return html_content

def protect_contact_info(html_content):
    """Replace direct phone and email with protected buttons"""
    
    # Pattern 1: Phone with link - <a href="tel:...">(...) ...-...</a>
    phone_pattern1 = r'<a\s+href="tel:\+?1?8582599286"[^>]*>\(858\)\s*259-9286</a>'
    html_content = re.sub(
        phone_pattern1,
        '<button class="reveal-phone" onclick="revealContact(\'phone\')">Click to reveal phone</button>',
        html_content,
        flags=re.IGNORECASE
    )
    
    # Pattern 2: Phone with span - <span class="phone-number">(...) ...-...</span>
    phone_pattern2 = r'<span\s+class="phone-number"[^>]*>\(858\)\s*259-9286</span>'
    html_content = re.sub(
        phone_pattern2,
        '<button class="reveal-phone" onclick="revealContact(\'phone\')">Click to reveal phone</button>',
        html_content,
        flags=re.IGNORECASE
    )
    
    # Pattern 3: Plain phone number
    phone_pattern3 = r'\(858\)\s*259-9286'
    # Only replace if not already in a button
    if '<button class="reveal-phone"' not in html_content or html_content.count('(858) 259-9286') > html_content.count('reveal-phone'):
        html_content = re.sub(
            phone_pattern3,
            '<button class="reveal-phone" onclick="revealContact(\'phone\')">Click to reveal phone</button>',
            html_content,
            flags=re.IGNORECASE
        )
    
    # Pattern 4: Email with link - <a href="mailto:...">info@...</a>
    email_pattern1 = r'<a\s+href="mailto:info@qualifiedmachine\.com"[^>]*>info@qualifiedmachine\.com</a>'
    html_content = re.sub(
        email_pattern1,
        '<button class="reveal-email" onclick="revealContact(\'email\')">Click to reveal email</button>',
        html_content,
        flags=re.IGNORECASE
    )
    
    # Pattern 5: Email with span - <span class="email-address">info@...</span>
    email_pattern2 = r'<span\s+class="email-address"[^>]*>info@qualifiedmachine\.com</span>'
    html_content = re.sub(
        email_pattern2,
        '<button class="reveal-email" onclick="revealContact(\'email\')">Click to reveal email</button>',
        html_content,
        flags=re.IGNORECASE
    )
    
    # Pattern 6: Plain email address
    email_pattern3 = r'info@qualifiedmachine\.com'
    # Only replace if not already in a button
    if '<button class="reveal-email"' not in html_content or html_content.count('info@qualifiedmachine.com') > html_content.count('reveal-email'):
        html_content = re.sub(
            email_pattern3,
            '<button class="reveal-email" onclick="revealContact(\'email\')">Click to reveal email</button>',
            html_content,
            flags=re.IGNORECASE
        )
    
    return html_content

def process_html_file(filepath):
    """Process a single HTML file to add CAPTCHA protection"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ensure scripts are included
    content = ensure_captcha_scripts(content)
    
    # Protect contact information
    content = protect_contact_info(content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ {filepath} updated")

def main():
    """Main function to process all HTML files"""
    print("Starting comprehensive hCaptcha protection implementation...\n")
    
    for html_file in HTML_FILES:
        if os.path.exists(html_file):
            process_html_file(html_file)
        else:
            print(f"⚠ Warning: {html_file} not found")
    
    print("\n✓ All HTML files processed successfully!")
    print("\nNext steps:")
    print("1. Review changes with: git diff")
    print("2. Commit changes: git add . && git commit -m 'Complete hCaptcha protection across all pages'")
    print("3. Push to GitHub: git push")

if __name__ == '__main__':
    main()
