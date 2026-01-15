import { rewriteHtml } from "@rewriters/html";
import { URLMeta } from "@rewriters/url";
import { CookieStore } from "@/shared/cookie";

export async function runtimeFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const meta: URLMeta = {
    url,
    base: url,              // URL, not string
    origin: url,            // URL, not string
    path: url.pathname + url.search
  };

  const cookieStore = new CookieStore();

  // Fetch upstream
  const upstream = await fetch(url.toString(), request);

  // Read body as text
  const text = await upstream.text();

  // Rewrite HTML from the top so inject scripts run
  const rewritten = rewriteHtml(text, cookieStore, meta, true);

  return new Response(rewritten, {
    status: upstream.status,
    headers: upstream.headers
  });
}
