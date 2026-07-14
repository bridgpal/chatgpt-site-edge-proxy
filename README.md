# ChatGPT Site Edge Proxy

A minimal Netlify Edge Function that proxies a public ChatGPT site.

## How it works

The function replaces the incoming origin with the ChatGPT site's origin, preserves the path and query string, and forwards the request. Because the site's assets use root-relative URLs, they are fetched through the same proxy.

```js
const upstream = "https://atlanta-july-weather-2026.bridgpal.chatgpt.site";

export default function proxy(request) {
  const { pathname, search } = new URL(request.url);
  const forwarded = new Request(upstream + pathname + search, request);
  forwarded.headers.delete("host");
  return fetch(forwarded);
}
```

`netlify.toml` maps every path to the function:

```toml
[[edge_functions]]
function = "proxy-chatgpt-site"
path = "/*"
```

## Try it

Create a new Netlify project from this repository. No build command or environment variables are required.

To proxy another public ChatGPT site, change the `upstream` URL in `netlify/edge-functions/proxy-chatgpt-site.js`.

## Edge personalization experiment

Add `?utm=rain` to replace the hero headline at the edge:

```text
Hot days. Electric skies. → Heat rising. Storms forming.
```

Without the parameter, the upstream page is returned unchanged.

The Edge Function rewrites both the rendered headline and React's serialized hydration data, so the personalized text remains stable after the app loads.
