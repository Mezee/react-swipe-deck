import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/e2e-report', open: 'never' }],
  ],
  use: { trace: 'on', headless: true, channel: 'chrome' },
  outputDir: 'artifacts/test-results',
});
