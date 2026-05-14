import adapter from "@sveltejs/adapter-static";

// When the SPA is hosted under https://storage.googleapis.com/<bucket>/, the
// effective base path is /<bucket>. With a custom domain pointing at the bucket
// later, BASE_PATH stays empty and the app lives at the domain root.
const basePath = process.env.BASE_PATH ?? "";

export default {
  kit: {
    adapter: adapter({
      fallback: "index.html",
      strict: false
    }),
    paths: {
      base: basePath,
      relative: false
    },
    alias: {
      $components: "src/lib/components",
      $services: "src/lib/services",
      $stores: "src/lib/stores",
      $utils: "src/lib/utils",
      $config: "src/lib/config",
      $constants: "src/lib/constants"
    }
  }
};
