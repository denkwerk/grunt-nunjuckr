/**
 * grunt-nunjuckr
 *
 * Copyright (c) 2015 denkwerk GmbH
 */

var nunjucks = require('nunjucks');
var path = require('path');

module.exports = function(grunt) {
    'use strict';

    grunt.registerMultiTask('nunjuckr', function () {

        var options = this.data.options
        var njEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader(options.searchPaths), {
            autoescape : options.autoescape,
            watch : false,
            tags : options.tags
        });

        if (options.setUp && typeof options.setUp === 'function') {
            njEnv = options.setUp.call(this, njEnv);
        }

        this.files.forEach(function ( sources ) {

            sources.src.forEach(function ( file ) {

            var fileExt = path.extname(file);
            var filename = path.basename(file, fileExt);
            var relativeFile = path.relative(options.searchPaths || '', file);
            var relativePath = path.dirname(relativeFile);
            var destExt = sources.ext || options.ext || '.html';
            var data = options.data;

            if (options.preprocessData && typeof options.preprocessData === 'function') {
                data = options.preprocessData(data, relativeFile);
            }

            var renderedFile = njEnv.getTemplate(relativeFile).render(data);
            var destFile = (path.extname(sources.dest) !== '') ? sources.dest : path.join(sources.dest, relativePath, filename + destExt);

            grunt.file.write(destFile, renderedFile);

            }, this);

        }, this);

    });
};
