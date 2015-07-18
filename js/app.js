(function (Prism) {
  'use strict';

  if (window.domCL) {
    Prism.highlightAll();
  }
  else {
    window.addEventListener('DOMContentLoaded', function () {
      Prism.highlightAll();
    });
  }
}(window.Prism));
