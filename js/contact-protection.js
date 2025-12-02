/**
 * Contact Protection Module
 * Protects email and phone numbers with hCaptcha verification
 */

let hcaptchaSiteKey = null;

// Fetch the hCaptcha site key from the server
async function fetchSiteKey() {
    try {
        const response = await fetch('/api/hcaptcha-sitekey');
        const data = await response.json();
        hcaptchaSiteKey = data.sitekey;
        return hcaptchaSiteKey;
    } catch (error) {
        console.error('Error fetching site key:', error);
        return null;
    }
}

// Initialize hCaptcha for contact info reveal
async function initContactProtection() {
    // Fetch site key first
    await fetchSiteKey();
    
    if (!hcaptchaSiteKey) {
        console.error('Failed to load hCaptcha site key');
        return;
    }
    
    // Update all dynamic hCaptcha elements with the site key
    const dynamicCaptchas = document.querySelectorAll('.h-captcha-dynamic');
    dynamicCaptchas.forEach(element => {
        element.setAttribute('data-sitekey', hcaptchaSiteKey);
    });
    
    // Find all email and phone reveal buttons
    const emailButtons = document.querySelectorAll('.reveal-email');
    const phoneButtons = document.querySelectorAll('.reveal-phone');
    
    emailButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showCaptchaModal('email', button);
        });
    });
    
    phoneButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showCaptchaModal('phone', button);
        });
    });
}

// Show CAPTCHA modal
function showCaptchaModal(type, button) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'captcha-modal-overlay';
    modal.innerHTML = `
        <div class="captcha-modal">
            <button class="captcha-modal-close">&times;</button>
            <h3>Verify You're Human</h3>
            <p>Please complete the verification to view our ${type === 'email' ? 'email address' : 'phone number'}.</p>
            <div id="captcha-container"></div>
            <div id="captcha-result"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button handler
    const closeBtn = modal.querySelector('.captcha-modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Render hCaptcha
    const widgetId = hcaptcha.render('captcha-container', {
        sitekey: hcaptchaSiteKey,
        callback: (token) => handleCaptchaSuccess(token, type, button, modal)
    });
}

// Handle successful CAPTCHA verification
async function handleCaptchaSuccess(token, type, button, modal) {
    try {
        const response = await fetch('/api/verify-captcha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                type: type
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Replace button with actual contact info
            if (type === 'email') {
                button.outerHTML = `<a href="mailto:${result.data}" class="contact-info-revealed">${result.data}</a>`;
            } else {
                button.outerHTML = `<a href="tel:${result.data.replace(/[^0-9]/g, '')}" class="contact-info-revealed">${result.data}</a>`;
            }
            
            // Close modal
            document.body.removeChild(modal);
        } else {
            showError(modal, 'Verification failed. Please try again.');
        }
    } catch (error) {
        console.error('Error verifying CAPTCHA:', error);
        showError(modal, 'An error occurred. Please try again.');
    }
}

// Show error message in modal
function showError(modal, message) {
    const resultDiv = modal.querySelector('#captcha-result');
    resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactProtection);
} else {
    initContactProtection();
}
