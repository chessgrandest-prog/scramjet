import { getRewriter } from "../shared/rewriters";

export async function runtimeFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Fetch upstream
  const upstream = await fetch(url.toString(), request);

  // Rewrite using Scramjet's rewriter engine
  const rewriter = getRewriter(url);
  const rewritten = await rewriter.rewriteResponse(upstream);

  return rewritten;
}
