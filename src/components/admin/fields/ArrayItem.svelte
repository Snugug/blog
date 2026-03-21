<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import SchemaField from './SchemaField.svelte';

  interface Props {
    /** Parent array field name, used to namespace child field ids */
    name: string;
    /** Zero-based position of this item in the array */
    index: number;
    /** The item's current value */
    item: unknown;
    /** JSON Schema node describing a single array item */
    itemSchema: SchemaNode;
    /** Whether the item schema is an object type */
    isObject: boolean;
    /** Whether this item's content is collapsed (only applicable for objects) */
    collapsed: boolean;
    /** Whether this item is currently being dragged */
    dragging: boolean;
    /** Whether this item is the current drag-over drop target */
    dropTarget: boolean;
    /** Whether this is the first item in the list (disables move-up) */
    isFirst: boolean;
    /** Whether this is the last item in the list (disables move-down) */
    isLast: boolean;
    /** Whether the remove button is enabled */
    canRemove: boolean;
    /** Fired when this item's value changes */
    onupdate: (index: number, value: unknown) => void;
    /** Fired when the remove button is clicked */
    onremove: (index: number) => void;
    /** Fired when the move-up arrow is clicked */
    onmoveup: (index: number) => void;
    /** Fired when the move-down arrow is clicked */
    onmovedown: (index: number) => void;
    /** Fired when the collapse/expand toggle is clicked */
    ontogglecollapse: (index: number) => void;
    /** Native dragstart handler — attached to the draggable wrapper div */
    ondragstart: (e: DragEvent) => void;
    /** Native dragover handler — attached to the draggable wrapper div */
    ondragover: (e: DragEvent) => void;
    /** Native dragleave handler — attached to the draggable wrapper div */
    ondragleave: (e: DragEvent) => void;
    /** Native drop handler — attached to the draggable wrapper div */
    ondrop: (e: DragEvent) => void;
    /** Native dragend handler — attached to the draggable wrapper div */
    ondragend: (e: DragEvent) => void;
  }

  let {
    name,
    index,
    item,
    itemSchema,
    isObject,
    collapsed,
    dragging,
    dropTarget,
    isFirst,
    isLast,
    canRemove,
    onupdate,
    onremove,
    onmoveup,
    onmovedown,
    ontogglecollapse,
    ondragstart,
    ondragover,
    ondragleave,
    ondrop,
    ondragend,
  }: Props = $props();

  /**
   * Derives a brief summary string for collapsed object items.
   * Uses the first string-typed property value found, or falls back to "Item N".
   * @returns Summary label string for the collapsed header
   */
  const summary = $derived.by(() => {
    if (!isObject) return '';
    if (typeof item !== 'object' || item === null) return `Item ${index + 1}`;
    const obj = item as Record<string, unknown>;
    const firstString = Object.values(obj).find(
      (v) => typeof v === 'string' && v !== '',
    );
    return typeof firstString === 'string' ? firstString : `Item ${index + 1}`;
  });
</script>

<!-- Single array item with drag-and-drop and reorder controls -->
<div
  class="array-item"
  class:array-item--dragging={dragging}
  class:array-item--drop-target={dropTarget}
  draggable="true"
  role="listitem"
  {ondragstart}
  {ondragover}
  {ondragleave}
  {ondrop}
  {ondragend}
>
  <!-- Controls bar: drag handle, collapse toggle, summary, reorder arrows, remove -->
  <div class="array-item__controls">
    <span
      class="array-item__drag-handle"
      aria-hidden="true"
      title="Drag to reorder">⠿</span
    >

    {#if isObject}
      <!-- Collapse/expand toggle — only shown for object items -->
      <button
        class="array-item__btn"
        type="button"
        aria-label={collapsed ? 'Expand item' : 'Collapse item'}
        onclick={() => ontogglecollapse(index)}
      >
        {collapsed ? '▶' : '▼'}
      </button>
      <span class="array-item__summary">{summary}</span>
    {/if}

    <span class="array-item__spacer"></span>

    <!-- Move up -->
    <button
      class="array-item__btn"
      type="button"
      aria-label="Move item up"
      disabled={isFirst}
      onclick={() => onmoveup(index)}>▲</button
    >

    <!-- Move down -->
    <button
      class="array-item__btn"
      type="button"
      aria-label="Move item down"
      disabled={isLast}
      onclick={() => onmovedown(index)}>▼</button
    >

    <!-- Remove -->
    <button
      class="array-item__btn array-item__btn--remove"
      type="button"
      aria-label="Remove item"
      disabled={!canRemove}
      onclick={() => onremove(index)}>✕</button
    >
  </div>

  <!-- Item content — hidden when collapsed for object items -->
  {#if !isObject || !collapsed}
    <div class="array-item__content">
      <SchemaField
        name={`${name}[${index}]`}
        schema={itemSchema}
        value={item}
        onchange={(v) => onupdate(index, v)}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  .array-item {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    background: var(--near-black, #1e1e22);
    transition:
      opacity 0.15s,
      border-color 0.15s;
  }

  // Dragging: fade out the item being dragged
  .array-item--dragging {
    opacity: 0.5;
  }

  // Drop target: highlight border with accent colour
  .array-item--drop-target {
    border-color: var(--plum);
  }

  .array-item__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  // Drag handle — not interactive itself; drag is on the parent div
  .array-item__drag-handle {
    color: var(--grey);
    cursor: grab;
    font-size: 1rem;
    line-height: 1;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .array-item__summary {
    font-size: 0.875rem;
    color: var(--grey);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  // Pushes action buttons to the right
  .array-item__spacer {
    flex: 1;
  }

  .array-item__btn {
    background: none;
    border: none;
    color: var(--grey);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem;
    line-height: 1;

    &:hover:not(:disabled) {
      color: var(--white);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  // Remove button gets a red hover to signal destructive action
  .array-item__btn--remove {
    &:hover:not(:disabled) {
      color: var(--light-red);
    }
  }

  .array-item__content {
    padding: 0.75rem;
  }
</style>
