module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [ 'Gruntfile.js', 'app/*.js', 'app/**/*.js' ],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    
    bower: {
      install: {
        options: {
          install: true,
          copy: false,
          targetDir: './libs',
          cleanTargetDir: true
        }
      }
    },
    
    uglify: {
      min: {
        files: {
          'dist/gde-adapter.min.js': [ 'dist/gde-adapter.min.js' ]
        },
        options: {
          mangle: false
        }
      }
    },
    
    concat: {
      options: {
      },
      dist: {
        src: [ 'app/app.js', 'app/directives/*.js', 'app/services/gdeAdapterService.js', 'app/services/gdeConfigProvider.js' ],
        dest: 'dist/gde-adapter.js'
      },
      min: {
          src: [ 'app/app.js', 'app/directives/*.js', 'app/services/gdeAdapterService.js', 'app/services/gdeConfigProvider.js' ],
          dest: 'dist/gde-adapter.min.js'
      }
    },
    
    html2js: {
      dist: {
        src: [ 'app/views/*.html' ],
        dest: 'tmp/templates.js'
      }
    },
    
    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 8888
        }
      }
    },
    
    compress: {
      dist: {
        options: {
          archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
        },
        files: [{
          src: [ 'index.html' ],
          dest: '/'
        }, {
          src: [ 'dist/**' ],
          dest: 'dist/'
        }, {
          src: [ 'assets/**' ],
          dest: 'assets/'
        }, {
          src: [ 'libs/**' ],
          dest: 'libs/'
        }]
      }
    },
    
    karma: {
      options: {
        configFile: 'config/karma.conf.js'
      },
      unit: {
        singleRun: true
      },
      
      continuous: {
        singleRun: false,
        autoWatch: true
      }
    },
    
    clean: {
      release: {
        options: {
          'no-write': false
         },
         src: ['dist']
        }
    },
    
    watch: {
      dev: {
        files: [
            'Gruntfile.js',
            'app/**/*.html',
            'app/**/*.json',
            'app/**/*.less',
            'app/**/*.config',
            'app/**/*.js',
            'app/*.js',
            'app/*.html'
        ],
        tasks: [ 'jshint', 'concat:dist' ],
        options: {
          atBegin: true
        }
      }
    },
    
    min: {
      files: [ 'Gruntfile.js', 'app/*.js', '*.html' ],
      tasks: [ 'clean:release', 'jshint', 'concat:dist', 'uglify:dist' ],
      options: {
        atBegin: true
      }
    }
});

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('dev', [ 'bower', 'connect:server', 'watch:dev' ]);
  grunt.registerTask('test', [ 'bower', 'jshint', 'karma:continuous' ]);
  grunt.registerTask('minified', [ 'bower', 'connect:server', 'watch:min' ]);
  grunt.registerTask('package', [ 'bower', 'clean:release', 'jshint',  'concat:dist', 'concat:min', 'uglify:min' ]);
};