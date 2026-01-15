import { handleFetch } from "../shared/rewriters";
import { config } from "../config";

export async function runtimeFetch(request: Request): Promise<Response> {
  try {
    return await handleFetch(request, config);
  } catch (err) {
    return new Response("Scramjet runtime error: " + (err as Error).message, {
      status: 500
    });
  }
}
