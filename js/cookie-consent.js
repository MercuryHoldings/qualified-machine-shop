// Cookie Consent Banner - CCPA Compliant
// Qualified Machine Shop

(function() {
    'use strict';
    
    // Configuration
    const COOKIE_NAME = 'qms_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;
    
    // Initialize on page load - use multiple methods to ensure execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
        // DOM already loaded
        initCookieConsent();
    }
    
    // Fallback: also try on window load
    window.addEventListener('load', function() {
        if (!document.querySelector('.cookie-consent-banner')) {
            initCookieConsent();
        }
    });
    
    function initCookieConsent() {
        // Check if user has already made a choice
        const consent = getCookie(COOKIE_NAME);
        
        if (!consent) {
            // Show banner immediately for testing
            setTimeout(showCookieBanner, 500);
        }
    }
    
    function showCookieBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-consent-text">
                    <p>
                        We use cookies to enhance your browsing experience and analyze our traffic. 
                        By clicking "Accept All", you consent to our use of cookies. 
                        <a href="privacy-policy.html">Privacy Policy</a>
                    </p>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-consent-btn cookie-accept-btn" id="cookie-accept">
                        Accept All
                    </button>
                    <button class="cookie-consent-btn cookie-decline-btn" id="cookie-decline">
                        Decline
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Trigger animation
        setTimeout(function() {
            banner.classList.add('show');
        }, 100);
        
        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', function() {
            acceptCookies(banner);
        });
        
        document.getElementById('cookie-decline').addEventListener('click', function() {
            declineCookies(banner);
        });
    }
    
    function acceptCookies(banner) {
        // Set cookie consent
        setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
        
        // Enable analytics (if you add Google Analytics later)
        enableAnalytics();
        
        // Hide banner with animation
        hideBanner(banner);
    }
    
    function declineCookies(banner) {
        // Set cookie consent as declined
        setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
        
        // Disable analytics
        disableAnalytics();
        
        // Hide banner with animation
        hideBanner(banner);
    }
    
    function hideBanner(banner) {
        banner.style.animation = 'slideDown 0.4s ease';
        
        setTimeout(function() {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 400);
    }
    
    function enableAnalytics() {
        // Placeholder for Google Analytics or other tracking
        // Example: window.ga = window.ga || function() { (ga.q = ga.q || []).push(arguments) };
        console.log('Analytics enabled');
    }
    
    function disableAnalytics() {
        // Disable Google Analytics if present
        // Example: window['ga-disable-UA-XXXXX-Y'] = true;
        console.log('Analytics disabled');
    }
    
    // Cookie utility functions
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + date.toUTCString();
        document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
    }
    
    function getCookie(name) {
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }
    
    // Add slideDown animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
})();
