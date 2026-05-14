import adapter from "@sveltejs/adapter-static";

export default {
  kit: {
    adapter: adapter({
      fallback: "index.html",
      strict: false
    }),
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
