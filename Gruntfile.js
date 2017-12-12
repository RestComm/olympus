module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['target/dist'],
    copy: {
      main: {
        expand: true,
        cwd: 'src/main/webapp',
        src: '**',
        dest: 'target/dist',
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: '$rootScope.clientVersion = \'1.0.0\';',
              replacement: '$rootScope.clientVersion = \'' + grunt.option('clientVersion') + '\';'
            }
          ],
          usePrefix: false
        },
        files: [{
          expand: true,
          src: ['target/dist/resources/js/controllers/sign-in.js']
        }]
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/main/webapp/resources/**/*.js',
        dest: 'src/main/webapp/build/<%= pkg.name %>.min.js'
      }
    },
    cacheBust: {
        taskName: {
            options: {
                assets: ['resources/js/**/*', 'resources/css/**/*'],
                baseDir: 'target/dist/',
                outputDir: 'resources/assets/',
                clearOutputDir: true,
                deleteOriginals: true,
                queryString: false
            },
            files: [{
              src: ['target/dist/index.html']
            }]
        }
    },
    ngtemplates:  {
      mcWebRTC:        {
        cwd:      'target/dist',
        src:      'modules/**/*.html',
        dest:     'target/dist/resources/js/app.js',
        options:    {
          append: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-replace');
  
  grunt.registerTask('default', ['clean', 'copy', 'replace', 'ngtemplates', 'cacheBust']);

};

