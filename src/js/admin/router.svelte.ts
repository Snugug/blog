/**
 * Parsed route state for the admin SPA.
 */
export type AdminRoute =
  | { view: 'home' }
  | { view: 'collection'; collection: string }
  | { view: 'file'; collection: string; slug: string };

// Current route, reactive via Svelte 5 runes
let route = $state<AdminRoute>(parsePathname(location.pathname));

/**
 * Parses a pathname into an AdminRoute.
 * @param {string} pathname - The URL pathname to parse
 * @return {AdminRoute} The route corresponding to the given pathname
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
 * @return {AdminRoute} The current parsed admin route
 */
export function getRoute(): AdminRoute {
  return route;
}

/**
 * Navigates to a path within the admin SPA using the Navigation API.
 * @param {string} path - The path to navigate to (e.g., '/admin/posts')
 * @return {void}
 */
export function navigate(path: string): void {
  navigation.navigate(path);
}

// Callback to check if the editor has unsaved changes
let dirtyChecker: (() => boolean) | null = null;

/**
 * Registers a function that returns whether the editor has unsaved changes.
 * @param {() => boolean} checker - Function returning true if there are unsaved changes
 * @return {void}
 */
export function registerDirtyChecker(checker: () => boolean): void {
  dirtyChecker = checker;
}

// Guard against duplicate listener registration (e.g., HMR remount)
let initialized = false;

/**
 * Initializes the Navigation API listener, intercepting navigations under /admin/ and updating reactive route state.
 * Safe to call multiple times — registers the listener only once.
 * @return {void}
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
