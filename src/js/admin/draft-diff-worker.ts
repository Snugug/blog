import { stableStringify } from './stable-stringify';

/**
 * Input entry for comparing a draft snapshot against live content.
 */
type DiffEntry = {
  // Draft UUID
  draftId: string;
  // The draft's stored snapshot string (from stableStringify at draft creation)
  snapshot: string;
  // Current live frontmatter data
  liveFormData: Record<string, unknown>;
  // Current live body content
  liveBody: string;
};

// Listens for diff requests, compares each draft's snapshot against current live content,
// and returns a map of draftId → isOutdated.
self.addEventListener('message', (event: MessageEvent) => {
  const { type, entries } = event.data as {
    type: string;
    entries: DiffEntry[];
  };
  if (type !== 'diff') return;

  const results: Record<string, boolean> = {};

  for (const entry of entries) {
    // Reconstruct the comparable string using the same format as snapshot creation
    const liveString = stableStringify({
      formData: entry.liveFormData,
      body: entry.liveBody,
    });
    results[entry.draftId] = liveString !== entry.snapshot;
  }

  self.postMessage({ type: 'diff-result', results });
});
