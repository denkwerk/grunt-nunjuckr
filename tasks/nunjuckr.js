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

		var loader = options.loader;

		if (typeof loader === 'undefined') {
			loader = [];
		} else if (!Array.isArray(loader)) {
			loader = [loader];
		}

		loader.push(new nunjucks.FileSystemLoader(options.searchPaths));

        var njEnv = new nunjucks.Environment( loader, {
            autoescape : options.autoescape,
            watch : false,
            tags : options.tags
        });

        if (options.setUp && typeof options.setUp === 'function') {
            njEnv = options.setUp.call(this, njEnv);
        }

        if (typeof options.globals === 'object') {
            for (var globalName in options.globals) {
                var globalVal = options.globals[globalName];
                njEnv.addGlobal(globalName, globalVal);
            }
        } else if (typeof options.globals === 'array') {
            options.globals.forEach(function(globalObj) {
                if (typeof globalObj === 'object') {
                    njEnv.addGlobal(globalObj.name, globalObj.value);
                }
            });
        }

        var renderFiles = ( function( contentDimensions ) {
            var fileIterator = function(callback) {
                this.files.forEach(function( sources ) {
                    sources.src.forEach(function(file) {

                        var ext = sources.ext || options.ext || '.html';
                        var data = options.data;

                        var dest = sources.dest;

                        callback( file, dest, ext, data );

                    }, this);
                }, this);
            }.bind(this);

            var callback = function( file, dest, destExt, data ) {

                var fileExt = path.extname(file);
                var filename = path.basename(file, fileExt);
                var relativeFile;

                if (options.preprocessFilePath && typeof options.preprocessFilePath === 'function') {
                    relativeFile = options.preprocessFilePath.call(this, file, contentDimensions);
                } else {
                    relativeFile = path.relative(options.searchPaths || '', file);
                }

                var relativePath = path.dirname(relativeFile);

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

                    destFile = path.join( dest, dimensionsPath, relativePath, filename + destExt );

                } else {
                    destFile = (path.extname(dest) !== '') ? dest : path.join(dest, relativePath, filename + destExt);
                }

                grunt.file.write(destFile, renderedFile);

            }.bind(this);

            if (typeof options.iterator === 'function') {
                options.iterator.call(this, callback, options);
            } else {
                fileIterator(callback);
            }
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
