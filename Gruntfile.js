module.exports = function (grunt) {

    var path = require('path');
    var showdown = require('showdown');
    var mdConverter = new showdown.Converter();

    grunt.initConfig({

        nunjuckr : {

            testSimple : {
                options : {
                    data : grunt.file.readJSON('test/simple/data/data.json')
                },
                files : [
                    {
                        src : 'test/simple/src/index.njs',
                        dest : 'test/simple/dest/index.html'
                    }
                ]
            },
            testExtended : {
                options : {
                    data : grunt.file.readJSON('test/extended/data/data.json'),
                    ext : '.html',
                    tags : {
                        blockStart: '<%',
                        blockEnd: '%>',
                        variableStart: '<$',
                        variableEnd: '$>',
                        commentStart: '<#',
                        commentEnd: '#>'
                    },
                    searchPaths : 'test/extended/src',
                    setUp : function (env) {
                        env.addFilter('crop', function (str, count) {
                            return str.slice(0, count || 5);
                        });
                        return env;
                    },
                    preprocessData : function (data, file) {
                        var fileExt = path.extname(file);
                        var filename = path.basename(file, fileExt);
                        var jsonPath = path.join('test/extended/data/', filename + '.json');

                        data = grunt.file.readJSON(jsonPath);

                        return data;
                    }
                },
                files : [
                    {
                        src : 'test/extended/src/**/*.njs',
                        dest : 'test/extended/dest/'
                    }
                ]
            },
            testMarkdown : {
                options : {
                    ext: '.html',
                    searchPaths : 'test/markdown/src',
                    preprocessData : function(data, file) {
                        var text = grunt.file.read(file);
                        data = {
                            content: mdConverter.makeHtml(text)
                        };
                        return data;
                    },
                    preprocessFilePath : function (fileName) {
                        return 'template.njs';
                    }
                },
                files : [
                    {
                        src : 'test/markdown/content/**/*.md',
                        dest : 'test/markdown/dest/'
                    }
                ]
            },

            testDimensions : {
                options : {
                    data : grunt.file.readJSON('test/simple/data/data.json'),
                    contentDimensions: {
                        lang: [ 'de', 'en' ],
                        tz: [ 'UTC', 'GMT' ]
                    }
                },
                files : [
                    {
                        src : 'test/simple/src/index.njs',
                        dest : 'test/simple/dest/'
                    }
                ]
            }
        }

    });

    grunt.loadTasks('tasks');
};
