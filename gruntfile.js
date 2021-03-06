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
        	'./assets/styles/rosengren.css': './assets/styles/rosengren.less',
        	'./assets/styles/presentation.css': './assets/styles/presentation.less'
        }
      }
    },
    copy: {
      css : {
        files: {
        	'./_site/assets/styles/rosengren.css': './assets/styles/rosengren.css',
        	'./_site/assets/styles/presentation.css': './assets/styles/presentation.css'
        }
      },
      jsx: {
      	files: [{
			expand: true,
      		src: ['presentations/**/*.js*'],
			dest: '_site/'
      	}]
      }
    },
    shell: {
      jekyll: {
        options: {
          stdout: true
        },
        command: 'jekyll build'
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
      	files: './presentations/**/*.jsx',
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