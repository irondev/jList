module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            default: {
                files: [{
                    src: ['jquery.jlist.min.js'],
                    dest: './demo/js/jquery.jlist.min.js'
                }]
            }
        },

        uglify: {
            options: {
                sourceMap:false,
                mangle: false,
                compress: {},
                beautify: false,
                preserveComments: 'some'
            },
            default: {
                files: [{
                    src: ['jquery.jlist.js'],
                    dest: 'jquery.jlist.min.js'
                }]
            }
        },

        watch: {
            options: {
                livereload: false,
            },
            js: {
                files: ['jquery.jlist.js'],
                tasks: ['uglify', 'copy']
            }
        },

        browserSync: {
            default: {
                bsFiles: {
                    src : [
                        'demo/js/jquery.jlist.min.js',
                        'demo/css/*.css',
                        'demo/**/*.html'
                    ]
                },
                options: {
                    watchTask: true,
                    server: './demo'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('publish', ['uglify', 'copy']);
    grunt.registerTask('serve', ['publish', 'browserSync', 'watch']);
    grunt.registerTask('default', ['serve']);

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

};
