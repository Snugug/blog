import puppeteer from 'puppeteer';
import sirv from 'sirv';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

export default function ogImageGenerator() {
  return {
    name: 'generate-og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        logger.info('Starting OG Image Generation...');
        const distDirPath = fileURLToPath(dir);
        const ogDirPath = path.join(distDirPath, 'og');
        const imagesOgDirPath = path.join(distDirPath, 'images', 'og');

        if (!fs.existsSync(ogDirPath)) {
          logger.info('No OG pages found to generate images for.');
          return;
        }

        fs.mkdirSync(imagesOgDirPath, { recursive: true });

        const slugs = fs
          .readdirSync(ogDirPath)
          .filter((f) => fs.statSync(path.join(ogDirPath, f)).isDirectory());
        if (slugs.length === 0) {
          logger.info('No OG directories found.');
          return;
        }

        logger.info(`Found ${slugs.length} pages to generate OG images for.`);

        const assets = sirv(distDirPath, { dev: false });
        const server = http.createServer((req, res) => {
          assets(req, res, () => {
            res.statusCode = 404;
            res.end('Not found');
          });
        });

        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

        const port = server.address().port;
        logger.info(`Local static server started at http://127.0.0.1:${port}`);

        const browser = await puppeteer.launch({
          headless: 'new',
          args: process.env.CI
            ? ['--no-sandbox', '--disable-setuid-sandbox']
            : [],
        });

        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1200, height: 630 });
          await page.emulateMediaFeatures([
            { name: 'prefers-reduced-motion', value: 'reduce' },
          ]);

          for (const slug of slugs) {
            const url = `http://127.0.0.1:${port}/og/${slug}/`;
            logger.info(`Rendering OG image for: ${slug}`);

            await page.goto(url, { waitUntil: 'networkidle0' });
            await new Promise((r) => setTimeout(r, 500)); // Paint triangles needs a bit of time to settle after load

            const outputPath = path.join(imagesOgDirPath, `${slug}.png`);
            await page.screenshot({ path: outputPath });
          }
        } finally {
          await browser.close();
          server.close();
        }
        logger.info('OG Image Generation complete.');
      },
    },
  };
}
