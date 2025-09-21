// Global variables
let currentRating = 0;
let searchTimeout;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const categoriesBtn = document.getElementById('categoriesBtn');
const categoriesDropdown = document.getElementById('categoriesDropdown');
const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const ratingModal = document.getElementById('ratingModal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateActiveNavLink();
    setupSmoothScrolling();
    setupImageLazyLoading();
    setupTouchGestures();
});

// Initialize application
function initializeApp() {
    // Add loading animation to images
    const images = document.querySelectorAll('.menu-item img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.animation = 'none';
            this.style.background = 'none';
        });
    });

    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        observer.observe(item);
    });

    // Update navigation indicators
    updateNavigationIndicators();
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar controls
    menuBtn.addEventListener('click', openSidebar);
    closeSidebar.addEventListener('click', closeSidebarFunc);
    overlay.addEventListener('click', closeSidebarFunc);

    // Categories dropdown
    categoriesBtn.addEventListener('click', showCategoriesDropdownWithInfo);
    
    // Category items click
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            navigateToCategory(category);
            closeCategoriesDropdown();
        });
    });

    // Search functionality
    searchBtn.addEventListener('click', toggleSearchBar);
    clearSearch.addEventListener('click', clearSearchInput);
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            navigateToCategory(target);
            updateActiveNavLink(this);
        });
    });

    // Rating stars
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.rating);
            updateStarRating(currentRating);
        });
    });

    // Rating form
    document.getElementById('ratingForm').addEventListener('submit', submitRating);

    // Close modal when clicking outside
    ratingModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Window resize
    window.addEventListener('resize', handleWindowResize);

    // Scroll events
    window.addEventListener('scroll', handleScroll);
}

// Sidebar functions
function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function closeSidebarFunc() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeSidebarAndGoHome() {
    closeSidebarFunc();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Categories dropdown functions
function toggleCategoriesDropdown() {
    categoriesDropdown.classList.toggle('hidden');
    
    // Close search if open
    if (!searchBar.classList.contains('hidden')) {
        toggleSearchBar();
    }
    
    // Close breakfast dropdown if open
    closeBreakfastDropdown();
}

function closeCategoriesDropdown() {
    categoriesDropdown.classList.add('hidden');
}

// Show categories dropdown with info (titles and counts)
function showCategoriesDropdownWithInfo() {
    categoriesDropdown.classList.remove('hidden');
    // Close search if open
    if (!searchBar.classList.contains('hidden')) {
        toggleSearchBar();
    }
    // Close breakfast dropdown if open
    closeBreakfastDropdown();
    // Scroll to dropdown for visibility
    categoriesDropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Breakfast dropdown functions
function toggleBreakfastMenu() {
    const breakfastDropdown = document.getElementById('breakfastDropdown');
    breakfastDropdown.classList.toggle('hidden');
    
    // Close other dropdowns
    closeCategoriesDropdown();
    if (!searchBar.classList.contains('hidden')) {
        toggleSearchBar();
    }
}

function closeBreakfastDropdown() {
    const breakfastDropdown = document.getElementById('breakfastDropdown');
    if (breakfastDropdown) {
        breakfastDropdown.classList.add('hidden');
    }
}

// Search functions
function toggleSearchBar() {
    searchBar.classList.toggle('hidden');
    
    if (!searchBar.classList.contains('hidden')) {
        searchInput.focus();
        // Close categories if open
        closeCategoriesDropdown();
    } else {
        clearSearchInput();
    }
}

function clearSearchInput() {
    searchInput.value = '';
    showAllItems();
    searchInput.focus();
}

function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 300);
}

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        showAllItems();
        return;
    }

    const menuItems = document.querySelectorAll('.menu-item');
    const categories = document.querySelectorAll('.category');
    let hasResults = false;

    categories.forEach(category => {
        let categoryHasResults = false;
        const items = category.querySelectorAll('.menu-item');
        
        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || description.includes(query)) {
                item.style.display = 'block';
                categoryHasResults = true;
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        category.style.display = categoryHasResults ? 'block' : 'none';
    });

    // Show no results message if needed
    if (!hasResults) {
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
    }
}

function showAllItems() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'block';
    });
    document.querySelectorAll('.category').forEach(category => {
        category.style.display = 'block';
    });
    hideNoResultsMessage();
}

