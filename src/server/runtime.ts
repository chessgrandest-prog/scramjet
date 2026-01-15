import { rewriteHtml } from "@rewriters/html";
import { URLMeta } from "@rewriters/url";
import { CookieStore } from "@/shared/cookie";

export async function runtimeFetch(request: Request): Promise<Response> {
  // Always valid
  const upstreamUrl = new URL(request.url);

  // Rewrite to Google
  upstreamUrl.hostname = "google.com";
  upstreamUrl.protocol = "https:";

  const meta: URLMeta = {
    base: upstreamUrl,
    origin: upstreamUrl
  };

  const cookieStore = new CookieStore();

  const upstream = await fetch(upstreamUrl.toString(), request);
  const text = await upstream.text();

  const rewritten = rewriteHtml(text, cookieStore, meta, true);

  return new Response(rewritten, {
    status: upstream.status,
    headers: upstream.headers
  });
}
