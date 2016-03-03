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

### ContentDimensions

Type: `Object`
Default: `undefined`

Makes it possible to generate pages with multiple content dimensions. E.g. language or timezone.
The current dimensions object is handed over as a third parameter in the [preprocessData](#preprocessdata)
function as well as the [preprocessFilePath](#preprocessfilepath) function.

### SetUp

Type: `Function`
Default: `undefined`

A callback function that sets up the nunjucks environment. The environment is passed as a parameter and it is expected to return it.

For more infomation about nunjucks environments see [https://mozilla.github.io/nunjucks/api.html#environment](https://mozilla.github.io/nunjucks/api.html#environment)

### PreprocessData

Type: `Function`
Default: `undefined`

A preprocessor callback for the data coming in. Gets called on every file with the params `data` and `file`.

__Changes in `v0.1.0`:__ `file` is no longer relative to `searchPath`. It now is the full path to the current file.

### PreprocessFilePath

A callback function for preprocessing the template path. Gets called for every file only with the parameter `file`.

### Iterator

A function that represents the iterator. Here you can do some custom iteration over e.g. `data` to render multiple sites
from one file.

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

Load different data files for every file in the templates folder.

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
          var jsonPath = path.join('test/extended/data/', filename + '.json');

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

### Markdown parsing with default template

This example uses [showdown](https://www.npmjs.com/package/showdown) as a markdown parser. You can preprocess your data as you prefer, e.g. when you are using RST.

```javascript
var showdown = require('showdown');
var mdConverter = new showdown.Converter();

grunt.initConfig({
  nunjuckr : {
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
    }
  }
});
```
