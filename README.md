# ChatGPT Site Edge Proxy

TL;DR: this repository demonstrates two stages of proxying a public ChatGPT Site through Netlify. The original eight-line Edge Function is the minimal transparent proxy. The function shipped in this repository adds conditional personalization with `?utm=rain` and rewrites the client modules so the change survives React hydration.

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

## Netlify configuration

`netlify.toml` maps every request to the Edge Function:

```toml
[[edge_functions]]
function = "proxy-chatgpt-site"
path = "/*"
```

## Deploy it

Create a new Netlify project from this repository. No build command or environment variables are required.

To proxy another public ChatGPT site, change the `upstream` URL in `netlify/edge-functions/proxy-chatgpt-site.js`.
