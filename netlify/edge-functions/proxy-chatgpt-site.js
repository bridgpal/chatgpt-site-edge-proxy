const upstream = "https://atlanta-july-weather-2026.bridgpal.chatgpt.site";

export default function proxy(request) {
  const { pathname, search } = new URL(request.url);
  const forwarded = new Request(upstream + pathname + search, request);
  forwarded.headers.delete("host");
  return fetch(forwarded).then(async (response) => {
    if (new URL(request.url).searchParams.get("utm") !== "rain") return response;

    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("javascript")) return response;

    const body = (await response.text())
      .replaceAll("Hot days.", "Heat rising.")
      .replaceAll("Electric skies.", "Storms forming.")
      .replace(/\.js(["'`])/g, ".js?utm=rain$1");
    const headers = new Headers(response.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(body, { status: response.status, headers });
  });
}
