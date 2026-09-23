const CACHE_NAME = "dental-system-v2";

const ASSETS_TO_CACHE = [
    "./loginpage.html",
    "./register.html",
    "./offline.html",
    "./manifest.json",

    "./icons/icon.192.png",
    "./icons/icon.512.png",

    "./dentist/dentistdash.html",
    "./dentist/appointments.html",
    "./dentist/patientrecord.html",
    "./dentist/profile.html",
    "./dentist/services.html",

    "./patient/patientsdash.html",
    "./patient/appointment.html",
    "./patient/profile.html",
    "./patient/record.html",
    "./patient/services.html"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});