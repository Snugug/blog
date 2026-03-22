import { registerDirtyChecker } from './router.svelte';
import { splitFrontmatter } from './frontmatter';
import { setByPath } from './schema-utils';
import type { PathSegment } from './schema-utils';
import { getDraftByFile } from './draft-storage';
import { getStorageClient } from './state.svelte';

/**
 * Editor file state exposed via getEditorFile().
 */
export type EditorFile = {
  body: string;
  formData: Record<string, unknown>;
  dirty: boolean;
  saving: boolean;
  filename: string;
  // Whether the body content has been loaded from disk
  bodyLoaded: boolean;
  // Draft ID if editing a draft, null for live content without a draft
  draftId: string | null;
  // Whether this is a brand-new draft (not yet published)
  isNewDraft: boolean;
};

/**
 * Shape for bulk-setting all editor state via applyEditorState. Avoids repetitive assignments across load/preload/clear functions.
 */
export type EditorStateConfig = {
  body: string;
  formData: Record<string, unknown>;
  filename: string;
  bodyLoaded: boolean;
  draftId: string | null;
  isNewDraft: boolean;
  snapshot: string | null;
  collection: string;
  draftCreatedAt: string | null;
};

let body = $state('');
let formData = $state<Record<string, unknown>>({});
let dirty = $state(false);
let saving = $state(false);
let lastSavedBody = '';
let lastSavedFormData = '{}';
let filename = $state('');
let fileOpen = $state(false);
let activeTab = $state('metadata');
let bodyLoaded = $state(false);
// Draft-specific state
let draftId = $state<string | null>(null);
let isNewDraft = $state(false);
let snapshot = $state<string | null>(null);
let currentCollection = $state('');
let draftCreatedAt = $state<string | null>(null);

registerDirtyChecker(() => dirty);

/**
 * Applies a full set of editor state values, resetting dirty/saving flags and updating save baselines.
 * @param {EditorStateConfig} c - All editor state fields to apply
 * @param {boolean} open - Whether to mark the file as open
 * @return {void}
 */
export function applyEditorState(c: EditorStateConfig, open: boolean): void {
  formData = c.formData;
  lastSavedFormData = JSON.stringify(c.formData);
  body = c.body;
  lastSavedBody = c.body;
  dirty = false;
  saving = false;
  filename = c.filename;
  bodyLoaded = c.bodyLoaded;
  activeTab = 'metadata';
  fileOpen = open;
  draftId = c.draftId;
  isNewDraft = c.isNewDraft;
  snapshot = c.snapshot;
  currentCollection = c.collection;
  draftCreatedAt = c.draftCreatedAt;
}

/**
 * Recomputes dirty state by comparing body and formData against their saved snapshots.
 * @return {void}
 */
function recomputeDirty(): void {
  dirty =
    body !== lastSavedBody || JSON.stringify(formData) !== lastSavedFormData;
}

/**
 * Returns a snapshot of draft-related internal state for use by editor-draft-ops. Exposes private module state without leaking $state reactivity.
 * @return {{ saving: boolean, draftId: string | null, isNewDraft: boolean, snapshot: string | null, currentCollection: string, draftCreatedAt: string | null, lastSavedFormData: string, lastSavedBody: string, formData: Record<string, unknown>, body: string, filename: string, dirty: boolean }}
 */
export function _getDraftState(): {
  saving: boolean;
  draftId: string | null;
  isNewDraft: boolean;
  snapshot: string | null;
  currentCollection: string;
  draftCreatedAt: string | null;
  lastSavedFormData: string;
  lastSavedBody: string;
  formData: Record<string, unknown>;
  body: string;
  filename: string;
  dirty: boolean;
} {
  return {
    saving,
    draftId,
    isNewDraft,
    snapshot,
    currentCollection,
    draftCreatedAt,
    lastSavedFormData,
    lastSavedBody,
    formData,
    body,
    filename,
    dirty,
  };
}

/**
 * Applies draft-related state mutations from editor-draft-ops back into the reactive module state.
 * @param {Partial<{ saving: boolean, draftId: string | null, isNewDraft: boolean, snapshot: string | null, draftCreatedAt: string | null, lastSavedFormData: string, lastSavedBody: string, dirty: boolean }>} updates - Fields to update
 * @return {void}
 */
export function _setDraftState(
  updates: Partial<{
    saving: boolean;
    draftId: string | null;
    isNewDraft: boolean;
    snapshot: string | null;
    draftCreatedAt: string | null;
    lastSavedFormData: string;
    lastSavedBody: string;
    dirty: boolean;
  }>,
): void {
  if ('saving' in updates) saving = updates.saving!;
  if ('draftId' in updates) draftId = updates.draftId!;
  if ('isNewDraft' in updates) isNewDraft = updates.isNewDraft!;
  if ('snapshot' in updates) snapshot = updates.snapshot!;
  if ('draftCreatedAt' in updates) draftCreatedAt = updates.draftCreatedAt!;
  if ('lastSavedFormData' in updates)
    lastSavedFormData = updates.lastSavedFormData!;
  if ('lastSavedBody' in updates) lastSavedBody = updates.lastSavedBody!;
  if ('dirty' in updates) dirty = updates.dirty!;
}

