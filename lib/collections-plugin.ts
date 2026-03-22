import {
  existsSync,
  lstatSync,
  readlinkSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

// Vite virtual module ID for collection schema paths
const VIRTUAL_ID = 'virtual:collections';
// Vite convention: resolved virtual IDs are prefixed with \0
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Astro integration that exposes content collection JSON schemas to client-side JavaScript via a symlink and virtual module.
 * @return {AstroIntegration} The configured Astro integration object
 */
export default function collections(): AstroIntegration {
  return {
    name: 'collections',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger }) => {
        updateConfig({
          vite: {
            plugins: [collectionsVitePlugin(logger)],
          },
        });
      },
    },
  };
}

/**
 * Vite plugin that handles symlink creation and virtual module resolution.
 * @param {AstroIntegrationLogger} logger - Astro integration logger for warnings
 * @return {object} A Vite plugin object with buildStart, resolveId, and load hooks
 */
function collectionsVitePlugin(logger: AstroIntegrationLogger) {
  return {
    name: 'vite-plugin-collections',

    /**
     * Creates symlink from public/collections to .astro/collections.
     * @return {void}
     */
    buildStart() {
      const root = process.cwd();
      const source = resolve(root, '.astro/collections');
      const target = resolve(root, 'public/collections');

      // Guard: skip if .astro/collections doesn't exist yet
      if (!existsSync(source)) {
        logger.warn(
          '`.astro/collections` not found — skipping symlink. Run `pnpm sync` first.',
        );
        return;
      }

      // lstatSync instead of existsSync because existsSync follows symlinks and returns false for broken ones
      let targetStat: ReturnType<typeof lstatSync> | null = null;
      try {
        targetStat = lstatSync(target);
      } catch {
        /* doesn't exist at all */
      }

      if (targetStat !== null) {
        if (targetStat.isSymbolicLink()) {
          const linkTarget = resolve(dirname(target), readlinkSync(target));
          if (linkTarget === source) {
            return; // Symlink is correct, nothing to do
          }
          unlinkSync(target);
        } else if (targetStat.isDirectory()) {
          // rmSync needed because unlinkSync cannot remove directories
          rmSync(target, { recursive: true });
        } else {
          unlinkSync(target);
        }
      }

      // Create relative symlink for portability
      const relPath = relative(dirname(target), source);
      symlinkSync(relPath, target);
    },

    /**
     * Resolves the virtual:collections import to a Vite-internal ID.
     * @param {string} id - The module ID being resolved
     * @return {string | undefined} The resolved internal ID, or undefined if not handled
     */
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    /**
     * Generates the virtual module by reading .astro/collections/ and mapping collection names to schema fetch URLs.
     * @param {string} id - The resolved module ID to load
     * @return {string | undefined} Generated module source code, or undefined if not handled
     */
    load(id: string) {
      if (id !== RESOLVED_ID) return;

      const root = process.cwd();
      const collectionsDir = resolve(root, '.astro/collections');

      // Guard: return empty object if directory doesn't exist
      if (!existsSync(collectionsDir)) {
        logger.warn(
          '`.astro/collections` not found — virtual:collections will be empty.',
        );
        return 'export default {};';
      }

      const files = readdirSync(collectionsDir).filter((f) =>
        f.endsWith('.schema.json'),
      );

      const entries = files.map((f) => {
        const name = f.replace('.schema.json', '');
        return `  ${JSON.stringify(name)}: ${JSON.stringify('/collections/' + f)}`;
      });

      return `export default {\n${entries.join(',\n')}\n};`;
    },
  };
}
