// Service Worker for Digital Menu
const CACHE_NAME = 'digital-menu-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/images/breakfast/breakfast1.jpg',
    '/images/breakfast/breakfast2.jpg',
    '/images/breakfast/breakfast3.jpg',
    '/images/hot_appetizers/hot1.jpg',
    '/images/hot_appetizers/hot2.jpg',
    '/images/cold_appetizers/cold1.jpg',
    '/images/cold_appetizers/cold2.jpg',
    '/images/salads/salad1.jpg',
    '/images/salads/salad2.jpg',
    '/images/soups/soup1.jpg',
    '/images/soups/soup2.jpg',
    '/images/eastern/eastern1.jpg',
    '/images/eastern/eastern2.jpg',
    '/images/eastern/eastern3.jpg',
    '/images/western/western1.jpg',
    '/images/western/western2.jpg',
    '/images/western/western3.jpg',
    '/images/meat/meat1.jpg',
    '/images/meat/meat2.jpg',
    '/images/meat/meat3.jpg',
    '/images/meat/meat4.jpg',
    '/images/grills/grill1.jpg',
    '/images/grills/grill2.jpg',
    '/images/seafood/seafood1.jpg',
    '/images/seafood/seafood2.jpg',
    '/images/pasta/pasta1.jpg',
    '/images/pasta/pasta2.jpg',
    '/images/pizza/margherita1.jpg',
    '/images/pizza/pepperoni1.jpg',
    '/images/pizza/vegetarian1.jpg',
    '/images/sandwiches/sandwich1.jpg',
    '/images/kids_meals/kids1.jpg',
    '/images/crepes/crepe1.jpg',
    '/images/waffles/waffle1.jpg',
    '/images/cakes/cake1.jpg',
    '/images/fruit_salads/fruit1.jpg',
    '/images/hot_drinks/coffee1.jpg',
    '/images/hot_drinks/tea1.jpg',
    '/images/hot_drinks/cappuccino1.jpg',
    '/images/cold_drinks/orange1.jpg',
    '/images/cold_drinks/apple1.jpg',
    '/images/cold_drinks/mango1.jpg',
    '/images/sweets/arabic_sweets1.jpg',
    '/images/sweets/baklava1.jpg',
    '/images/sweets/knafeh1.jpg',
    '/images/shisha/apple1.jpg',
    '/images/shisha/grape1.jpg',
    '/images/shisha/traditional1.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Sync any pending data when connection is restored
    return Promise.resolve();
}

// Push notifications (if needed in future)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Menu',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Digital Menu', options)
    );
});

