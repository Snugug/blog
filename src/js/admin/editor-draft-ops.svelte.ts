import { dump } from 'js-yaml';
import {
  saveDraft as persistDraft,
  loadDraft as fetchDraft,
  deleteDraft as removeDraft,
  type Draft,
} from './draft-storage';
import { stableStringify } from './stable-stringify';
import {
  applyEditorState,
  _getDraftState,
  _setDraftState,
} from './editor.svelte';
import { getStorageClient } from './state.svelte';

/**
 * Loads a draft by ID from IndexedDB and populates the editor. Falls back to empty state if the draft is not found (safety fallback for the "Add" button flow).
 * @param {string} id - The draft UUID to load
 * @param {string} collection - The collection this draft belongs to
 * @return {Promise<void>}
 */
export async function loadDraftById(
  id: string,
  collection: string,
): Promise<void> {
  const draft = await fetchDraft(id);

  if (!draft) {
    applyEditorState(
      {
        body: '',
        formData: {},
        filename: '',
        bodyLoaded: true,
        draftId: id,
        isNewDraft: true,
        snapshot: null,
        collection,
        draftCreatedAt: new Date().toISOString(),
      },
      true,
    );
    return;
  }

  applyEditorState(
    {
      body: draft.body,
      formData: draft.formData,
      filename: draft.filename ?? '',
      bodyLoaded: true,
      draftId: draft.id,
      isNewDraft: draft.isNew,
      snapshot: draft.snapshot,
      collection,
      draftCreatedAt: draft.createdAt,
    },
    true,
  );
}

/**
 * Saves the current editor content as a draft in IndexedDB. On first save, generates a UUID and createdAt timestamp. For live content edits, captures a snapshot of the original data.
 * @return {Promise<void>}
 */
export async function saveDraftToIDB(): Promise<void> {
  const s = _getDraftState();
  _setDraftState({ saving: true });

  try {
    let { draftId, draftCreatedAt, snapshot } = s;

    // Generate draft ID and timestamp on first save
    if (!draftId) {
      draftId = crypto.randomUUID();
      draftCreatedAt = new Date().toISOString();

      // For live content edits, capture a snapshot of the original saved data
      if (!s.isNewDraft) {
        snapshot = stableStringify({
          formData: JSON.parse(s.lastSavedFormData),
          body: s.lastSavedBody,
        });
      }

      _setDraftState({ draftId, draftCreatedAt, snapshot });
    }

    const draft: Draft = {
      id: draftId,
      collection: s.currentCollection,
      filename: s.filename || null,
      isNew: s.isNewDraft,
      formData: $state.snapshot(s.formData) as Record<string, unknown>,
      body: s.body,
      snapshot,
      createdAt: draftCreatedAt!,
    };

    await persistDraft(draft);
    _setDraftState({
      lastSavedBody: s.body,
      lastSavedFormData: JSON.stringify(s.formData),
      dirty: false,
    });
  } finally {
    _setDraftState({ saving: false });
  }
}

/**
 * Legacy alias for saveDraftToIDB — preserves existing call sites until Tasks 11-13 rewire them.
 * @return {Promise<void>}
 */
export async function saveFile(): Promise<void> {
  return saveDraftToIDB();
}

/**
 * Writes editor content to the storage backend via StorageClient. Deletes the associated draft from IndexedDB after a successful write.
 * @param {string} collection - The collection the file belongs to
 * @param {string} filename - The filename to write within the collection
 * @return {Promise<void>}
 */
export async function publishFile(
  collection: string,
  filename: string,
): Promise<void> {
  const s = _getDraftState();
  _setDraftState({ saving: true });

  try {
    // dump() adds a trailing newline, so the template omits a \n before ---
    const yaml = dump(s.formData, { lineWidth: -1 });
    const content = `---\n${yaml}---\n\n${s.body}\n`;

    const client = getStorageClient();
    if (!client) throw new Error('No storage backend connected');
    await client.writeFile(collection, filename, content);

    // Clean up the draft from IndexedDB after successful publish
    if (s.draftId) {
      await removeDraft(s.draftId);
      _setDraftState({
        draftId: null,
        isNewDraft: false,
        snapshot: null,
        draftCreatedAt: null,
      });
    }

    _setDraftState({
      lastSavedBody: s.body,
      lastSavedFormData: JSON.stringify(s.formData),
      dirty: false,
    });
  } finally {
    _setDraftState({ saving: false });
  }
}

/**
 * Deletes the current draft from IndexedDB and resets draft-related state fields.
 * @return {Promise<void>}
 */
export async function deleteCurrentDraft(): Promise<void> {
  const { draftId } = _getDraftState();
  if (draftId) {
    await removeDraft(draftId);
  }
  _setDraftState({
    draftId: null,
    isNewDraft: false,
    snapshot: null,
    draftCreatedAt: null,
  });
}
