import { rewriteHtml } from "@rewriters/html";
import { URLMeta } from "@rewriters/url";
import { CookieStore } from "@/shared/cookie";

export async function runtimeFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const meta: URLMeta = {
    base: url,
    origin: url,
    path: url.pathname + url.search
  };

  const cookieStore = new CookieStore();

  const upstream = await fetch(url.toString(), request);
  const text = await upstream.text();

  const rewritten = rewriteHtml(text, cookieStore, meta, true);

  return new Response(rewritten, {
    status: upstream.status,
    headers: upstream.headers
  });
}
