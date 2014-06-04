/*
 * Inspiration and some code for the compilation of routes comes from pagejs.
 * The original has been modified to better handle hash fragments, and to store
 * the regular expression on the Route instance. Also, the resolve method has
 * been added to return a resolved path given a parameters object.
 */

Route = function (router, name, options) {
  var path;

  Utils.assert(router instanceof IronRouter);

  Utils.assert(_.isString(name),
    'Route constructor requires a name as the second parameter');

  if (_.isFunction(options))
    options = { handler: options };

  options = this.options = options || {};
  path = options.path || ('/' + name);

  this.router = router;
  this.originalPath = path;

  if (_.isString(this.originalPath) && this.originalPath.charAt(0) !== '/')
    this.originalPath = '/' + this.originalPath;

  this.name = name;
  this.where = options.where || 'client';
  this.controller = options.controller;

  if (typeof options.reactive !== 'undefined')
    this.isReactive = options.reactive;
  else
    this.isReactive = true;

  this.compile();
};

Route.prototype = {
  constructor: Route,

  /**
   * Compile the path. 
   *
   *  @return {Route}
   *  @api public
   */

  compile: function () {
    var self = this
      , path
      , options = self.options;

    this.keys = [];

    if (self.originalPath instanceof RegExp) {
      self.re = self.originalPath;
    } else {
      path = self.originalPath
        .replace(/(.)\/$/, '$1')
        .concat(options.strict ? '' : '/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/#/, '/?#')
        .replace(
          /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
          function (match, slash, format, key, capture, optional){
            self.keys.push({ name: key, optional: !! optional });
            slash = slash || '';
            return ''
              + (optional ? '' : slash)
              + '(?:'
              + (optional ? slash : '')
              + (format || '') 
              + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
              + (optional || '');
          }
        )
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)');
      
      self.re = new RegExp('^' + path + '$', options.sensitive ? '' : 'i');
    }

    return this;
  },

  /**
   * Returns an array of parameters given a path. The array may have named
   * properties in addition to indexed values.
   *
   * @param {String} path
   * @return {Array}
   * @api public
   */

  params: function (path) {
    if (!path) return null;

    var params = []
      , m = this.exec(path)
      , queryString
      , keys = this.keys
      , key
      , value;

    if (!m)
      throw new Error('The route named "' + this.name + '" does not match the path "' + path + '"');

    for (var i = 1, len = m.length; i < len; ++i) {
      key = keys[i - 1];
      value = typeof m[i] == 'string' ? decodeURIComponent(m[i]) : m[i];
      if (key) {
        params[key.name] = params[key.name] !== undefined ? 
          params[key.name] : value;
      } else
        params.push(value);
    }

    path = decodeURI(path);

    queryString = path.split('?')[1];
    if (queryString)
      queryString = queryString.split('#')[0];

    params.hash = path.split('#')[1];

    if (queryString) {
      _.each(queryString.split('&'), function (paramString) {
        paramParts = paramString.split('=');
        params[paramParts[0]] = decodeURIComponent(paramParts[1]);
      });
    }

    return params;
  },

  normalizePath: function (path) {
    var origin = Meteor.absoluteUrl();

    path = path.replace(origin, '');

    var queryStringIndex = path.indexOf('?');
    path = ~queryStringIndex ? path.slice(0, queryStringIndex) : path;

    var hashIndex = path.indexOf('#');
    path = ~hashIndex ? path.slice(0, hashIndex) : path;

    if (path.charAt(0) !== '/')
      path = '/' + path;

    return path;
  },

  /**
   * Returns true if the path matches and false otherwise.
   *
   * @param {String} path
   * @return {Boolean} 
   * @api public
   */
  test: function (path) {
    return this.re.test(this.normalizePath(path));
  },

  exec: function (path) {
    return this.re.exec(this.normalizePath(path));
  },

  resolve: function (params, options) {
    var value
      , isValueDefined
      , result
      , wildCardCount = 0
      , path = this.originalPath
      , hash
      , query
      , isMissingParams = false;

    options = options || {};
    params = params || [];
    query = options.query;
    hash = options.hash;

    if (path instanceof RegExp) {
      throw new Error('Cannot currently resolve a regular expression path');
    } else {
      path = this.originalPath
        .replace(
          /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
          function (match, slash, format, key, capture, optional, offset) {
            slash = slash || '';
            value = params[key];
            isValueDefined = typeof value !== 'undefined';

            if (optional && !isValueDefined) {
              value = '';
            } else if (!isValueDefined) {
              isMissingParams = true;
              console.warn('You called Route.prototype.resolve with a missing parameter. "' + key + '" not found in params');
              return;
              //throw new Error('You called Route.prototype.resolve with a missing parameter. "' + key + '" not found in params');
            }

            value = _.isFunction(value) ? value.call(params) : value;
            var escapedValue = _.map(String(value).split('/'), function (segment) {
              return encodeURIComponent(segment);
            }).join('/');
            return slash + escapedValue
          }
        )
        .replace(
          /\*/g,
          function (match) {
            if (typeof params[wildCardCount] === 'undefined') {
              throw new Error(
                'You are trying to access a wild card parameter at index ' + 
                wildCardCount +
                ' but the value of params at that index is undefined');
            }

            var paramValue = String(params[wildCardCount++]);
            return _.map(paramValue.split('/'), function (segment) {
              return encodeURIComponent(segment);
            }).join('/');
          }
        );

      if (_.isObject(query)) {
        query = _.map(_.pairs(query), function (queryPart) {
          return queryPart[0] + '=' + encodeURIComponent(queryPart[1]);
        }).join('&');

        if (query && query.length)
          path = path + '/?' + query;
      }

      if (hash) {
        hash = encodeURI(hash.replace('#', ''));
        path = query ? 
          path + '#' + hash : path + '/#' + hash;
      }
    }

    // Because of optional possibly empty segments we normalize path here
    path = path.replace(/\/+/g, '/'); // Multiple / -> one /
    path = path.replace(/^(.+)\/$/g, '$1'); // Removal of trailing /

    return isMissingParams ? null : path;
  },

  path: function (params, options) {
    return this.resolve(params, options);
  },

  url: function (params, options) {
    var path = this.path(params, options);
    if (path[0] === '/')
      path = path.slice(1, path.length);
    return Meteor.absoluteUrl() + path;
  },

  getController: function (path, options) {
    var self = this;
    var handler
      , controllerClass
      , controller
      , action
      , routeName;

    var resolveValue = Utils.resolveValue;
    var classify = Utils.classify; 
    var toArray = Utils.toArray;

    var findController = function (name) {
      var controller = resolveValue(name);
      if (typeof controller === 'undefined') {
        throw new Error(
          'controller "' + name + '" is not defined');
      }

      return controller;
    };

    options = _.extend({}, this.router.options, this.options, options || {}, {
      before: toArray(this.options.before),
      after: toArray(this.options.after),
      unload: toArray(this.options.unload),
      waitOn: toArray(this.router.options.waitOn)
        .concat(toArray(this.options.waitOn)),
      path: path,
      route: this,
      router: this.router,
      params: this.params(path)
    });
    
    // case 1: controller option is defined on the route
    if (this.controller) {
      controllerClass = _.isString(this.controller) ?
        findController(this.controller) : this.controller;
      controller = new controllerClass(options);
      return controller;
    }

    // case 2: intelligently find the controller class in global namespace
    routeName = this.name;

    if (routeName) {
      controllerClass = resolveValue(classify(routeName + 'Controller'));

      if (controllerClass) {
        controller = new controllerClass(options);
        return controller;
      }
    }

    // case 3: nothing found so create an anonymous controller
    return new RouteController(options);
  }
};
