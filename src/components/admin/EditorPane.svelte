<script lang="ts">
  import { EditorView, keymap } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
  import { languages } from '@codemirror/language-data';
  import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
  import { tags as t } from '@lezer/highlight';
  import { getEditorFile, updateBody, saveFile } from '$js/admin/editor.svelte';
  import { linkWrapPlugin } from '$js/admin/cm-link-wrap';

  // Container element for CodeMirror
  let container: HTMLDivElement;
  // The CodeMirror EditorView instance
  let view: EditorView | undefined;

  // Highlight style for the markdown editor — headings are sized, syntax markers are dimmed.
  const markdownHighlight = HighlightStyle.define([
    // Headings — larger, bold
    {
      tag: t.heading1,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'var(--white)',
    },
    {
      tag: t.heading2,
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'var(--white)',
    },
    {
      tag: t.heading3,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: 'var(--white)',
    },
    // Emphasis
    { tag: t.strong, fontWeight: 'bold', color: 'var(--white)' },
    { tag: t.emphasis, fontStyle: 'italic', color: 'var(--white)' },
    // Inline code
    { tag: t.monospace, color: 'var(--light-orange)' },
    // Links
    { tag: t.link, color: 'var(--light-teal)', textDecoration: 'underline' },
    { tag: t.url, color: 'var(--light-green)' },
    // Syntax markers — dimmed
    { tag: t.processingInstruction, color: 'var(--grey)' },
    { tag: t.labelName, color: 'var(--light-teal)' },
    // Code block language tag
    { tag: t.tagName, color: 'var(--light-purple)' },
    // Lists
    { tag: t.list, color: 'var(--light-teal)' },
    // Blockquotes
    { tag: t.quote, color: 'var(--grey)', fontStyle: 'italic' },
    // Code block contents — language-specific highlighting
    { tag: t.keyword, color: 'var(--light-plum)' },
    { tag: t.string, color: 'var(--light-orange)' },
    { tag: t.variableName, color: 'var(--light-teal)' },
    { tag: t.function(t.variableName), color: 'var(--gold)' },
    { tag: t.typeName, color: 'var(--light-green)' },
    { tag: t.number, color: 'var(--light-purple)' },
    { tag: t.bool, color: 'var(--light-purple)' },
    { tag: t.comment, color: 'var(--grey)', fontStyle: 'italic' },
    { tag: t.operator, color: 'var(--light-red)' },
    { tag: t.punctuation, color: 'var(--grey)' },
    { tag: t.meta, color: 'var(--grey)' },
  ]);

  // Keymap for saving with Cmd+S / Ctrl+S
  const saveKeymap = keymap.of([
    {
      key: 'Mod-s',
      run() {
        saveFile();
        return true;
      },
    },
  ]);

  // Base editor theme matching the admin color scheme
  const editorTheme = EditorView.theme({
    '&': {
      fontSize: '1rem',
    },
    '.cm-content': {
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
      caretColor: 'hsl(15, 80%, 51%)',
      padding: '1rem',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-line': {
      padding: '0 0.25rem',
    },
    // Hardcoded because CodeMirror's cursor style has high specificity
    // and CSS custom properties from :root don't reliably override it
    '.cm-cursor': {
      borderLeftColor: 'hsl(15, 80%, 51%)',
    },
    '.cm-selectionBackground': {
      background: 'var(--plum) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      background: 'var(--plum) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'hsla(225, 6%, 13%, 0.5)',
    },
    '.cm-gutters': {
      display: 'none',
    },
  });

  /**
   * Creates the full set of CodeMirror extensions for the markdown editor.
   * @param {string} doc - Initial document content used to configure the update listener
   * @return {Extension[]} The array of CodeMirror extensions to apply
   */
  function createExtensions(doc: string) {
    return [
      editorTheme,
      history(),
      saveKeymap,
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      syntaxHighlighting(markdownHighlight),
      EditorView.lineWrapping,
      linkWrapPlugin,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updateBody(update.state.doc.toString());
        }
      }),
      EditorView.contentAttributes.of({ 'aria-label': 'Markdown editor' }),
    ];
  }

  // Track the last loaded filename to detect file changes
  let lastFilename = '';

  $effect(() => {
    const file = getEditorFile();

    if (!file) {
      // No file open — destroy editor if it exists
      if (view) {
        view.destroy();
        view = undefined;
        lastFilename = '';
      }
      return;
    }

    // Wait for body to load before creating/updating CodeMirror
    if (!file.bodyLoaded) return;

    if (!view && container) {
      // First mount — create the editor
      lastFilename = file.filename;
      view = new EditorView({
        state: EditorState.create({
          doc: file.body,
          extensions: createExtensions(file.body),
        }),
        parent: container,
      });
    } else if (view && file.filename !== lastFilename) {
      // Different file selected — replace document
      lastFilename = file.filename;
      view.setState(
        EditorState.create({
          doc: file.body,
          extensions: createExtensions(file.body),
        }),
      );
    }
  });

  // Cleanup on component destroy
  $effect(() => {
    return () => {
      view?.destroy();
      view = undefined;
    };
  });
</script>

<div class="editor-wrapper">
  <div class="editor-box">
    <div class="editor-pane" bind:this={container}></div>
  </div>
</div>

<style lang="scss">
  .editor-wrapper {
    padding: 1.5rem;
    max-width: 80ch;
    margin: 0 auto;
  }

  .editor-box {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    overflow: hidden;
    // Subtract the toolbar, tabs, and wrapper padding from viewport height.
    height: calc(100dvh - 9rem);
  }

  .editor-pane {
    height: 100%;
    overflow: auto;
  }

  // Forces .cm-content to shrink below its longest word so overflow-wrap can break long URLs
  .editor-pane :global(.cm-content) {
    min-width: 0 !important;
  }

  // Wraps long URLs at word boundaries where possible, breaking mid-word only when necessary
  .editor-pane :global(.cm-link-wrap) {
    overflow-wrap: break-word;
    word-break: break-all;
  }

  .editor-pane :global(.cm-link-wrap span:nth-of-type(2)) {
    word-break: break-word;
  }
</style>
