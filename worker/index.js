// All public pages, including /productos/:slug/, are emitted as static HTML.
// An unknown path must remain 404 instead of returning the home page (soft 404).
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
