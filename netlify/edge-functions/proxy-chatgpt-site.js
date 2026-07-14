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
    const html = (await response.text())
      .replace("Hot days.<br/><em>Electric skies.</em>", headline)
      .replace("</body>", `<script>document.querySelector("h1").innerHTML="${headline}"</script></body>`);
    const headers = new Headers(response.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(html, { status: response.status, headers });
  });
}
