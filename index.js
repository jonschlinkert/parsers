/*!
 * parsers <https://github.com/jonschlinkert/parsers>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');

/**
 * Module dependencies.
 */

var readCache = {};

/**
 * Require cache.
 */

var requires = {};

/**
 * Clear the cache.
 *
 * @api public
 */

exports.clearCache = function() {
  readCache = {};
};

/**
 * Strip utf8 BOM marker and remove windows
 * carriage returns.
 *
 * @param  {String} `str`
 * @return {String}
 */

function normalize(str) {
  // remove extraneous utf8 BOM marker
  str = str.replace(/^\uFEFF/, '');

  // remove windows carriage returns
  str = str.replace(/\r/g, '');
  return str;
}

/**
 * Extend the source object with the properties
 * of other objects.
 *
 * @param  {Object} `o`
 * @return {Object}
 */

function extend(o) {
  var args = [].slice.call(arguments, 1);

  if (o == null) {
    return {};
  }

  var len = args.length;
  if (len === 0) {
    return o;
  }

  for (var i = 0; i < len; i++) {
    var obj = args[i];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        o[key] = obj[key];
      }
    }
  }
  return o;
}

/**
 * Normalize args.
 *
 * @api private
 */

function callback(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  return {options: options, cb: cb};
}

/**
 * Read `filepath` with `options` with callback `(err, str)`.
 * When `options.cache` is true the template string will be
 * cached.
 *
 * @param {String} `filepath`
 * @param {Object} `options`
 * @param {Function} `fn`
 * @api private
 */

function read(filepath, options, cb) {
  var str = readCache[filepath];
  if (options.cache && str && typeof str === 'string') {
    return cb(null, str);
  }

  // read file
  fs.readFile(filepath, 'utf8', function (err, str) {
    if (err) {
      cb(err);
      return;
    }

    str = normalize(str);
    if (options.cache) {
      readCache[filepath] = str;
    }
    cb(null, str);
  });
}

/**
 * Read `filepath` with `options`.
 *
 * When `options.cache` is true the file string will
 * be cached.
 *
 * @param {String} `filepath`
 * @param {String} `options`
 * @api private
 */

function readSync(filepath, options) {
  var str = readCache[filepath];

  if (options.cache && (str && typeof str === 'string')) {
    return str;
  }

  str = fs.readFileSync(filepath, 'utf8');
  str = normalize(str);

  if (options.cache) {
    readCache[filepath] = str;
  }
  return str;
}

/**
 * fromStringParser
 */

function fromStringParser(name) {
  return function (filepath, options, cb) {
    options = extend({}, options);
    options.filename = filepath;

    var args = [].slice.call(arguments);
    var last = args[args.length - 1];
    var callback;

    if (typeof last === 'function') {
      callback = true;
      cb = last;
    }

    if (callback) {
      if ('parse' in exports[name]) {
        return exports[name].parse(filepath, options, cb);
      }

      if ('parseFile' in exports[name]) {
        read(filepath, options, function (err, str) {
          if (err) {
            return cb(err);
          }
          var opts = extend({}, options);
          exports[name].parse(str, opts, cb);
        });
      }
    }


    if ('parseSync' in exports[name]) {
      return exports[name].parseSync(filepath, options);
    }

    if ('parseFileSync' in exports[name]) {
      var str = readSync(filepath, options);
      return exports[name].parseSync(str, options);
    }

    throw new Error('Could not parse:', filepath);
  };
}

/**
 * Remarkable support.
 */

exports.remarkable = fromStringParser('remarkable');

/**
 * Remarkable sync support.
 */

exports.remarkable.parseSync = function(str, options) {
  var Remarkable = requires.remarkable || (requires.remarkable = require('remarkable'));
  try {
    var parser = new Remarkable(options);
    return parser.render(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Marked support.
 */

exports.marked = fromStringParser('marked');

/**
 * Marked sync support.
 */

exports.marked.parseSync = function(str, options) {
  var parser = requires.marked || (requires.marked = require('marked'));
  try {
    return parser(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * Markdown.js support.
 */

exports.markdownjs = fromStringParser('markdownjs');

/**
 * Markdown.js sync support.
 */

exports.markdownjs.parseSync = function(str, options) {
  var parser = requires.markdownjs || (requires.markdownjs = require('markdown'));
  try {
    options = extend({}, options);
    return parser.markdown.toHTML(str, options.dialect, options);
  } catch (err) {
    throw err;
  }
};

/**
 * gray-matter support.
 */

exports.matter = fromStringParser('matter');

/**
 * gray-matter async support.
 */

exports.matter.parse = function(str, options, cb) {
  var parser = requires.matter || (requires.matter = require('gray-matter'));
  var args = callback(options, cb);
  options = args.options;
  cb = args.cb;
  try {
    cb(null, parser(str, options));
  } catch (err) {
    cb(err);
    return;
  }
};

/**
 * gray-matter sync support.
 */

exports.matter.parseSync = function(str, options) {
  var parser = requires.matter || (requires.matter = require('gray-matter'));
  try {
    return parser(str, options);
  } catch (err) {
    throw err;
  }
};

/**
 * gray-matter async file support.
 */

exports.matter.parseFile = function(filepath, options, cb) {
  var parser = requires.matter || (requires.matter = require('gray-matter'));
  var args = callback(options, cb);
  options = args.options;
  cb = args.cb;
  try {
    cb(null, parser.read(filepath, options));
  } catch (err) {
    cb(err);
    return;
  }
};

/**
 * gray-matter sync file support.
 */

exports.matter.parseFileSync = function(filepath, options) {
  var parser = requires.matter || (requires.matter = require('gray-matter'));
  try {
    return parser.read(filepath, options);
  } catch (err) {
    throw err;
  }
};