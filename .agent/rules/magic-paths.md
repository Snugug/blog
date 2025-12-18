---
trigger: always_on
---

When importing files, prefer the path prefixes as defined in `compilerOptions.paths` in `tsconfig.json` to relative file paths. For instance, to import `src/components/Icon.svelte` from `src/components/BuildAMonster.svelte`, prefer `import Icon from '$components/Icon.svelte';` to `import Icon from './Icon.svelte';`
