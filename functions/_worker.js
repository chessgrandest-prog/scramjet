import server from "../dist/server/index.js";

export async function onRequest(context) {
  return server.fetch(context.request, context.env, context);
}
