// Cookie Consent Banner - CCPA Compliant
// Qualified Machine Shop - Show by default, hide only after interaction

const COOKIE_NAME = 'qms_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

// Check if cookie exists and hide banner if it does
window.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie-banner');
    if (banner && getCookie(COOKIE_NAME)) {
        banner.style.display = 'none';
        console.log('Cookie consent already set, banner hidden');
    } else {
        console.log('No cookie consent found, banner visible');
    }
});

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
