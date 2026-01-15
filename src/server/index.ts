import { runtimeFetch } from "./runtime";

export default {
  async fetch(request: Request) {
    return runtimeFetch(request);
  }
};
