/** Parsed route state for the admin SPA */
export type AdminRoute =
  | { view: 'home' }
  | { view: 'collection'; collection: string }
  | { view: 'file'; collection: string; slug: string };

/** Current route, reactive via Svelte 5 runes */
let route = $state<AdminRoute>(parsePathname(location.pathname));

/**
 * Parses a pathname into an AdminRoute.
 * @param pathname - The URL pathname to parse
 * @returns The parsed route object
 */
function parsePathname(pathname: string): AdminRoute {
  const segments = pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean);
  if (segments.length >= 2) {
    return { view: 'file', collection: segments[0], slug: segments[1] };
  }
  if (segments.length === 1) {
    return { view: 'collection', collection: segments[0] };
  }
  return { view: 'home' };
}

/**
 * Returns the current admin route (reactive).
 * @returns The current AdminRoute
 */
export function getRoute(): AdminRoute {
  return route;
}

/**
 * Navigates to a path within the admin SPA.
 * Uses the Navigation API to update the URL without a full page reload.
 * @param path - The path to navigate to (e.g., '/admin/posts')
 */
export function navigate(path: string): void {
  navigation.navigate(path);
}

/** Callback to check if the editor has unsaved changes */
let dirtyChecker: (() => boolean) | null = null;

/**
 * Registers a function that returns whether the editor has unsaved changes.
 * Called by the editor state module during initialization.
 * @param checker - Function returning true if there are unsaved changes
 */
export function registerDirtyChecker(checker: () => boolean): void {
  dirtyChecker = checker;
}

/** Guard against duplicate listener registration (e.g., HMR remount) */
let initialized = false;

/**
 * Initializes the Navigation API listener.
 * Intercepts navigations under /admin/ and updates the reactive route state.
 * Safe to call multiple times -- only registers the listener once.
 */
export function initRouter(): void {
  if (initialized) return;
  initialized = true;

  navigation.addEventListener('navigate', (event) => {
    const url = new URL(event.destination.url);

    // Only intercept navigations within /admin/
    if (!url.pathname.startsWith('/admin')) return;

    // Don't intercept downloads or hash-only changes
    if (event.hashChange || event.downloadRequest) return;

    if (!event.canIntercept) return;

    // Block navigation if editor has unsaved changes and user cancels.
    // This check must happen before event.intercept() — if it were inside the
    // handler, the URL would already be updated by the time the user cancels.
    if (
      dirtyChecker?.() &&
      !confirm('You have unsaved changes. Leave without saving?')
    ) {
      event.preventDefault();
      return;
    }

    event.intercept({
      handler() {
        route = parsePathname(url.pathname);
      },
    });
  });

  window.addEventListener('beforeunload', (event) => {
    if (dirtyChecker?.()) {
      event.preventDefault();
    }
  });
}