function showNoResultsMessage() {
    hideNoResultsMessage();
    const message = document.createElement('div');
    message.id = 'noResults';
    message.className = 'no-results';
    message.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 20px; margin: 2rem;">
            <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
            <h3 style="color: #666; margin-bottom: 0.5rem;">لم يتم العثور على نتائج</h3>
            <p style="color: #999;">جرب البحث بكلمات مختلفة</p>
        </div>
    `;
    document.querySelector('main').appendChild(message);
}

function hideNoResultsMessage() {
    const existing = document.getElementById('noResults');
    if (existing) {
        existing.remove();
    }
}

// Navigation functions
function navigateToCategory(categoryId) {
    const target = document.getElementById(categoryId);
    if (target) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function updateNavigationIndicators() {
    // Navigation indicators removed as requested
}

// Rating functions
function openRating() {
    closeSidebarFunc();
    window.location.href = 'rating.html';
}

function closeModal() {
    ratingModal.classList.remove('active');
    ratingModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetRatingForm();
}

function updateStarRating(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function resetRatingForm() {
    document.getElementById('ratingForm').reset();
    currentRating = 0;
    updateStarRating(0);
}

function submitRating(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value;
    const comment = document.getElementById('comment').value;
    
    if (!name || currentRating === 0) {
        alert('يرجى إدخال اسمك واختيار التقييم');
        return;
    }
    
    // Simulate rating submission
    const ratingData = {
        name: name,
        rating: currentRating,
        comment: comment,
        timestamp: new Date().toISOString()
    };
    
    // Store in localStorage (in real app, send to server)
    const ratings = JSON.parse(localStorage.getItem('restaurantRatings') || '[]');
    ratings.push(ratingData);
    localStorage.setItem('restaurantRatings', JSON.stringify(ratings));
    
    // Show success message
    alert('شكراً لك! تم إرسال تقييمك بنجاح');
    closeModal();
    
    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Sidebar menu functions
function showWorkingHours() {
    closeSidebarFunc();
    window.location.href = 'working-hours.html';
}

function showAboutUs() {
    closeSidebarFunc();
    window.location.href = 'about-us.html';
}

function openLocation() {
    closeSidebarFunc();
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    // Restaurant coordinates (example)
    const lat = 24.7136;
    const lng = 46.6753;
    
    let mapUrl;
    if (isIOS) {
        mapUrl = `maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`;
    } else if (isAndroid) {
        mapUrl = `geo:${lat},${lng}?q=${lat},${lng}(مطعم فاخر)`;
    } else {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    
    window.open(mapUrl, '_blank');
}

// Developer info dropdown toggle
function toggleDeveloperInfo() {
    const dropdown = document.getElementById('developerDropdown');
    const arrow = document.getElementById('developerArrow');
    
    dropdown.classList.toggle('open');
    arrow.classList.toggle('rotated');
    
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Touch gestures
function setupTouchGestures() {
    let startX, startY, currentX, currentY;
    let isScrolling = false;
    
    const navContainer = document.querySelector('nav ul');
    
    navContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScrolling = false;
    });
    
    navContainer.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;
        
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);
        
        if (diffX > diffY && diffX > 10) {
            isScrolling = true;
            e.preventDefault();
        }
    });
    
    navContainer.addEventListener('touchend', () => {
        startX = null;
        startY = null;
        isScrolling = false;
    });
}

// Smooth scrolling setup
function setupSmoothScrolling() {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Image lazy loading
function setupImageLazyLoading() {
    const images = document.querySelectorAll('.menu-item img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Keyboard navigation
function handleKeyboardNavigation(e) {
    switch(e.key) {
        case 'Escape':
            if (!sidebar.classList.contains('open')) {
                closeSidebarFunc();
            }
            if (!ratingModal.classList.contains('hidden')) {
                closeModal();
            }
            if (!searchBar.classList.contains('hidden')) {
                toggleSearchBar();
            }
            if (!categoriesDropdown.classList.contains('hidden')) {
                closeCategoriesDropdown();
            }
            break;
        case '/':
            if (!searchBar.classList.contains('hidden')) {
                e.preventDefault();
                searchInput.focus();
            }
            break;
    }
}

// Window resize handler
function handleWindowResize() {
    // Close mobile menus on resize
    if (window.innerWidth > 768) {
        closeSidebarFunc();
        closeCategoriesDropdown();
    }
    
    // Update navigation indicators
    updateNavigationIndicators();
}

// Scroll handler
function handleScroll() {
    const header = document.querySelector('header');
    const scrolled = window.pageYOffset;
    
    // Add shadow to header when scrolled
    if (scrolled > 10) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    }
    
    // Update active navigation link based on scroll position
    const sections = document.querySelectorAll('.category');
    const navLinks = document.querySelectorAll('nav a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (scrolled >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimizations
const debouncedSearch = debounce(performSearch, 300);
const throttledScroll = throttle(handleScroll, 100);

// Replace original event listeners with optimized versions
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', throttledScroll);

// Add loading states
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #667eea; font-weight: 600;">جاري التحميل...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to a logging service
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Add to home screen prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or banner
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 1rem; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000; text-align: center;">
            <p style="margin-bottom: 0.5rem;">أضف المنيو إلى الشاشة الرئيسية</p>
            <button onclick="installApp()" style="background: white; color: #667eea; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer;">تثبيت</button>
            <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 8px; margin-right: 0.5rem; cursor: pointer;">لاحقاً</button>
        </div>
    `;
    document.body.appendChild(installBanner);
});

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Analytics (placeholder)
function trackEvent(eventName, eventData) {
    // In production, send to analytics service
    console.log('Event tracked:', eventName, eventData);
}

// Track user interactions
document.addEventListener('click', function(e) {
    if (e.target.matches('.menu-item')) {
        trackEvent('menu_item_click', {
            item: e.target.querySelector('h3').textContent
        });
    }
});

// Initialize tooltips and help text
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 5px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    
    // Add loading animation
    showLoading();
    
    // Hide loading after everything is ready
    setTimeout(hideLoading, 1000);
    
    // تم حذف رسالة الترحيب للمرة الأولى نهائيًا
});
