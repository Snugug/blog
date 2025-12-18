---
trigger: always_on
---

When sizing things in CSS, only use `px` if a specific pixel size was requested, or if you're sizing a border width. Otherwise, instead of `px`, use `rem`. When using `rem`, only use increments of `.25rem`. Other units (including, but not limited to `vh`, `vw`, `cqi`, `cqb`, and `fr`) are allowed.
