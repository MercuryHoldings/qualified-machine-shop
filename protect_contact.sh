#!/bin/bash
# Protect phone numbers and emails with CAPTCHA classes

for file in *.html; do
  echo "Processing $file..."
  
  # Protect phone numbers in various formats
  sed -i 's|(858) 259-9286|<span class="phone-number">(858) 259-9286</span>|g' "$file"
  sed -i 's|8582599286|<span class="phone-number">8582599286</span>|g' "$file"
  
  # Protect email addresses
  sed -i 's|info@QualifiedMachine\.com|<span class="email-address">info@QualifiedMachine.com</span>|g' "$file"
  sed -i 's|info@qualifiedmachine\.com|<span class="email-address">info@qualifiedmachine.com</span>|g' "$file"
  
  echo "Updated $file"
done

echo "All files updated!"
