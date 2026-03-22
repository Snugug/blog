## Commands

**CRITICAL: ALWAYS USE `pnpm`, AND ONLY USE THE EXISTING `package.json` SCRIPTS! Never use `npm`, `npx`, or `pnpx`!** If a Node.js based CLI is not already installed and configured to be run through a `package.json` script, it should not be run.

**ALWAYS RUN `pnpm lint` and `pnpm fix` before committing!** You are FORBIDDEN from finalizing your code until you have no more warnings or errors from either script.

**IMPORTANT!** Before asking to run the dev server, check to see if it already is (it is often running). Only ask to run the dev server if you've already checked and it's not running, or if you specifically need access to the dev server's output.

## Git Worktrees

Worktree directory: `.worktrees/` (project-local). All feature work must be done in an isolated git worktree, never directly on `main`.

## Architecture

### File Size and Component Decomposition

**CRITICAL REQUIREMENT!** FILES MUST NOT BE LARGER THAN 350 LINES OF CODE! IF YOUR CHANGES WOULD VIOLATE THIS, YOU MUST REFACTOR YOUR WORK SO THAT IT DOES NOT. We do this to ensure each individual file is easy to read and maintain (docs, planning files like `.feature` files, tests because they have a lot of boilerplate, and markdown files excluded).

Files usually balloon larger than this because they're trying to do too much at one. Aim for components and library files to do a SINGLE THING. Compose multiple smaller components together into larger ones **instead of** trying to put everything into a single file.

### Semantic HTML

**CRITICAL REQUIREMENTS!** YOU ARE STRICTLY FORBIDDEN FROM ATTACHING CLICK HANDLERS TO ANYTHING THAT IS NOT A `button` OR `a` ELEMENT! YOU MUST USE THOSE ELEMENTS CORRECTLY, `a` IS FOR LINKING TO RESOURCES (URLs, files with paths, etc…), `button` IS FOR IN-PAGE INTERACTION. FAILURE TO ADHERE TO THIS IS CONSIDERED A CRITICAL FAILURE!

### State Management

**CRITICAL:** Prop drilling architecture patterns for state are STRICTLY FORBIDDEN! They add too much boilerplate and complexity. Use small, reactive state instead.

**CRITICAL:** Function and callback drilling architecture patterns are STRICTLY FORBIDDEN! Functions and callbacks must ONLY be passed into components if their functionality changes per-instance (like a button). It MUST NOT be used for coordination or managing state! You MUST use reactive state instead.

### CSS Rules

Font sizes MUST follow this scale:

- **Default** text: `1rem`
- **Smallest non-caption** text: `0.875rem` (for compact UI elements, labels, buttons)
- **Smallest allowed** text: `0.75rem` — ONLY for captions, secondary information (timestamps, placeholders, empty states). Using `0.75rem` for primary or interactive content requires explicit permission.

Non-standard sizes like `0.8rem`, `0.85rem`, `0.9rem`, `0.95rem` are NOT allowed. Round to the nearest size on this scale. Font sizes can increment above `1rem` in steps of `.25rem`

All other CSS sizing MUST be in `rem` units, and MUST be written in `.25rem` increments, pixels are FORBIDDEN. The ONLY exception to this is for border radius, border width, text shadow, or drop shadow <= `5px`. Other relative units, where applicable, are OK (like `vh`, `vw`, `cqi`, `cqb`, `fr`).

Prefer CSS Grid to Flexbox unless you need the specific characteristics of flexbox.

### `:global` Usage Policy

`:global` escapes Svelte's scoped CSS. Most uses indicate styles that should be in a global SCSS partial instead. Only use `:global` when scoped CSS physically cannot reach the target element.

- **Top-layer rendering** — Elements using the Popover API or `<dialog>` render in the browser's top layer, outside the component DOM where scoped CSS cannot reach
- **Scoped parent + global child** — Combining a scoped parent selector with a `:global` child when the child is library-generated (e.g. `.lexical-editor--readonly :global([contenteditable='false'])`)

**Not allowed:**

- **Convenience** — If a style could be a global partial or scoped class, don't use `:global`
- **Shared/reusable styles** — Move to `src/sass/partials/` (e.g. `_input.scss`, `_utilities.scss`)
- **Utility classes** — Add to `src/sass/partials/_utilities.scss`
- **Portal-rendered content** — Refactor to Svelte-rendered markup with scoped styles instead of imperative DOM + `:global`

### Code Comments

You are REQUIRED to professionally comment your code. Comments should be short and helpful, explaining what something does, but MUST NOT include your dialog or thinking. For JavaScript and TypeScript, the MUST be written in JSDoc format, and you MUST have comments for all of your functions and classes, including inputs and outputs and a brief description of what they do, all with proper TypeScript typing. For SCSS/Sass, use inline comments `//` instead of CSS comments `/*`. Comments MUST NOT have arbitrary line breaks to conform to an invisible max character count, just write normally and have line wrapping handle comment wrapping.

It is CRITICAL that you write comments explaining specific items that we've gone back and forth on a number of times to ensure that the reason why it exists the way it does (which likely went against your normal thinking) so that future developers and agents can learn from it and improve.

### Component Reuse (CRITICAL)

Before creating ANY new UI component, pattern, or styling, you MUST search the existing codebase for similar functionality. If a component, pattern, or style already exists, you MUST reuse or extend it — even if it requires refactoring to accept props for configurability. Creating duplicates of existing functionality is FORBIDDEN. Specifically:

- **Search `src/components/`** for existing components that do what you need. If one exists but is hardcoded to one page's state, refactor it to accept optional props (controlled mode) while preserving the original behavior (uncontrolled mode).
- **Search `src/sass/`** for existing styles, mixins, and variables before writing new CSS.
- **Match existing layout patterns** — reuse the same components and follow the same structure, not recreate it from scratch.

### DOM Manipulation Rules

Svelte's declarative rendering MUST be used for all UI construction. Direct DOM manipulation (`document.createElement`, `appendChild`, `innerHTML`, `querySelector`, etc.) is FORBIDDEN except in these cases:

- **Focus and scroll** — `.focus()` and `.scrollIntoView()` are imperative by nature, but the element reference MUST come from `bind:this` (in components) or reactive state signals (in state files). Using `document.getElementById`/`querySelector` to obtain element references is FORBIDDEN.
- **Popover API** — `.showPopover()` / `.hidePopover()` require imperative calls, but the element MUST be obtained via `bind:this`, never DOM queries.
- **Cross-component coordination** — State files MUST NOT query the DOM. Use reactive signals (counter increment pattern) so components react via `$effect` and control their own elements.
- **Positioning** — Use CSS Anchor Positioning (`anchor-name`, `position-anchor`, `position-area`) instead of computing pixel positions with `getBoundingClientRect()` and `style.top`/`style.left`.
