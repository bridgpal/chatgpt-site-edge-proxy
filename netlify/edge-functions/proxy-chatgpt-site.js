const upstream = "https://atlanta-july-weather-2026.bridgpal.chatgpt.site";

export default function proxy(request) {
  const { pathname, search } = new URL(request.url);
  const forwarded = new Request(upstream + pathname + search, request);
  forwarded.headers.delete("host");
  return fetch(forwarded).then(async (response) => {
    if (
      new URL(request.url).searchParams.get("utm") !== "rain" ||
      !response.headers.get("content-type")?.includes("text/html")
    ) return response;

    const headline = "Heat rising.<br/><em>Storms forming.</em>";
    const personalize = `<script>(()=>{const set=()=>{const h=document.querySelector("h1");if(h&&h.innerHTML!=="${headline}")h.innerHTML="${headline}"};new MutationObserver(set).observe(document.documentElement,{subtree:true,childList:true,characterData:true});set()})()</script>`;
    const html = (await response.text())
      .replace("Hot days.<br/><em>Electric skies.</em>", headline)
      .replace("</body>", personalize + "</body>");
    const headers = new Headers(response.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(html, { status: response.status, headers });
  });
}
