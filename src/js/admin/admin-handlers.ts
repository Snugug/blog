import {
  saveDraftToIDB,
  publishFile,
  deleteCurrentDraft,
  getEditorFile,
  setFilename,
} from './editor.svelte';
import { getDirectoryHandle, reloadCollection } from './state.svelte';
import { navigate } from './router.svelte';

/**
 * Saves the current editor content as a draft to IndexedDB.
 * @return {Promise<void>}
 */
export async function handleSave(): Promise<void> {
  await saveDraftToIDB();
}

/**
 * Result of attempting a publish operation.
 */
export type PublishResult =
  | { status: 'ok' }
  | { status: 'no-file' }
  | { status: 'needs-filename' };

/**
 * Publishes the current editor content to the filesystem. If the file has no filename, returns a status indicating the filename dialog should be shown. For new files, creates a new file handle in the collection directory.
 * @param {string | null} activeCollection - The currently active collection name
 * @return {Promise<PublishResult>} The result of the publish attempt
 */
export async function handlePublish(
  activeCollection: string | null,
): Promise<PublishResult> {
  const file = getEditorFile();
  if (!file) return { status: 'no-file' };
  if (!file.filename) return { status: 'needs-filename' };

  const dirHandle = getDirectoryHandle();

  if (file.handle) {
    // Existing file — publish to its stored handle
    await publishFile(file.handle);
  } else if (activeCollection && dirHandle) {
    // New file — create a handle in the collection directory
    const src = await dirHandle.getDirectoryHandle('src');
    const content = await src.getDirectoryHandle('content');
    const collDir = await content.getDirectoryHandle(activeCollection);
    const newHandle = await collDir.getFileHandle(file.filename, {
      create: true,
    });
    await publishFile(newHandle);
  }

  if (activeCollection) {
    reloadCollection(activeCollection);
  }

  return { status: 'ok' };
}

/**
 * Deletes the current draft and navigates back to the collection view.
 * @param {string | null} activeCollection - The collection to navigate back to
 * @return {Promise<void>}
 */
export async function handleDeleteDraft(
  activeCollection: string | null,
): Promise<void> {
  await deleteCurrentDraft();
  if (activeCollection) {
    reloadCollection(activeCollection);
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
