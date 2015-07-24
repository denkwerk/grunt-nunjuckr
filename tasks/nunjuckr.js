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

        var options = this.options();
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
            var relativeFile;
            var relativePath = path.dirname(relativeFile);
            var destExt = sources.ext || options.ext || '.html';
            var data = options.data;

            if (options.preprocessFilePath && typeof options.preprocessFilePath === 'function') {
                relativeFile = options.preprocessFilePath.call(this, file);
            } else {
                relativeFile = path.relative(options.searchPaths || '', file);
            }

            if (options.preprocessData && typeof options.preprocessData === 'function') {
                data = options.preprocessData.call(this, data, file);
            }

            var renderedFile = njEnv.getTemplate(relativeFile).render(data);
            var destFile = (path.extname(sources.dest) !== '') ? sources.dest : path.join(sources.dest, relativePath, filename + destExt);

            grunt.file.write(destFile, renderedFile);

            }, this);

        }, this);

    });
};
