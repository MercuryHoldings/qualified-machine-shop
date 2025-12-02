/**
 * Contact Protection Module
 * Protects email and phone numbers with hCaptcha verification
 * Also handles form submissions with CAPTCHA
 */

let hcaptchaSiteKey = null;
let formCaptchaWidgets = {};
let revealedContacts = {
    email: null,
    phone: null
};

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

// Wait for hCaptcha library to load
function waitForHCaptcha() {
    return new Promise((resolve) => {
        if (typeof hcaptcha !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof hcaptcha !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize hCaptcha for contact info reveal and forms
async function initContactProtection() {
    // Wait for hCaptcha library to load
    await waitForHCaptcha();
    
    // Fetch site key first
    await fetchSiteKey();
    
    if (!hcaptchaSiteKey) {
        console.error('Failed to load hCaptcha site key');
        return;
    }
    
    // Initialize form CAPTCHAs
    initFormCaptchas();
    
    // Initialize reveal button CAPTCHAs
    initRevealButtons();
}

// Initialize CAPTCHA on forms
function initFormCaptchas() {
    const captchaContainers = document.querySelectorAll('.h-captcha[data-sitekey=""]');
    
    captchaContainers.forEach((container, index) => {
        // Set the site key
        container.setAttribute('data-sitekey', hcaptchaSiteKey);
        
        // Render hCaptcha widget
        const widgetId = hcaptcha.render(container, {
            sitekey: hcaptchaSiteKey,
            callback: () => {
                // CAPTCHA completed
            },
            'error-callback': () => {
                console.error('hCaptcha error');
            },
            'expired-callback': () => {
                console.warn('hCaptcha expired');
            }
        });
        
        formCaptchaWidgets[index] = widgetId;
        
        // Hide loading spinner and show CAPTCHA
        const loadingSpinner = document.getElementById('captcha-loading');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        container.classList.remove('loading');
        container.classList.add('loaded');
    });
    
    // Add form submission handlers
    const forms = document.querySelectorAll('form.contact-form, form.quote-form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Handle form submission with CAPTCHA verification
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const captchaContainer = form.querySelector('.h-captcha');
    
    if (!captchaContainer) {
        // No CAPTCHA on this form, submit normally
        form.submit();
        return;
    }
    
    // Get hCaptcha response
    const response = hcaptcha.getResponse(captchaContainer);
    
    if (!response) {
        alert('Please complete the CAPTCHA verification.');
        return;
    }
    
    // Verify CAPTCHA with backend
    try {
        const verifyResponse = await fetch('/api/verify-form-captcha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: response
            })
        });
        
        const result = await verifyResponse.json();
        
        if (result.success) {
            // CAPTCHA verified, submit the form
            form.submit();
        } else {
            alert('CAPTCHA verification failed. Please try again.');
            hcaptcha.reset(captchaContainer);
        }
    } catch (error) {
        console.error('Error verifying form CAPTCHA:', error);
        alert('An error occurred. Please try again.');
    }
}

// Initialize reveal buttons
function initRevealButtons() {
    const emailButtons = document.querySelectorAll('.reveal-email, button[onclick*="revealContact"][onclick*="email"], a[onclick*="revealContact"][onclick*="email"], span.email-address');
    const phoneButtons = document.querySelectorAll('.reveal-phone, button[onclick*="revealContact"][onclick*="phone"], a[onclick*="revealContact"][onclick*="phone"], span.phone-number');
    
    emailButtons.forEach(button => {
        // Remove inline onclick if present
        button.removeAttribute('onclick');
        button.style.cursor = 'pointer';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if already revealed
            if (revealedContacts.email) {
                replaceAllContactButtons('email', revealedContacts.email);
            } else {
                showCaptchaModal('email');
            }
        });
    });
    
    phoneButtons.forEach(button => {
        // Remove inline onclick if present
        button.removeAttribute('onclick');
        button.style.cursor = 'pointer';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if already revealed
            if (revealedContacts.phone) {
                replaceAllContactButtons('phone', revealedContacts.phone);
            } else {
                showCaptchaModal('phone');
            }
        });
    });
}

// Show CAPTCHA modal for contact info reveal
function showCaptchaModal(type) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'captcha-modal-overlay';
    modal.innerHTML = `
        <div class="captcha-modal">
            <button class="captcha-modal-close">&times;</button>
            <h3>Verify You're Human</h3>
            <p>Please complete the verification to view our ${type === 'email' ? 'email address' : 'phone number'}.</p>
            <div id="captcha-container-${Date.now()}"></div>
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
    const containerId = modal.querySelector('[id^="captcha-container-"]').id;
    const widgetId = hcaptcha.render(containerId, {
        sitekey: hcaptchaSiteKey,
        callback: (token) => handleCaptchaSuccess(token, type, modal)
    });
}

// Handle successful CAPTCHA verification for contact info reveal
async function handleCaptchaSuccess(token, type, modal) {
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
            // Store the revealed contact info
            revealedContacts[type] = result.data;
            
            // Replace ALL buttons of this type with actual contact info
            replaceAllContactButtons(type, result.data);
            
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

// Replace all contact buttons of a specific type with the actual contact info
function replaceAllContactButtons(type, contactInfo) {
    let buttons;
    let linkHTML;
    
    if (type === 'email') {
        buttons = document.querySelectorAll('.reveal-email, button[onclick*="email"], a[onclick*="email"], span.email-address');
        linkHTML = `<a href="mailto:${contactInfo}" class="contact-info-revealed email-revealed">${contactInfo}</a>`;
    } else {
        buttons = document.querySelectorAll('.reveal-phone, button[onclick*="phone"], a[onclick*="phone"], span.phone-number');
        const phoneClean = contactInfo.replace(/[^0-9]/g, '');
        linkHTML = `<a href="tel:${phoneClean}" class="contact-info-revealed phone-revealed">${contactInfo}</a>`;
    }
    
    buttons.forEach(button => {
        // Create a temporary container to parse the HTML
        const temp = document.createElement('div');
        temp.innerHTML = linkHTML;
        const newElement = temp.firstChild;
        
        // Replace the button with the new link
        button.parentNode.replaceChild(newElement, button);
    });
}

// Show error message in modal
function showError(modal, message) {
    const resultDiv = modal.querySelector('#captcha-result');
    resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
}

// Global function for inline onclick handlers (backwards compatibility)
function revealContact(type) {
    const button = event.target;
    showCaptchaModal(type);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactProtection);
} else {
    initContactProtection();
}
