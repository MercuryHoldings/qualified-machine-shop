// hCaptcha Contact Info Protection and Form Validation
// Qualified Machine Shop - Anti-Spam Protection

// Configuration
const HCAPTCHA_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001'; // Test key - replace with real key
const CONTACT_EMAIL = 'info@qualifiedmachine.com';
const CONTACT_PHONE = '(858) 259-9286';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeContactProtection();
    initializeFormCaptcha();
});

// Contact Info Protection
function initializeContactProtection() {
    // Find all phone and email elements
    const phoneElements = document.querySelectorAll('a[href^="tel:"], .phone-number');
    const emailElements = document.querySelectorAll('a[href^="mailto:"], .email-address');
    
    phoneElements.forEach(el => {
        protectContactInfo(el, 'phone', CONTACT_PHONE);
    });
    
    emailElements.forEach(el => {
        protectContactInfo(el, 'email', CONTACT_EMAIL);
    });
}

function protectContactInfo(element, type, realValue) {
    const originalHref = element.getAttribute('href');
    const displayText = type === 'phone' ? 'Click to reveal phone' : 'Click to reveal email';
    
    // Replace with protected version
    element.textContent = displayText;
    element.style.cursor = 'pointer';
    element.style.textDecoration = 'underline';
    element.removeAttribute('href');
    
    // Add click handler
    element.addEventListener('click', function(e) {
        e.preventDefault();
        showCaptchaModal(type, realValue, element, originalHref);
    });
}

function showCaptchaModal(type, realValue, element, originalHref) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'captcha-modal';
    modal.innerHTML = `
        <div class="captcha-modal-content">
            <span class="captcha-close">&times;</span>
            <h3>Verify You're Human</h3>
            <p>Please complete the verification to view our ${type === 'phone' ? 'phone number' : 'email address'}.</p>
            <div id="contact-captcha-${Date.now()}" class="h-captcha" data-sitekey="${HCAPTCHA_SITE_KEY}"></div>
            <button class="captcha-verify-btn" style="display:none;">Verify</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Render hCaptcha
    const captchaId = modal.querySelector('[class^="h-captcha"]').id;
    const widgetId = hcaptcha.render(captchaId, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: function(token) {
            // Verification successful
            revealContactInfo(type, realValue, element, originalHref);
            document.body.removeChild(modal);
        }
    });
    
    // Close button
    modal.querySelector('.captcha-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function revealContactInfo(type, realValue, element, originalHref) {
    element.textContent = realValue;
    if (originalHref) {
        element.setAttribute('href', originalHref);
    }
    element.style.cursor = 'default';
    
    // Store in session so user doesn't have to verify again
    sessionStorage.setItem(`verified_${type}`, 'true');
}

// Form CAPTCHA Integration
function initializeFormCaptcha() {
    const contactForm = document.querySelector('form[action*="formsubmit"]');
    const quoteForm = document.querySelector('form[action*="quote"]');
    
    if (contactForm) {
        setupFormCaptcha(contactForm, 'contact');
    }
    
    if (quoteForm) {
        setupFormCaptcha(quoteForm, 'quote');
    }
}

function setupFormCaptcha(form, formType) {
    // Add hCaptcha container before submit button
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    
    if (!submitButton) return;
    
    const captchaContainer = document.createElement('div');
    captchaContainer.className = 'form-captcha-container';
    captchaContainer.innerHTML = `
        <div class="h-captcha" data-sitekey="${HCAPTCHA_SITE_KEY}"></div>
    `;
    
    submitButton.parentNode.insertBefore(captchaContainer, submitButton);
    
    // Render hCaptcha
    const captchaElement = captchaContainer.querySelector('.h-captcha');
    let captchaToken = null;
    
    hcaptcha.render(captchaElement, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: function(token) {
            captchaToken = token;
        },
        'expired-callback': function() {
            captchaToken = null;
        }
    });
    
    // Intercept form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!captchaToken) {
            showErrorMessage('Please complete the CAPTCHA verification.');
            return false;
        }
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Submit form
        submitFormWithCaptcha(form, captchaToken, formType, submitButton);
    });
}

function submitFormWithCaptcha(form, captchaToken, formType, submitButton) {
    const formData = new FormData(form);
    formData.append('h-captcha-response', captchaToken);
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showSuccessModal(formType);
            form.reset();
            hcaptcha.reset();
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        showErrorMessage('There was an error submitting your form. Please try again or call us directly.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = formType === 'contact' ? 'Send Message' : 'Request Quote';
    });
}

function showSuccessModal(formType) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your ${formType === 'contact' ? 'message' : 'quote request'} has been successfully submitted.</p>
            <p>A representative from Qualified Machine Shop will be in touch with you shortly to discuss your needs.</p>
            <button class="success-close-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.success-close-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Auto-close after 5 seconds
    setTimeout(function() {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 5000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'background: #f44336; color: white; padding: 15px; margin: 10px 0; border-radius: 4px; text-align: center;';
    
    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form);
    
    setTimeout(function() {
        errorDiv.remove();
    }, 5000);
}