/**
 * Returns the current editor file state, or null if no file is open.
 * @return {EditorFile | null} The current editor file state, or null
 */
export function getEditorFile(): EditorFile | null {
  if (!fileOpen) return null;
  return {
    body,
    formData,
    dirty,
    saving,
    filename,
    bodyLoaded,
    draftId,
    isNewDraft,
  };
}

/**
 * Returns the current formData object (reactive).
 * @return {Record<string, unknown>} The current form data
 */
export function getFormData(): Record<string, unknown> {
  return formData;
}

/**
 * Returns the currently active editor tab (reactive).
 * @return {string} The active tab identifier
 */
export function getActiveTab(): string {
  return activeTab;
}

/**
 * Sets the active editor tab.
 * @param {string} tab - The tab identifier to activate
 * @return {void}
 */
export function setActiveTab(tab: string): void {
  activeTab = tab;
}

/**
 * Updates a single field within formData by path and recomputes dirty state.
 * @param {PathSegment[]} path - Ordered path segments addressing the field
 * @param {unknown} value - The new value to assign at the given path
 * @return {void}
 */
export function updateFormField(path: PathSegment[], value: unknown): void {
  setByPath(formData, path, value);
  recomputeDirty();
}

/**
 * Populates the editor with metadata so the UI renders without waiting for the async file read. Checks IndexedDB for an existing draft first — if found, loads draft data instead.
 * @param {string} collection - The collection this file belongs to
 * @param {string} itemFilename - The content file's name
 * @param {Record<string, unknown>} data - Pre-parsed frontmatter data
 * @return {Promise<void>}
 */
export async function preloadFile(
  collection: string,
  itemFilename: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (filename === itemFilename && fileOpen) return;

  // Check IndexedDB for an existing draft of this live file
  const d = await getDraftByFile(collection, itemFilename);
  if (d) {
    // Draft already contains body content, no disk read needed
    applyEditorState(
      {
        body: d.body,
        formData: d.formData,
        filename: itemFilename,
        bodyLoaded: true,
        draftId: d.id,
        isNewDraft: d.isNew,
        snapshot: d.snapshot,
        collection,
        draftCreatedAt: d.createdAt,
      },
      true,
    );
    return;
  }

  // No draft — load live data; $state.snapshot strips Svelte reactive proxies
  applyEditorState(
    {
      body: '',
      formData: $state.snapshot(data) as Record<string, unknown>,
      filename: itemFilename,
      bodyLoaded: false,
      draftId: null,
      isNewDraft: false,
      snapshot: null,
      collection,
      draftCreatedAt: null,
    },
    true,
  );
}

/**
 * Sets the filename for the current editor file. Used by the filename dialog.
 * @param {string} newFilename - The new filename to set
 * @return {void}
 */
export function setFilename(newFilename: string): void {
  filename = newFilename;
}

/**
 * Loads body content via StorageClient for an already-preloaded file, completing the two-phase load.
 * @param {string} collection - The collection the file belongs to
 * @param {string} filename - The filename to read within the collection
 * @return {Promise<void>}
 */
export async function loadFileBody(
  collection: string,
  filename: string,
): Promise<void> {
  const client = getStorageClient();
  if (!client) return;
  const text = await client.readFile(collection, filename);
  const split = splitFrontmatter(text);

  // Strip leading/trailing newlines from body for cleaner editing —
  // they get added back on save when reconstituting the file
  const trimmedBody = split.body.replace(/^\n+/, '').replace(/\n+$/, '');
  body = trimmedBody;
  lastSavedBody = trimmedBody;
  bodyLoaded = true;
}

/**
 * Updates the editor body content and recomputes dirty state.
 * @param {string} content - The new body content
 * @return {void}
 */
export function updateBody(content: string): void {
  body = content;
  recomputeDirty();
}

/**
 * Resets all editor state including draft-specific fields.
 * @return {void}
 */
export function clearEditor(): void {
  applyEditorState(
    {
      body: '',
      formData: {},
      filename: '',
      bodyLoaded: false,
      draftId: null,
      isNewDraft: false,
      snapshot: null,
      collection: '',
      draftCreatedAt: null,
    },
    false,
  );
}

// Re-export draft operations so existing import paths keep working.
// The canonical source is editor-draft-ops.svelte.ts.
export {
  saveDraftToIDB,
  saveFile,
  publishFile,
  loadDraftById,
  deleteCurrentDraft,
} from './editor-draft-ops.svelte';
