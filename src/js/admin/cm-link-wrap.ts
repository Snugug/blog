import { ViewPlugin, Decoration, type DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder, type EditorState } from '@codemirror/state';

/** Mark decoration that adds the cm-link-wrap class to link nodes */
const linkMark = Decoration.mark({ class: 'cm-link-wrap' });

/**
 * Builds a DecorationSet marking all Link nodes in the syntax tree with the cm-link-wrap class.
 * @param {EditorState} state - The current editor state
 * @return {DecorationSet} The decoration set with all link ranges marked
 */
function buildDecorations(state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name === 'Link') {
        builder.add(node.from, node.to, linkMark);
      }
    },
  });
  return builder.finish();
}

/**
 * ViewPlugin that adds a word-break: break-all wrapper around markdown links.
 * This prevents the Unicode Line Break Algorithm from breaking between ] and (
 * in [text](url) syntax, which causes URLs to jump to the next line.
 */
export const linkWrapPlugin = ViewPlugin.define(
  (view) => ({
    decorations: buildDecorations(view.state),
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.state);
      }
    },
  }),
  { decorations: (v) => v.decorations },
);
