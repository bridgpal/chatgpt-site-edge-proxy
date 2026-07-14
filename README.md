# ChatGPT Site Edge Proxy

TL;DR: this repository demonstrates proxying a public ChatGPT Site through Netlify. The Edge Function shows how to customize proxied responses. The active `netlify.toml` configuration is a root-level proxy rewrite to the Cuddle Club site, which also keeps its root-relative assets working through the proxy.

## Version 1: the original proxy

The original experiment only changes the request origin. It preserves the path, query string, method, headers, and body. Because this ChatGPT Site uses root-relative asset URLs, its CSS, JavaScript, and images are requested through the same Netlify proxy.

```js
const upstream = "https://atlanta-july-weather-2026.bridgpal.chatgpt.site";

export default function proxy(request) {
  const { pathname, search } = new URL(request.url);
  const forwarded = new Request(upstream + pathname + search, request);
  forwarded.headers.delete("host");
  return fetch(forwarded);
}
```

The `host` header must be removed so the upstream receives its own hostname instead of the Netlify hostname.

## Version 2: the shipped personalized proxy

The Edge Function in [`netlify/edge-functions/proxy-chatgpt-site.js`](netlify/edge-functions/proxy-chatgpt-site.js) starts with the same proxy behavior and adds a query-based variant.

- `/` returns the original site unchanged.
- `/?utm=rain` changes the hero from `Hot days. Electric skies.` to `Heat rising. Storms forming.`
- Other `utm` values return the original site unchanged.

Changing only the server-rendered HTML is not enough. React hydrates the page using its serialized data and client bundle, which can restore the original text. The shipped function therefore rewrites three places:

1. The rendered HTML.
2. React's serialized hydration data in the HTML response.
3. The JavaScript page bundle containing the original headline.

To ensure the browser loads the personalized bundle, the function propagates `?utm=rain` through JavaScript module imports. It removes `content-encoding` and `content-length` after rewriting because the response body has changed.

This copy replacement is intentionally specific to the example site. The proxy pattern should work for similarly generated public ChatGPT Sites, but another site needs its own source and replacement strings.

## Root-level proxy rewrite

The active `netlify.toml` configuration proxies every request to the Cuddle Club ChatGPT Site:

```toml
[[redirects]]
from = "/*"
to = "https://cuddle-club-plushies.youvalv.chatgpt.site/:splat"
status = 200
force = true
```

Using the proxy at the root ensures URLs such as `/assets/index.css` and `/plush-crew.png` are sent to the same upstream site. A subpath-only rewrite would return the page HTML but would not automatically rewrite those root-relative asset URLs.

## Deploy it

Create a new Netlify project from this repository. No build command or environment variables are required.

To proxy another public ChatGPT Site with the TOML rewrite, change the target URL in `netlify.toml`. To enable response customization instead, map the included Edge Function to the desired paths.
