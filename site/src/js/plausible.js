/**
 * Plausible Analytics setup
 */
export function setup() {
  window.plausible =
    window.plausible ||
    function (...args) {
      (window.plausible.q = window.plausible.q || []).push(args);
    };
}
