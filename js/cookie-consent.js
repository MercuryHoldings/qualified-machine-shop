// Cookie Consent Banner - CCPA Compliant
// Qualified Machine Shop - Aggressive Display Approach

const COOKIE_NAME = 'qms_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

// Function to show the banner
function showCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner && !getCookie(COOKIE_NAME)) {
        banner.style.display = 'block';
        banner.style.opacity = '1';
        console.log('Cookie banner displayed');
        return true;
    } else if (getCookie(COOKIE_NAME)) {
        console.log('Cookie consent already set:', getCookie(COOKIE_NAME));
        return false;
    }
    return false;
}

// Try multiple times to show the banner
function initCookieBanner() {
    // Try immediately
    if (showCookieBanner()) return;
    
    // Try after 100ms
    setTimeout(function() {
        if (showCookieBanner()) return;
        
        // Try after 500ms
        setTimeout(function() {
            if (showCookieBanner()) return;
            
            // Final try after 1000ms
            setTimeout(showCookieBanner, 1000);
        }, 400);
    }, 100);
}

// Listen to multiple events
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    // DOM already loaded
    initCookieBanner();
}

// Also listen to window load as backup
window.addEventListener('load', initCookieBanner);

// Accept cookies function
function acceptCookies() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
    hideBanner();
    console.log('Cookies accepted');
}

// Decline cookies function
function declineCookies() {
    setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
    hideBanner();
    console.log('Cookies declined');
}

// Hide banner with fade out
function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.style.transition = 'opacity 0.3s ease';
        banner.style.opacity = '0';
        setTimeout(function() {
            banner.style.display = 'none';
        }, 300);
    }
}

// Set cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
}

// Get cookie
function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}
