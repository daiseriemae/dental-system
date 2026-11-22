
const CACHE_NAME = "dental-system-v3";
const APP_SHELL = "./index.html";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                const response = await fetch(APP_SHELL);

                if (!response.ok) {
                    throw new Error("Failed to cache DentalCare app.");
                }

                await cache.put(APP_SHELL, response);
            })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name =>
                            name.startsWith("dental-system-") &&
                            name !== CACHE_NAME
                        )
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (
        url.origin !== self.location.origin ||
        url.pathname.includes("/api/")
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));
                    }

                    return response;
                })
                .catch(async () => {
                    const cachedPage = await caches.match(request);

                    if (cachedPage) {
                        return cachedPage;
                    }

                   
                    const app = await caches.match(APP_SHELL);

                    if (app) {
                        return app;
                    }

                    return new Response(
                        "DentalCare is offline. Please reconnect to the internet.",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/plain"
                            }
                        }
                    );
                })
        );

        return;
    }


    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {
                        if (response.ok) {
                            const copy = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, copy));
                        }

                        return response;
                    });
            })
    );
});
