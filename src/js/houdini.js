import triangles from '$js/houdini/triangles.js?url';

if (window?.CSS?.registerProperty) {
  const props = [
    'paint-alpha',
    'base-hue',
    'max-saturation',
    'max-lightness',
    'size',
  ];

  for (const prop of props) {
    try {
      window.CSS.registerProperty({
        name: `--${prop}`,
        syntax: '<number>',
        inherits: false,
        initialValue: 0,
      });
    } catch (e) {
      console.error(e);
    }
  }
}

if (!window?.CSS?.paintWorklet) {
  import('css-paint-polyfill').then(setupHoudiniPainting);
} else {
  setupHoudiniPainting();
}

/**
 * Sets up Houdini paint worklets
 */
function setupHoudiniPainting() {
  CSS.paintWorklet.addModule(triangles);
}
