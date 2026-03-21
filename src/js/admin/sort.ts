/**
 * Sidebar item displayed as a link in the admin navigation.
 * Used by AdminSidebar for both collections and content lists.
 */
export type SidebarItem = {
  label: string;
  href: string;
  subtitle?: string;
  date?: Date;
};

/** Sort mode identifiers */
export type SortMode = 'alpha' | 'date-asc' | 'date-desc';

/** Sort mode configuration: icon name and display label */
export const SORT_MODES: Record<SortMode, { icon: string; label: string }> = {
  alpha: { icon: 'sort_by_alpha', label: 'Alphabetical' },
  'date-asc': { icon: 'hourglass_arrow_down', label: 'Oldest first' },
  'date-desc': { icon: 'hourglass_arrow_up', label: 'Newest first' },
};

/** Fixed display order for sort options in the popover */
export const SORT_ORDER: SortMode[] = ['alpha', 'date-asc', 'date-desc'];

/**
 * Reads the persisted sort mode from localStorage.
 * @param key - Collection name to construct the storage key
 * @returns The stored SortMode, or 'alpha' if absent/invalid
 */
export function readSortMode(key: string): SortMode {
  const stored = localStorage.getItem(`cms-sort-${key}`);
  if (stored === 'alpha' || stored === 'date-asc' || stored === 'date-desc') {
    return stored;
  }
  return 'alpha';
}

/**
 * Writes the sort mode to localStorage.
 * @param key - Collection name to construct the storage key
 * @param mode - The sort mode to persist
 */
export function writeSortMode(key: string, mode: SortMode): void {
  localStorage.setItem(`cms-sort-${key}`, mode);
}

/**
 * Creates a comparator function for sorting SidebarItems by the given mode.
 * @param mode - The sort mode to use
 * @returns A comparator function for Array.sort()
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
