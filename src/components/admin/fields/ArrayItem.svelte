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
    /** Native dragstart handler */
    ondragstart: (e: DragEvent) => void;
    /** Native dragover handler */
    ondragover: (e: DragEvent) => void;
    /** Native dragleave handler */
    ondragleave: (e: DragEvent) => void;
    /** Native drop handler */
    ondrop: (e: DragEvent) => void;
    /** Native dragend handler */
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

  /** Schema title for the item type, if present (e.g., "Step") */
  const itemTitle = $derived(itemSchema['title'] as string | undefined);

  /**
   * Header label for object items.
   * Uses "{title} {N}" if schema has a title (e.g., "Step 1"),
   * otherwise derives from first string value or falls back to "Item N".
   */
  const headerLabel = $derived.by(() => {
    if (!isObject) return '';
    if (itemTitle) return `${itemTitle} ${index + 1}`;
    if (typeof item !== 'object' || item === null) return `Item ${index + 1}`;
    const obj = item as Record<string, unknown>;
    const firstString = Object.values(obj).find(
      (v) => typeof v === 'string' && v !== '',
    );
    return typeof firstString === 'string' ? firstString : `Item ${index + 1}`;
  });
</script>

<!--
  Object items use <fieldset> for semantic grouping with a <legend> in
  the controls bar. Primitive items use a plain <div> — their parent
  ArrayField is the <fieldset>.
-->
{#if isObject}
  <fieldset
    class="array-item"
    class:array-item--dragging={dragging}
    class:array-item--drop-target={dropTarget}
    draggable="true"
    {ondragstart}
    {ondragover}
    {ondragleave}
    {ondrop}
    {ondragend}
  >
    <!-- Controls bar with legend for the fieldset label -->
    <div class="array-item__controls">
      <span
        class="array-item__drag-handle"
        aria-hidden="true"
        title="Drag to reorder">⠿</span
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label={collapsed ? 'Expand item' : 'Collapse item'}
        onclick={() => ontogglecollapse(index)}
      >
        {collapsed ? '▶' : '▼'}
      </button>
      <legend class="array-item__legend">{headerLabel}</legend>
      <span class="array-item__spacer"></span>
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item up"
        disabled={isFirst}
        onclick={() => onmoveup(index)}>▲</button
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item down"
        disabled={isLast}
        onclick={() => onmovedown(index)}>▼</button
      >
      <button
        class="array-item__btn array-item__btn--remove"
        type="button"
        aria-label="Remove item"
        disabled={!canRemove}
        onclick={() => onremove(index)}>✕</button
      >
    </div>

    {#if !collapsed}
      <div class="array-item__content">
        <!-- inline=true skips the ObjectField fieldset wrapper -->
        <SchemaField
          name={`${name}[${index}]`}
          schema={itemSchema}
          value={item}
          onchange={(v) => onupdate(index, v)}
          inline={true}
        />
      </div>
    {/if}
  </fieldset>
{:else}
  <!-- Primitive item: input sits inline between drag handle and buttons -->
  <div
    class="array-item array-item--primitive"
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
    <div class="array-item__controls">
      <span
        class="array-item__drag-handle"
        aria-hidden="true"
        title="Drag to reorder">⠿</span
      >
      <!-- Inline input with aria-label only, no visible label -->
      <div class="array-item__inline-field">
        <SchemaField
          name={`${name}[${index}]`}
          schema={itemSchema}
          value={item}
          onchange={(v) => onupdate(index, v)}
          inline={true}
        />
      </div>
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item up"
        disabled={isFirst}
        onclick={() => onmoveup(index)}>▲</button
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item down"
        disabled={isLast}
        onclick={() => onmovedown(index)}>▼</button
      >
      <button
        class="array-item__btn array-item__btn--remove"
        type="button"
        aria-label="Remove item"
        disabled={!canRemove}
        onclick={() => onremove(index)}>✕</button
      >
    </div>
  </div>
{/if}

<style lang="scss">
  .array-item {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    background: var(--near-black, #1e1e22);
    transition:
      opacity 0.15s,
      border-color 0.15s;
    // Reset fieldset defaults
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  .array-item--dragging {
    opacity: 0.5;
  }

  .array-item--drop-target {
    border-color: var(--plum);
  }

  .array-item__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

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

  // Legend rendered inline in the controls flex row
  .array-item__legend {
    font-size: 0.875rem;
    color: var(--grey);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    // Reset legend defaults so it participates in flex layout
    padding: 0;
    float: unset;
    width: auto;
  }

  .array-item__spacer {
    flex: 1;
  }

  // Primitive items: input fills space between drag handle and buttons
  .array-item__inline-field {
    flex: 1;
    min-width: 0;

    // Hide the label and description from leaf fields — only aria-label
    // is needed since the parent ArrayField provides the visible label
    :global(.field-label),
    :global(.field-help) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
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

  .array-item__btn--remove {
    &:hover:not(:disabled) {
      color: var(--light-red);
    }
  }

  .array-item__content {
    padding: 0.75rem;
  }
</style>
