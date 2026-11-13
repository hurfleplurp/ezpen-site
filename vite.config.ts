import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'product-domain-links',
    apply: 'build',
    transformIndexHtml(html, context) {
      let updated = html
        .replaceAll('href="/ggezpen.html"', 'href="https://gg.ezpen.ink/"')
        .replaceAll('href="/leaderboard-privacy.html"', 'href="/leaderboard-privacy"');
      if (context.filename.endsWith('ggezpen.html')) {
        updated = updated.replaceAll('href="/"', 'href="https://ezpen.ink/"');
      }
      return updated;
    },
  }],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        ggezpen: fileURLToPath(new URL('./ggezpen.html', import.meta.url)),
      },
    },
  },
});
