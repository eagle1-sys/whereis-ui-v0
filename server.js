import server from "./_fresh/server.js";

export default {
  fetch: (request, env, ctx) => {
    // Make environment variables available globally for the request
    if (env) {
      globalThis.__CF_ENV__ = env;
    }
    return server.fetch(request, env, ctx);
  },
};
