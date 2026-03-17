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

/** Vite virtual module ID for collection schema paths */
const VIRTUAL_ID = 'virtual:collections';
/** Vite convention: resolved virtual IDs are prefixed with \0 */
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Astro integration that exposes content collection JSON schemas to client-side JavaScript.
 * Creates a symlink from public/collections -> .astro/collections and provides
 * a virtual module mapping collection names to their fetch-ready schema URLs.
 * @returns Astro integration config
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
 * @param logger - Astro integration logger for warnings
 * @returns Vite plugin config
 */
function collectionsVitePlugin(logger: AstroIntegrationLogger) {
  return {
    name: 'vite-plugin-collections',

    /**
     * Creates symlink from public/collections to .astro/collections.
     * Runs after astro sync has generated the schema files.
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

      // Check if something already exists at the target path.
      // Uses lstatSync instead of existsSync because existsSync follows symlinks
      // and returns false for broken symlinks, which would cause symlinkSync to
      // throw EEXIST on dangling links.
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
     * @param id - The import specifier
     * @returns Resolved ID if this is our virtual module
     */
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    /**
     * Generates the virtual module content by reading .astro/collections/.
     * Returns a mapping of collection name -> fetch URL for each schema file.
     * @param id - The resolved module ID
     * @returns Generated module source code
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
