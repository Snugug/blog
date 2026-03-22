import {
  saveDraftToIDB,
  publishFile,
  deleteCurrentDraft,
  clearEditor,
  getEditorFile,
  setFilename,
} from './editor.svelte';
import { reloadCollection, refreshDrafts } from './state.svelte';
import { navigate } from './router.svelte';

/**
 * Saves the current editor content as a draft to IndexedDB and refreshes the sidebar's draft list so changes appear immediately.
 * @param {string | null} activeCollection - The active collection for refreshing the draft list
 * @return {Promise<void>}
 */
export async function handleSave(
  activeCollection: string | null,
): Promise<void> {
  await saveDraftToIDB();
  if (activeCollection) {
    await refreshDrafts(activeCollection);
  }
}

/**
 * Result of attempting a publish operation.
 */
export type PublishResult =
  | { status: 'ok' }
  | { status: 'no-file' }
  | { status: 'needs-filename' };

/**
 * Publishes the current editor content via StorageClient. If the file has no filename, returns a status indicating the filename dialog should be shown.
 * @param {string | null} activeCollection - The currently active collection name
 * @return {Promise<PublishResult>} The result of the publish attempt
 */
export async function handlePublish(
  activeCollection: string | null,
): Promise<PublishResult> {
  const file = getEditorFile();
  if (!file) return { status: 'no-file' };
  if (!file.filename) return { status: 'needs-filename' };
  if (!activeCollection) return { status: 'no-file' };

  await publishFile(activeCollection, file.filename);

  reloadCollection(activeCollection);
  return { status: 'ok' };
}

/**
 * Deletes the current draft. For drafts of live content, navigates to the live file's URL so the live version reloads in-place. For new drafts, navigates back to the collection list.
 * @param {string | null} activeCollection - The collection to navigate within
 * @return {Promise<void>}
 */
export async function handleDeleteDraft(
  activeCollection: string | null,
): Promise<void> {
  const file = getEditorFile();
  const wasNewDraft = file?.isNewDraft ?? true;
  const liveFilename = file?.filename;

  await deleteCurrentDraft();

  if (!activeCollection) return;

  // Refresh drafts list only — live content hasn't changed, so no need to
  // reload the full collection (which re-reads all files and causes a flash)
  await refreshDrafts(activeCollection);

  // Clear editor so the route change triggers a fresh load (preloadFile has
  // an early return if the same filename is already open)
  clearEditor();

  if (!wasNewDraft && liveFilename) {
    // Draft of live content — navigate to the live file so it reloads from disk
    const slug = liveFilename.replace(/\.mdx?$/, '');
    navigate(`/admin/${activeCollection}/${slug}`);
  } else {
    // New draft — no live file to return to, go to collection list
    navigate(`/admin/${activeCollection}`);
  }
}

/**
 * Handles the filename dialog confirmation: sets the filename on the editor and triggers publish.
 * @param {string} filename - The chosen filename (with extension)
 * @param {string | null} activeCollection - The active collection name
 * @return {Promise<void>}
 */
export async function handleFilenameConfirm(
  filename: string,
  activeCollection: string | null,
): Promise<void> {
  setFilename(filename);
  await handlePublish(activeCollection);
}

/**
 * Checks whether the publish button should be disabled by verifying required schema fields are populated.
 * @param {Record<string, unknown> | null} schema - The active JSON schema
 * @param {Record<string, unknown>} formData - The current form data
 * @return {boolean} True if publish should be disabled
 */
export function computePublishDisabled(
  schema: Record<string, unknown> | null,
  formData: Record<string, unknown>,
): boolean {
  if (!schema) return true;
  const required = schema['required'] as string[] | undefined;
  if (!required) return false;
  return required.some((key) => {
    const val = formData[key];
    return val === undefined || val === null || val === '';
  });
}
