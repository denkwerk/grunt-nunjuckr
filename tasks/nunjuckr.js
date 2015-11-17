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

        var renderFiles = ( function( contentDimensions ) {
            this.files.forEach(function ( sources ) {

                sources.src.forEach(function ( file ) {

                var fileExt = path.extname(file);
                var filename = path.basename(file, fileExt);
                var relativeFile;
                var relativePath = path.dirname(relativeFile);
                var destExt = sources.ext || options.ext || '.html';
                var data = options.data;

                if (options.preprocessFilePath && typeof options.preprocessFilePath === 'function') {
                    relativeFile = options.preprocessFilePath.call(this, file, contentDimensions);
                } else {
                    relativeFile = path.relative(options.searchPaths || '', file);
                }

                if (options.preprocessData && typeof options.preprocessData === 'function') {
                    data = options.preprocessData.call(this, data, file, contentDimensions);
                }

                var renderedFile = njEnv.getTemplate(relativeFile).render(data);
                var destFile;
                if ( typeof contentDimensions === 'object' ) {
                    var keys = Object.keys(options.contentDimensions);
                    var pathSegments = [];

                    keys.forEach( function( key ) {
                        pathSegments.push( contentDimensions[ key ] );
                    } );

                    var dimensionsPath = pathSegments.join( path.sep );

                    destFile = path.join( sources.dest, dimensionsPath, relativePath, filename + destExt );

                } else {
                    destFile = (path.extname(sources.dest) !== '') ? sources.dest : path.join(sources.dest, relativePath, filename + destExt);
                }

                grunt.file.write(destFile, renderedFile);

                }, this);

            }, this);
        } ).bind( this );

        if ( !options.contentDimensions ) {
            renderFiles();
        } else {
            var allContentDimensions = Object.keys(options.contentDimensions);
            var keys = Object.keys(options.contentDimensions);

            var contentDimension = allContentDimensions.shift();

            var getCombinations = function( dimension ) {

                if ( allContentDimensions.length === 0 ) {
                    return options.contentDimensions[dimension].map( function ( item ) {
                        return [item];
                    } );
                } else {
                    var contentDimension = allContentDimensions.shift();

                    var combinations = getCombinations( contentDimension );

                    var output = [];

                    combinations.forEach( function ( combination ) {
                        options.contentDimensions[dimension].forEach( function ( content ) {
                            output.push( [ content ].concat( combination ) );
                        });
                    } );

                    return output;
                }

            };

            var combinations = getCombinations( contentDimension ).map(function ( combination ) {
                var output = {};

                combination.forEach( function( value, index ) {
                    output[ keys[ index ] ] = value;
                } );

                return output;

            } );

            combinations.forEach( function( dimensions ) {
                renderFiles( dimensions );
            } );

        }

    });
};
