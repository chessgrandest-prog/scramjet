import { getRewriter } from "../shared/rewriters";

export async function runtimeFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Build URLMeta exactly as your fork expects
  const meta = {
    url,
    base: url.origin,
    origin: url, // must be URL, not string
    path: url.pathname + url.search
  };

  // Fetch upstream
  const upstream = await fetch(url.toString(), request);

  // Extract body text
  const text = await upstream.text();

  // getRewriter returns [rewriter, cleanup]
  const [rewriter, cleanup] = getRewriter(meta);

  try {
    // Rewrite HTML (Scramjet auto-detects content type)
    const rewrittenText = await rewriter.rewriteHtml(text);

    // Return rewritten response
    return new Response(rewrittenText, {
      status: upstream.status,
      headers: upstream.headers
    });
  } finally {
    cleanup();
  }
}
