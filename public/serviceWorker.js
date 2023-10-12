/**
 * Service Worker to intercept and modify requests.
 *
 * @listens fetch
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Check if the request is for the root path (home index page)
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const newHeaders = new Headers(event.request.headers);

    // Extract currentCurrency from cookies in headers
    const currencyCookie = event.request.headers
      .get("Cookie")
      ?.split("; ")
      .find((row) => row.startsWith("currentCurrency="));
    const currency = currencyCookie?.split("=")[1] || "CAD";

    newHeaders.append("X-Current-Currency", currency);

    const newRequest = new Request(event.request, { headers: newHeaders });
    event.respondWith(fetch(newRequest));
  }
});
