module.exports = function (grunt) {

  var path = require('path');

  grunt.initConfig({

    nunjuckr : {

      testSimple : {
        options : {
          data : grunt.file.readJSON('test/simple/data/data.json'),
          setUp : function (env) {
            env.addFilter('crop', function (str, count) {
              return str.slice(0, count || 5);
            });
            return env;
          }
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
            var dir = path.dirname(file);
            var jsonPath = path.join('test/extended/data/', dir, filename + '.json');

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
      }
    }

  });

  grunt.loadTasks('tasks');
};
