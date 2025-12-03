/**
 * Toggles the mobile navigation menu's visibility.
 */
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('active');
}

/**
 * Closes the mobile navigation menu if a click occurs outside of it.
 */
document.addEventListener('click', function(event) {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    // Check if the nav is active and the click is outside the nav and the button
    if (mobileNav && mobileNav.classList.contains('active') && !mobileNav.contains(event.target) && !menuBtn.contains(event.target)) {
        mobileNav.classList.remove('active');
    }
});

/**
 * Handles the sequential hero video playback with crossfade transitions.
 */
document.addEventListener('DOMContentLoaded', function() {
    const videos = [
        document.querySelector('.hero-video-1'),
        document.querySelector('.hero-video-2'),
        document.querySelector('.hero-video-3')
    ];
    const crossfade = document.querySelector('.hero-crossfade');

    // Only run if all video elements and the crossfade element exist
    if (videos.every(video => video) && crossfade) {
        let currentVideoIndex = 0;
        let isTransitioning = false;

        function switchToNextVideo() {
            if (isTransitioning) return;
            isTransitioning = true;

            const currentVideo = videos[currentVideoIndex];
            const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
            const nextVideo = videos[nextVideoIndex];

            // Start the crossfade (fade to black)
            crossfade.classList.add('active');

            // After 1 second (at peak of fade), switch the videos
            setTimeout(() => {
                currentVideo.classList.remove('active');
                currentVideo.pause();

                nextVideo.classList.add('active');
                nextVideo.currentTime = 0;
                nextVideo.play();

                currentVideoIndex = nextVideoIndex;
            }, 1000);

            // After 2 seconds (transition is over), remove the crossfade (fade from black)
            setTimeout(() => {
                crossfade.classList.remove('active');
                isTransitioning = false;
            }, 2000);
        }

        // Add an 'ended' event listener to each video to trigger the switch
        videos.forEach(video => {
            video.addEventListener('ended', switchToNextVideo);
        });

        // Start playing the first video
        if (videos[0]) {
            videos[0].play().catch(error => {
                console.log('Video autoplay was prevented:', error);
            });
        }
    }
});
/**
 * Header scroll effect - makes header opaque when scrolling
 * Applied to all pages site-wide
 */
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const body = document.body;
    
    // Check if we're on the homepage
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    const isQuotePage = body.getAttribute('data-page') === 'quote';
    
    if (isHomePage) {
        // Add home-page class to body
        body.classList.add('home-page');
    } else if (isQuotePage) {
        // Quote page should show orange logo pre-scroll (no solid-header class)
        // Will transition to white background on scroll
    } else {
        // Add solid-header class for non-homepage pages
        header.classList.add('solid-header');
    }
    
    // Add scroll event listener for transparent-to-opaque effect on ALL pages
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        // Debounce scroll events for performance
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    });
});

/**
 * Smooth page transitions - prevent white flash
 */
// Remove loading class after page fully loads
window.addEventListener('load', function() {
    document.body.classList.remove('loading');
});

// Add loading class before navigation
window.addEventListener('beforeunload', function() {
    document.body.classList.add('loading');
});
