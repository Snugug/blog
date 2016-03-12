'use strict';

var settings = {
  'options': {
    'copy': [
      'CNAME'
    ]
  },
  'tasks': {
    'dist': {
      'build': [
        'build',
        'clean:dist'
      ],
      'copy': [
        'copy:dist',
        'copy:fonts',
        'imagemin:dist',
        'usemin'
      ],
      'optimize': [
        'critical'
      ]
    }
  }
};


module.exports = settings;
