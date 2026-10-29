import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4178', ...devices['Desktop Chrome'] },
  workers: 4,
  webServer: [
    {
      command: 'npm run dev -- --port 4178 --strictPort',
      url: 'http://127.0.0.1:4178',
      reuseExistingServer: false,
      env: { VITE_EZPEN_DOWNLOAD_URL: '', VITE_EZPEN_RELEASES_URL: '', VITE_SITE_URL: '' },
    },
    {
      command: 'npm run dev -- --port 4179 --strictPort',
      url: 'http://127.0.0.1:4179',
      reuseExistingServer: false,
      env: {
        VITE_EZPEN_DOWNLOAD_URL: 'https://downloads.example.com/ezPen.exe',
        VITE_EZPEN_RELEASES_URL: 'https://example.com/releases',
        VITE_SITE_URL: 'https://example.com',
      },
    },
  ],
});
