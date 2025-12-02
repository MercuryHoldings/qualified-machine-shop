#!/bin/bash
# Add CAPTCHA CSS and JS to all HTML pages

for file in *.html; do
  # Skip if already has captcha.css
  if grep -q "captcha.css" "$file"; then
    echo "Skipping $file - already has CAPTCHA"
    continue
  fi
  
  # Add CAPTCHA CSS link in head
  sed -i 's|</head>|    <link rel="stylesheet" href="css/captcha.css">\n    <script src="https://js.hcaptcha.com/1/api.js" async defer></script>\n</head>|' "$file"
  
  # Add CAPTCHA JS before closing body tag
  sed -i 's|</body>|    <script src="js/captcha.js"></script>\n</body>|' "$file"
  
  echo "Updated $file"
done
