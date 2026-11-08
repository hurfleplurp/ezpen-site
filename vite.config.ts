import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'product-domain-links',
    apply: 'build',
    transformIndexHtml(html, context) {
      return context.filename.endsWith('ggezpen.html')
        ? html.replaceAll('href="/"', 'href="https://ezpen.ink/"')
        : html.replaceAll('href="/ggezpen.html"', 'href="https://gg.ezpen.ink/"');
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
