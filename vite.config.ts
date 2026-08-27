// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        // Cloudflare provides these virtual modules at runtime. Keeping the full
        // namespace external also covers transitive imports such as sockets.
        external: [/^cloudflare:/],
      },
    },
    // In Vite's multi-environment build, build.rollupOptions.external only
    // applies to the "client" environment. The SSR environment needs its own
    // external declaration so Rollup doesn't try to bundle cloudflare:* modules
    // (e.g. "cloudflare:workers") when compiling the server output.
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            external: [/^cloudflare:/],
          },
        },
      },
    },
  },
});
