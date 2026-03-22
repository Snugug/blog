/**
 * Sidebar item displayed as a link in the admin navigation. Used by AdminSidebar for both collections and content lists.
 */
export type SidebarItem = {
  label: string;
  href: string;
  subtitle?: string;
  date?: Date;
  // Draft-specific fields
  draftId?: string;
  isDraft?: boolean;
  isOutdated?: boolean;
};

/**
 * Sort mode identifiers.
 */
export type SortMode = 'alpha' | 'date-asc' | 'date-desc';

// Sort mode configuration: icon name and display label
export const SORT_MODES: Record<SortMode, { icon: string; label: string }> = {
  alpha: { icon: 'sort_by_alpha', label: 'Alphabetical' },
  'date-asc': { icon: 'hourglass_arrow_down', label: 'Oldest first' },
  'date-desc': { icon: 'hourglass_arrow_up', label: 'Newest first' },
};

// Fixed display order for sort options in the popover
export const SORT_ORDER: SortMode[] = ['alpha', 'date-asc', 'date-desc'];

/**
 * Reads the persisted sort mode from localStorage, defaulting to 'alpha' if absent or invalid.
 * @param {string} key - Collection name used to construct the storage key
 * @return {SortMode} The persisted sort mode, or 'alpha' if not set
 */
export function readSortMode(key: string): SortMode {
  const stored = localStorage.getItem(`cms-sort-${key}`);
  if (stored === 'alpha' || stored === 'date-asc' || stored === 'date-desc') {
    return stored;
  }
  return 'alpha';
}

/**
 * Persists the sort mode to localStorage.
 * @param {string} key - Collection name used to construct the storage key
 * @param {SortMode} mode - The sort mode to persist
 * @return {void}
 */
export function writeSortMode(key: string, mode: SortMode): void {
  localStorage.setItem(`cms-sort-${key}`, mode);
}

/**
 * Coerces a frontmatter published value (Date object or ISO string) into a Date for sorting. Returns undefined if the value is not a recognized date type.
 * @param {unknown} val - The published value from frontmatter
 * @return {Date | undefined} The resolved Date, or undefined
 */
export function toSortDate(val: unknown): Date | undefined {
  if (val instanceof Date) return val;
  return typeof val === 'string' ? new Date(val) : undefined;
}

/**
 * Returns a comparator function for sorting SidebarItems by the given mode.
 * @param {SortMode} mode - The sort mode to use
 * @return {(a: SidebarItem, b: SidebarItem) => number} A comparator function suitable for Array.sort
 */
export function createComparator(
  mode: SortMode,
): (a: SidebarItem, b: SidebarItem) => number {
  return (a, b) => {
    if (mode === 'date-asc') {
      return (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0);
    }
    if (mode === 'date-desc') {
      return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
    }
    return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
  };
}
