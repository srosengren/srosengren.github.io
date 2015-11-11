module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.initConfig({
    less: {
      development: {
        options: {
          paths: ["./assets/styles/less"],
          yuicompress: true,
          compress: true
        },
        files: {
          './assets/styles/rosengren.css': './assets/styles/rosengren.less'
        }
      }
    },
    copy: {
      css : {
        files: {
          './_site/assets/styles/rosengren.css': './assets/styles/rosengren.css'
        }
      },
      jsx: {
      	files: [{
			expand: true,
      		src: ['presentations/**/*.jsx'],
			dest: '_site/'
      	}]
      }
    },
    shell: {
      jekyll: {
        options: {
          stdout: true
        },
        command: 'jekyll build --incremental'
      }
    },
    watch: {
      less: {
        files: './assets/styles/*.less',
        tasks: ['less:development', 'copy:css'],
        options: {
          livereload: true,
          spawn: false
        }
      },
      jsx: {
      	files: './**/*.jsx',
		tasks: ['copy:jsx']
      },
      jekyll: {
        files: [
          '*.html', '*.yml', 'assets/js/**.js',
          '_posts/**', '_includes/**', '_layouts/**',
          'presentations/**/*.markdown'
        ],
        tasks: 'shell:jekyll',
        options: {
          livereload: true
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'watch');
};