<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import SchemaField from './SchemaField.svelte';

  interface Props {
    // Parent array field name, used to namespace child field ids
    name: string;
    // Zero-based position of this item in the array
    index: number;
    // The item's current value
    item: unknown;
    // JSON Schema node describing a single array item
    itemSchema: SchemaNode;
    // Whether the item schema is an object type
    isObject: boolean;
    // Whether this item's content is collapsed (only applicable for objects)
    collapsed: boolean;
    // Whether this item is currently being dragged
    dragging: boolean;
    // Whether this item is the current drag-over drop target
    dropTarget: boolean;
    // Whether this is the first item in the list (disables move-up)
    isFirst: boolean;
    // Whether this is the last item in the list (disables move-down)
    isLast: boolean;
    // Whether the remove button is enabled
    canRemove: boolean;
    // Fired when this item's value changes
    onupdate: (index: number, value: unknown) => void;
    // Fired when the remove button is clicked
    onremove: (index: number) => void;
    // Fired when the move-up arrow is clicked
    onmoveup: (index: number) => void;
    // Fired when the move-down arrow is clicked
    onmovedown: (index: number) => void;
    // Fired when the collapse/expand toggle is clicked
    ontogglecollapse: (index: number) => void;
    // Native dragstart handler
    ondragstart: (e: DragEvent) => void;
    // Native dragover handler
    ondragover: (e: DragEvent) => void;
    // Native dragleave handler
    ondragleave: (e: DragEvent) => void;
    // Native drop handler
    ondrop: (e: DragEvent) => void;
    // Native dragend handler
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

  // Schema title for the item type, if present (e.g., "Step")
  const itemTitle = $derived(itemSchema['title'] as string | undefined);

  // Header label: "{title} N" if schema has a title, first string value, or "Item N".
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
        title="Drag to reorder"
        ><span class="material-symbols-outlined">drag_indicator</span></span
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label={collapsed ? 'Expand item' : 'Collapse item'}
        onclick={() => ontogglecollapse(index)}
      >
        <span
          class="material-symbols-outlined array-item__collapse-icon"
          class:array-item__collapse-icon--collapsed={collapsed}
          >chevron_right</span
        >
      </button>
      <legend class="array-item__legend">{headerLabel}</legend>
      <span class="array-item__spacer"></span>
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item up"
        disabled={isFirst}
        onclick={() => onmoveup(index)}
        ><span class="material-symbols-outlined">arrow_upward</span></button
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item down"
        disabled={isLast}
        onclick={() => onmovedown(index)}
        ><span class="material-symbols-outlined">arrow_downward</span></button
      >
      <button
        class="array-item__btn array-item__btn--remove"
        type="button"
        aria-label="Remove item"
        disabled={!canRemove}
        onclick={() => onremove(index)}
        ><span class="material-symbols-outlined">close</span></button
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
        title="Drag to reorder"
        ><span class="material-symbols-outlined">drag_indicator</span></span
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
        onclick={() => onmoveup(index)}
        ><span class="material-symbols-outlined">arrow_upward</span></button
      >
      <button
        class="array-item__btn"
        type="button"
        aria-label="Move item down"
        disabled={isLast}
        onclick={() => onmovedown(index)}
        ><span class="material-symbols-outlined">arrow_downward</span></button
      >
      <button
        class="array-item__btn array-item__btn--remove"
        type="button"
        aria-label="Remove item"
        disabled={!canRemove}
        onclick={() => onremove(index)}
        ><span class="material-symbols-outlined">close</span></button
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
    padding: 0.5rem;
  }

  .array-item__drag-handle {
    color: var(--grey);
    cursor: grab;
    user-select: none;
    display: grid;
    place-items: center;

    &:active {
      cursor: grabbing;
    }
  }

  // Chevron rotates 90deg when expanded (default), points right when collapsed
  .array-item__collapse-icon {
    transition: transform 0.15s;
    transform: rotate(90deg);
    display: block;
  }

  .array-item__collapse-icon--collapsed {
    transform: rotate(0deg);
  }

  // Consistent icon size for all Material Symbols in array items
  .material-symbols-outlined {
    font-size: 1.25rem;
    // Ensure vertical centering in flex row
    display: grid;
    place-items: center;
  }

  // Smaller icons for action buttons (arrows + close)
  .array-item__btn .material-symbols-outlined {
    font-size: 1rem;
  }

  // Legend rendered inline in the controls flex row, after the drag handle and chevron
  .array-item__legend {
    font-size: 0.875rem;
    color: var(--grey);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    margin-left: 0.25rem;
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
    margin: 0 0.5rem;

    // Visually hide label/description — the parent ArrayField provides the visible label
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
    // Minimal padding so action buttons sit tight together
    padding: 0;
    line-height: 1;

    &:hover:not(:disabled) {
      color: var(--white);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  // Small gap before the remove button to visually separate it from arrows
  .array-item__btn--remove {
    margin-left: 0.25rem;

    &:hover:not(:disabled) {
      color: var(--light-red);
    }
  }

  .array-item__content {
    padding: 0.75rem;
  }
</style>
