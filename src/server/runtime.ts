import { rewriteHtml } from "@rewriters/html";
import { URLMeta } from "@rewriters/url";
import { CookieStore } from "@/shared/cookie";

const UPSTREAM = "https://google.com";

export async function runtimeFetch(request: Request): Promise<Response> {
  const incoming = new URL(request.url);

  // Build upstream URL
  const upstreamUrl = new URL(request.url);
upstreamUrl.hostname = "google.com";
upstreamUrl.protocol = "https:";


  // Build URLMeta (your type only has base + origin)
  const meta: URLMeta = {
    base: upstreamUrl,
    origin: upstreamUrl
  };

  const cookieStore = new CookieStore();

  // Fetch upstream Google page
  const upstream = await fetch(upstreamUrl.toString(), request);

  // Read body as text
  const text = await upstream.text();

  // Rewrite HTML from the top so scripts are injected
  const rewritten = rewriteHtml(text, cookieStore, meta, true);

  return new Response(rewritten, {
    status: upstream.status,
    headers: upstream.headers
  });
}
