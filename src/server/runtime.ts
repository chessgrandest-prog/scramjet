import { getRewriter } from "../shared/rewriters";

export async function runtimeFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Build the URLMeta object expected by your rewriter engine
  const meta = {
    url,
    base: url.origin,
    origin: url.origin,
    path: url.pathname + url.search
  };

  // Fetch upstream
  const upstream = await fetch(url.toString(), request);

  // getRewriter returns [rewriter, cleanup]
  const [rewriter, cleanup] = getRewriter(meta);

  try {
    const rewritten = await rewriter.rewriteResponse(upstream);
    return rewritten;
  } finally {
    cleanup();
  }
}
