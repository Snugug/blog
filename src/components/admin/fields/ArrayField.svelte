<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { createDefaultValue, resolveFieldType } from '$js/admin/schema-utils';
  import ArrayItem from './ArrayItem.svelte';

  /**
   * Props for the ArrayField component, which renders a JSON Schema array field with add, remove, reorder, and drag-and-drop controls.
   */
  interface Props {
    // Property name for the label
    name: string;
    // JSON Schema node describing this array field
    schema: SchemaNode;
    // Current array value
    value: unknown;
    // Whether this field is required
    required?: boolean;
    // Callback fired when the array value changes
    onchange: (value: unknown) => void;
  }

  let { name, schema, value, required = false, onchange }: Props = $props();

  //////////////////////////////
  // Derived schema metadata
  //////////////////////////////

  // Schema for each item in the array
  const itemSchema = $derived(
    (schema['items'] as SchemaNode | undefined) ?? {},
  );

  // Whether items are objects — enables collapse UI in ArrayItem
  const isObjectItems = $derived(
    resolveFieldType(itemSchema).kind === 'object',
  );

  // Minimum number of items allowed (from schema)
  const minItems = $derived(schema['minItems'] as number | undefined);

  // Maximum number of items allowed (from schema)
  const maxItems = $derived(schema['maxItems'] as number | undefined);

  /**
   * Converts a name string to Title Case, splitting on camelCase, hyphens, and underscores.
   * @param {string} str - The raw property name to convert
   * @return {string} The title-cased display string
   */
  function toTitleCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Display label — schema.title if present, otherwise title-cased name
  const label = $derived(
    (schema['title'] as string | undefined) ?? toTitleCase(name),
  );

  // Current items array, falling back to empty array if value is not an array
  const items = $derived(Array.isArray(value) ? (value as unknown[]) : []);

  //////////////////////////////
  // Collapse state
  //////////////////////////////

  // Collapsed state per item slot; grows/shrinks reactively with the items array.
  let collapsed = $state<boolean[]>([]);

  // Keep collapsed array length in sync with items without wiping existing state
  $effect(() => {
    const len = items.length;
    if (collapsed.length < len) {
      // Append false entries for any new items
      collapsed = [...collapsed, ...Array(len - collapsed.length).fill(false)];
    } else if (collapsed.length > len) {
      collapsed = collapsed.slice(0, len);
    }
  });

  //////////////////////////////
  // Drag-and-drop state
  //////////////////////////////

  // Index of the item currently being dragged, or -1 when idle
  let dragIndex = $state(-1);

  // Index of the item currently hovered over as a drop target, or -1 when none
  let dropTarget = $state(-1);

  //////////////////////////////
  // Array mutation helpers
  //////////////////////////////

  /**
   * Appends a new default item to the array, using the item schema to create a default value.
   * Guards against maxItems even when the button is disabled.
   * @return {void}
   */
  function addItem(): void {
    if (maxItems != null && items.length >= maxItems) return;
    const newItem = createDefaultValue(itemSchema);
    onchange([...items, newItem]);
  }

  /**
   * Removes the item at the given index. Guards against minItems even when the button is disabled.
   * @param {number} index - Zero-based index of the item to remove
   * @return {void}
   */
  function removeItem(index: number): void {
    if (minItems != null && items.length <= minItems) return;
    const next = items.filter((_, i) => i !== index);
    onchange(next);
  }

  /**
   * Moves an item from one index to another, keeping collapsed state in sync with the reorder.
   * @param {number} from - Zero-based source index of the item to move
   * @param {number} to - Zero-based destination index to move the item to
   * @return {void}
   */
  function moveItem(from: number, to: number): void {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    // Keep collapsed state in sync with the reorder
    const nextCollapsed = [...collapsed];
    const [movedCollapsed] = nextCollapsed.splice(from, 1);
    nextCollapsed.splice(to, 0, movedCollapsed);
    collapsed = nextCollapsed;
    onchange(next);
  }

  /**
   * Replaces the item at the given index with a new value and dispatches the updated array.
   * @param {number} index - Zero-based index of the item to update
   * @param {unknown} newValue - The replacement value for the item
   * @return {void}
   */
  function updateItem(index: number, newValue: unknown): void {
    const next = items.map((item, i) => (i === index ? newValue : item));
    onchange(next);
  }

  /**
   * Toggles the collapsed state for the item at the given index.
   * @param {number} index - Zero-based index of the item whose collapse state to toggle
   * @return {void}
   */
  function toggleCollapse(index: number): void {
    collapsed = collapsed.map((c, i) => (i === index ? !c : c));
  }

  //////////////////////////////
  // Drag-and-drop handlers
  //////////////////////////////

  /**
   * Marks an item as the drag source and sets the drag effect.
   * @param {DragEvent} e - The native dragstart event
   * @param {number} index - Zero-based index of the item being dragged
   * @return {void}
   */
  function handleDragStart(e: DragEvent, index: number): void {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Updates the drop target index while dragging over an item.
   * @param {DragEvent} e - The native dragover event (preventDefault allows drop)
   * @param {number} index - Zero-based index of the item currently being dragged over
   * @return {void}
   */
  function handleDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    dropTarget = index;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Clears the drop target highlight when the drag leaves an item.
   * @param {number} index - Zero-based index of the item being left
   * @return {void}
   */
  function handleDragLeave(index: number): void {
    if (dropTarget === index) dropTarget = -1;
  }

  /**
   * Completes the drag-and-drop reorder when an item is dropped onto a target slot.
   * @param {number} index - Zero-based index of the slot where the dragged item was dropped
   * @return {void}
   */
  function handleDrop(index: number): void {
    if (dragIndex !== -1 && dragIndex !== index) {
      moveItem(dragIndex, index);
    }
    dragIndex = -1;
    dropTarget = -1;
  }

  /**
   * Resets drag state after a drag operation ends, including cancelled drags.
   * @return {void}
   */
  function handleDragEnd(): void {
    dragIndex = -1;
    dropTarget = -1;
  }

  //////////////////////////////
  // Derived constraint checks
  //////////////////////////////

  // Whether the add button should be disabled
  const atMax = $derived(maxItems != null && items.length >= maxItems);

  // Whether removal is permitted (need more than minItems)
  const canRemove = $derived(minItems == null || items.length > minItems);
</script>

{#snippet arrayContent()}
  {#if items.length === 0}
    <p class="array-field__empty">No items</p>
  {:else}
    <div class="array-field__list" role="list">
      {#each items as item, i (i)}
        <ArrayItem
          {name}
          index={i}
          {item}
          {itemSchema}
          isObject={isObjectItems}
          collapsed={collapsed[i] ?? false}
          dragging={dragIndex === i}
          dropTarget={dropTarget === i}
          isFirst={i === 0}
          isLast={i === items.length - 1}
          {canRemove}
          onupdate={updateItem}
          onremove={removeItem}
          onmoveup={(idx) => moveItem(idx, idx - 1)}
          onmovedown={(idx) => moveItem(idx, idx + 1)}
          ontogglecollapse={toggleCollapse}
          ondragstart={(e) => handleDragStart(e, i)}
          ondragover={(e) => handleDragOver(e, i)}
          ondragleave={() => handleDragLeave(i)}
          ondrop={() => handleDrop(i)}
          ondragend={handleDragEnd}
        />
      {/each}
    </div>
  {/if}

  <button
    class="array-field__add"
    type="button"
    disabled={atMax}
    onclick={addItem}
  >
    + Add item
  </button>
{/snippet}

<fieldset class="array-field">
  <legend class="array-field__label">
    {label}{#if required}<span class="array-field__required" aria-hidden="true"
        >*</span
      >{/if}
  </legend>
  {@render arrayContent()}
</fieldset>

<style lang="scss">
  .array-field {
    display: grid;
    gap: 0.5rem;
    // Reset fieldset defaults when used for primitive arrays
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  .array-field__label {
    font-size: 0.875rem;
    color: var(--white);
    padding: 0;
    margin-bottom: 0.25rem;
  }

  .array-field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .array-field__empty {
    font-size: 0.75rem;
    color: var(--grey);
    margin: 0;
  }

  .array-field__list {
    display: grid;
    gap: 0.5rem;
  }

  .array-field__add {
    border: 1px dashed var(--dark-grey);
    border-radius: 4px;
    background: none;
    color: var(--grey);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.5rem;
    text-align: center;
    width: 100%;

    &:hover:not(:disabled) {
      border-color: var(--white);
      color: var(--white);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }
</style>
