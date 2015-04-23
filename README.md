# grunt-nunjuckr

> Render your nunjucks templates to static files

## Getting started

If you haven't used [Grunt](http://gruntjs.com/) before, check out the [Getting Started](http://gruntjs.com/getting-started) guide.

Once you have installed the plugin via `npm install --save-dev grunt-nunjuckr` include this in your `Gruntfile.js`

```javascript
grunt.loadNpmTasks('grunt-nunjuckr');
```

## Options

### Data

Type: `Object`
Default: `undefined`

The data that is passed to the template.

### Ext

Type: `String`
Default: `.html`

The file extension for the output.

### SearchPaths

Type: `String`
Default: `.`

The path where the templates can be found.

### Tags

Type: `Object`
Default: `undefined`

Configures nunjucks to render with different tags

### SetUp

Type: `Function`
Default: `undefined`

A callback function that sets up the nunjucks environment. The environment is passed as a parameter and it is expected to return it.

For more infomation about nunjucks environments see [https://mozilla.github.io/nunjucks/api.html#environment](https://mozilla.github.io/nunjucks/api.html#environment)

### PreprocessData

Type: `Function`
Default: `undefined`

A preprocessor callback for the data coming in. Gets called on every file with the params `data` and `file`

## Usage Examples

### Basic usage

Render a single input file to a single output file.

```javascript
grunt.initConfig({

  nunjuckr : {

    testSimple : {
      options : {
        data : grunt.file.readJSON('data/data.json')
      },
      files : [
        {
          src : 'src/input.njs',
          dest : 'dest/output.html'
        }
      ]
    }
  }
});
```

### Different data for every template

load different data files for every file in the templates folder.

```javascript
var path = require('path');

grunt.initConfig({
  nunjuckr : {
    testExtended : {
      options : {
        data : grunt.file.readJSON('test/extended/data/data.json'),
        ext : '.html'
        searchPaths : 'src',
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
          src : 'src/**/*.njs',
          dest : 'dest/'
        }
      ]
    }
  }
});
```

### Custom Environment

Set up a custom environment for the renderer.

```javascript
grunt.initConfig({
  nunjuckr : {
    testExtended : {
      options : {
        data : grunt.file.readJSON('test/extended/data/data.json'),
        ext : '.html',
        searchPaths : 'test/extended/src',
        setUp : function (env) {
          env.addFilter('crop', function (str, count) {
            return str.slice(0, count || 5);
          });
          return env;
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
```
