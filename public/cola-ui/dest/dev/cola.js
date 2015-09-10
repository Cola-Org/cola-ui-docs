(function() {
  var ALIAS_REGEXP, IGNORE_NODES, LinkedList, ON_NODE_REMOVED_KEY, Page, TYPE_SEVERITY, USER_DATA_KEY, VALIDATION_ERROR, VALIDATION_INFO, VALIDATION_NONE, VALIDATION_WARN, XDate, _$, _DOMNodeRemovedListener, _Entity, _EntityList, _RESERVE_NAMES, _compileResourceUrl, _cssCache, _destroyDomBinding, _doRrenderDomTemplate, _evalDataPath, _findRouter, _getData, _getHashPath, _jsCache, _loadCss, _loadHtml, _loadJs, _matchValue, _onHashChange, _onStateChange, _removeNodeData, _setValue, _sortConvertor, _switchRouter, _toJSON, alertException, appendChild, browser, buildAliasFeature, buildAttrFeature, buildBindFeature, buildClassFeature, buildContent, buildEvent, buildI18NFeature, buildRepeatFeature, buildStyleFeature, buildWatchFeature, cola, colaEventRegistry, compileConvertor, createContentPart, createNodeForAppend, currentRoutePath, currentRouter, defaultDataTypes, defaultLocale, definedSetting, digestExpression, doMergeDefinitions, doms, exceptionStack, getEntityPath, i18nStore, jsep, key, oldIE, originalAjax, os, preprocessClass, routerRegistry, setAttrs, setting, splitExpression, sprintf, tagSplitter, trimPath, typeRegistry, uniqueIdSeed, value, xCreate,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  this.cola = cola = function() {
    var ref;
    return (ref = cola["_rootFunc"]) != null ? ref.apply(cola, arguments) : void 0;
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = cola;
  }

  cola.util = {};

  cola.constants = {
    VARIABLE_NAME_REGEXP: /^[_a-zA-Z][_a-zA-Z0-9]*$/g,
    VIEW_CLASS: "c-view",
    VIEW_PORT_CLASS: "c-viewport",
    IGNORE_DIRECTIVE: "c-ignore",
    COLLECTION_CURRENT_CLASS: "current",
    DEFAULT_PATH: "$root",
    DOM_USER_DATA_KEY: "_d",
    DOM_BINDING_KEY: "_binding",
    DOM_INITIALIZER_KEY: "_initialize",
    REPEAT_TEMPLATE_KEY: "_template",
    REPEAT_TAIL_KEY: "_tail",
    DOM_ELEMENT_KEY: "_element",
    NOT_WHITE_REG: /\S+/g,
    CLASS_REG: /[\t\r\n\f]/g,
    WIDGET_DIMENSION_UNIT: "px",
    MESSAGE_REFRESH: 0,
    MESSAGE_DATA_CHANGE: 1,
    MESSAGE_CURRENT_CHANGE: 10,
    MESSAGE_EDITING_STATE_CHANGE: 11,
    MESSAGE_VALIDATION_STATE_CHANGE: 15,
    MESSAGE_INSERT: 20,
    MESSAGE_REMOVE: 21,
    MESSAGE_LOADING_START: 30,
    MESSAGE_LOADING_END: 31
  };

  oldIE = !-[1,];

  $.xCreate = xCreate = function(template, context) {
    var $el, child, content, el, element, elements, l, len1, len2, len3, o, part, q, ref, tagName, templateProcessor;
    if (template instanceof Array) {
      elements = [];
      for (l = 0, len1 = template.length; l < len1; l++) {
        part = template[l];
        element = xCreate(part, context);
        if (element != null) {
          elements.push(element);
        }
      }
      return elements;
    }
    if (xCreate.templateProcessors.length) {
      ref = xCreate.templateProcessors;
      for (o = 0, len2 = ref.length; o < len2; o++) {
        templateProcessor = ref[o];
        element = templateProcessor(template);
        if (element != null) {
          return element;
        }
      }
    }
    if (typeof template === "string") {
      if (template.charAt(0) === '^') {
        template = {
          tagName: template.substring(1)
        };
      } else {
        return document.createTextNode(template);
      }
    }
    tagName = template.tagName || "DIV";
    tagName = tagName.toUpperCase();
    if (oldIE && tagName.toUpperCase() === "INPUT" && template.type) {
      el = document.createElement("<" + tagName + " type=\"" + template.type + "\"/>");
    } else {
      el = document.createElement(tagName);
    }
    $el = $(el);
    setAttrs(el, $el, template, context);
    content = template.content;
    if (content != null) {
      if (typeof content === "string") {
        if (content.charAt(0) === '^') {
          appendChild(el, document.createElement(content.substring(1)));
        } else {
          $el.text(content);
        }
      } else {
        if (content instanceof Array) {
          for (q = 0, len3 = content.length; q < len3; q++) {
            part = content[q];
            if (typeof part === "string") {
              if (part.charAt(0) === '^') {
                appendChild(el, document.createElement(part.substring(1)));
              } else {
                appendChild(el, document.createTextNode(part));
              }
            } else {
              child = xCreate(part, context);
              if (child != null) {
                appendChild(el, child);
              }
            }
          }
        } else if (content.nodeType) {
          appendChild(el, content);
        } else {
          child = xCreate(content, context);
          if (child != null) {
            appendChild(el, child);
          }
        }
      }
    } else if (template.html) {
      $el.html(template.html);
    }
    return el;
  };

  xCreate.templateProcessors = [];

  xCreate.attributeProcessor = {
    data: function($el, attrName, attrValue, context) {
      $el.data(attrValue);
    },
    style: function($el, attrName, attrValue, context) {
      if (typeof attrValue === "string") {
        $el.attr("style", attrValue);
      } else if (attrValue !== null) {
        $el.css(attrValue);
      }
    }
  };

  setAttrs = function(el, $el, attrs, context) {
    var attrName, attrValue, attributeProcessor;
    for (attrName in attrs) {
      attrValue = attrs[attrName];
      attributeProcessor = xCreate.attributeProcessor[attrName];
      if (attributeProcessor) {
        attributeProcessor($el, attrName, attrValue, context);
      } else {
        switch (attrName) {
          case "tagName":
          case "nodeName":
          case "content":
          case "html":
            continue;
          case "contextKey":
            if (context instanceof Object && attrValue && typeof attrValue === "string") {
              context[attrValue] = el;
            }
            break;
          default:
            if (typeof attrValue === "function") {
              $el.bind(attrName, attrValue);
            } else {
              $el.attr(attrName, attrValue);
            }
        }
      }
    }
  };

  appendChild = function(parentEl, el) {
    var tbody;
    if (parentEl.nodeName === "TABLE" && el.nodeName === "TR") {
      tbody;
      if (parentEl && parentEl.tBodies[0]) {
        tbody = parentEl.tBodies[0];
      } else {
        tbody = parentEl.appendChild(document.createElement("tbody"));
      }
      parentEl = tbody;
    }
    return parentEl.appendChild(el);
  };

  createNodeForAppend = function(template, context) {
    var element, fragment, l, len1, result;
    result = xCreate(template, context);
    if (!result) {
      return null;
    }
    if (result instanceof Array) {
      fragment = document.createDocumentFragment();
      for (l = 0, len1 = result.length; l < len1; l++) {
        element = result[l];
        fragment.appendChild(element);
      }
      result = fragment;
    }
    return result;
  };

  $.fn.xAppend = function(template, context) {
    var result;
    result = createNodeForAppend(template, context);
    if (!result) {
      return null;
    }
    return this.append(result);
  };

  $.fn.xInsertBefore = function(template, context) {
    var result;
    result = createNodeForAppend(template, context);
    if (!result) {
      return null;
    }
    return this.before(result);
  };

  $.fn.xInsertAfter = function(template, context) {
    var result;
    result = createNodeForAppend(template, context);
    if (!result) {
      return null;
    }
    return this.after(result);
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./namespace");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.util.KeyedArray = (function() {
    KeyedArray.prototype.size = 0;

    function KeyedArray() {
      this.elements = [];
      this.keyMap = {};
    }

    KeyedArray.prototype.add = function(key, element) {
      var i;
      if (this.keyMap.hasOwnProperty(key)) {
        i = this.elements.indexOf(element);
        if (i > -1) {
          this.elements.splice(i, 1);
        }
      }
      this.keyMap[key] = element;
      this.size = this.elements.push(element);
      return this;
    };

    KeyedArray.prototype.remove = function(key) {
      var element, i;
      if (typeof key === "number") {
        i = key;
        element = this.elements[i];
        this.elements.splice(i, 1);
        this.size = this.elements.length;
        if (element) {
          for (key in this.keyMap) {
            if (this.keyMap[key] === element) {
              delete this.keyMap[key];
              break;
            }
          }
        }
      } else {
        element = this.keyMap[key];
        delete this.keyMap[key];
        if (element) {
          i = this.elements.indexOf(element);
          if (i > -1) {
            this.elements.splice(i, 1);
            this.size = this.elements.length;
          }
        }
      }
      return element;
    };

    KeyedArray.prototype.get = function(key) {
      if (typeof key === "number") {
        return this.elements[key];
      } else {
        return this.keyMap[key];
      }
    };

    KeyedArray.prototype.getIndex = function(key) {
      var element;
      element = this.keyMap[key];
      if (element) {
        return this.elements.indexOf(element);
      }
      return -1;
    };

    KeyedArray.prototype.clear = function() {
      this.elements = [];
      this.keyMap = {};
      this.size = 0;
    };

    KeyedArray.prototype.elements = function() {
      return this.elements;
    };

    KeyedArray.prototype.each = function(fn) {
      var element, l, len1, ref;
      ref = this.elements;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        element = ref[l];
        if (fn.call(this, element) === false) {
          break;
        }
      }
    };

    return KeyedArray;

  })();

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./keyed-array");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.util.trim = function(text) {
    if (text != null) {
      return String.prototype.trim.call(text);
    } else {
      return "";
    }
  };

  cola.util.capitalize = function(text) {
    if (!text) {
      return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  cola.util.isSimpleValue = function(value) {
    var type;
    if (value === null || value === void 0) {
      return false;
    }
    type = typeof value;
    return type !== "object" && type !== "function" || type instanceof Date;
  };

  cola.util.parseStyleLikeString = function(styleStr, headerProp) {
    var i, j, l, len1, part, parts, style, styleExpr, styleProp;
    if (!styleStr) {
      return false;
    }
    style = {};
    parts = styleStr.split(";");
    for (i = l = 0, len1 = parts.length; l < len1; i = ++l) {
      part = parts[i];
      j = part.indexOf(":");
      if (j > 0) {
        styleProp = this.trim(part.substring(0, j));
        styleExpr = this.trim(part.substring(j + 1));
        if (styleProp && styleExpr) {
          style[styleProp] = styleExpr;
        }
      } else {
        part = this.trim(part);
        if (!part) {
          continue;
        }
        if (i === 0 && headerProp) {
          style[headerProp] = part;
        } else {
          style[part] = true;
        }
      }
    }
    return style;
  };

  cola.util.parseFunctionArgs = function(func) {
    var arg, argStr, args, i, l, len1, rawArgs;
    argStr = func.toString().match(/\([^\(\)]*\)/)[0];
    rawArgs = argStr.substring(1, argStr.length - 1).split(",");
    args = [];
    for (i = l = 0, len1 = rawArgs.length; l < len1; i = ++l) {
      arg = rawArgs[i];
      arg = cola.util.trim(arg);
      if (arg) {
        args.push(arg);
      }
    }
    return args;
  };

  cola.util.parseListener = function(listener) {
    var argStr, args, argsMode;
    argsMode = 1;
    argStr = listener.toString().match(/\([^\(\)]*\)/)[0];
    args = argStr.substring(1, argStr.length - 1).split(",");
    if (args.length) {
      if (cola.util.trim(args[0]) === "arg") {
        argsMode = 2;
      }
    }
    listener._argsMode = argsMode;
    return argsMode;
  };

  cola.util.isCompatibleType = function(baseType, type) {
    if (type === baseType) {
      return true;
    }
    while (type.__super__) {
      type = type.__super__.constructor;
      if (type === baseType) {
        return true;
      }
    }
    return false;
  };

  cola.util.delay = function(owner, name, delay, fn) {
    cola.util.cancelDelay(owner, name);
    owner["_timer_" + name] = setTimeout(function() {
      fn.call(owner);
    }, delay);
  };

  cola.util.cancelDelay = function(owner, name) {
    var key, timerId;
    key = "_timer_" + name;
    timerId = owner[key];
    if (timerId) {
      delete owner[key];
      clearTimeout(timerId);
    }
  };

  cola.util.waitForAll = function(funcs, callback) {
    var completed, func, id, l, len1, procedures, subCallback, total;
    if (!funcs || !funcs.length) {
      cola.callback(callback, true);
    }
    completed = 0;
    total = funcs.length;
    procedures = {};
    for (l = 0, len1 = funcs.length; l < len1; l++) {
      func = funcs[l];
      id = cola.uniqueId();
      procedures[id] = true;
      subCallback = {
        id: id,
        complete: function(success) {
          var disabled;
          if (disabled) {
            return;
          }
          if (success) {
            if (procedures[this.id]) {
              delete procedures[this.id];
              completed++;
              if (completed === total) {
                cola.callback(callback, true);
                disabled = true;
              }
            }
          } else {
            cola.callback(callback, false);
            disabled = true;
          }
        }
      };
      subCallback.scope = subCallback;
      func(subCallback);
    }
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./util");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.version = "${version}";

  uniqueIdSeed = 1;

  cola.uniqueId = function() {
    return "_id" + (uniqueIdSeed++);
  };

  cola.sequenceNo = function() {
    return uniqueIdSeed++;
  };

  cola._EMPTY_FUNC = function() {};

  if (typeof window !== "undefined" && window !== null) {
    (function() {
      var s, theshold, ua;
      cola.browser = {};
      cola.os = {};
      cola.device = {};
      ua = window.navigator.userAgent.toLowerCase();
      if ((s = ua.match(/webkit\/([\d.]+)/))) {
        cola.browser.webkit = s[1] || -1;
        if ((s = ua.match(/chrome\/([\d.]+)/))) {
          cola.browser.chrome = parseFloat(s[1]) || -1;
        } else if ((s = ua.match(/version\/([\d.]+).*safari/))) {
          cola.browser.safari = parseFloat(s[1]) || -1;
        }
        if ((s = ua.match(/qqbrowser\/([\d.]+)/))) {
          cola.browser.qqbrowser = parseFloat(s[1]) || -1;
        }
      } else if ((s = ua.match(/msie ([\d.]+)/))) {
        cola.browser.ie = parseFloat(s[1]) || -1;
      } else if ((s = ua.match(/trident/))) {
        cola.browser.ie = 11;
      } else if ((s = ua.match(/firefox\/([\d.]+)/))) {
        cola.browser.mozilla = parseFloat(s[1]) || -1;
      } else if ((s = ua.match(/opera.([\d.]+)/))) {
        cola.browser.opera = parseFloat(s[1]) || -1;
      }
      if ((s = ua.match(/(iphone|ipad).*os\s([\d_]+)/))) {
        cola.os.ios = parseFloat(s[2]) || -1;
        cola.device.pad = s[1] === "ipad";
        cola.device.phone = !cola.device.pad;
      } else {
        if ((s = ua.match(/(android)\s+([\d.]+)/))) {
          cola.os.android = parseFloat(s[1]) || -1;
          if ((s = ua.match(/micromessenger\/([\d.]+)/))) {
            cola.browser.weixin = parseFloat(s[1]) || -1;
          }
        } else if ((s = ua.match(/(windows)[\D]*([\d]+)/))) {
          cola.os.windows = parseFloat(s[1]) || -1;
        }
      }
      cola.device.mobile = !!(("ontouchstart" in window) && ua.match(/(mobile)/));
      cola.device.desktop = !cola.device.mobile;
      if (cola.device.mobile && !cola.os.ios) {
        theshold = 768;
        if (cola.browser.qqbrowser) {
          cola.device.pad = (window.screen.width / 2) >= theshold || (window.screen.height / 2) >= theshold;
        } else {
          cola.device.pad = window.screen.width >= theshold || window.screen.height >= theshold;
        }
        cola.device.phone = !cola.device.pad;
      }
    })();
  }


  /*
  Event
   */

  colaEventRegistry = {
    ready: {},
    settingChange: {},
    exception: {},
    beforeRouterSwitch: {},
    routerSwitch: {}
  };

  cola.on = function(eventName, listener) {
    var alias, aliasMap, i, listenerRegistry, listeners;
    i = eventName.indexOf(":");
    if (i > 0) {
      alias = eventName.substring(i + 1);
      eventName = eventName.substring(0, i);
    }
    listenerRegistry = colaEventRegistry[eventName];
    if (!listenerRegistry) {
      throw new cola.Exception("Unrecognized event \"" + eventName + "\".");
    }
    if (typeof listener !== "function") {
      throw new cola.Exception("Invalid event listener.");
    }
    listeners = listenerRegistry.listeners;
    aliasMap = listenerRegistry.aliasMap;
    if (listeners) {
      if (alias && (aliasMap != null ? aliasMap[alias] : void 0) > -1) {
        cola.off(eventName + ":" + alias);
      }
      listeners.push(listener);
      i = listeners.length - 1;
    } else {
      listenerRegistry.listeners = listeners = [listener];
      i = 0;
    }
    if (alias) {
      if (!aliasMap) {
        listenerRegistry.aliasMap = aliasMap = {};
      }
      aliasMap[alias] = i;
    }
    return this;
  };

  cola.off = function(eventName, listener) {
    var alias, aliasMap, i, listenerRegistry, listeners;
    i = eventName.indexOf(":");
    if (i > 0) {
      alias = eventName.substring(i + 1);
      eventName = eventName.substring(0, i);
    }
    listenerRegistry = colaEventRegistry[eventName];
    if (!listenerRegistry) {
      return this;
    }
    listeners = listenerRegistry.listeners;
    if (!listeners || listeners.length === 0) {
      return this;
    }
    i = -1;
    if (alias) {
      aliasMap = listenerRegistry.aliasMap;
      i = aliasMap != null ? aliasMap[alias] : void 0;
      if (i > -1) {
        if (aliasMap != null) {
          delete aliasMap[alias];
        }
        listeners.splice(i, 1);
      }
    } else if (listener) {
      i = listeners.indexOf(listener);
      if (i > -1) {
        listeners.splice(i, 1);
        aliasMap = listenerRegistry.aliasMap;
        if (aliasMap) {
          for (alias in aliasMap) {
            if (aliasMap[alias] === listener) {
              delete aliasMap[alias];
              break;
            }
          }
        }
      }
    } else {
      delete listenerRegistry.listeners;
      delete listenerRegistry.aliasMap;
    }
    return this;
  };

  cola.getListeners = function(eventName) {
    var listener, ref;
    listener = (ref = colaEventRegistry[eventName]) != null ? ref.listeners : void 0;
    if (listener != null ? listener.length : void 0) {
      return listener;
    } else {
      return null;
    }
  };

  cola.fire = function(eventName, self, arg) {
    var argsMode, l, len1, listener, listeners, ref, retValue;
    if (arg == null) {
      arg = {};
    }
    listeners = (ref = colaEventRegistry[eventName]) != null ? ref.listeners : void 0;
    if (listeners) {
      for (l = 0, len1 = listeners.length; l < len1; l++) {
        listener = listeners[l];
        argsMode = listener._argsMode;
        if (!listener._argsMode) {
          argsMode = cola.util.parseListener(listener);
        }
        if (argsMode === 1) {
          retValue = listener.call(this, self, arg);
        } else {
          retValue = listener.call(this, arg, self);
        }
        if (retValue === false) {
          return false;
        }
      }
    }
    return true;
  };

  cola.ready = function(listener) {
    return this.on("ready", listener);
  };


  /*
  Setting
   */

  setting = {
    defaultCharset: "utf-8"
  };

  cola.setting = function(key, value) {
    var k, v;
    if (typeof key === "string") {
      if (value !== void 0) {
        setting[key] = value;
        if (cola.getListeners("settingChange")) {
          cola.fire("settingChange", cola, {
            key: key
          });
        }
      } else {
        return setting[key];
      }
    } else if (typeof key === "object") {
      for (k in key) {
        v = key[k];
        setting[k] = v;
        if (cola.getListeners("settingChange")) {
          cola.fire("settingChange", cola, {
            key: k
          });
        }
      }
    }
    return this;
  };

  definedSetting = (typeof colaSetting !== "undefined" && colaSetting !== null) || (typeof global !== "undefined" && global !== null ? global.colaSetting : void 0);

  if (definedSetting) {
    for (key in definedSetting) {
      value = definedSetting[key];
      cola.setting(key, value);
    }
  }


  /*
  Exception
   */

  exceptionStack = [];

  alertException = function(ex) {
    var msg;
    if (ex instanceof cola.Exception || ex instanceof Error) {
      msg = ex.message;
    } else {
      msg = ex + "";
    }
    if (typeof alert === "function") {
      alert(msg);
    }
  };

  cola.Exception = (function() {
    function Exception(message3, error1) {
      this.message = message3;
      this.error = error1;
      if (this.error) {
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.trace === "function") {
            console.trace(this.error);
          }
        }
      }
      exceptionStack.push(this);
      setTimeout((function(_this) {
        return function() {
          if (exceptionStack.indexOf(_this) > -1) {
            cola.Exception.processException(_this);
          }
        };
      })(this), 50);
    }

    Exception.processException = function(ex) {
      var ex2, scope;
      if (cola.Exception.ignoreAll) {
        return;
      }
      if (ex) {
        cola.Exception.removeException(ex);
      }
      if (ex instanceof cola.AbortException) {
        return;
      }
      if (cola.fire("exception", cola, {
        exception: ex
      }) === false) {
        return;
      }
      if (ex instanceof cola.RunnableException) {
        eval("var fn = function(){" + ex.script + "}");
        scope = typeof window !== "undefined" && window !== null ? window : this;
        fn.call(scope);
      } else {
        if (cola.Exception.ignoreAll) {
          return;
        }
        try {
          if (typeof document !== "undefined" && document !== null ? document.body : void 0) {
            if (ex.showException) {
              ex.showException();
            } else {
              cola.Exception.showException(ex);
            }
          } else {
            if (ex.safeShowException) {
              ex.safeShowException();
            } else {
              cola.Exception.safeShowException(ex);
            }
          }
        } catch (_error) {
          ex2 = _error;
          cola.Exception.removeException(ex2);
          if (ex2.safeShowException) {
            ex2.safeShowException();
          } else {
            cola.Exception.safeShowException(ex2);
          }
        }
      }
    };

    Exception.removeException = function(ex) {
      var i;
      i = exceptionStack.indexOf(ex);
      if (i > -1) {
        exceptionStack.splice(i, 1);
      }
    };

    Exception.safeShowException = function(exception) {
      alertException(exception);
    };

    Exception.showException = function(exception) {
      alertException(exception);
    };

    return Exception;

  })();

  cola.AbortException = (function(superClass) {
    extend(AbortException, superClass);

    function AbortException() {}

    return AbortException;

  })(cola.Exception);

  cola.RunnableException = (function(superClass) {
    extend(RunnableException, superClass);

    function RunnableException(script1) {
      this.script = script1;
      RunnableException.__super__.constructor.call(this, "[script]");
    }

    return RunnableException;

  })(cola.Exception);


  /*
  I18N
   */

  defaultLocale = "en";

  i18nStore = {};

  sprintf = function() {
    var i, l, len1, param, params, templ;
    templ = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = l = 0, len1 = params.length; l < len1; i = ++l) {
      param = params[i];
      templ = templ.replace(new RegExp("\\{" + i + "\\}", "g"), param);
    }
    return templ;
  };

  cola.i18n = function() {
    var bundle, key, locale, oldBundle, params, ref, str, templ;
    key = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (typeof key === "string") {
      locale = cola.setting("locale") || defaultLocale;
      templ = (ref = i18nStore[locale]) != null ? ref[key] : void 0;
      if (templ) {
        if (params.length) {
          return sprintf.apply(this, [templ].concat(params));
        } else {
          return templ;
        }
      } else {
        return key;
      }
    } else {
      bundle = key;
      locale = params[0] || defaultLocale;
      oldBundle = i18nStore[locale];
      if (oldBundle) {
        for (key in bundle) {
          str = bundle[key];
          oldBundle[key] = str;
        }
      } else {
        i18nStore[locale] = oldBundle = bundle;
      }
    }
  };

  cola.I18nException = (function(superClass) {
    extend(I18nException, superClass);

    function I18nException() {
      var key, params;
      key = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      I18nException.__super__.constructor.call(this, cola.i18n.apply(cola, [key].concat(slice.call(params))));
    }

    return I18nException;

  })(cola.Exception);


  /*
  Mothods
   */

  cola.callback = function(callback, success, result) {
    var scope;
    if (!callback) {
      return;
    }
    if (typeof callback === "function") {
      if (success) {
        return callback.call(this, result);
      }
    } else {
      scope = callback.scope || this;
      if (callback.delay) {
        setTimeout(function() {
          callback.complete.call(scope, success, result);
        }, callback.delay);
      } else {
        return callback.complete.call(scope, success, result);
      }
    }
  };

  _toJSON = function(data) {
    var p, rawData, v;
    if (data) {
      if (typeof data === "object") {
        if (data instanceof cola.Entity || data instanceof cola.EntityList) {
          data = data.toJSON();
        } else {
          rawData = data;
          data = {};
          for (p in rawData) {
            v = rawData[p];
            data[p] = _toJSON(v);
          }
        }
      } else if (typeof data === "function") {
        data = void 0;
      }
    }
    return data;
  };

  originalAjax = jQuery.ajax;

  $.ajax = function(url, settings) {
    var data, p, rawData, v;
    if (typeof url === "object" && !settings) {
      settings = url;
    }
    data = settings.data;
    if (data) {
      if (typeof data === "object") {
        if (data instanceof cola.Entity || data instanceof cola.EntityList) {
          data = data.toJSON();
        } else {
          rawData = data;
          data = {};
          for (p in rawData) {
            v = rawData[p];
            data[p] = _toJSON(v);
          }
        }
      } else if (typeof data === "function") {
        data = void 0;
      }
      settings.data = data;
    }
    return originalAjax.apply(this, [url, settings]);
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./util");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  tagSplitter = " ";

  doMergeDefinitions = function(definitions, mergeDefinitions, overwrite) {
    var definition, mergeDefinition, name, prop;
    if (definitions === mergeDefinitions) {
      return;
    }
    for (name in mergeDefinitions) {
      mergeDefinition = mergeDefinitions[name];
      if (definitions.hasOwnProperty(name)) {
        definition = definitions[name];
        if (definition) {
          for (prop in mergeDefinition) {
            if (overwrite || !definition.hasOwnProperty(prop)) {
              definition[prop] = mergeDefinition[prop];
            }
          }
        } else {
          definitions[name] = mergeDefinition;
        }
      } else {
        definitions[name] = mergeDefinition;
      }
    }
  };

  preprocessClass = function(classType) {
    var attributes, events, ref, superType;
    superType = (ref = classType.__super__) != null ? ref.constructor : void 0;
    if (superType) {
      if (classType.__super__) {
        preprocessClass(superType);
      }
      attributes = classType.ATTRIBUTES;
      if (!attributes._inited) {
        attributes._inited = true;
        doMergeDefinitions(attributes, superType.ATTRIBUTES, false);
      }
      events = classType.EVENTS;
      if (!events._inited) {
        events._inited = true;
        doMergeDefinitions(events, superType.EVENTS, false);
      }
    }
  };

  cola.Element = (function() {
    Element.mixin = function(classType, mixin) {
      var attributes, events, member, mixInEvents, mixinAttributes, name;
      for (name in mixin) {
        member = mixin[name];
        if (name === "ATTRIBUTES") {
          mixinAttributes = member;
          if (mixinAttributes) {
            attributes = classType.ATTRIBUTES != null ? classType.ATTRIBUTES : classType.ATTRIBUTES = {};
            doMergeDefinitions(attributes, mixinAttributes, true);
          }
        } else if (name === "EVENTS") {
          mixInEvents = member;
          if (mixInEvents) {
            events = classType.EVENTS != null ? classType.EVENTS : classType.EVENTS = {};
            doMergeDefinitions(events, mixInEvents, true);
          }
        } else if (name === "constructor") {
          if (!classType._constructors) {
            classType._constructors = [member];
          } else {
            classType._constructors.push(member);
          }
        } else if (name === "destroy") {
          if (!classType._destructors) {
            classType._destructors = [member];
          } else {
            classType._destructors.push(member);
          }
        } else {
          classType.prototype[name] = member;
        }
      }
    };

    Element.ATTRIBUTES = {
      tag: {
        getter: function() {
          if (this._tag) {
            return this._tag.join(tagSplitter);
          } else {
            return null;
          }
        },
        setter: function(tag) {
          var l, len1, len2, o, ref, t, ts;
          if (this._tag) {
            ref = this._tag;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              t = ref[l];
              cola.tagManager.unreg(t, this);
            }
          }
          if (tag) {
            this._tag = ts = tag.split(tagSplitter);
            for (o = 0, len2 = ts.length; o < len2; o++) {
              t = ts[o];
              cola.tagManager.reg(t, this);
            }
          } else {
            this._tag = null;
          }
        }
      },
      userData: null
    };

    Element.EVENTS = {
      attributeChange: null,
      destroy: null
    };

    function Element(config) {
      var attr, attrConfig, attrConfigs, classType, constructor, l, len1, ref;
      this._constructing = true;
      classType = this.constructor;
      if (!classType.ATTRIBUTES._inited || !classType.EVENTS._inited) {
        preprocessClass(classType);
      }
      this._scope = (config != null ? config.scope : void 0) || cola.currentScope;
      attrConfigs = classType.ATTRIBUTES;
      for (attr in attrConfigs) {
        attrConfig = attrConfigs[attr];
        if ((attrConfig != null ? attrConfig.defaultValue : void 0) !== void 0) {
          if (attrConfig.setter) {
            attrConfig.setter.call(this, attrConfig.defaultValue, attr);
          } else {
            this["_" + attr] = attrConfig.defaultValue;
          }
        }
      }
      if (classType._constructors) {
        ref = classType._constructors;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          constructor = ref[l];
          constructor.call(this);
        }
      }
      if (config) {
        this.set(config, true);
      }
      delete this._constructing;
    }

    Element.prototype.destroy = function() {
      var classType, destructor, elementAttrBinding, l, len1, p, ref, ref1;
      classType = this.constructor;
      if (classType._destructors) {
        ref = classType._destructors;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          destructor = ref[l];
          destructor.call(this);
        }
      }
      if (this._elementAttrBindings) {
        ref1 = this._elementAttrBindings;
        for (p in ref1) {
          elementAttrBinding = ref1[p];
          elementAttrBinding.destroy();
        }
      }
      this.fire("destroy", this);
      if (this._tag) {
        this._set("tag", null);
      }
    };

    Element.prototype.get = function(attr, ignoreError) {
      var l, len1, obj, path, paths;
      if (attr.indexOf(".") > -1) {
        paths = attr.split(".");
        obj = this;
        for (l = 0, len1 = paths.length; l < len1; l++) {
          path = paths[l];
          if (obj instanceof cola.Element) {
            obj = obj._get(path, ignoreError);
          } else if (typeof obj.get === "function") {
            obj = obj.get(path);
          } else {
            obj = obj[path];
          }
          if (obj == null) {
            break;
          }
        }
        return obj;
      } else {
        return this._get(attr, ignoreError);
      }
    };

    Element.prototype._get = function(attr, ignoreError) {
      var attrConfig;
      if (!this.constructor.ATTRIBUTES.hasOwnProperty(attr)) {
        if (ignoreError) {
          return;
        }
        throw new cola.Exception("Unrecognized Attribute \"" + attr + "\".");
      }
      attrConfig = this.constructor.ATTRIBUTES[attr];
      if (attrConfig != null ? attrConfig.getter : void 0) {
        return attrConfig.getter.call(this, attr);
      } else {
        return this["_" + attr];
      }
    };

    Element.prototype.set = function(attr, value, ignoreError) {
      var config, i, l, len1, obj, path, paths;
      if (typeof attr === "string") {
        if (attr.indexOf(".") > -1) {
          paths = attr.split(".");
          obj = this;
          for (i = l = 0, len1 = paths.length; l < len1; i = ++l) {
            path = paths[i];
            if (obj instanceof cola.Element) {
              obj = obj._get(path, ignoreError);
            } else {
              obj = obj[path];
            }
            if (obj == null) {
              break;
            }
            if (i >= (paths.length - 2)) {
              break;
            }
          }
          if ((obj == null) && !ignoreError) {
            throw new cola.Exception("Cannot set attribute \"" + (path.slice(0, i).join(".")) + "\" of undefined.");
          }
          if (obj instanceof cola.Element) {
            obj._set(paths[paths.length - 1], value, ignoreError);
          } else if (typeof obj.set === "function") {
            obj.set(paths[paths.length - 1], value);
          } else {
            obj[paths[paths.length - 1]] = value;
          }
        } else {
          this._set(attr, value, ignoreError);
        }
      } else {
        config = attr;
        ignoreError = value;
        for (attr in config) {
          this.set(attr, config[attr], ignoreError);
        }
      }
      return this;
    };

    Element.prototype._set = function(attr, value, ignoreError) {
      var action, attrConfig, eventName, expression, i, parts, ref, scope;
      if (typeof value === "string" && this._scope) {
        if (value.charCodeAt(0) === 123) {
          parts = cola._compileText(value);
          if ((parts != null ? parts.length : void 0) > 0) {
            value = parts[0];
          }
        }
      }
      if (this.constructor.ATTRIBUTES.hasOwnProperty(attr)) {
        attrConfig = this.constructor.ATTRIBUTES[attr];
        if (attrConfig) {
          if (attrConfig.readOnly) {
            if (ignoreError) {
              return;
            }
            throw new cola.Exception("Attribute \"" + attr + "\" is readonly.");
          }
          if (!this._constructing && attrConfig.readOnlyAfterCreate) {
            if (ignoreError) {
              return;
            }
            throw new cola.Exception("Attribute \"" + attr + "\" cannot be changed after create.");
          }
        }
      } else if (value) {
        eventName = attr;
        i = eventName.indexOf(":");
        if (i > 0) {
          eventName = eventName.substring(0, i);
        }
        if (this.constructor.EVENTS.hasOwnProperty(eventName)) {
          if (value instanceof cola.Expression) {
            expression = value;
            scope = this._scope;
            this.on(attr, function(self, arg) {
              expression.evaluate(scope, "never", {
                vars: {
                  self: self,
                  arg: arg
                }
              });
            }, ignoreError);
            return;
          } else if (typeof value === "function") {
            this.on(attr, value);
            return;
          } else if (typeof value === "string") {
            action = (ref = this._scope) != null ? ref.action(value) : void 0;
            if (action) {
              this.on(attr, action);
              return;
            }
          }
        }
        if (ignoreError) {
          return;
        }
        throw new cola.Exception("Unrecognized Attribute \"" + attr + "\".");
      }
      this._doSet(attr, attrConfig, value);
      if (this._eventRegistry) {
        if (this.getListeners("attributeChange")) {
          this.fire("attributeChange", this, {
            attribute: attr
          });
        }
      }
    };

    Element.prototype._doSet = function(attr, attrConfig, value) {
      var elementAttrBinding, elementAttrBindings, expression, scope;
      if (!this._duringBindingRefresh && this._elementAttrBindings) {
        elementAttrBinding = this._elementAttrBindings[attr];
        if (elementAttrBinding) {
          elementAttrBinding.destroy();
          delete this._elementAttrBindings[attr];
        }
      }
      if (value instanceof cola.Expression && cola.currentScope) {
        expression = value;
        scope = cola.currentScope;
        if (expression.isStatic) {
          value = expression.evaluate(scope, "never");
        } else {
          elementAttrBinding = new cola.ElementAttrBinding(this, attr, expression, scope);
          if (this._elementAttrBindings == null) {
            this._elementAttrBindings = {};
          }
          elementAttrBindings = this._elementAttrBindings;
          if (elementAttrBindings) {
            elementAttrBindings[attr] = elementAttrBinding;
          }
          value = elementAttrBinding.evaluate();
        }
      }
      if (attrConfig) {
        if (attrConfig.type === "boolean") {
          if ((value != null) && typeof value !== "boolean") {
            value = value === "true";
          }
        } else if (attrConfig.type === "number") {
          if ((value != null) && typeof value !== "number") {
            value = parseFloat(value) || 0;
          }
        }
        if (attrConfig["enum"] && attrConfig["enum"].indexOf(value) < 0) {
          throw new cola.Exception("The value \"" + value + "\" of attribute \"" + attr + "\" is out of range.");
        }
        if (attrConfig.setter) {
          attrConfig.setter.call(this, value, attr);
          return;
        }
      }
      this["_" + attr] = value;
    };

    Element.prototype._on = function(eventName, listener, alias, once) {
      var aliasMap, eventConfig, i, listenerRegistry, listeners;
      eventConfig = this.constructor.EVENTS[eventName];
      if (this._eventRegistry) {
        listenerRegistry = this._eventRegistry[eventName];
      } else {
        this._eventRegistry = {};
      }
      if (!listenerRegistry) {
        this._eventRegistry[eventName] = listenerRegistry = {};
      }
      if (once) {
        if (listenerRegistry.onceListeners == null) {
          listenerRegistry.onceListeners = [];
        }
        listenerRegistry.onceListeners.push(listener);
      }
      listeners = listenerRegistry.listeners;
      aliasMap = listenerRegistry.aliasMap;
      if (listeners) {
        if ((eventConfig != null ? eventConfig.singleListener : void 0) && listeners.length) {
          throw new cola.Exception("Multi listeners is not allowed for event \"" + eventName + "\".");
        }
        if (alias && (aliasMap != null ? aliasMap[alias] : void 0) > -1) {
          cola.off(eventName + ":" + alias);
        }
        listeners.push(listener);
        i = listeners.length - 1;
      } else {
        listenerRegistry.listeners = listeners = [listener];
        i = 0;
      }
      if (alias) {
        if (!aliasMap) {
          listenerRegistry.aliasMap = aliasMap = {};
        }
        aliasMap[alias] = i;
      }
    };

    Element.prototype.on = function(eventName, listener, once) {
      var alias, i;
      i = eventName.indexOf(":");
      if (i > 0) {
        alias = eventName.substring(i + 1);
        eventName = eventName.substring(0, i);
      }
      if (!this.constructor.EVENTS.hasOwnProperty(eventName)) {
        throw new cola.Exception("Unrecognized event \"" + eventName + "\".");
      }
      if (typeof listener !== "function") {
        throw new cola.Exception("Invalid event listener.");
      }
      this._on(eventName, listener, alias, once);
      return this;
    };

    Element.prototype.one = function(eventName, listener) {
      return this.on(eventName, listener, true);
    };

    Element.prototype._off = function(eventName, listener, alias) {
      var aliasMap, i, listenerRegistry, listeners, onceListeners;
      listenerRegistry = this._eventRegistry[eventName];
      if (!listenerRegistry) {
        return this;
      }
      listeners = listenerRegistry.listeners;
      if (!(listeners && listeners.length)) {
        return this;
      }
      i = -1;
      if (alias || listener) {
        if (alias) {
          aliasMap = listenerRegistry.aliasMap;
          i = aliasMap != null ? aliasMap[alias] : void 0;
          if (i > -1) {
            if (aliasMap != null) {
              delete aliasMap[alias];
            }
            listener = listeners[i];
            listeners.splice(i, 1);
          }
        } else if (listener) {
          i = listeners.indexOf(listener);
          if (i > -1) {
            listeners.splice(i, 1);
            aliasMap = listenerRegistry.aliasMap;
            if (aliasMap) {
              for (alias in aliasMap) {
                if (aliasMap[alias] === listener) {
                  delete aliasMap[alias];
                  break;
                }
              }
            }
          }
        }
        if (listenerRegistry.onceListeners && listener) {
          onceListeners = listenerRegistry.onceListeners;
          i = onceListeners.indexOf(listener);
          if (i > -1) {
            onceListeners.splice(i, 1);
            if (!onceListeners.length) {
              delete listenerRegistry.onceListeners;
            }
          }
        }
      } else {
        delete listenerRegistry.listeners;
        delete listenerRegistry.aliasMap;
      }
    };

    Element.prototype.off = function(eventName, listener) {
      var alias, i;
      if (!this._eventRegistry) {
        return this;
      }
      i = eventName.indexOf(":");
      if (i > 0) {
        alias = eventName.substring(i + 1);
        eventName = eventName.substring(0, i);
      }
      this._off(eventName, listener, alias);
      return this;
    };

    Element.prototype.getListeners = function(eventName) {
      var ref, ref1;
      return (ref = this._eventRegistry) != null ? (ref1 = ref[eventName]) != null ? ref1.listeners : void 0 : void 0;
    };

    Element.prototype.fire = function(eventName, self, arg) {
      var argsMode, l, len1, len2, listener, listenerRegistry, listeners, o, onceListeners, result, retValue;
      if (!this._eventRegistry) {
        return true;
      }
      listenerRegistry = this._eventRegistry[eventName];
      if (listenerRegistry) {
        listeners = listenerRegistry.listeners;
        if (listeners) {
          if (arg) {
            arg.model = this._scope;
          } else {
            arg = {
              model: this._scope
            };
          }
          for (l = 0, len1 = listeners.length; l < len1; l++) {
            listener = listeners[l];
            if (typeof listener === "function") {
              argsMode = listener._argsMode;
              if (!listener._argsMode) {
                argsMode = cola.util.parseListener(listener);
              }
              if (argsMode === 1) {
                retValue = listener.call(self, self, arg);
              } else {
                retValue = listener.call(self, arg, self);
              }
            } else if (typeof listener === "string") {
              retValue = (function(_this) {
                return function(self, arg) {
                  return eval(listener);
                };
              })(this)(self, arg);
            }
            if (retValue !== void 0) {
              result = retValue;
            }
            if (retValue === false) {
              break;
            }
          }
          if (listenerRegistry.onceListeners) {
            onceListeners = listenerRegistry.onceListeners.slice();
            delete listenerRegistry.onceListeners;
            for (o = 0, len2 = onceListeners.length; o < len2; o++) {
              listener = onceListeners[o];
              this.off(eventName, listener);
            }
          }
        }
      }
      return result;
    };

    return Element;

  })();

  cola.Definition = (function(superClass) {
    extend(Definition, superClass);

    function Definition(config) {
      var scope;
      if (config != null ? config.name : void 0) {
        this._name = config.name;
        delete config.name;
        scope = (config != null ? config.scope : void 0) || cola.currentScope;
        if (scope) {
          scope.data.regDefinition(this);
        }
      }
      Definition.__super__.constructor.call(this, config);
    }

    return Definition;

  })(cola.Element);


  /*
      Element Group
   */

  cola.Element.createGroup = function(elements, model) {
    var ele, l, len1, scope;
    if (model) {
      elements = [];
      for (l = 0, len1 = elements.length; l < len1; l++) {
        ele = elements[l];
        if (ele._scope && !ele._model) {
          scope = ele._scope;
          while (scope) {
            if (scope instanceof cola.Model) {
              ele._model = scope;
              break;
            }
            scope = scope.parent;
          }
        }
        if (ele._model === model) {
          elements.push(ele);
        }
      }
    } else {
      elements = elements ? elements.slice(0) : [];
    }
    elements.set = function(attr, value) {
      var element, len2, o;
      for (o = 0, len2 = elements.length; o < len2; o++) {
        element = elements[o];
        element.set(attr, value);
      }
      return this;
    };
    elements.on = function(eventName, listener) {
      var element, len2, o;
      for (o = 0, len2 = elements.length; o < len2; o++) {
        element = elements[o];
        element.on(eventName, listener);
      }
      return this;
    };
    elements.off = function(arg1) {
      var element, len2, o, string;
      string = arg1.eventName;
      for (o = 0, len2 = elements.length; o < len2; o++) {
        element = elements[o];
        element.off(eventName);
      }
      return this;
    };
    return elements;
  };


  /*
      Tag Manager
   */

  cola.tagManager = {
    registry: {},
    reg: function(tag, element) {
      var elements;
      elements = this.registry[tag];
      if (elements) {
        elements.push(element);
      } else {
        this.registry[tag] = [element];
      }
    },
    unreg: function(tag, element) {
      var elements, i;
      if (element) {
        elements = this.registry[tag];
        if (elements) {
          i = elements.indexOf(element);
          if (i > -1) {
            if (i === 0 && elements.length === 1) {
              delete this.registry[tag];
            } else {
              elements.splice(i, 1);
            }
          }
        }
      } else {
        delete this.registry[tag];
      }
    },
    find: function(tag) {
      return this.registry[tag];
    }
  };

  cola.tag = function(tag) {
    var elements;
    elements = cola.tagManager.find(tag);
    return cola.Element.createGroup(elements);
  };


  /*
      Type Registry
   */

  typeRegistry = {};

  cola.registerType = function(namespace, typeName, constructor) {
    var holder;
    holder = typeRegistry[namespace] || (typeRegistry[namespace] = {});
    holder[typeName] = constructor;
  };

  cola.registerTypeResolver = function(namespace, typeResolver) {
    var holder;
    holder = typeRegistry[namespace] || (typeRegistry[namespace] = {});
    if (holder._resolvers == null) {
      holder._resolvers = [];
    }
    holder._resolvers.push(typeResolver);
  };

  cola.resolveType = function(namespace, config, baseType) {
    var constructor, holder, l, len1, ref, resolver;
    constructor = null;
    holder = typeRegistry[namespace];
    if (holder) {
      constructor = holder[(config != null ? config.$type : void 0) || "_default"];
      if (!constructor && holder._resolvers) {
        ref = holder._resolvers;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          resolver = ref[l];
          constructor = resolver(config);
          if (constructor) {
            if (baseType && !cola.util.isCompatibleType(baseType, constructor)) {
              throw new cola.Exception("Incompatiable class type.");
            }
            break;
          }
        }
      }
      return constructor;
    }
  };

  cola.create = function(namespace, config, baseType) {
    var constr;
    if (typeof config === "string") {
      config = {
        $type: config
      };
    }
    constr = cola.resolveType(namespace, config, baseType);
    return new constr(config);
  };

  if (typeof exports !== "undefined" && exports !== null) {
    XDate = require("./../lib/xdate");
    cola = require("./base");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    XDate = this.XDate;
    cola = this.cola;
  }

  if (XDate) {
    if (typeof $ === "function") {
      $(function() {
        var localeStrings;
        XDate.defaultLocale = cola.setting("locale") || defaultLocale;
        XDate.locales[defaultLocale] = localeStrings = {};
        if (cola.i18n("cola.date.monthNames")) {
          localeStrings.monthNames = cola.i18n("cola.date.monthNames").split(",");
        }
        if (cola.i18n("cola.date.monthNamesShort")) {
          localeStrings.monthNamesShort = cola.i18n("cola.date.monthNamesShort").split(",");
        }
        if (cola.i18n("cola.date.dayNames")) {
          localeStrings.dayNames = cola.i18n("cola.date.dayNames").split(",");
        }
        if (cola.i18n("cola.date.dayNamesShort")) {
          localeStrings.dayNamesShort = cola.i18n("cola.date.dayNamesShort").split(",");
        }
        if (cola.i18n("cola.date.amDesignator")) {
          localeStrings.amDesignator = cola.i18n("cola.date.amDesignator");
        }
        if (cola.i18n("cola.date.pmDesignator")) {
          localeStrings.pmDesignator = cola.i18n("cola.date.pmDesignator");
        }
      });
    }
    XDate.parsers.push(function(str) {
      var c, dateStr, digit, digits, format, hasText, i, inQuota, l, len1, len2, o, part, parts, pattern, patterns, shouldReturn, start;
      if (str.indexOf("||") < 0) {
        return;
      }
      parts = str.split("||");
      format = parts[0];
      dateStr = parts[1];
      parts = {
        y: {
          len: 0,
          value: 1900
        },
        M: {
          len: 0,
          value: 1
        },
        d: {
          len: 0,
          value: 1
        },
        h: {
          len: 0,
          value: 0
        },
        m: {
          len: 0,
          value: 0
        },
        s: {
          len: 0,
          value: 0
        }
      };
      patterns = [];
      hasText = false;
      inQuota = false;
      i = 0;
      while (i < format.length) {
        c = format.charAt(i);
        if (c === "\"") {
          hasText = true;
          if (inQuota === c) {
            inQuota = false;
          } else if (!inQuota) {
            inQuota = c;
          }
        } else if (!inQuota && parts[c]) {
          if (parts[c].len === 0) {
            patterns.push(c);
          }
          parts[c].len++;
        } else {
          hasText = true;
        }
        i++;
      }
      shouldReturn = false;
      if (!hasText) {
        if (dateStr.match(/^\d{2,14}$/)) {
          shouldReturn = true;
          start = 0;
          for (l = 0, len1 = patterns.length; l < len1; l++) {
            pattern = patterns[l];
            part = parts[pattern];
            if (part.len) {
              digit = dateStr.substring(start, start + part.len);
              part.value = parseInt(digit, 10);
              start += part.len;
            }
          }
        }
      } else {
        digits = dateStr.split(/\D+/);
        if (digits[digits.length - 1] === "") {
          digits.splice(digits.length - 1, 1);
        }
        if (digits[0] === "") {
          digits.splice(0, 1);
        }
        if (patterns.length === digits.length) {
          shouldReturn = true;
          for (i = o = 0, len2 = patterns.length; o < len2; i = ++o) {
            pattern = patterns[i];
            parts[pattern].value = parseInt(digits[i], 10);
          }
        }
      }
      if (shouldReturn) {
        return new XDate(parts.y.value, parts.M.value - 1, parts.d.value, parts.h.value, parts.m.value, parts.s.value);
      } else {

      }
    });
  }

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./entity");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.convertor = {};

  cola.convertor["upper"] = function(value) {
    return value != null ? value.toUpperCase() : void 0;
  };

  cola.convertor["lower"] = function(value) {
    return value != null ? value.toLowerCase() : void 0;
  };

  cola.convertor["default"] = function(value, defaultValue) {
    if (defaultValue == null) {
      defaultValue = "";
    }
    if (value != null) {
      return value;
    } else {
      return defaultValue;
    }
  };

  _matchValue = function(value, propFilter) {
    if (propFilter.strict) {
      if (!propFilter.caseSensitive && typeof propFilter.value === "string") {
        return (value + "").toLowerCase() === propFilter.value;
      } else {
        return value === propFilter.value;
      }
    } else {
      if (!propFilter.caseSensitive) {
        return (value + "").toLowerCase().indexOf(propFilter.value) > -1;
      } else {
        return (value + "").indexOf(propFilter.value) > -1;
      }
    }
  };

  cola.convertor["filter"] = function() {
    var caseSensitive, collection, criteria, filtered, params, prop, propFilter;
    collection = arguments[0], criteria = arguments[1], params = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if (!(collection && criteria)) {
      return collection;
    }
    if (cola.util.isSimpleValue(criteria)) {
      caseSensitive = params[0];
      if (!caseSensitive) {
        criteria = (criteria + "").toLowerCase();
      }
      criteria = {
        "$": {
          value: criteria,
          caseSensitive: caseSensitive,
          strict: params[1]
        }
      };
    }
    if (typeof criteria === "object") {
      for (prop in criteria) {
        propFilter = criteria[prop];
        if (typeof propFilter === "string") {
          criteria[prop] = {
            value: propFilter.toLowerCase()
          };
        } else {
          if (cola.util.isSimpleValue(propFilter)) {
            criteria[prop] = {
              value: propFilter
            };
          }
          if (!propFilter.strict) {
            propFilter.value = propFilter.value ? propFilter.value + "" : "";
          }
          if (!propFilter.caseSensitive && typeof propFilter.value === "string") {
            propFilter.value = propFilter.value.toLowerCase();
          }
        }
      }
      filtered = [];
      cola.each(collection, function(item) {
        var data, matches, p, v;
        matches = false;
        if (cola.util.isSimpleValue(item)) {
          if (criteria.$) {
            matches = _matchValue(v, criteria.$);
          }
        } else {
          for (prop in criteria) {
            propFilter = criteria[prop];
            if (prop === "$") {
              if (item instanceof cola.Entity) {
                data = item._data;
              } else {
                data = item;
              }
              for (p in data) {
                v = data[p];
                if (_matchValue(v, propFilter)) {
                  matches = true;
                  break;
                }
              }
              if (matches) {
                break;
              }
            } else if (item instanceof cola.Entity) {
              if (_matchValue(item.get(prop), propFilter)) {
                matches = true;
                break;
              }
            } else {
              if (_matchValue(item[prop], propFilter)) {
                matches = true;
                break;
              }
            }
          }
        }
        if (matches) {
          filtered.push(item);
        }
      });
      return filtered;
    } else if (typeof criteria === "function") {
      filtered = [];
      cola.each(collection, function(item) {
        if (criteria.apply(null, [item].concat(slice.call(params)))) {
          filtered.push(item);
        }
      });
      return filtered;
    } else {
      return collection;
    }
  };

  _sortConvertor = function(collection, comparator, caseSensitive) {
    var c, comparatorFunc, comparatorProps, l, len1, part, prop, propDesc, ref;
    if (!collection) {
      return null;
    }
    if (collection instanceof cola.EntityList) {
      collection = collection.toArray();
    }
    if (comparator) {
      if (typeof comparator === "string") {
        comparatorProps = [];
        ref = comparator.split(",");
        for (l = 0, len1 = ref.length; l < len1; l++) {
          part = ref[l];
          c = part.charCodeAt(0);
          propDesc = false;
          if (c === 43) {
            prop = part.substring(1);
          } else if (c === 45) {
            prop = part.substring(1);
            propDesc = true;
          } else {
            prop = part;
          }
          comparatorProps.push({
            prop: prop,
            desc: propDesc
          });
        }
        comparator = function(item1, item2) {
          var comparatorProp, len2, o, result, value1, value2;
          for (o = 0, len2 = comparatorProps.length; o < len2; o++) {
            comparatorProp = comparatorProps[o];
            value1 = null;
            value2 = null;
            prop = comparatorProp.prop;
            if (prop) {
              if (prop === "$random") {
                return Math.random() * 2 - 1;
              } else {
                if (item1 instanceof cola.Entity) {
                  value1 = item1.get(prop);
                } else if (cola.util.isSimpleValue(item1)) {
                  value1 = item1;
                } else {
                  value1 = item1[prop];
                }
                if (!caseSensitive && typeof value1 === "string") {
                  value1 = value1.toLowerCase();
                }
                if (item2 instanceof cola.Entity) {
                  value2 = item2.get(prop);
                } else if (cola.util.isSimpleValue(item2)) {
                  value2 = item2;
                } else {
                  value2 = item2[prop];
                }
                if (!caseSensitive && typeof value2 === "string") {
                  value2 = value2.toLowerCase();
                }
                result = 0;
                if (value1 == null) {
                  result = -1;
                } else if (value2 == null) {
                  result = 1;
                } else if (value1 > value2) {
                  result = 1;
                } else if (value1 < value2) {
                  result = -1;
                }
                if (result !== 0) {
                  if (comparatorProp.desc) {
                    return 0 - result;
                  } else {
                    return result;
                  }
                }
              }
            } else {
              result = 0;
              if (item1 == null) {
                result = -1;
              } else if (item2 == null) {
                result = 1;
              } else if (item1 > item2) {
                result = 1;
              } else if (item1 < item2) {
                result = -1;
              }
              if (result !== 0) {
                if (comparatorProp.desc) {
                  return 0 - result;
                } else {
                  return result;
                }
              }
            }
          }
          return 0;
        };
      }
    } else if (comparator === "$none") {
      return collection;
    } else {
      comparator = function(item1, item2) {
        var result;
        result = 0;
        if (!caseSensitive) {
          if (typeof item1 === "string") {
            item1 = item1.toLowerCase();
          }
          if (typeof item2 === "string") {
            item2 = item2.toLowerCase();
          }
        }
        if (item1 == null) {
          result = -1;
        } else if (item2 == null) {
          result = 1;
        } else if (item1 > item2) {
          result = 1;
        } else if (item1 < item2) {
          result = -1;
        }
        return result;
      };
    }
    comparatorFunc = function(item1, item2) {
      return comparator(item1, item2);
    };
    return collection.sort(comparatorFunc);
  };

  cola.convertor["orderBy"] = _sortConvertor;

  cola.convertor["sort"] = _sortConvertor;

  cola.convertor["top"] = function(collection, top) {
    var i, items;
    if (top == null) {
      top = 1;
    }
    if (!collection) {
      return null;
    }
    items = [];
    i = 0;
    cola.each(collection, function(item) {
      i++;
      items.push(item);
      return i < top;
    });
    return items;
  };

  cola.convertor["date"] = function(date, format) {
    if (date == null) {
      return "";
    }
    if (!(date instanceof XDate)) {
      date = new XDate(date);
    }
    return date.toString(format);
  };

  cola.convertor["number"] = function(number, format) {
    if (number == null) {
      return "";
    }
    return formatNumber(format, number);
  };

  if (typeof exports !== "undefined" && exports !== null) {
    jsep = require("./../lib/jsep");
    cola = require("./element");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    jsep = this.jsep;
    cola = this.cola;
  }

  cola._compileText = function(text) {
    var expr, exprStr, p, parts, s;
    p = 0;
    s = 0;
    while ((s = text.indexOf("{{", p)) > -1) {
      exprStr = digestExpression(text, s + 2);
      if (exprStr) {
        if (s > p) {
          if (!parts) {
            parts = [];
          }
          parts.push(text.substring(p, s));
        }
        expr = cola._compileExpression(exprStr, exprStr.indexOf(" in ") > 0 ? "repeat" : void 0);
        if (!parts) {
          parts = [expr];
        } else {
          parts.push(expr);
        }
        p = s + exprStr.length + 4;
      } else {
        break;
      }
    }
    if (parts) {
      if (p < text.length - 1) {
        parts.push(text.substring(p));
      }
      return parts;
    } else {
      return null;
    }
  };

  digestExpression = function(text, p) {
    var c, endBracket, len, quota, s;
    s = p;
    len = text.length;
    endBracket = 0;
    while (p < len) {
      c = text.charCodeAt(p);
      if (c === 125 && !quota) {
        if (endBracket === 1) {
          return text.substring(s, p - 1);
        }
        endBracket++;
      } else {
        endBracket = 0;
        if (c === 39 || c === 34) {
          if (quota) {
            if (quota === c) {
              quota = false;
            }
          } else {
            quota = c;
          }
        }
      }
      p++;
    }
  };

  cola._compileExpression = function(exprStr, specialType) {
    var aliasName, exp, i, isStatic, j, l, last, len1, len2, o, oldParts, part, parts, path, pathStr, paths, ref;
    if (!exprStr) {
      return null;
    }
    if (exprStr.charCodeAt(0) === 61) {
      exprStr = exprStr.substring(1);
      isStatic = true;
    }
    i = exprStr.indexOf(" on ");
    if (i > 0) {
      pathStr = exprStr.substring(i + 4);
      exprStr = exprStr.substring(0, i);
      paths = [];
      ref = pathStr.split(",");
      for (l = 0, len1 = ref.length; l < len1; l++) {
        path = ref[l];
        path = cola.util.trim(path);
        if (!path) {
          continue;
        }
        if (path.indexOf(".") > 0) {
          parts = [];
          oldParts = path.split(".");
          last = oldParts.length - 1;
          for (j = o = 0, len2 = oldParts.length; o < len2; j = ++o) {
            part = oldParts[j];
            if (j < last && part.charCodeAt(0) !== 33) {
              part = "!" + part;
            }
            parts.push(part);
          }
          path = parts.join(".");
        }
        paths.push(path);
      }
    }
    if (specialType === "repeat") {
      i = exprStr.indexOf(" in ");
      if (i > 0) {
        aliasName = exprStr.substring(0, i);
        if (aliasName.match(cola.constants.VARIABLE_NAME_REGEXP)) {
          exprStr = exprStr.substring(i + 4);
          if (!exprStr) {
            return null;
          }
          exp = new cola.Expression(exprStr, true);
          exp.raw = aliasName + " in " + exp.raw;
          exp.repeat = true;
          exp.alias = aliasName;
        }
        if (!exp) {
          throw new cola.Exception("\"" + exprStr + "\" is not a valid expression.");
        }
      } else {
        exp = new cola.Expression(exprStr, true);
        exp.repeat = true;
        exp.alias = "item";
      }
    } else if (specialType === "alias") {
      i = exprStr.indexOf(" as ");
      if (i > 0) {
        aliasName = exprStr.substring(i + 4);
        if (aliasName && aliasName.match(cola.constants.VARIABLE_NAME_REGEXP)) {
          exprStr = exprStr.substring(0, i);
          if (!exprStr) {
            return null;
          }
          exp = new cola.Expression(exprStr, true);
          exp.raw = exp.raw + " as " + aliasName;
          exp.setAlias = true;
          exp.alias = aliasName;
        }
      }
      if (!exp) {
        throw new cola.Exception("\"" + exprStr + "\" should be a alias expression.");
      }
    } else {
      exp = new cola.Expression(exprStr, true);
    }
    if (isStatic) {
      exp.isStatic = true;
    }
    if (paths) {
      exp.path = paths;
    }
    return exp;
  };

  splitExpression = function(text, separator) {
    var c, i, len, p, part, parts, quota, separatorCharCode;
    separatorCharCode = separator.charCodeAt(0);
    parts = null;
    p = 0;
    i = 0;
    len = text.length;
    while (i < len) {
      c = text.charCodeAt(i);
      if (c === separatorCharCode && !quota) {
        part = text.substring(p, i);
        if (parts == null) {
          parts = [];
        }
        parts.push(cola.util.trim(part));
        p = i + 1;
      } else {
        if (c === 39 || c === 34) {
          if (quota) {
            if (quota === c) {
              quota = false;
            }
          } else {
            quota = c;
          }
        }
      }
      i++;
    }
    if (p < len) {
      part = text.substring(p);
      if (parts == null) {
        parts = [];
      }
      parts.push(cola.util.trim(part));
    }
    return parts;
  };

  compileConvertor = function(text) {
    var bindStr, convertor, expr, i, l, len1, len2, o, params, part, parts, path, ref;
    parts = splitExpression(text, ":");
    if (parts == null) {
      parts = [text];
    }
    convertor = {
      name: parts[0],
      params: []
    };
    params = convertor.params;
    if (convertor.name === "watch") {
      bindStr = parts[1];
      if (!bindStr) {
        return null;
      }
      ref = bindStr.split(",");
      for (l = 0, len1 = ref.length; l < len1; l++) {
        path = ref[l];
        params.push(cola.util.trim(path));
      }
    } else {
      if (parts.length > 1) {
        for (i = o = 0, len2 = parts.length; o < len2; i = ++o) {
          part = parts[i];
          if (i === 0) {
            continue;
          }
          expr = new cola.Expression(part);
          params.push(expr);
        }
      }
    }
    return convertor;
  };

  cola.Expression = (function() {
    function Expression(exprStr, supportConvertor) {
      var convertor, i, l, len1, len2, len3, mainExprCompiled, o, param, part, parts, q, ref, ref1, subPath;
      this.raw = exprStr;
      if (supportConvertor) {
        i = exprStr.indexOf("|");
        if ((0 < i && i < (exprStr.length - 1))) {
          parts = splitExpression(exprStr, "|");
          if ((parts != null ? parts.length : void 0) > 1) {
            this.convertors = [];
            for (i = l = 0, len1 = parts.length; l < len1; i = ++l) {
              part = parts[i];
              if (i === 0) {
                this.compile(part);
                mainExprCompiled = true;
              } else {
                convertor = compileConvertor(part);
                if (convertor) {
                  if (convertor.name === "watch") {
                    this.watch = convertor.params[0];
                  } else {
                    this.convertors.push(convertor);
                  }
                }
              }
            }
          }
        }
      }
      if (!mainExprCompiled) {
        this.compile(exprStr);
      }
      if (this.watch) {
        this.path = this.watch;
      } else if (supportConvertor && this.convertors) {
        subPath = null;
        ref = this.convertors;
        for (o = 0, len2 = ref.length; o < len2; o++) {
          convertor = ref[o];
          ref1 = convertor.params;
          for (q = 0, len3 = ref1.length; q < len3; q++) {
            param = ref1[q];
            if (param instanceof cola.Expression && param.path) {
              if (subPath == null) {
                subPath = [];
              }
              subPath = subPath.concat(param.path);
            }
          }
        }
        if (subPath) {
          if (!this.path) {
            this.path = subPath;
          } else if (typeof this.path === "string") {
            this.path = [this.path].concat(subPath);
          } else {
            this.path = this.path.concat(subPath);
          }
        }
      }
    }

    Expression.prototype.compile = function(exprStr) {
      var parts, stringify, stringifyMemberExpression, tree;
      stringifyMemberExpression = function(node, parts, context) {
        var type;
        type = node.type;
        if (type === "Identifier") {
          parts.push(node.name);
        } else {
          stringifyMemberExpression(node.object, parts, context);
          parts.push(node.property.name);
        }
      };
      stringify = function(node, parts, context) {
        var argument, element, i, l, len1, len2, o, path, pathPart, ref, ref1, ref2, type;
        type = node.type;
        switch (type) {
          case "MemberExpression":
          case "Identifier":
            pathPart = [];
            stringifyMemberExpression(node, pathPart, context);
            path = pathPart.join(".");
            if (!context.path) {
              context.path = path;
            } else if (typeof context.path === "string") {
              context.path = [context.path, path];
            } else {
              context.path.push(path);
            }
            parts.push("_getData(scope,'");
            parts.push(path);
            parts.push("',loadMode,dataCtx)");
            break;
          case "CallExpression":
            context.hasCallStatement = true;
            parts.push("scope.action(\"");
            stringifyMemberExpression(node.callee, parts, context);
            parts.push("\")(");
            if ((ref = node["arguments"]) != null ? ref.length : void 0) {
              ref1 = node["arguments"];
              for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
                argument = ref1[i];
                if (i > 0) {
                  parts.push(",");
                }
                stringify(argument, parts, context);
              }
            }
            parts.push(")");
            break;
          case "Literal":
            parts.push(node.raw);
            break;
          case "BinaryExpression":
          case "LogicalExpression":
            parts.push("(");
            stringify(node.left, parts, context);
            parts.push(node.operator);
            stringify(node.right, parts, context);
            parts.push(")");
            break;
          case "ThisExpression":
            parts.push("scope");
            break;
          case "UnaryExpression":
            parts.push(node.operator);
            stringify(node.argument, parts, context);
            break;
          case "ConditionalExpression":
            parts.push("(");
            stringify(node.test, parts, context);
            parts.push("?");
            stringify(node.consequent, parts, context);
            parts.push(":");
            stringify(node.alternate, parts, context);
            parts.push(")");
            break;
          case "ArrayExpression":
            parts.push("[");
            ref2 = node.elements;
            for (i = o = 0, len2 = ref2.length; o < len2; i = ++o) {
              element = ref2[i];
              if (i > 0) {
                parts.push(",");
              }
              stringify(element, parts, context);
            }
            parts.push("]");
        }
      };
      tree = jsep(exprStr);
      this.type = tree.type;
      parts = [];
      stringify(tree, parts, this);
      return this.expression = parts.join("");
    };

    Expression.prototype.evaluate = function(scope, loadMode, dataCtx) {
      var args, convertor, convertorDef, l, len1, len2, o, paramExpr, paramValue, ref, ref1, retValue;
      retValue = eval(this.expression);
      if (retValue instanceof cola.Entity || retValue instanceof cola.EntityList) {
        if (dataCtx != null) {
          dataCtx.path = retValue.getPath();
        }
      }
      if (this.convertors) {
        if (dataCtx != null) {
          dataCtx.originData = retValue;
        }
        ref = this.convertors;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          convertorDef = ref[l];
          convertor = cola.convertor[convertorDef.name];
          if (convertor) {
            args = [retValue];
            ref1 = convertorDef.params;
            for (o = 0, len2 = ref1.length; o < len2; o++) {
              paramExpr = ref1[o];
              paramValue = paramExpr.evaluate(scope, "never");
              args.push(paramValue);
            }
            retValue = convertor.apply(null, args);
          } else {
            throw new cola.Exception("Unknown convert \"" + convertorDef.name + "\".");
          }
        }
      }
      return retValue;
    };

    Expression.prototype.toString = function() {
      return this.expression;
    };

    return Expression;

  })();

  _getData = function(scope, path, loadMode, dataCtx) {
    var retValue;
    retValue = scope.get(path, loadMode, dataCtx);
    if (retValue === void 0 && (dataCtx != null ? dataCtx.vars : void 0)) {
      retValue = dataCtx.vars[path];
    }
    return retValue;
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./ajax");
    cola = require("./element");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.AjaxServiceInvoker = (function() {
    function AjaxServiceInvoker(ajaxService1, invokerOptions1) {
      this.ajaxService = ajaxService1;
      this.invokerOptions = invokerOptions1;
      this.callbacks = [];
    }

    AjaxServiceInvoker.prototype.invokeCallback = function(success, result) {
      var callback, callbacks, l, len1;
      this.invoking = false;
      callbacks = this.callbacks;
      this.callbacks = [];
      for (l = 0, len1 = callbacks.length; l < len1; l++) {
        callback = callbacks[l];
        cola.callback(callback, success, result);
      }
    };

    AjaxServiceInvoker.prototype._internalInvoke = function(async) {
      var ajaxService, invokerOptions, options, p, retValue, v;
      if (async == null) {
        async = true;
      }
      ajaxService = this.ajaxService;
      invokerOptions = this.invokerOptions;
      retValue = void 0;
      options = {};
      for (p in invokerOptions) {
        v = invokerOptions[p];
        options[p] = v;
      }
      options.async = async;
      if (options.sendJson) {
        options.data = JSON.stringify(options.data);
      }
      if (ajaxService.getListeners("beforeSend")) {
        if (ajaxService.fire("beforeSend", ajaxService, {
          options: options
        }) === false) {
          return;
        }
      }
      jQuery.ajax(options).done((function(_this) {
        return function(result) {
          _this.invokeCallback(true, result);
          if (ajaxService.getListeners("success")) {
            ajaxService.fire("success", ajaxService, {
              options: options,
              result: result
            });
          }
          if (ajaxService.getListeners("complete")) {
            ajaxService.fire("complete", ajaxService, {
              success: true,
              options: options,
              result: result
            });
          }
          retValue = result;
        };
      })(this)).fail((function(_this) {
        return function(xhr) {
          var error;
          error = xhr.responseJSON;
          _this.invokeCallback(false, error);
          ajaxService.fire("error", ajaxService, {
            options: options,
            xhr: xhr,
            error: error
          });
          ajaxService.fire("complete", ajaxService, {
            success: false,
            options: options,
            xhr: xhr,
            error: error
          });
        };
      })(this));
      return retValue;
    };

    AjaxServiceInvoker.prototype.invokeAsync = function(callback) {
      this.callbacks.push(callback);
      if (this.invoking) {
        return false;
      }
      this.invoking = true;
      this._internalInvoke();
      return true;
    };

    AjaxServiceInvoker.prototype.invokeSync = function(callback) {
      if (this.invoking) {
        throw new cola.Exception("Cannot perform synchronized request during an asynchronized request executing. [" + this.url + "]");
      }
      this.callbacks.push(callback);
      return this._internalInvoke(false);
    };

    return AjaxServiceInvoker;

  })();

  cola.AjaxService = (function(superClass) {
    extend(AjaxService, superClass);

    AjaxService.ATTRIBUTES = {
      url: null,
      sendJson: null,
      method: null,
      parameter: null,
      ajaxOptions: null
    };

    AjaxService.EVENTS = {
      beforeSend: null,
      complete: null,
      success: null,
      error: null
    };

    function AjaxService(config) {
      if (typeof config === "string") {
        config = {
          url: config
        };
      }
      AjaxService.__super__.constructor.call(this, config);
    }

    AjaxService.prototype.getUrl = function() {
      return this._url;
    };

    AjaxService.prototype.getInvokerOptions = function(context) {
      var ajaxOptions, options, p, v;
      options = {};
      ajaxOptions = this._ajaxOptions;
      if (ajaxOptions) {
        for (p in ajaxOptions) {
          v = ajaxOptions[p];
          options[p] = v;
        }
      }
      options.url = this.getUrl(context);
      options.data = this._parameter;
      options.sendJson = this._sendJson;
      if (options.sendJson && !options.method) {
        options.method = "post";
      }
      return options;
    };

    AjaxService.prototype.getInvoker = function(context) {
      return new cola.AjaxServiceInvoker(this, this.getInvokerOptions(context));
    };

    return AjaxService;

  })(cola.Definition);

  cola.Provider = (function(superClass) {
    extend(Provider, superClass);

    function Provider() {
      return Provider.__super__.constructor.apply(this, arguments);
    }

    Provider.ATTRIBUTES = {
      pageSize: null
    };

    Provider.prototype._evalParamValue = function(expr, context) {
      if (expr.charCodeAt(0) === 58) {
        if (context) {
          return cola.Entity._evalDataPath(context, expr.substring(1), true, "never");
        } else {
          return null;
        }
      } else {
        return expr;
      }
    };

    Provider.prototype.getUrl = function(context) {
      var l, len1, part, parts, ref, url;
      url = this._url;
      if (url.indexOf(":") > -1) {
        parts = [];
        ref = url.split("/");
        for (l = 0, len1 = ref.length; l < len1; l++) {
          part = ref[l];
          parts.push(this._evalParamValue(part, context));
        }
        url = parts.join("/");
      }
      return url;
    };

    Provider.prototype.getInvokerOptions = function(context) {
      var data, oldParameter, options, p, parameter, v;
      options = Provider.__super__.getInvokerOptions.call(this, context);
      parameter = options.data;
      if (parameter != null) {
        if (typeof parameter === "string") {
          parameter = this._evalParamValue(parameter, context);
        } else if (typeof parameter === "object") {
          oldParameter = parameter;
          parameter = {};
          for (p in oldParameter) {
            v = oldParameter[p];
            if (typeof v === "string") {
              v = this._evalParamValue(v, context);
            }
            parameter[p] = v;
          }
        }
      }
      data = {};
      if (this._pageSize > 1) {
        data.from = 0;
        data.limit = this._pageSize;
      }
      if (parameter != null) {
        data.parameter = parameter;
      }
      options.data = data;
      return options;
    };

    return Provider;

  })(cola.AjaxService);

  cola.Resolver = (function(superClass) {
    extend(Resolver, superClass);

    function Resolver() {
      return Resolver.__super__.constructor.apply(this, arguments);
    }

    Resolver.ATTRIBUTES = {
      sendJson: {
        defaultValue: true
      }
    };

    return Resolver;

  })(cola.AjaxService);

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./element");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  cola.registerTypeResolver("validator", function(config) {
    if (!(config && config.$type)) {
      return;
    }
    return cola[cola.util.capitalize(config.$type) + "Validator"];
  });

  cola.registerTypeResolver("validator", function(config) {
    if (typeof config === "function") {
      return cola.CustomValidator;
    }
  });

  cola.Validator = (function(superClass) {
    extend(Validator, superClass);

    function Validator() {
      return Validator.__super__.constructor.apply(this, arguments);
    }

    Validator.ATTRIBUTES = {
      message: null,
      messageType: {
        defaultValue: "error",
        "enum": ["error", "warning", "info"]
      },
      disabled: null,
      validateEmptyValue: null
    };

    Validator.prototype._getDefaultMessage = function(data) {
      return "\"" + data + "\" is not a valid value.";
    };

    Validator.prototype._parseValidResult = function(result, data) {
      var text;
      if (typeof result === "boolean") {
        if (result) {
          result = null;
        } else {
          text = this._message;
          if (text == null) {
            text = this._getDefaultMessage(data);
          }
          result = {
            type: this._messageType,
            text: text
          };
        }
      } else if (result && typeof result === "string") {
        result = {
          type: this._messageType,
          text: result
        };
      }
      return result;
    };

    Validator.prototype.validate = function(data) {
      var result;
      if (!this._validateEmptyValue) {
        if (!((data != null) && data !== "")) {
          return;
        }
      }
      result = this._validate(data);
      return this._parseValidResult(result, data);
    };

    return Validator;

  })(cola.Definition);

  cola.RequiredValidator = (function(superClass) {
    extend(RequiredValidator, superClass);

    function RequiredValidator() {
      return RequiredValidator.__super__.constructor.apply(this, arguments);
    }

    RequiredValidator.ATTRIBUTES = {
      validateEmptyValue: {
        defaultValue: true
      },
      trim: {
        defaultValue: true
      }
    };

    RequiredValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.required", data);
    };

    RequiredValidator.prototype._validate = function(data) {
      if (!(typeof data === "string")) {
        return data != null;
      }
      if (this._trim) {
        data = cola.util.trim(data);
      }
      return !!data;
    };

    return RequiredValidator;

  })(cola.Validator);

  cola.NumberValidator = (function(superClass) {
    extend(NumberValidator, superClass);

    function NumberValidator() {
      return NumberValidator.__super__.constructor.apply(this, arguments);
    }

    NumberValidator.ATTRIBUTES = {
      min: null,
      minInclude: {
        defaultValue: true
      },
      max: null,
      maxInclude: {
        defaultValue: true
      }
    };

    NumberValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.number", data);
    };

    NumberValidator.prototype._validate = function(data) {
      var result;
      result = true;
      if (this._min != null) {
        result = this._minInclude ? data >= this._min : data > this._min;
      }
      if (result && (this._max != null)) {
        result = this._maxInclude ? data <= this._max : data < this._max;
      }
      return result;
    };

    return NumberValidator;

  })(cola.Validator);

  cola.LengthValidator = (function(superClass) {
    extend(LengthValidator, superClass);

    function LengthValidator() {
      return LengthValidator.__super__.constructor.apply(this, arguments);
    }

    LengthValidator.ATTRIBUTES = {
      min: null,
      max: null
    };

    LengthValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.length", data);
    };

    LengthValidator.prototype._validate = function(data) {
      var len, result;
      if (typeof data === "string" || typeof data === "number") {
        result = true;
        len = (data + "").length;
        if (this._min != null) {
          result = len >= this._min;
        }
        if (result && (this._max != null)) {
          result = len <= this._max;
        }
        return result;
      }
      return true;
    };

    return LengthValidator;

  })(cola.Validator);

  cola.RegExpValidator = (function(superClass) {
    extend(RegExpValidator, superClass);

    function RegExpValidator() {
      return RegExpValidator.__super__.constructor.apply(this, arguments);
    }

    RegExpValidator.ATTRIBUTES = {
      regExp: null,
      mode: {
        defaultValue: "white",
        "enum": ["white", "black"]
      }
    };

    RegExpValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.regExp", data);
    };

    RegExpValidator.prototype._validate = function(data) {
      var regExp, result;
      regExp = this._regExp;
      if (regExp && typeof data === "string") {
        if (!regExp instanceof RegExp) {
          regExp = new RegExp(regExp);
        }
        result = true;
        result = !!data.match(regExp);
        if (this._mode === "black") {
          result = !result;
        }
        return result;
      }
      return true;
    };

    return RegExpValidator;

  })(cola.Validator);

  cola.EmailValidator = (function(superClass) {
    extend(EmailValidator, superClass);

    function EmailValidator() {
      return EmailValidator.__super__.constructor.apply(this, arguments);
    }

    EmailValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.email", data);
    };

    EmailValidator.prototype._validate = function(data) {
      if (typeof data === "string") {
        return !!data.match(/^[a-z]([a-z0-9]*[-_\.]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i);
      }
      return true;
    };

    return EmailValidator;

  })(cola.Validator);

  cola.UrlValidator = (function(superClass) {
    extend(UrlValidator, superClass);

    function UrlValidator() {
      return UrlValidator.__super__.constructor.apply(this, arguments);
    }

    UrlValidator.prototype._getDefaultMessage = function(data) {
      return cola.i18n("cola.validator.error.email", data);
    };

    UrlValidator.prototype._validate = function(data) {
      if (typeof data === "string") {
        return !!data.match(/^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/i);
      }
      return true;
    };

    return UrlValidator;

  })(cola.Validator);

  cola.AsyncValidator = (function(superClass) {
    extend(AsyncValidator, superClass);

    function AsyncValidator() {
      return AsyncValidator.__super__.constructor.apply(this, arguments);
    }

    AsyncValidator.ATTRIBUTES = {
      async: {
        defaultValue: true
      }
    };

    AsyncValidator.prototype.validate = function(data, callback) {
      var result;
      if (!this._validateEmptyValue) {
        if (!((data != null) && data !== "")) {
          return;
        }
      }
      if (this._async) {
        result = this._validate(data, {
          complete: (function(_this) {
            return function(success, result) {
              if (success) {
                result = _this._parseValidResult(result);
              }
              cola.callback(callback, success, result);
            };
          })(this)
        });
      } else {
        result = this._validate(data);
        result = this._parseValidResult(result);
        cola.callback(callback, true, result);
      }
      return result;
    };

    return AsyncValidator;

  })(cola.Validator);

  cola.AjaxValidator = (function(superClass) {
    extend(AjaxValidator, superClass);

    function AjaxValidator() {
      return AjaxValidator.__super__.constructor.apply(this, arguments);
    }

    AjaxValidator.ATTRIBUTES = {
      url: null,
      sendJson: null,
      method: null,
      ajaxOptions: null,
      data: null
    };

    AjaxValidator.prototype._validate = function(data, callback) {
      var ajaxOptions, invoker, options, p, realSendData, sendData, v;
      sendData = this._data;
      if ((sendData == null) || sendData === ":data") {
        sendData = data;
      } else if (typeof sendData === "object") {
        realSendData = {};
        for (p in sendData) {
          v = sendData[p];
          if (v === ":data") {
            v = data;
          }
          realSendData[p] = v;
        }
        sendData = realSendData;
      }
      options = {};
      ajaxOptions = this._ajaxOptions;
      if (ajaxOptions) {
        for (p in ajaxOptions) {
          v = ajaxOptions[p];
          options[p] = v;
        }
      }
      options.async = !!callback;
      options.url = this._url;
      options.data = sendData;
      options.sendJson = this._sendJson;
      options.method = this._method;
      if (options.sendJson && !options.method) {
        options.method = "post";
      }
      invoker = new cola.AjaxServiceInvoker(this, options);
      if (callback) {
        return invoker.invokeAsync(callback);
      } else {
        return invoker.invokeSync();
      }
    };

    return AjaxValidator;

  })(cola.AsyncValidator);

  cola.CustomValidator = (function(superClass) {
    extend(CustomValidator, superClass);

    CustomValidator.ATTRIBUTES = {
      validateEmptyValue: {
        defaultValue: true
      },
      func: null
    };

    function CustomValidator(config) {
      if (typeof config === "function") {
        CustomValidator.__super__.constructor.call(this);
        this.set({
          func: config,
          async: cola.util.parseFunctionArgs(config).length > 1
        });
      } else {
        CustomValidator.__super__.constructor.call(this, config);
      }
    }

    CustomValidator.prototype._validate = function(data, callback) {
      if (callback) {
        if (this._func) {
          this._func(data, callback);
        } else {
          cola.callback(callback, true);
        }
      } else {
        return typeof this._func === "function" ? this._func(data) : void 0;
      }
    };

    return CustomValidator;

  })(cola.AsyncValidator);

  if (typeof exports !== "undefined" && exports !== null) {
    XDate = require("./../lib/xdate");
    cola = require("./expression");
    require("./date");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    XDate = this.XDate;
    cola = this.cola;
  }

  cola.DataType = (function(superClass) {
    extend(DataType, superClass);

    function DataType() {
      return DataType.__super__.constructor.apply(this, arguments);
    }

    DataType.ATTRIBUTES = {
      name: {
        readOnlyAfterCreate: true
      }
    };

    return DataType;

  })(cola.Definition);

  cola.BaseDataType = (function(superClass) {
    extend(BaseDataType, superClass);

    function BaseDataType() {
      return BaseDataType.__super__.constructor.apply(this, arguments);
    }

    return BaseDataType;

  })(cola.DataType);

  cola.StringDataType = (function(superClass) {
    extend(StringDataType, superClass);

    function StringDataType() {
      return StringDataType.__super__.constructor.apply(this, arguments);
    }

    StringDataType.prototype.toText = function(value) {
      if (value != null) {
        return value + "";
      } else {
        return "";
      }
    };

    StringDataType.prototype.parse = function(text) {
      return text;
    };

    return StringDataType;

  })(cola.BaseDataType);

  cola.NumberDataType = (function(superClass) {
    extend(NumberDataType, superClass);

    function NumberDataType() {
      return NumberDataType.__super__.constructor.apply(this, arguments);
    }

    NumberDataType.ATTRIBUTES = {
      isInteger: null
    };

    NumberDataType.prototype.parse = function(text) {
      var n;
      if (!text) {
        return 0;
      }
      if (typeof text === "number") {
        if (this._isInteger) {
          return Math.round(text);
        } else {
          return text;
        }
      }
      if (this._isInteger) {
        n = Math.round(parseInt(text, 10));
      } else {
        n = parseFloat(text, 10);
      }
      if (isNaN(n)) {
        return 0;
      } else {
        return n;
      }
    };

    return NumberDataType;

  })(cola.BaseDataType);

  cola.BooleanDataType = (function(superClass) {
    extend(BooleanDataType, superClass);

    function BooleanDataType() {
      return BooleanDataType.__super__.constructor.apply(this, arguments);
    }

    BooleanDataType.prototype.parse = function(text) {
      if (!text) {
        return false;
      }
      if (typeof text === "boolean") {
        return text;
      }
      if (["true", "on", "yes", "y", "1"].indexOf((text + "").toLowerCase()) > -1) {
        return true;
      }
      return false;
    };

    return BooleanDataType;

  })(cola.BaseDataType);

  cola.DateDataType = (function(superClass) {
    extend(DateDataType, superClass);

    function DateDataType() {
      return DateDataType.__super__.constructor.apply(this, arguments);
    }

    DateDataType.prototype.parse = function(text) {
      var xDate;
      if (!text) {
        return new Date(NaN);
      }
      xDate = new XDate(text);
      return xDate.toDate();
    };

    return DateDataType;

  })(cola.BaseDataType);

  cola.JSONDataType = (function(superClass) {
    extend(JSONDataType, superClass);

    function JSONDataType() {
      return JSONDataType.__super__.constructor.apply(this, arguments);
    }

    JSONDataType.prototype.toText = function(value) {
      return JSON.stringify(value);
    };

    JSONDataType.prototype.parse = function(text) {
      return JSON.parse(text);
    };

    return JSONDataType;

  })(cola.DataType);


  /*
  EntityDataType
   */

  cola.EntityDataType = (function(superClass) {
    extend(EntityDataType, superClass);

    EntityDataType.ATTRIBUTES = {
      readOnly: null,
      properties: {
        setter: function(properties) {
          var config, l, len1, property, results, results1;
          this._properties.clear();
          if (properties instanceof Array) {
            results = [];
            for (l = 0, len1 = properties.length; l < len1; l++) {
              property = properties[l];
              results.push(this.addProperty(property));
            }
            return results;
          } else {
            results1 = [];
            for (property in properties) {
              config = properties[property];
              if (config) {
                if (!(config instanceof cola.Property)) {
                  config.property = property;
                }
                results1.push(this.addProperty(config));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }
        }
      }
    };

    EntityDataType.EVENTS = {
      beforeCurrentChange: null,
      currentChange: null,
      beforeDataChange: null,
      dataChange: null,
      beforeEntityInsert: null,
      entityInsert: null,
      beforeEntityDelete: null,
      entityDelete: null
    };

    function EntityDataType(config) {
      this._properties = new cola.util.KeyedArray();
      EntityDataType.__super__.constructor.call(this, config);
    }

    EntityDataType.prototype.addProperty = function(property) {
      if (!(property instanceof cola.Property)) {
        if (typeof property === "string") {
          property = new cola.BaseProperty({
            property: property
          });
        } else if (typeof property.compute === "function") {
          property = new cola.ComputeProperty(property);
        } else {
          property = new cola.BaseProperty(property);
        }
      } else if (property._owner && property._owner !== this) {
        throw new cola.Exception("Property(" + property._property + ") is already belongs to anthor DataType.");
      }
      if (this._properties.get(property._property)) {
        this.removeProperty(property._property);
      }
      this._properties.add(property._property, property);
      property._owner = this;
      return property;
    };

    EntityDataType.prototype.removeProperty = function(property) {
      if (property instanceof cola.Property) {
        this._properties.remove(property._property);
      } else {
        property = this._properties.remove(property);
      }
      delete property._owner;
      return property;
    };

    EntityDataType.prototype.getProperty = function(path) {
      var i, part1, part2, prop;
      i = path.indexOf(".");
      if (i > 0) {
        part1 = path.substring(0, i);
        part2 = path.substring(i + 1);
        prop = this._getProperty(part1);
        if (prop != null ? prop._dataType : void 0) {
          return prop != null ? prop._dataType.getProperty(part2) : void 0;
        }
      } else {
        return this._getProperty(path);
      }
    };

    EntityDataType.prototype._getProperty = function(property) {
      return this._properties.get(property);
    };

    EntityDataType.prototype.getProperties = function() {
      return this._properties;
    };

    return EntityDataType;

  })(cola.DataType);

  cola.DataType.dataTypeSetter = function(dataType) {
    var name, scope;
    if (typeof dataType === "string") {
      name = dataType;
      scope = this._scope;
      if (scope) {
        dataType = scope.dataType(name);
      } else {
        dataType = cola.DataType.defaultDataTypes[name];
      }
      if (!dataType) {
        throw new cola.Exception("Unrecognized DataType \"" + name + "\".");
      }
    } else if ((dataType != null) && !(dataType instanceof cola.DataType)) {
      dataType = new cola.EntityDataType(dataType);
    }
    this._dataType = dataType || null;
  };

  cola.Property = (function(superClass) {
    extend(Property, superClass);

    Property.ATTRIBUTES = {
      property: {
        readOnlyAfterCreate: true
      },
      name: {
        readOnlyAfterCreate: true,
        setter: function(name) {
          this._name = name;
          if (this._property == null) {
            this._property = name;
          }
        }
      },
      owner: {
        readOnly: true
      },
      caption: null,
      dataType: {
        setter: cola.DataType.dataTypeSetter
      },
      description: null
    };

    function Property(config) {
      Property.__super__.constructor.call(this, config);
    }

    return Property;

  })(cola.Definition);

  cola.BaseProperty = (function(superClass) {
    extend(BaseProperty, superClass);

    function BaseProperty() {
      return BaseProperty.__super__.constructor.apply(this, arguments);
    }

    BaseProperty.ATTRIBUTES = {
      provider: {
        setter: function(provider) {
          if ((provider != null) && !(provider instanceof cola.Provider)) {
            provider = new cola.Provider(provider);
          }
          this._provider = provider;
        }
      },
      defaultValue: null,
      readOnly: null,
      required: null,
      aggregated: {
        readOnlyAfterCreate: true
      },
      validators: {
        setter: function(validators) {
          var addValidator, l, len1, validator;
          addValidator = (function(_this) {
            return function(validator) {
              if (!(validator instanceof cola.Validator)) {
                validator = cola.create("validator", validator, cola.Validator);
              }
              _this._validators.push(validator);
              if (validator instanceof cola.RequiredValidator && !_this._required) {
                _this._required = true;
              }
            };
          })(this);
          delete this._validators;
          if (validators) {
            this._validators = [];
            if (typeof validators === "string") {
              validator = cola.create("validator", validators, cola.Validator);
              addValidator(validator);
            } else if (validators instanceof Array) {
              for (l = 0, len1 = validators.length; l < len1; l++) {
                validator = validators[l];
                addValidator(validator);
              }
            } else {
              addValidator(validators);
            }
          }
        }
      },
      rejectInvalidValue: null
    };

    BaseProperty.EVENTS = {
      beforeWrite: null,
      write: null,
      beforeLoad: null,
      loaded: null
    };

    return BaseProperty;

  })(cola.Property);

  cola.ComputeProperty = (function(superClass) {
    extend(ComputeProperty, superClass);

    function ComputeProperty() {
      return ComputeProperty.__super__.constructor.apply(this, arguments);
    }

    ComputeProperty.ATTRIBUTES = {
      delay: null,
      watchingDataPath: null
    };

    ComputeProperty.EVENTS = {
      compute: {
        singleListener: true
      }
    };

    ComputeProperty.prototype.compute = function(entity) {
      return this.fire("compute", this, {
        entity: entity
      });
    };

    return ComputeProperty;

  })(cola.Property);

  cola.DataType.jsonToEntity = function(json, dataType, aggregated) {
    var entityList;
    if (aggregated === void 0) {
      if (json instanceof Array) {
        aggregated = true;
      } else if (typeof json === "object" && json.hasOwnProperty("$data")) {
        aggregated = json.$data instanceof Array;
      } else {
        aggregated = false;
      }
    }
    if (aggregated) {
      entityList = new cola.EntityList(dataType);
      entityList.fillData(json);
      return entityList;
    } else {
      if (json instanceof Array) {
        throw new cola.Exception("Unmatched DataType. expect \"Object\" but \"Array\".");
      }
      return new cola.Entity(dataType, json);
    }
  };

  cola.DataType.jsonToData = function(json, dataType, aggregated) {
    var result;
    if (dataType instanceof cola.StringDataType && typeof json !== "string" || dataType instanceof cola.BooleanDataType && typeof json !== "boolean" || dataType instanceof cola.NumberDataType && typeof json !== "number" || dataType instanceof cola.DateDataType && !(json instanceof Date)) {
      result = dataType.parse(json);
    } else if (dataType instanceof cola.EntityDataType) {
      result = cola.DataType.jsonToEntity(json, dataType, aggregated);
    } else if (dataType && typeof json === "object") {
      result = dataType.parse(json);
    } else {
      result = json;
    }
    return result;
  };

  cola.DataType.defaultDataTypes = defaultDataTypes = {
    "string": new cola.StringDataType({
      name: "string"
    }),
    "int": new cola.NumberDataType({
      name: "int",
      isInteger: true
    }),
    "float": new cola.NumberDataType({
      name: "float"
    }),
    "boolean": new cola.BooleanDataType({
      name: "boolean"
    }),
    "date": new cola.DateDataType({
      name: "date"
    }),
    "json": new cola.JSONDataType({
      name: "json"
    }),
    "entity": new cola.EntityDataType({
      name: "entity"
    })
  };

  defaultDataTypes["number"] = defaultDataTypes["int"];

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./data-type");
    require("./service");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  getEntityPath = function(markNoncurrent) {
    var lastEntity, parent, part, path, self;
    if (!markNoncurrent && this._pathCache) {
      return this._pathCache;
    }
    parent = this._parent;
    if (parent == null) {
      return;
    }
    path = [];
    self = this;
    while (parent != null) {
      if (parent instanceof _EntityList) {
        lastEntity = self;
      }
      part = self._parentProperty;
      if (part) {
        if (markNoncurrent && self instanceof _EntityList) {
          if (markNoncurrent === "always" || lastEntity && self.current !== lastEntity) {
            path.push("!" + part);
          } else {
            path.push(part);
          }
        } else {
          path.push(part);
        }
      }
      self = parent;
      parent = parent._parent;
    }
    path = path.reverse();
    if (!markNoncurrent) {
      this._pathCache = path;
    }
    return path;
  };

  cola.Entity = (function() {
    Entity.STATE_NONE = "none";

    Entity.STATE_NEW = "new";

    Entity.STATE_MODIFIED = "modified";

    Entity.STATE_DELETED = "deleted";

    Entity.prototype.state = Entity.STATE_NONE;

    Entity.prototype._disableObserverCount = 0;

    Entity.prototype._disableWriteObservers = 0;

    function Entity(dataType, data) {
      this.id = cola.uniqueId();
      this.timestamp = cola.sequenceNo();
      this.dataType = dataType;
      this._data = {};
      if (data != null) {
        this._disableWriteObservers++;
        this.set(data);
        this._disableWriteObservers--;
      }
    }

    Entity.prototype.hasValue = function(prop) {
      var ref;
      return this._data.hasOwnProperty(prop) || (((ref = this.dataType) != null ? ref.getProperty(prop) : void 0) != null);
    };

    Entity.prototype.get = function(prop, loadMode, context) {
      var callback;
      if (loadMode == null) {
        loadMode = "async";
      }
      if (typeof loadMode === "function") {
        loadMode = "async";
        callback = loadMode;
      }
      if (prop.indexOf(".") > 0) {
        return _evalDataPath(this, prop, false, loadMode, callback, context);
      } else {
        return this._get(prop, loadMode, callback, context);
      }
    };

    Entity.prototype._get = function(prop, loadMode, callback, context) {
      var callbackProcessed, loadData, property, provider, providerInvoker, ref;
      loadData = function(provider) {
        var providerInvoker, retValue;
        retValue = void 0;
        providerInvoker = provider.getInvoker(this);
        if (loadMode === "sync") {
          retValue = providerInvoker.invokeSync();
          retValue = this._set(prop, retValue);
          if (retValue && (retValue instanceof cola.EntityList || retValue instanceof cola.Entity)) {
            retValue._providerInvoker = providerInvoker;
          }
        } else if (loadMode === "async") {
          if (context) {
            context.unloaded = true;
            if (context.providerInvokers == null) {
              context.providerInvokers = [];
            }
            context.providerInvokers.push(providerInvoker);
          }
          this._data[prop] = providerInvoker;
          providerInvoker.invokeAsync({
            complete: (function(_this) {
              return function(success, result) {
                if (_this._data[prop] !== providerInvoker) {
                  success = false;
                }
                if (success) {
                  result = _this._set(prop, result);
                  retValue = result;
                  if (result && (result instanceof cola.EntityList || result instanceof cola.Entity)) {
                    result._providerInvoker = providerInvoker;
                  }
                } else {
                  _this._set(prop, null);
                }
                if (callback) {
                  cola.callback(callback, success, result);
                }
              };
            })(this)
          });
        } else {
          cola.callback(callback, true, void 0);
        }
        return retValue;
      };
      property = (ref = this.dataType) != null ? ref.getProperty(prop) : void 0;
      value = this._data[prop];
      if (value === void 0) {
        if (property) {
          if (property instanceof cola.BaseProperty) {
            provider = property.get("provider");
            if (context != null) {
              context.unloaded = true;
            }
            if (provider) {
              value = loadData.call(this, provider);
              callbackProcessed = true;
            }
          } else if (property instanceof cola.ComputeProperty) {
            value = property.compute(this);
          }
        }
      } else if (value instanceof cola.Provider) {
        value = loadData.call(this, value);
        callbackProcessed = true;
      } else if (value instanceof cola.AjaxServiceInvoker) {
        providerInvoker = value;
        if (loadMode === "sync") {
          value = providerInvoker.invokeSync();
          value = this._set(prop, value);
        } else if (loadMode === "async") {
          if (callback) {
            providerInvoker.callbacks.push(callback);
          }
          callbackProcessed = true;
        }
        if (context) {
          context.unloaded = true;
          if (context.providerInvokers == null) {
            context.providerInvokers = [];
          }
          context.providerInvokers.push(providerInvoker);
        }
      }
      if (callback && !callbackProcessed) {
        cola.callback(callback, true, value);
      }
      return value;
    };

    Entity.prototype.set = function(prop, value, context) {
      var config;
      if (typeof prop === "string") {
        _setValue(this, prop, value, context);
      } else if (prop && (typeof prop === "object")) {
        config = prop;
        for (prop in config) {
          if (prop.charAt(0) === "$") {
            continue;
          }
          this.set(prop, config[prop]);
        }
      }
      return this;
    };

    Entity.prototype._jsonToEntity = function(value, dataType, aggregated, provider) {
      var result;
      result = cola.DataType.jsonToEntity(value, dataType, aggregated);
      if (result && provider) {
        result.pageSize = provider._pageSize;
        result._providerInvoker = provider.getInvoker(this);
      }
      return result;
    };

    Entity.prototype._set = function(prop, value) {
      var actualType, changed, convert, dataType, expectedType, item, l, len1, len2, len3, matched, message, messages, o, oldValue, property, provider, q, ref, ref1, ref2, ref3, ref4, validator;
      oldValue = this._data[prop];
      property = (ref = this.dataType) != null ? ref.getProperty(prop) : void 0;
      if (property && property instanceof cola.ComputeProperty) {
        throw new cola.Exception("Cannot set value to ComputeProperty \"" + prop + "\".");
      }
      if (value != null) {
        if (value instanceof cola.Provider) {
          changed = oldValue !== void 0;
        } else {
          if (property) {
            dataType = property._dataType;
            provider = property._provider;
          }
          if (dataType) {
            if (value != null) {
              if (dataType instanceof cola.StringDataType && typeof value !== "string" || dataType instanceof cola.BooleanDataType && typeof value !== "boolean" || dataType instanceof cola.NumberDataType && typeof value !== "number" || dataType instanceof cola.DateDataType && !(value instanceof Date)) {
                value = dataType.parse(value);
              } else if (dataType instanceof cola.EntityDataType) {
                matched = true;
                if (value instanceof _Entity) {
                  matched = value.dataType === dataType && !property._aggregated;
                } else if (value instanceof _EntityList) {
                  matched = value.dataType === dataType && property._aggregated;
                } else {
                  value = this._jsonToEntity(value, dataType, property._aggregated, provider);
                }
                if (!matched) {
                  expectedType = dataType.get("name");
                  actualType = ((ref1 = value.dataType) != null ? ref1.get("name") : void 0) || "undefined";
                  if (property._aggregated) {
                    expectedType = "[" + expectedType + "]";
                  }
                  if (value instanceof cola.EntityList) {
                    actualType = "[" + actualType + "]";
                  }
                  throw new cola.Exception("Unmatched DataType. expect \"" + expectedType + "\" but \"" + actualType + "\".");
                }
              } else {
                value = dataType.parse(value);
              }
            }
          } else if (typeof value === "object" && (value != null)) {
            if (value instanceof Array) {
              convert = true;
              if (value.length > 0) {
                item = value[0];
                if (cola.util.isSimpleValue(item)) {
                  convert = false;
                }
              }
              if (convert) {
                value = this._jsonToEntity(value, null, true, provider);
              }
            } else if (value.hasOwnProperty("$data")) {
              value = this._jsonToEntity(value, null, true, provider);
            } else if (value instanceof Date) {

            } else {
              value = this._jsonToEntity(value, null, false, provider);
            }
          }
          changed = oldValue !== value;
        }
      } else {
        changed = oldValue !== value;
      }
      if (changed) {
        if (property && property instanceof cola.BaseProperty) {
          if (property._validators && property._rejectInvalidValue) {
            messages = null;
            ref2 = property._validators;
            for (l = 0, len1 = ref2.length; l < len1; l++) {
              validator = ref2[l];
              if ((value != null) || validator instanceof cola.RequiredValidator) {
                if (!(validator._disabled && validator instanceof cola.AsyncValidator && validator.get("async"))) {
                  message = validator.validate(value);
                  if (message) {
                    if (messages == null) {
                      messages = [];
                    }
                    if (message instanceof Array) {
                      Array.prototype.push.apply(messages, message);
                    } else {
                      messages.push(message);
                    }
                  }
                }
              }
            }
            if (messages) {
              for (o = 0, len2 = messages.length; o < len2; o++) {
                message = messages[o];
                if (message === VALIDATION_ERROR) {
                  throw new cola.Exception(message.text);
                }
              }
            }
          }
        }
        if (this._disableWriteObservers === 0) {
          if ((oldValue != null) && (oldValue instanceof _Entity || oldValue instanceof _EntityList)) {
            delete oldValue._parent;
            delete oldValue._parentProperty;
          }
          if (this.state === _Entity.STATE_NONE) {
            this.setState(_Entity.STATE_MODIFIED);
          }
        }
        this._data[prop] = value;
        if ((value != null) && (value instanceof _Entity || value instanceof _EntityList)) {
          if (value._parent && value._parent !== this) {
            throw new cola.Exception("Entity/EntityList is already belongs to another owner. \"" + prop + "\"");
          }
          value._parent = this;
          value._parentProperty = prop;
          value._setListener(this._listener);
          value._onPathChange();
          this._mayHasSubEntity = true;
        }
        this.timestamp = cola.sequenceNo();
        if (this._disableWriteObservers === 0) {
          this._notify(cola.constants.MESSAGE_DATA_CHANGE, {
            entity: this,
            property: prop,
            value: value,
            oldValue: oldValue
          });
        }
        if (messages !== void 0) {
          if ((ref3 = this._messageHolder) != null) {
            ref3.clear(prop);
          }
          this.addMessage(prop, messages);
          if (value != null) {
            ref4 = property._validators;
            for (q = 0, len3 = ref4.length; q < len3; q++) {
              validator = ref4[q];
              if (!validator._disabled && validator instanceof cola.AsyncValidator && validator.get("async")) {
                validator.validate(value, (function(_this) {
                  return function(message) {
                    if (message) {
                      _this.addMessage(prop, message);
                    }
                  };
                })(this));
              }
            }
          }
        } else {
          this.validate(prop);
        }
      }
      return value;
    };

    Entity.prototype.getText = function(prop, loadMode, callback, context) {
      var entity, i, part1, part2, text;
      if (loadMode == null) {
        loadMode = "async";
      }
      if (typeof loadMode === "function") {
        loadMode = "async";
        callback = loadMode;
      }
      i = prop.lastIndexOf(".");
      if (i > 0) {
        part1 = prop.substring(0, i);
        part2 = prop.substring(i + 1);
        if (callback) {
          return this.get(part1, loadMode, {
            complete: function(success, entity) {
              var text;
              if (success) {
                if (entity) {
                  if (typeof entity._getText === "function") {
                    entity._getText(part2, loadMode, callback);
                  } else {
                    text = entity[path];
                    cola.callback(callback, true, (text != null ? text + "" : ""));
                  }
                } else {
                  cola.callback(callback, true, "");
                }
              } else {
                cola.callback(callback, false, entity);
              }
            }
          }, context);
        } else {
          entity = this.get(part1, loadMode, null, context);
          if (entity) {
            if (typeof entity._getText === "function") {
              return entity._getText(part2, null, null, context);
            } else {
              text = entity[path] + "";
              if (text != null) {
                return text + "";
              } else {
                return "";
              }
            }
          }
        }
      } else {
        return this._getText(prop, loadMode, callback, context);
      }
    };

    Entity.prototype._getText = function(prop, loadMode, callback, context) {
      var dataType, property, propertyDataType, ref;
      if (callback) {
        dataType = this.dataType;
        this._get(prop, loadMode, {
          complete: function(success, value) {
            var property, propertyDataType, text;
            if (success) {
              if (value != null) {
                property = dataType != null ? dataType.getProperty(prop) : void 0;
                propertyDataType = property != null ? property._dataType : void 0;
                if (propertyDataType) {
                  text = propertyDataType.toText(value, property._format);
                } else {
                  text = value != null ? value + "" : "";
                }
              }
              cola.callback(callback, true, text || "");
            } else {
              cola.callback(callback, false, value);
            }
          }
        }, context);
        return "";
      } else {
        value = this._get(prop, loadMode, null, context);
        if (value != null) {
          property = (ref = this.dataType) != null ? ref.getProperty(prop) : void 0;
          propertyDataType = property != null ? property._dataType : void 0;
          if (propertyDataType) {
            return propertyDataType.toText(value, property._format);
          } else {
            if (value != null) {
              return value + "";
            } else {
              return "";
            }
          }
        } else {
          return "";
        }
      }
    };

    Entity.prototype.remove = function() {
      if (this._parent) {
        if (this._parent instanceof _EntityList) {
          this._parent.remove(this);
        } else {
          this.setState(_Entity.STATE_DELETED);
          this._parent.set(this._parentProperty, null);
        }
      } else {
        this.setState(_Entity.STATE_DELETED);
      }
      return this;
    };

    Entity.prototype.createChild = function(prop, data) {
      var entityList, property, propertyDataType, provider, ref;
      if (data && data instanceof Array) {
        throw new cola.Exception("Unmatched DataType. expect \"Object\" but \"Array\".");
      }
      property = (ref = this.dataType) != null ? ref.getProperty(prop) : void 0;
      propertyDataType = property != null ? property._dataType : void 0;
      if (propertyDataType && !(propertyDataType instanceof cola.EntityDataType)) {
        throw new cola.Exception("Unmatched DataType. expect \"cola.EntityDataType\" but \"" + propertyDataType._name + "\".");
      }
      if (property != null ? property._aggregated : void 0) {
        entityList = this._get(prop, "never");
        if (entityList == null) {
          entityList = new cola.EntityList(propertyDataType);
          provider = property._provider;
          if (provider) {
            entityList.pageSize = provider._pageSize;
            entityList._providerInvoker = provider.getInvoker(this);
          }
          this._disableWriteObservers++;
          this._set(prop, entityList);
          this._disableWriteObservers--;
        }
        return entityList.insert(data);
      } else {
        return this._set(prop, data);
      }
    };

    Entity.prototype.createBrother = function(data) {
      var brother, parent;
      if (data && data instanceof Array) {
        throw new cola.Exception("Unmatched DataType. expect \"Object\" but \"Array\".");
      }
      brother = new _Entity(this.dataType, data);
      brother.setState(_Entity.STATE_NEW);
      parent = this._parent;
      if (parent && parent instanceof _EntityList) {
        parent.insert(brother);
      }
      return brother;
    };

    Entity.prototype.setState = function(state) {
      var oldState;
      if (this.state === state) {
        return this;
      }
      if (this.state === _Entity.STATE_NONE && state === _Entity.STATE_MODIFIED) {
        this._storeOldData();
      }
      oldState = this.state;
      this.state = state;
      this._notify(cola.constants.MESSAGE_EDITING_STATE_CHANGE, {
        entity: this,
        oldState: oldState,
        state: state
      });
      return this;
    };

    Entity.prototype._storeOldData = function() {
      var data, oldData, p;
      if (this._oldData) {
        return;
      }
      data = this._data;
      oldData = this._oldData = {};
      for (p in data) {
        value = data[p];
        if (value && (value instanceof _Entity || value instanceof _EntityList)) {
          continue;
        }
        oldData[p] = value;
      }
    };

    Entity.prototype.getOldValue = function(prop) {
      var ref;
      return (ref = this._oldData) != null ? ref[prop] : void 0;
    };

    Entity.prototype.reset = function(prop) {
      var data;
      if (prop) {
        this._set(prop, void 0);
        this.clearMessages(prop);
      } else {
        this.disableObservers();
        data = this._data;
        for (prop in data) {
          value = data[prop];
          if (value !== void 0) {
            delete data[prop];
          }
        }
        this.resetState();
        this.enableObservers();
        this._notify(cola.constants.MESSAGE_REFRESH, {
          entity: this
        });
      }
      return this;
    };

    Entity.prototype.resetState = function() {
      delete this._oldData;
      this.clearMessages();
      this.setState(_Entity.STATE_NONE);
      return this;
    };

    Entity.prototype.getDataType = function(path) {
      var data, dataType, l, len1, part, parts, property;
      if (path) {
        dataType = this.dataType;
        if (dataType) {
          parts = path.split(".");
          for (l = 0, len1 = parts.length; l < len1; l++) {
            part = parts[l];
            property = typeof dataType.getProperty === "function" ? dataType.getProperty(part) : void 0;
            if (property == null) {
              break;
            }
            dataType = property.get("dataType");
            if (dataType == null) {
              break;
            }
          }
        }
      } else {
        dataType = this.dataType;
      }
      if (dataType == null) {
        data = this.get(path);
        dataType = data != null ? data.dataType : void 0;
      }
      return dataType;
    };

    Entity.prototype.getPath = getEntityPath;

    Entity.prototype.flush = function(property, loadMode) {
      var callback, notifyArg, propertyDef;
      if (loadMode == null) {
        loadMode = "async";
      }
      propertyDef = this.dataType.getProperty(property);
      if ((propertyDef != null ? propertyDef._provider : void 0) == null) {
        throw new cola.Exception("Provider undefined.");
      }
      this._set(property, void 0);
      if (typeof loadMode === "function") {
        callback = loadMode;
        loadMode = "async";
      }
      notifyArg = {
        entity: this,
        property: property
      };
      if (loadMode === "async") {
        this._notify(cola.constants.MESSAGE_LOADING_START, notifyArg);
      }
      return this._get(property, loadMode, {
        complete: (function(_this) {
          return function(success, result) {
            cola.callback(callback, success, result);
            if (loadMode === "async") {
              return _this._notify(cola.constants.MESSAGE_LOADING_END, notifyArg);
            }
          };
        })(this)
      });
    };

    Entity.prototype._setListener = function(listener) {
      var data, p;
      if (this._listener === listener) {
        return;
      }
      this._listener = listener;
      if (this._mayHasSubEntity) {
        data = this._data;
        for (p in data) {
          value = data[p];
          if (value && (value instanceof _Entity || value instanceof _EntityList)) {
            value._setListener(listener);
          }
        }
      }
    };

    Entity.prototype._onPathChange = function() {
      var data, p;
      delete this._pathCache;
      if (this._mayHasSubEntity) {
        data = this._data;
        for (p in data) {
          value = data[p];
          if (value && (value instanceof _Entity || value instanceof _EntityList)) {
            value._onPathChange();
          }
        }
      }
    };

    Entity.prototype.disableObservers = function() {
      if (this._disableObserverCount < 0) {
        this._disableObserverCount = 1;
      } else {
        this._disableObserverCount++;
      }
      return this;
    };

    Entity.prototype.enableObservers = function() {
      if (this._disableObserverCount < 1) {
        this._disableObserverCount = 0;
      } else {
        this._disableObserverCount--;
      }
      return this;
    };

    Entity.prototype._notify = function(type, arg) {
      var path;
      if (this._disableObserverCount === 0) {
        path = this.getPath(true);
        if ((type === cola.constants.MESSAGE_DATA_CHANGE || type === cola.constants.MESSAGE_VALIDATION_STATE_CHANGE || type === cola.constants.MESSAGE_LOADING_START || type === cola.constants.MESSAGE_LOADING_END) && arg.property) {
          if (path) {
            path = path.concat(arg.property);
          } else {
            path = [arg.property];
          }
        }
        this._doNotify(path, type, arg);
      }
    };

    Entity.prototype._doNotify = function(path, type, arg) {
      var ref;
      if ((ref = this._listener) != null) {
        ref.onMessage(path, type, arg);
      }
    };

    Entity.prototype._validate = function(prop) {
      var data, l, len1, message, messageChanged, property, ref, validator;
      property = this.dataType.getProperty(prop);
      if (property && property instanceof cola.BaseProperty) {
        if (property._validators) {
          data = this._data[prop];
          if (data && (data instanceof cola.Provider || data instanceof cola.AjaxServiceInvoker)) {
            return;
          }
          ref = property._validators;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            validator = ref[l];
            if (!validator._disabled) {
              if (validator instanceof cola.AsyncValidator && validator.get("async")) {
                validator.validate(data, (function(_this) {
                  return function(message) {
                    if (message) {
                      _this.addMessage(prop, message);
                    }
                  };
                })(this));
              } else {
                message = validator.validate(data);
                if (message) {
                  this._addMessage(prop, message);
                  messageChanged = true;
                }
              }
            }
          }
        }
      }
      return messageChanged;
    };

    Entity.prototype.validate = function(prop) {
      var keyMessage, l, len1, oldKeyMessage, property, ref, ref1;
      if (this._messageHolder) {
        oldKeyMessage = this._messageHolder.getKeyMessage();
        this._messageHolder.clear(prop);
      }
      if (this.dataType) {
        if (prop) {
          this._validate(prop);
          this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
            entity: this,
            property: prop
          });
        } else {
          ref = this.dataType.getProperties().elements;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            property = ref[l];
            this._validate(property._property);
            this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
              entity: this,
              property: property._property
            });
          }
        }
      }
      keyMessage = (ref1 = this._messageHolder) != null ? ref1.getKeyMessage() : void 0;
      if ((oldKeyMessage || keyMessage) && oldKeyMessage !== keyMessage) {
        this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
          entity: this
        });
      }
      return keyMessage;
    };

    Entity.prototype._addMessage = function(prop, message) {
      var l, len1, m, messageHolder, topKeyChanged;
      messageHolder = this._messageHolder;
      if (!messageHolder) {
        this._messageHolder = messageHolder = new _Entity.MessageHolder();
      }
      if (message instanceof Array) {
        for (l = 0, len1 = message.length; l < len1; l++) {
          m = message[l];
          if (messageHolder.add(prop, m)) {
            topKeyChanged = true;
          }
        }
      } else {
        if (messageHolder.add(prop, message)) {
          topKeyChanged = true;
        }
      }
      return topKeyChanged;
    };

    Entity.prototype.clearMessages = function(prop) {
      var hasPropMessage, topKeyChanged;
      if (!this._messageHolder) {
        return this;
      }
      if (prop) {
        hasPropMessage = this._messageHolder.getKeyMessage(prop);
      }
      topKeyChanged = this._messageHolder.clear(prop);
      if (hasPropMessage) {
        this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
          entity: this,
          property: prop
        });
      }
      if (topKeyChanged) {
        this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
          entity: this
        });
      }
      return this;
    };

    Entity.prototype.addMessage = function(prop, message) {
      var topKeyChanged;
      if (arguments.length === 1) {
        message = prop;
        prop = "$";
      }
      if (prop === "$") {
        this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
          entity: this
        });
      } else {
        topKeyChanged = this._addMessage(prop, message);
        this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
          entity: this,
          property: prop
        });
        if (topKeyChanged) {
          this._notify(cola.constants.MESSAGE_VALIDATION_STATE_CHANGE, {
            entity: this
          });
        }
      }
      return this;
    };

    Entity.prototype.getKeyMessage = function(prop) {
      var ref;
      return (ref = this._messageHolder) != null ? ref.getKeyMessage(prop) : void 0;
    };

    Entity.prototype.findMessages = function(prop, type) {
      var ref;
      return (ref = this._messageHolder) != null ? ref.findMessages(prop, type) : void 0;
    };

    Entity.prototype.toJSON = function(options) {
      var data, json, oldData, prop, state;
      state = (options != null ? options.state : void 0) || false;
      oldData = (options != null ? options.oldData : void 0) || false;
      data = this._data;
      json = {};
      for (prop in data) {
        value = data[prop];
        if (value) {
          if (value instanceof cola.AjaxServiceInvoker) {
            continue;
          } else if (value instanceof _Entity || value instanceof _EntityList) {
            value = value.toJSON(options);
          }
        }
        json[prop] = value;
      }
      if (state) {
        json.$state = this.state;
      }
      if (oldData && this._oldData) {
        json.$oldData = this._oldData;
      }
      return json;
    };

    return Entity;

  })();

  LinkedList = (function() {
    function LinkedList() {}

    LinkedList.prototype._size = 0;

    LinkedList.prototype._insertElement = function(element, insertMode, refEntity) {
      var next, previous;
      if (!this._first) {
        this._first = this._last = element;
      } else {
        if (!insertMode || insertMode === "end") {
          element._previous = this._last;
          this._last._next = element;
          this._last = element;
        } else if (insertMode === "before") {
          previous = refEntity._previous;
          if (previous != null) {
            previous._next = element;
          }
          refEntity._previous = element;
          element._previous = previous;
          element._next = refEntity;
          if (this._first === refEntity) {
            this._first = element;
          }
        } else if (insertMode === "after") {
          next = refEntity._next;
          if (next != null) {
            next._previous = element;
          }
          refEntity._next = element;
          element._previous = refEntity;
          element._next = next;
          if (this._last === refEntity) {
            this._last = element;
          }
        } else if (insertMode === "begin") {
          element._next = this._first;
          this._first._previous = element;
          this._first = element;
        }
      }
      element._page = this;
      this._size++;
    };

    LinkedList.prototype._removeElement = function(element) {
      var next, previous;
      previous = element._previous;
      next = element._next;
      if (previous != null) {
        previous._next = next;
      }
      if (next != null) {
        next._previous = previous;
      }
      if (this._first === element) {
        this._first = next;
      }
      if (this._last === element) {
        this._last = previous;
      }
      this._size++;
    };

    LinkedList.prototype._clearElements = function() {
      this._first = this._last = null;
      this._size = 0;
    };

    return LinkedList;

  })();

  Page = (function(superClass) {
    extend(Page, superClass);

    Page.prototype.loaded = false;

    Page.prototype.entityCount = 0;

    function Page(entityList1, pageNo1) {
      this.entityList = entityList1;
      this.pageNo = pageNo1;
    }

    Page.prototype.initData = function(json) {
      var data, dataType, entity, entityList, l, len1, rawJson;
      rawJson = json;
      entityList = this.entityList;
      if (json.hasOwnProperty("$data")) {
        json = rawJson.$data;
      }
      if (!(json instanceof Array)) {
        throw new cola.Exception("Unmatched DataType. expect \"Array\" but \"Object\".");
      }
      dataType = entityList.dataType;
      for (l = 0, len1 = json.length; l < len1; l++) {
        data = json[l];
        entity = new _Entity(dataType, data);
        this._insertElement(entity);
      }
      if (rawJson.$entityCount != null) {
        entityList.totalEntityCount = rawJson.$entityCount;
      }
      if (entityList.totalEntityCount != null) {
        entityList.pageCount = parseInt((entityList.totalEntityCount + entityList.pageSize - 1) / entityList.pageSize);
        entityList.pageCountDetermined = true;
      }
      entityList.entityCount += json.length;
      entityList._notify(cola.constants.MESSAGE_REFRESH, {
        entityList: entityList
      });
    };

    Page.prototype._insertElement = function(entity, insertMode, refEntity) {
      var entityList;
      Page.__super__._insertElement.call(this, entity, insertMode, refEntity);
      entityList = this.entityList;
      entity._page = this;
      entity._parent = entityList;
      delete entity._parentProperty;
      if (!this.dontAutoSetCurrent && (entityList.current == null)) {
        if (entity.state !== _Entity.STATE_DELETED) {
          entityList.current = entity;
          entityList._setCurrentPage(entity._page);
        }
      }
      entity._setListener(entityList._listener);
      entity._onPathChange();
      if (entity.state !== _Entity.STATE_DELETED) {
        this.entityCount++;
      }
    };

    Page.prototype._removeElement = function(entity) {
      Page.__super__._removeElement.call(this, entity);
      delete entity._page;
      delete entity._parent;
      entity._setListener(null);
      entity._onPathChange();
      if (entity.state !== _Entity.STATE_DELETED) {
        this.entityCount--;
      }
    };

    Page.prototype._clearElements = function() {
      var entity;
      entity = this._first;
      while (entity) {
        delete entity._page;
        delete entity._parent;
        entity._setListener(null);
        entity._onPathChange();
        entity = entity._next;
      }
      this.entityCount = 0;
      Page.__super__._clearElements.call(this);
    };

    Page.prototype.loadData = function(callback) {
      var pageSize, providerInvoker, result;
      providerInvoker = this.entityList._providerInvoker;
      if (providerInvoker) {
        pageSize = this.entityList.pageSize;
        if (pageSize > 1 && this.pageNo > 1) {
          providerInvoker.invokerOptions.data.from = pageSize * (this.pageNo - 1);
        }
        if (callback) {
          providerInvoker.invokeAsync({
            complete: (function(_this) {
              return function(success, result) {
                if (success) {
                  _this.initData(result);
                }
                return cola.callback(callback, success, result);
              };
            })(this)
          });
        } else {
          result = providerInvoker.invokeSync();
          this.initData(result);
        }
      }
    };

    return Page;

  })(LinkedList);

  cola.EntityList = (function(superClass) {
    extend(EntityList, superClass);

    EntityList.prototype.current = null;

    EntityList.prototype.entityCount = 0;

    EntityList.prototype.pageMode = "append";

    EntityList.prototype.pageSize = 0;

    EntityList.prototype.pageNo = 1;

    EntityList.prototype.pageCount = 1;

    EntityList.prototype._disableObserverCount = 0;

    function EntityList(dataType) {
      this.id = cola.uniqueId();
      this.timestamp = cola.sequenceNo();
      this.dataType = dataType;
    }

    EntityList.prototype.fillData = function(array) {
      var page;
      page = this._findPage(this.pageNo);
      if (page == null) {
        page = new Page(this, this.pageNo);
      }
      this._insertElement(page, "begin");
      page.initData(array);
    };

    EntityList.prototype._setListener = function(listener) {
      var next, page;
      if (this._listener === listener) {
        return;
      }
      this._listener = listener;
      page = this._first;
      if (!page) {
        return;
      }
      next = page._first;
      while (page) {
        if (next) {
          next._setListener(listener);
          next = next._next;
        } else {
          page = page._next;
          next = page != null ? page._first : void 0;
        }
      }
    };

    EntityList.prototype._setCurrentPage = function(page) {
      this._currentPage = page;
      this.pageNo = (page != null ? page.pageNo : void 0) || 1;
    };

    EntityList.prototype._onPathChange = function() {
      var next, page;
      delete this._pathCache;
      page = this._first;
      if (!page) {
        return;
      }
      next = page._first;
      while (page) {
        if (next) {
          next._onPathChange();
          next = next._next;
        } else {
          page = page._next;
          next = page != null ? page._first : void 0;
        }
      }
    };

    EntityList.prototype._findPrevious = function(entity) {
      var page, previous;
      if (entity && entity._parent !== this) {
        return;
      }
      if (entity) {
        page = entity._page;
        previous = entity._previous;
      } else {
        page = this._last;
        previous = page._last;
      }
      while (page) {
        if (previous) {
          if (previous.state !== _Entity.STATE_DELETED) {
            return previous;
          } else {
            previous = previous._previous;
          }
        } else {
          page = page._previous;
          previous = page != null ? page._last : void 0;
        }
      }
    };

    EntityList.prototype._findNext = function(entity) {
      var next, page;
      if (entity && entity._parent !== this) {
        return;
      }
      if (entity) {
        page = entity._page;
        next = entity._next;
      } else {
        page = this._first;
        next = page._first;
      }
      while (page) {
        if (next) {
          if (next.state !== _Entity.STATE_DELETED) {
            return next;
          } else {
            next = next._next;
          }
        } else {
          page = page._next;
          next = page != null ? page._first : void 0;
        }
      }
    };

    EntityList.prototype._findPage = function(pageNo) {
      var page;
      if (pageNo < 1) {
        return null;
      }
      if (pageNo > this.pageCount) {
        if (this.pageCountDetermined || pageNo > (this.pageCount + 1)) {
          return null;
        }
      }
      page = this._currentPage || this._first;
      if (!page) {
        return null;
      }
      if (page.pageNo === pageNo) {
        return page;
      } else if (page.pageNo < pageNo) {
        page = page._next;
        while (page != null) {
          if (page.pageNo === pageNo) {
            return page;
          } else if (page.pageNo > pageNo) {
            break;
          }
          page = page._next;
        }
      } else {
        page = page._previous;
        while (page != null) {
          if (page.pageNo === pageNo) {
            return page;
          } else if (page.pageNo < pageNo) {
            break;
          }
          page = page._previous;
        }
      }
      return null;
    };

    EntityList.prototype._createPage = function(pageNo) {
      var insertMode, page, refPage;
      if (pageNo < 1) {
        return null;
      }
      if (pageNo > this.pageCount) {
        if (this.pageCountDetermined || pageNo > (this.pageCount + 1)) {
          return null;
        }
      }
      insertMode = "end";
      refPage = this._currentPage || this._first;
      if (refPage) {
        if (refPage.page === pageNo - 1) {
          insertMode = "after";
        } else if (refPage.page === pageNo + 1) {
          insertMode = "before";
        } else {
          page = this._last;
          while (page) {
            if (page.pageNo < pageNo) {
              refPage = page;
              insertMode = "after";
              break;
            }
            page = page._previous;
          }
        }
      }
      page = new Page(this, pageNo);
      this._insertElement(page, insertMode, refPage);
      return page;
    };

    EntityList.prototype.hasNextPage = function() {
      var pageNo;
      pageNo = this.pageNo + 1;
      return !this.pageCountDetermined || pageNo <= this.pageCount;
    };

    EntityList.prototype._loadPage = function(pageNo, setCurrent, loadMode) {
      var callback, entity, page;
      if (loadMode == null) {
        loadMode = "async";
      }
      if (typeof loadMode === "function") {
        callback = loadMode;
        loadMode = "async";
      }
      page = this._findPage(pageNo);
      if (page !== this._currentPage) {
        if (page) {
          this._setCurrentPage(page);
          if (setCurrent) {
            entity = page._first;
            while (entity) {
              if (entity.state !== _Entity.STATE_DELETED) {
                this.setCurrent(entity);
                break;
              }
              entity = entity._next;
            }
          }
          cola.callback(callback, true);
        } else if (loadMode !== "never") {
          if (setCurrent) {
            this.setCurrent(null);
          }
          page = this._createPage(pageNo);
          if (loadMode === "async") {
            page.loadData({
              complete: (function(_this) {
                return function(success, result) {
                  if (success) {
                    _this._setCurrentPage(page);
                    if (page.entityCount && _this.pageCount < pageNo) {
                      _this.pageCount = pageNo;
                    }
                  }
                  cola.callback(callback, success, result);
                };
              })(this)
            });
          } else {
            page.loadData();
            this._setCurrentPage(page);
            cola.callback(callback, true);
          }
        }
      }
      return this;
    };

    EntityList.prototype.loadPage = function(pageNo, loadMode) {
      return this._loadPage(pageNo, false, loadMode);
    };

    EntityList.prototype.gotoPage = function(pageNo, loadMode) {
      if (pageNo < 1) {
        pageNo = 1;
      } else if (this.pageCountDetermined && pageNo > this.pageCount) {
        pageNo = this.pageCount;
      }
      return this._loadPage(pageNo, true, loadMode);
    };

    EntityList.prototype.firstPage = function(loadMode) {
      this.gotoPage(1, loadMode);
      return this;
    };

    EntityList.prototype.previousPage = function(loadMode) {
      var pageNo;
      pageNo = this.pageNo - 1;
      if (pageNo < 1) {
        pageNo = 1;
      }
      this.gotoPage(pageNo, loadMode);
      return this;
    };

    EntityList.prototype.nextPage = function(loadMode) {
      var pageNo;
      pageNo = this.pageNo + 1;
      if (this.pageCountDetermined && pageNo > this.pageCount) {
        pageNo = this.pageCount;
      }
      this.gotoPage(pageNo, loadMode);
      return this;
    };

    EntityList.prototype.lastPage = function(loadMode) {
      this.gotoPage(this.pageCount, loadMode);
      return this;
    };

    EntityList.prototype.insert = function(entity, insertMode, refEntity) {
      var page;
      if (insertMode === "before" || insertMode === "after") {
        if (refEntity && refEntity._parent !== this) {
          refEntity = null;
        }
        if (refEntity == null) {
          refEntity = this.current;
        }
        if (refEntity) {
          page = refEntity._page;
        }
      } else if (this.pageMode === "append") {
        if (insertMode === "end") {
          page = this._last;
        } else if (insertMode === "begin") {
          page = this._first;
        }
      }
      if (!page) {
        page = this._currentPage;
        if (!page) {
          this.gotoPage(1);
          page = this._currentPage;
        }
      }
      if (entity instanceof _Entity) {
        if (entity._parent && entity._parent !== this) {
          throw new cola.Exception("Entity is already belongs to another owner. \"" + (this._parentProperty || "Unknown") + "\".");
        }
      } else {
        entity = new _Entity(this.dataType, entity);
        entity.setState(_Entity.STATE_NEW);
      }
      page.dontAutoSetCurrent = true;
      page._insertElement(entity, insertMode, refEntity);
      page.dontAutoSetCurrent = false;
      if (entity.state !== _Entity.STATE_DELETED) {
        this.entityCount++;
      }
      this.timestamp = cola.sequenceNo();
      this._notify(cola.constants.MESSAGE_INSERT, {
        entityList: this,
        entity: entity,
        insertMode: insertMode,
        refEntity: refEntity
      });
      if (!this.current) {
        this.setCurrent(entity);
      }
      return entity;
    };

    EntityList.prototype.remove = function(entity, detach) {
      var changeCurrent, newCurrent, page;
      if (entity == null) {
        entity = this.current;
        if (entity == null) {
          return void 0;
        }
      }
      if (entity._parent !== this) {
        return void 0;
      }
      if (entity === this.current) {
        changeCurrent = true;
        newCurrent = this._findNext(entity);
        if (!newCurrent) {
          newCurrent = this._findPrevious(entity);
        }
      }
      page = entity._page;
      if (detach) {
        page._removeElement(entity);
        this.entityCount--;
      } else if (entity.state === _Entity.STATE_NEW) {
        entity.setState(_Entity.STATE_DELETED);
        page._removeElement(entity);
        this.entityCount--;
      } else if (entity.state !== _Entity.STATE_DELETED) {
        entity.setState(_Entity.STATE_DELETED);
        this.entityCount--;
      }
      this.timestamp = cola.sequenceNo();
      this._notify(cola.constants.MESSAGE_REMOVE, {
        entityList: this,
        entity: entity
      });
      if (changeCurrent) {
        this.setCurrent(newCurrent);
      }
      return entity;
    };

    EntityList.prototype.setCurrent = function(entity) {
      var oldCurrent;
      if (this.current === entity || (entity != null ? entity.state : void 0) === cola.Entity.STATE_DELETED) {
        return this;
      }
      if (entity && entity._parent !== this) {
        return this;
      }
      oldCurrent = this.current;
      if (oldCurrent) {
        oldCurrent._onPathChange();
      }
      this.current = entity;
      if (entity) {
        this._setCurrentPage(entity._page);
        entity._onPathChange();
      }
      this._notify(cola.constants.MESSAGE_CURRENT_CHANGE, {
        entityList: this,
        current: entity,
        oldCurrent: oldCurrent
      });
      return this;
    };

    EntityList.prototype.first = function() {
      var entity;
      entity = this._findNext();
      if (entity) {
        this.setCurrent(entity);
        return entity;
      } else {
        return this.current;
      }
    };

    EntityList.prototype.previous = function() {
      var entity;
      entity = this._findPrevious(this.current);
      if (entity) {
        this.setCurrent(entity);
        return entity;
      } else {
        return this.current;
      }
    };

    EntityList.prototype.next = function() {
      var entity;
      entity = this._findNext(this.current);
      if (entity) {
        this.setCurrent(entity);
        return entity;
      } else {
        return this.current;
      }
    };

    EntityList.prototype.last = function() {
      var entity;
      entity = this._findPrevious();
      if (entity) {
        this.setCurrent(entity);
        return entity;
      } else {
        return this.current;
      }
    };

    EntityList.prototype._reset = function() {
      var page;
      this.current = null;
      this.entityCount = 0;
      this.pageNo = 1;
      this.pageCount = 1;
      page = this._first;
      while (page) {
        page._clearElements();
        page = page._next;
      }
      this.timestamp = cola.sequenceNo();
      return this;
    };

    EntityList.prototype.disableObservers = function() {
      if (this._disableObserverCount < 0) {
        this._disableObserverCount = 1;
      } else {
        this._disableObserverCount++;
      }
      return this;
    };

    EntityList.prototype.enableObservers = function() {
      if (this._disableObserverCount < 1) {
        this._disableObserverCount = 0;
      } else {
        this._disableObserverCount--;
      }
      return this;
    };

    EntityList.prototype._notify = function(type, arg) {
      var ref;
      if (this._disableObserverCount === 0) {
        if ((ref = this._listener) != null) {
          ref.onMessage(this.getPath(true), type, arg);
        }
      }
    };

    EntityList.prototype.flush = function(loadMode) {
      var callback, notifyArg, page;
      if (this._providerInvoker == null) {
        throw new cola.Exception("Provider undefined.");
      }
      if (typeof loadMode === "function") {
        callback = loadMode;
        loadMode = "async";
      }
      this._reset();
      page = this._findPage(this.pageNo);
      if (!page) {
        this._createPage(this.pageNo);
      }
      if (loadMode === "async") {
        notifyArg = {
          entityList: this
        };
        this._notify(cola.constants.MESSAGE_LOADING_START, notifyArg);
        page.loadData({
          complete: (function(_this) {
            return function(success, result) {
              cola.callback(callback, success, result);
              return _this._notify(cola.constants.MESSAGE_LOADING_END, notifyArg);
            };
          })(this)
        });
      } else {
        page.loadData();
      }
      return this;
    };

    EntityList.prototype.each = function(fn, options) {
      var deleted, i, next, page, pageNo;
      page = this._first;
      if (!page) {
        return this;
      }
      if (options != null) {
        if (typeof options === "boolean") {
          deleted = options;
        } else {
          deleted = options.deleted;
          pageNo = options.pageNo;
          if (!pageNo && options.currentPage) {
            pageNo = this.pageNo;
          }
        }
      }
      if (pageNo > 1) {
        page = this._findPage(pageNo);
        if (!page) {
          return this;
        }
      }
      next = page._first;
      i = 0;
      while (page) {
        if (next) {
          if (deleted || next.state !== _Entity.STATE_DELETED) {
            if (fn.call(this, next, i++) === false) {
              break;
            }
          }
          next = next._next;
        } else if (!pageNo) {
          page = page._next;
          next = page != null ? page._first : void 0;
        }
      }
      return this;
    };

    EntityList.prototype.getPath = getEntityPath;

    EntityList.prototype.toJSON = function(options) {
      var array, deleted, next, page;
      deleted = options != null ? options.deleted : void 0;
      array = [];
      page = this._first;
      if (page) {
        next = page._first;
        while (page) {
          if (next) {
            if (deleted || next.state !== _Entity.STATE_DELETED) {
              array.push(next.toJSON(options));
            }
            next = next._next;
          } else {
            page = page._next;
            next = page != null ? page._first : void 0;
          }
        }
      }
      return array;
    };

    EntityList.prototype.toArray = function() {
      var array, next, page;
      array = [];
      page = this._first;
      if (page) {
        next = page._first;
        while (page) {
          if (next) {
            if (next.state !== _Entity.STATE_DELETED) {
              array.push(next);
            }
            next = next._next;
          } else {
            page = page._next;
            next = page != null ? page._first : void 0;
          }
        }
      }
      return array;
    };

    return EntityList;

  })(LinkedList);

  _Entity = cola.Entity;

  _EntityList = cola.EntityList;

  _Entity._evalDataPath = _evalDataPath = function(data, path, noEntityList, loadMode, callback, context) {
    var i, isLast, l, lastIndex, len1, part, parts, returnCurrent;
    if (path) {
      parts = path.split(".");
      lastIndex = parts.length - 1;
      for (i = l = 0, len1 = parts.length; l < len1; i = ++l) {
        part = parts[i];
        returnCurrent = false;
        if (i === 0 && data instanceof _EntityList) {
          if (part === "#") {
            data = data.current;
          } else {
            data = data[part];
          }
        } else {
          isLast = i === lastIndex;
          if (!noEntityList) {
            if (!isLast) {
              returnCurrent = true;
            }
            if (part.charCodeAt(part.length - 1) === 35) {
              returnCurrent = true;
              part = part.substring(0, part.length - 1);
            }
          }
          if (data instanceof _Entity) {
            if (typeof data._get === "function") {
              data = data._get(part, loadMode, callback, context);
            } else {

            }
            if (data && data instanceof _EntityList) {
              if (noEntityList || returnCurrent) {
                data = data.current;
              }
            }
          } else {
            data = data[part];
          }
        }
        if (data == null) {
          break;
        }
      }
    }
    return data;
  };

  _Entity._setValue = _setValue = function(entity, path, value, context) {
    var i, part1, part2;
    i = path.lastIndexOf(".");
    if (i > 0) {
      part1 = path.substring(0, i);
      part2 = path.substring(i + 1);
      entity = _evalDataPath(entity, part1, true, "never", context);
      if ((entity != null) && !(entity instanceof _EntityList)) {
        if (entity instanceof cola.AjaxServiceInvoker) {
          entity = void 0;
        } else if (typeof entity._set === "function") {
          entity._set(part2, value);
        } else {
          entity[part2] = value;
        }
      } else {
        throw new cola.Exception("Cannot set value to EntityList \"" + path + "\".");
      }
    } else if (typeof entity._set === "function") {
      entity._set(path, value);
    } else {
      entity[path] = value;
    }
  };

  _Entity._getEntityId = function(entity) {
    if (!entity) {
      return null;
    }
    if (entity instanceof cola.Entity) {
      return entity.id;
    } else if (typeof entity === "object") {
      if (entity._id == null) {
        entity._id = cola.uniqueId();
      }
      return entity._id;
    }
  };

  VALIDATION_NONE = "none";

  VALIDATION_INFO = "info";

  VALIDATION_WARN = "warning";

  VALIDATION_ERROR = "error";

  TYPE_SEVERITY = {
    VALIDATION_INFO: 1,
    VALIDATION_WARN: 2,
    VALIDATION_ERROR: 4
  };

  cola.Entity.MessageHolder = (function() {
    function MessageHolder() {
      this.keyMessage = {};
      this.propertyMessages = {};
    }

    MessageHolder.prototype.compare = function(message1, message2) {
      return (TYPE_SEVERITY[message1.type] || 0) - (TYPE_SEVERITY[message2.type] || 0);
    };

    MessageHolder.prototype.add = function(prop, message) {
      var isTopKey, keyMessage, messages, topKeyChanged;
      messages = this.propertyMessages[prop];
      if (!messages) {
        this.propertyMessages[prop] = [message];
      } else {
        messages.push(message);
      }
      isTopKey = prop === "$";
      if (keyMessage) {
        if (this.compare(message, keyMessage) > 0) {
          this.keyMessage[prop] = message;
          topKeyChanged = isTopKey;
        }
      } else {
        this.keyMessage[prop] = message;
        topKeyChanged = isTopKey;
      }
      if (!topKeyChanged && !isTopKey) {
        keyMessage = this.keyMessage["$"];
        if (keyMessage) {
          if (this.compare(message, keyMessage) > 0) {
            this.keyMessage["$"] = message;
            topKeyChanged = true;
          }
        } else {
          this.keyMessage["$"] = message;
          topKeyChanged = true;
        }
      }
      return topKeyChanged;
    };

    MessageHolder.prototype.clear = function(prop) {
      var keyMessage, l, len1, message, messages, p, ref, topKeyChanged;
      if (prop) {
        delete this.propertyMessages[prop];
        delete this.keyMessage[prop];
        ref = this.propertyMessages;
        for (p in ref) {
          messages = ref[p];
          for (l = 0, len1 = messages.length; l < len1; l++) {
            message = messages[l];
            if (!keyMessage) {
              keyMessage = message;
            } else if (this.compare(message, keyMessage) > 0) {
              keyMessage = message;
            } else {
              continue;
            }
            if (keyMessage.type === VALIDATION_ERROR) {
              break;
            }
          }
        }
        topKeyChanged = this.keyMessage["$"] !== keyMessage;
        if (topKeyChanged) {
          this.keyMessage["$"] = keyMessage;
        }
      } else {
        topKeyChanged = true;
        this.keyMessage = {};
        this.propertyMessages = {};
      }
      return topKeyChanged;
    };

    MessageHolder.prototype.getMessages = function(prop) {
      if (prop == null) {
        prop = "$";
      }
      return this.propertyMessages[prop];
    };

    MessageHolder.prototype.getKeyMessage = function(prop) {
      if (prop == null) {
        prop = "$";
      }
      return this.keyMessage[prop];
    };

    MessageHolder.prototype.findMessages = function(prop, type) {
      var l, len1, len2, m, messages, ms, o, p, ref;
      if (prop) {
        ms = this.propertyMessages[prop];
        if (type) {
          messages = [];
          for (l = 0, len1 = ms.length; l < len1; l++) {
            m = ms[l];
            if (m.type === type) {
              messages.push(m);
            }
          }
        } else {
          messages = ms;
        }
      } else {
        messages = [];
        ref = this.propertyMessages;
        for (p in ref) {
          ms = ref[p];
          for (o = 0, len2 = ms.length; o < len2; o++) {
            m = ms[o];
            if (!type || m.type === type) {
              messages.push(m);
            }
          }
        }
      }
      return messages;
    };

    return MessageHolder;

  })();


  /*
  Functions
   */

  cola.each = function(collection, fn) {
    if (collection instanceof cola.EntityList) {
      collection.each(fn);
    } else if (collection instanceof Array) {
      if (typeof collection.each === "function") {
        collection.each(fn);
      } else {
        collection.forEach(fn);
      }
    }
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./entity");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }


  /*
  Model and Scope
   */

  _RESERVE_NAMES = {
    self: null,
    arg: null
  };

  cola.model = function(name, model) {
    if (arguments.length === 2) {
      if (model) {
        if (cola.model[name]) {
          throw new cola.Exception("Duplicated model name \"" + name + "\".");
        }
        cola.model[name] = model;
      } else {
        model = cola.removeModel(name);
      }
      return model;
    } else {
      return cola.model[name];
    }
  };

  cola.model.defaultActions = {};

  cola.removeModel = function(name) {
    var model;
    model = cola.model[name];
    delete cola.model[name];
    return model;
  };

  cola.AbstractModel = (function() {
    function AbstractModel() {}

    AbstractModel.prototype.get = function(path, loadMode, context) {
      return this.data.get(path, loadMode, context);
    };

    AbstractModel.prototype.set = function(path, data, context) {
      this.data.set(path, data, context);
      return this;
    };

    AbstractModel.prototype.describe = function(property, config) {
      return this.data.describe(property, config);
    };

    AbstractModel.prototype.dataType = function(name) {
      var dataType, l, len1;
      if (typeof name === "string") {
        dataType = this.data.getDefinition(name);
        if (dataType instanceof cola.DataType) {
          return dataType;
        } else {
          return null;
        }
      } else if (name) {
        if (name instanceof Array) {
          for (l = 0, len1 = name.length; l < len1; l++) {
            dataType = name[l];
            if (!(dataType instanceof cola.DataType)) {
              dataType = new cola.EntityDataType(dataType);
            }
            this.data.regDefinition(dataType);
          }
        } else {
          dataType = name;
          if (!(dataType instanceof cola.DataType)) {
            dataType = new cola.EntityDataType(dataType);
          }
          this.data.regDefinition(dataType);
        }
      }
    };

    AbstractModel.prototype.getDefinition = function(name) {
      return this.data.getDefinition(name);
    };

    AbstractModel.prototype.flush = function(name, loadMode) {
      this.data.flush(name, loadMode);
      return this;
    };

    AbstractModel.prototype.disableObservers = function() {
      this.data.disableObservers();
      return this;
    };

    AbstractModel.prototype.enableObservers = function() {
      this.data.enableObservers();
      return this;
    };

    return AbstractModel;

  })();

  cola.Model = (function(superClass) {
    extend(Model, superClass);

    function Model(name, parent) {
      var parentName;
      if (name instanceof cola.Model) {
        parent = name;
        name = void 0;
      }
      if (name) {
        this.name = name;
        cola.model(name, this);
      }
      if (parent && typeof parent === "string") {
        parentName = parent;
        parent = cola.model(parentName);
      }
      if (parent) {
        this.parent = parent;
      }
      this.data = new cola.DataModel(this);
      this.action = function(name, action) {
        var a, config, fn, n, scope, store;
        store = this.action;
        if (arguments.length === 1) {
          if (typeof name === "string") {
            scope = this;
            while (store) {
              fn = store[name];
              if (fn) {
                return fn.action || fn;
              }
              scope = scope.parent;
              if (!scope) {
                break;
              }
              store = scope.action;
            }
            fn = cola.model.defaultActions[name];
            if (fn) {
              return fn.action || fn;
            }
          } else if (name && typeof name === "object") {
            config = name;
            for (n in config) {
              a = config[n];
              this.action(n, a);
            }
          }
          return null;
        } else {
          if (action) {
            store[name] = action;
          } else {
            delete store[name];
          }
          return this;
        }
      };
    }

    Model.prototype.destroy = function() {
      var base;
      if (this.name) {
        cola.removeModel(this.name);
      }
      if (typeof (base = this.data).destroy === "function") {
        base.destroy();
      }
    };

    return Model;

  })(cola.AbstractModel);

  cola.SubScope = (function(superClass) {
    extend(SubScope, superClass);

    function SubScope() {
      return SubScope.__super__.constructor.apply(this, arguments);
    }

    SubScope.prototype.watchPath = function(path) {
      var l, len1, p, parent, paths;
      if (this._watchAllMessages || this._watchPath === path) {
        return;
      }
      this._unwatchPath();
      if (path) {
        this._watchPath = paths = [];
        parent = this.parent;
        if (path instanceof Array) {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            p = p + ".**";
            paths.push(p);
            if (parent != null) {
              parent.data.bind(p, this);
            }
          }
        } else {
          path = path + ".**";
          paths.push(path);
          if (parent != null) {
            parent.data.bind(path, this);
          }
        }
      } else {
        delete this._watchPath;
      }
    };

    SubScope.prototype._unwatchPath = function() {
      var l, len1, p, parent, path;
      if (!this._watchPath) {
        return;
      }
      path = this._watchPath;
      delete this._watchPath;
      parent = this.parent;
      if (parent) {
        if (path instanceof Array) {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            parent.data.unbind(p, this);
          }
        } else {
          parent.data.unbind(path, this);
        }
      }
    };

    SubScope.prototype.watchAllMessages = function() {
      var parent;
      if (this._watchAllMessages) {
        return;
      }
      this._watchAllMessages = true;
      this._unwatchPath();
      parent = this.parent;
      if (parent) {
        parent.data.bind("**", this);
        if (typeof parent.watchAllMessages === "function") {
          parent.watchAllMessages();
        }
      }
    };

    SubScope.prototype.destroy = function() {
      if (this.parent) {
        if (this._watchAllMessages) {
          this.parent.data.unbind("**", this);
        } else if (this._watchPath) {
          this._unwatchPath();
        }
      }
    };

    return SubScope;

  })(cola.AbstractModel);

  cola.AliasScope = (function(superClass) {
    extend(AliasScope, superClass);

    function AliasScope(parent1, expression) {
      var dataType;
      this.parent = parent1;
      if (expression && typeof expression.path === "string" && !expression.hasCallStatement && !expression.convertors) {
        dataType = this.parent.data.getDataType(expression.path);
      }
      this.data = new cola.AliasDataModel(this, expression.alias, dataType);
      this.action = this.parent.action;
      this.expression = expression;
      if (!expression.path && expression.hasCallStatement) {
        this.watchAllMessages();
      } else {
        this.watchPath(expression.path);
      }
    }

    AliasScope.prototype.destroy = function() {
      AliasScope.__super__.destroy.call(this);
      this.data.destroy();
    };

    AliasScope.prototype.repeatNotification = true;

    AliasScope.prototype._processMessage = function(bindingPath, path, type, arg) {
      if (this.messageTimestamp >= arg.timestamp) {
        return;
      }
      this.data._processMessage(bindingPath, path, type, arg);
    };

    return AliasScope;

  })(cola.SubScope);

  cola.ItemScope = (function(superClass) {
    extend(ItemScope, superClass);

    function ItemScope(parent1, alias) {
      var ref;
      this.parent = parent1;
      this.data = new cola.AliasDataModel(this, alias, (ref = this.parent) != null ? ref.dataType : void 0);
      this.action = this.parent.action;
    }

    ItemScope.prototype.watchPath = function() {};

    ItemScope.prototype.watchAllMessages = function() {
      var ref;
      if ((ref = this.parent) != null) {
        if (typeof ref.watchAllMessages === "function") {
          ref.watchAllMessages();
        }
      }
    };

    ItemScope.prototype._processMessage = function(bindingPath, path, type, arg) {
      return this.data._processMessage(bindingPath, path, type, arg);
    };

    return ItemScope;

  })(cola.SubScope);

  cola.ItemsScope = (function(superClass) {
    extend(ItemsScope, superClass);

    function ItemsScope(parent, expression) {
      this.setParent(parent);
      this.setExpression(expression);
    }

    ItemsScope.prototype.setParent = function(parent) {
      if (this.parent) {
        if (this._watchAllMessages) {
          this.parent.data.unbind("**", this);
        } else if (this._watchPath) {
          this._unwatchPath();
        }
      }
      this.parent = parent;
      this.data = parent.data;
      this.action = parent.action;
      if (this._watchAllMessages) {
        parent.data.bind("**", this);
      } else if (this._watchPath) {
        this.watchPath(this._watchPath);
      }
    };

    ItemsScope.prototype.setExpression = function(expression) {
      var l, len1, path, paths, ref;
      this.expression = expression;
      if (expression) {
        this.alias = expression.alias;
        if (typeof expression.path === "string") {
          this.expressionPath = [expression.path.split(".")];
        } else if (expression.path instanceof Array) {
          paths = [];
          ref = expression.path;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            path = ref[l];
            paths.push(path.split("."));
          }
          this.expressionPath = paths;
        }
        if (!expression.path && expression.hasCallStatement) {
          this.watchAllMessages();
        } else {
          this.watchPath(expression.path);
        }
      } else {
        this.alias = "item";
        this.expressionPath = [];
      }
      if (expression && typeof expression.path === "string" && !expression.hasCallStatement && !expression.convertors) {
        this.dataType = this.parent.data.getDataType(expression.path);
      }
    };

    ItemsScope.prototype.setItems = function() {
      var items, originItems;
      items = arguments[0], originItems = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this._setItems.apply(this, [items].concat(slice.call(originItems)));
    };

    ItemsScope.prototype.retrieveItems = function(dataCtx) {
      var items;
      if (dataCtx == null) {
        dataCtx = {};
      }
      if (this._retrieveItems) {
        return this._retrieveItems(dataCtx);
      }
      if (this.expression) {
        items = this.expression.evaluate(this.parent, "async", dataCtx);
        this._setItems(items, dataCtx.originData);
      }
    };

    ItemsScope.prototype._setItems = function() {
      var it, items, l, len1, originItems, targetPath;
      items = arguments[0], originItems = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this.items = items;
      if (originItems && originItems.length === 1) {
        this.originItems = originItems[0];
      } else {
        this.originItems = originItems;
        this.originItems._multiItems = true;
      }
      targetPath = null;
      if (originItems) {
        for (l = 0, len1 = originItems.length; l < len1; l++) {
          it = originItems[l];
          if (it && it instanceof cola.EntityList) {
            if (targetPath == null) {
              targetPath = [];
            }
            targetPath.push(it.getPath());
          }
        }
      }
      if (targetPath) {
        this.targetPath = targetPath.concat(this.expressionPath);
      } else {
        this.targetPath = this.expressionPath;
      }
    };

    ItemsScope.prototype.refreshItems = function(dataCtx) {
      this.retrieveItems(dataCtx);
      if (typeof this.onItemsRefresh === "function") {
        this.onItemsRefresh();
      }
    };

    ItemsScope.prototype.refreshItem = function(arg) {
      arg.itemsScope = this;
      if (typeof this.onItemRefresh === "function") {
        this.onItemRefresh(arg);
      }
    };

    ItemsScope.prototype.insertItem = function(arg) {
      arg.itemsScope = this;
      if (typeof this.onItemInsert === "function") {
        this.onItemInsert(arg);
      }
    };

    ItemsScope.prototype.removeItem = function(arg) {
      arg.itemsScope = this;
      if (typeof this.onItemRemove === "function") {
        this.onItemRemove(arg);
      }
    };

    ItemsScope.prototype.changeCurrentItem = function(arg) {
      arg.itemsScope = this;
      if (typeof this.onCurrentItemChange === "function") {
        this.onCurrentItemChange(arg);
      }
    };

    ItemsScope.prototype.resetItemScopeMap = function() {
      this.itemScopeMap = {};
    };

    ItemsScope.prototype.getItemScope = function(item) {
      var itemId;
      itemId = cola.Entity._getEntityId(item);
      return this.itemScopeMap[itemId];
    };

    ItemsScope.prototype.regItemScope = function(itemId, itemScope) {
      this.itemScopeMap[itemId] = itemScope;
    };

    ItemsScope.prototype.unregItemScope = function(itemId) {
      delete this.itemScopeMap[itemId];
    };

    ItemsScope.prototype.findItemDomBinding = function(item) {
      var itemId, itemScopeMap, items, l, len1, matched, multiOriginItems, oi, originItems;
      itemScopeMap = this.itemScopeMap;
      items = this.items;
      originItems = this.originItems;
      multiOriginItems = originItems != null ? originItems._multiItems : void 0;
      if (items || originItems) {
        while (item) {
          if (item instanceof cola.Entity) {
            matched = item._parent === items;
            if (!matched && originItems) {
              if (multiOriginItems) {
                for (l = 0, len1 = originItems.length; l < len1; l++) {
                  oi = originItems[l];
                  if (item._parent === oi) {
                    matched = true;
                    break;
                  }
                }
              } else {
                matched = item._parent === originItems;
              }
            }
            if (matched) {
              itemId = cola.Entity._getEntityId(item);
              if (itemId) {
                return itemScopeMap[itemId];
              } else {
                return null;
              }
            }
          }
          item = item._parent;
        }
      }
      return null;
    };

    ItemsScope.prototype.isRootOfTarget = function(changedPath, targetPath) {
      var i, isRoot, l, len1, len2, len3, o, part, q, targetPaths;
      if (!targetPath) {
        return false;
      }
      if (!changedPath) {
        return true;
      }
      if (targetPath instanceof Array) {
        targetPaths = targetPath;
        for (l = 0, len1 = targetPaths.length; l < len1; l++) {
          targetPath = targetPaths[l];
          isRoot = true;
          for (i = o = 0, len2 = changedPath.length; o < len2; i = ++o) {
            part = changedPath[i];
            if (part !== targetPath[i]) {
              isRoot = false;
              break;
            }
          }
          if (isRoot) {
            return true;
          }
        }
        return false;
      } else {
        for (i = q = 0, len3 = changedPath.length; q < len3; i = ++q) {
          part = changedPath[i];
          if (part !== targetPath[i]) {
            return false;
          }
        }
        return true;
      }
    };

    ItemsScope.prototype.repeatNotification = true;

    ItemsScope.prototype._processMessage = function(bindingPath, path, type, arg) {
      var allProcessed, id, itemScope, ref;
      if (this.messageTimestamp >= arg.timestamp) {
        return;
      }
      allProcessed = this.processItemsMessage(bindingPath, path, type, arg);
      if (allProcessed) {
        this.messageTimestamp = arg.timestamp;
      } else if (this.itemScopeMap) {
        itemScope = this.findItemDomBinding(arg.entity || arg.entityList);
        if (itemScope) {
          itemScope._processMessage(bindingPath, path, type, arg);
        } else {
          ref = this.itemScopeMap;
          for (id in ref) {
            itemScope = ref[id];
            itemScope._processMessage(bindingPath, path, type, arg);
          }
        }
      }
    };

    ItemsScope.prototype.isOriginItems = function(items) {
      var l, len1, originItems, ref;
      if (!this.originItems) {
        return false;
      }
      if (this.originItems === items) {
        return true;
      }
      if (this.originItems instanceof Array && this.originItems._multiItems) {
        ref = this.originItems;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          originItems = ref[l];
          if (originItems === items) {
            return true;
          }
        }
      }
      return false;
    };

    ItemsScope.prototype.processItemsMessage = function(bindingPath, path, type, arg) {
      var allProcessed, i, items, parent, ref, targetPath;
      targetPath = this.targetPath ? this.targetPath.concat(this.expressionPath) : this.expressionPath;
      if (type === cola.constants.MESSAGE_REFRESH) {
        if (this.isRootOfTarget(path, targetPath)) {
          this.refreshItems();
          allProcessed = true;
        }
      } else if (type === cola.constants.MESSAGE_DATA_CHANGE) {
        if (this.isRootOfTarget(path, targetPath)) {
          this.refreshItems();
          allProcessed = true;
        } else {
          parent = (ref = arg.entity) != null ? ref._parent : void 0;
          if (parent === this.items || this.isOriginItems(arg.parent)) {
            this.refreshItem(arg);
          }
        }
      } else if (type === cola.constants.MESSAGE_CURRENT_CHANGE) {
        if (arg.entityList === this.items || this.isOriginItems(arg.entityList)) {
          if (typeof this.onCurrentItemChange === "function") {
            this.onCurrentItemChange(arg);
          }
        } else if (this.isRootOfTarget(path, targetPath)) {
          this.refreshItems();
          allProcessed = true;
        }
      } else if (type === cola.constants.MESSAGE_INSERT) {
        if (arg.entityList === this.items) {
          this.insertItem(arg);
          allProcessed = true;
        } else if (this.isOriginItems(arg.entityList)) {
          this.retrieveItems();
          this.insertItem(arg);
          allProcessed = true;
        }
      } else if (type === cola.constants.MESSAGE_REMOVE) {
        if (arg.entityList === this.items) {
          this.removeItem(arg);
          allProcessed = true;
        } else if (this.isOriginItems(arg.entityList)) {
          items = this.items;
          if (items instanceof Array) {
            i = items.indexOf(arg.entity);
            if (i > -1) {
              items.splice(i, 1);
            }
          }
          this.removeItem(arg);
          allProcessed = true;
        }
      }
      return allProcessed;
    };

    return ItemsScope;

  })(cola.SubScope);


  /*
  DataModel
   */

  cola.AbstractDataModel = (function() {
    function AbstractDataModel(model1) {
      this.model = model1;
      this.disableObserverCount = 0;
    }

    AbstractDataModel.prototype.get = function(path, loadMode, context) {
      var aliasData, aliasHolder, callback, firstPart, i, prop, ref, ref1, rootData;
      if (!path) {
        return this._getRootData() || ((ref = this.model.parent) != null ? ref.get() : void 0);
      }
      if (this._aliasMap) {
        i = path.indexOf('.');
        firstPart = i > 0 ? path.substring(0, i) : path;
        aliasHolder = this._aliasMap[firstPart];
        if (aliasHolder) {
          aliasData = aliasHolder.data;
          if (i > 0) {
            if (typeof loadMode === "function") {
              loadMode = "async";
              callback = loadMode;
            }
            return cola.Entity._evalDataPath(aliasData, path.substring(i + 1), false, loadMode, callback, context);
          } else {
            return aliasData;
          }
        }
      }
      rootData = this._rootData;
      if (rootData != null) {
        if (this.model.parent) {
          i = path.indexOf('.');
          if (i > 0) {
            prop = path.substring(0, i);
          } else {
            prop = path;
          }
          if (rootData.hasValue(prop)) {
            return rootData.get(path, loadMode, context);
          } else {
            return this.model.parent.data.get(path, loadMode, context);
          }
        } else {
          return rootData.get(path, loadMode, context);
        }
      } else {
        return (ref1 = this.model.parent) != null ? ref1.data.get(path, loadMode, context) : void 0;
      }
    };

    AbstractDataModel.prototype.set = function(path, data, context) {
      var aliasHolder, firstPart, i, p, rootData;
      if (path) {
        rootData = this._getRootData();
        if (typeof path === "string") {
          i = path.indexOf('.');
          if (i > 0) {
            firstPart = path.substring(0, i);
            if (this._aliasMap) {
              aliasHolder = this._aliasMap[firstPart];
              if (aliasHolder) {
                if (aliasHolder.data) {
                  cola.Entity._setValue(aliasHolder.data, path.substring(i + 1), data, context);
                } else {
                  throw new cola.Exception("Cannot set value to \"" + path + "\"");
                }
                return this;
              }
            }
            if (this.model.parent) {
              if (rootData.hasValue(firstPart)) {
                rootData.set(path, data, context);
              } else {
                this.model.parent.data.set(path, data, context);
              }
            } else {
              rootData.set(path, data, context);
            }
          } else {
            this._set(path, data, context);
          }
        } else {
          data = path;
          for (p in data) {
            this.set(p, data[p], context);
          }
        }
      }
      return this;
    };

    AbstractDataModel.prototype._set = function(prop, data, context) {
      var aliasHolder, dataModel, hasValue, oldAliasData, oldAliasHolder, path, property, provider, ref, rootData, rootDataType;
      rootData = this._rootData;
      hasValue = rootData.hasValue(prop);
      if ((ref = this._aliasMap) != null ? ref[prop] : void 0) {
        oldAliasHolder = this._aliasMap[prop];
        if (oldAliasHolder.data !== data) {
          oldAliasData = oldAliasHolder.data;
          delete this._aliasMap[prop];
          this.unbind(oldAliasHolder.bindingPath, oldAliasHolder);
        }
      }
      if (data != null) {
        if (data.$provider || data.$dataType) {
          if (data.$provider) {
            provider = new cola.Provider(data.$provider);
          }
          rootDataType = rootData.dataType;
          property = rootDataType.getProperty(prop);
          if (property == null) {
            property = rootDataType.addProperty({
              property: prop
            });
          }
          if (provider) {
            property.set("provider", provider);
          }
          if (data.$dataType) {
            property.set("dataType", data.$dataType);
          }
        }
      }
      if (!provider || hasValue) {
        if (data && (data instanceof cola.Entity || data instanceof cola.EntityList) && data._parent && data !== rootData._data[prop]) {
          if (this._aliasMap == null) {
            this._aliasMap = {};
          }
          path = data.getPath("always");
          dataModel = this;
          this._aliasMap[prop] = aliasHolder = {
            data: data,
            path: path,
            bindingPath: path.slice(0).concat("**"),
            _processMessage: function(bindingPath, path, type, arg) {
              var relativePath;
              relativePath = path.slice(this.path.length);
              dataModel._onDataMessage([prop].concat(relativePath), type, arg);
            }
          };
          this.bind(aliasHolder.bindingPath, aliasHolder);
          this._onDataMessage([prop], cola.constants.MESSAGE_DATA_CHANGE, {
            entity: rootData,
            property: prop,
            oldValue: oldAliasData,
            value: data
          });
        } else {
          rootData.set(prop, data, context);
        }
      }
    };

    AbstractDataModel.prototype.flush = function(name, loadMode) {
      var ref;
      if ((ref = this._rootData) != null) {
        ref.flush(name, loadMode);
      }
      return this;
    };

    AbstractDataModel.prototype.bind = function(path, processor) {
      if (!this.bindingRegistry) {
        this.bindingRegistry = {
          __path: "",
          __processorMap: {}
        };
      }
      if (typeof path === "string") {
        path = path.split(".");
      }
      if (path) {
        if (this._bind(path, processor, false)) {
          this._bind(path, processor, true);
        }
      }
      return this;
    };

    AbstractDataModel.prototype._bind = function(path, processor, nonCurrent) {
      var hasNonCurrent, l, len1, node, nodePath, part, subNode;
      node = this.bindingRegistry;
      if (path) {
        for (l = 0, len1 = path.length; l < len1; l++) {
          part = path[l];
          if (!nonCurrent && part.charCodeAt(0) === 33) {
            hasNonCurrent = true;
            part = part.substring(1);
          }
          subNode = node[part];
          if (subNode == null) {
            nodePath = !node.__path ? part : node.__path + "." + part;
            node[part] = subNode = {
              __path: nodePath,
              __processorMap: {}
            };
          }
          node = subNode;
        }
        if (processor.id == null) {
          processor.id = cola.uniqueId();
        }
        node.__processorMap[processor.id] = processor;
      }
      return hasNonCurrent;
    };

    AbstractDataModel.prototype.unbind = function(path, processor) {
      if (!this.bindingRegistry) {
        return;
      }
      if (typeof path === "string") {
        path = path.split(".");
      }
      if (path) {
        if (this._unbind(path, processor, false)) {
          this._unbind(path, processor, true);
        }
      }
      return this;
    };

    AbstractDataModel.prototype._unbind = function(path, processor, nonCurrent) {
      var hasNonCurrent, l, len1, node, part;
      node = this.bindingRegistry;
      for (l = 0, len1 = path.length; l < len1; l++) {
        part = path[l];
        if (!nonCurrent && part.charCodeAt(0) === 33) {
          hasNonCurrent = true;
          part = part.substring(1);
        }
        node = node[part];
        if (node == null) {
          break;
        }
      }
      if (node != null) {
        delete node.__processorMap[processor.id];
      }
      return hasNonCurrent;
    };

    AbstractDataModel.prototype.disableObservers = function() {
      if (this.disableObserverCount < 0) {
        this.disableObserverCount = 1;
      } else {
        this.disableObserverCount++;
      }
      return this;
    };

    AbstractDataModel.prototype.enableObservers = function() {
      if (this.disableObserverCount < 1) {
        this.disableObserverCount = 0;
      } else {
        this.disableObserverCount--;
      }
      return this;
    };

    AbstractDataModel.prototype.isObserversDisabled = function() {
      return this.disableObserverCount > 0;
    };

    AbstractDataModel.prototype._onDataMessage = function(path, type, arg) {
      var anyChildNode, anyPropNode, i, l, lastIndex, len1, node, oldScope, part;
      if (arg == null) {
        arg = {};
      }
      if (!this.bindingRegistry) {
        return;
      }
      if (this.isObserversDisabled()) {
        return;
      }
      oldScope = cola.currentScope;
      cola.currentScope = this;
      try {
        if (!arg.timestamp) {
          arg.timestamp = cola.sequenceNo();
        }
        if (path) {
          node = this.bindingRegistry;
          lastIndex = path.length - 1;
          for (i = l = 0, len1 = path.length; l < len1; i = ++l) {
            part = path[i];
            if (i === lastIndex) {
              anyPropNode = node["*"];
            }
            if (anyPropNode) {
              this._processDataMessage(anyPropNode, path, type, arg);
            }
            anyChildNode = node["**"];
            if (anyChildNode) {
              this._processDataMessage(anyChildNode, path, type, arg);
            }
            node = node[part];
            if (!node) {
              break;
            }
          }
        } else {
          node = this.bindingRegistry;
          anyPropNode = node["*"];
          if (anyPropNode) {
            this._processDataMessage(anyPropNode, null, type, arg);
          }
          anyChildNode = node["**"];
          if (anyChildNode) {
            this._processDataMessage(anyChildNode, null, type, arg);
          }
        }
        if (node) {
          this._processDataMessage(node, path, type, arg, true);
        }
      } finally {
        cola.currentScope = oldScope;
      }
    };

    AbstractDataModel.prototype._processDataMessage = function(node, path, type, arg, notifyChildren) {
      var id, notifyChildren2, part, processor, processorMap, subNode;
      processorMap = node.__processorMap;
      for (id in processorMap) {
        processor = processorMap[id];
        if (!processor.disabled && (!(processor.timestamp >= arg.timestamp) || processor.repeatNotification)) {
          processor.timestamp = arg.timestamp;
          processor._processMessage(node.__path, path, type, arg);
        }
      }
      if (notifyChildren) {
        notifyChildren2 = !((cola.constants.MESSAGE_EDITING_STATE_CHANGE <= type && type <= cola.constants.MESSAGE_VALIDATION_STATE_CHANGE)) && !((cola.constants.MESSAGE_LOADING_START <= type && type <= cola.constants.MESSAGE_LOADING_END));
        if (type === cola.constants.MESSAGE_CURRENT_CHANGE) {
          type = cola.constants.MESSAGE_REFRESH;
        }
        for (part in node) {
          subNode = node[part];
          if (subNode && (part === "**" || notifyChildren2) && part !== "__processorMap" && part !== "__path") {
            this._processDataMessage(subNode, path, type, arg, true);
          }
        }
      }
    };

    return AbstractDataModel;

  })();

  cola.DataModel = (function(superClass) {
    extend(DataModel, superClass);

    function DataModel() {
      return DataModel.__super__.constructor.apply(this, arguments);
    }

    DataModel.prototype._getRootData = function() {
      var dataModel, rootData;
      if (this._rootData == null) {
        if (this._rootDataType == null) {
          this._rootDataType = new cola.EntityDataType();
        }
        this._rootData = rootData = new cola.Entity(this._rootDataType);
        rootData.state = cola.Entity.STATE_NEW;
        dataModel = this;
        rootData._setListener({
          onMessage: function(path, type, arg) {
            return dataModel._onDataMessage(path, type, arg);
          }
        });
      }
      return this._rootData;
    };

    DataModel.prototype.describe = function(property, config) {
      var dataType, propertyConfig, propertyDef, propertyName, ref;
      this._getRootData();
      if (typeof property === "string") {
        propertyDef = (ref = this._rootDataType) != null ? ref.getProperty(property) : void 0;
        if (config) {
          if (!propertyDef) {
            propertyDef = this._rootDataType.addProperty({
              property: property
            });
          }
          if (typeof config === "string") {
            dataType = this.getDefinition(config);
            if (!dataType) {
              throw new cola.Exception("Unrecognized DataType \"" + config + "\".");
            }
            propertyDef.set("dataType", dataType);
          } else {
            propertyDef.set(config);
          }
        }
      } else if (property) {
        config = property;
        for (propertyName in config) {
          propertyConfig = config[propertyName];
          this.describe(propertyName, propertyConfig);
        }
      }
    };

    DataModel.prototype.getProperty = function(path) {
      var ref;
      return (ref = this._rootDataType) != null ? ref.getProperty(path) : void 0;
    };

    DataModel.prototype.getDataType = function(path) {
      var dataType, property;
      property = this.getProperty(path);
      dataType = property != null ? property.get("dataType") : void 0;
      return dataType;
    };

    DataModel.prototype.getDefinition = function(name) {
      var definition, ref;
      definition = (ref = this._definitionStore) != null ? ref[name] : void 0;
      if (definition == null) {
        definition = cola.DataType.defaultDataTypes[name];
      }
      return definition;
    };

    DataModel.prototype.regDefinition = function(definition) {
      var name, store;
      name = definition._name;
      if (!name) {
        throw new cola.Exception("Attribute \"name\" cannot be emtpy.");
      }
      if (definition._scope && definition._scope !== this.model) {
        throw new cola.Exception("DataType(" + definition._name + ") is already belongs to anthor Model.");
      }
      store = this._definitionStore;
      if (store == null) {
        this._definitionStore = store = {};
      } else if (store[name]) {
        throw new cola.Exception("Duplicated Definition name \"" + name + "\".");
      }
      store[name] = definition;
      return this;
    };

    DataModel.prototype.unregDefinition = function(name) {
      var definition;
      if (this._definitionStore) {
        definition = this._definitionStore[name];
        delete this._definitionStore[name];
      }
      return definition;
    };

    return DataModel;

  })(cola.AbstractDataModel);

  cola.AliasDataModel = (function(superClass) {
    extend(AliasDataModel, superClass);

    function AliasDataModel(model1, alias1, dataType1) {
      var parentModel;
      this.model = model1;
      this.alias = alias1;
      this.dataType = dataType1;
      parentModel = this.model.parent;
      while (parentModel) {
        if (parentModel.data) {
          this.parent = parentModel.data;
          break;
        }
        parentModel = parentModel.parent;
      }
    }

    AliasDataModel.prototype.getTargetData = function() {
      return this._targetData;
    };

    AliasDataModel.prototype.setTargetData = function(data, silence) {
      var oldData;
      oldData = this._targetData;
      if (oldData === data) {
        return;
      }
      this._targetData = data;
      if (data && (data instanceof cola.Entity || data instanceof cola.EntityList)) {
        this._targetPath = data.getPath();
      }
      if (!silence) {
        this._onDataMessage([this.alias], cola.constants.MESSAGE_DATA_CHANGE, {
          entity: null,
          property: this.alias,
          value: data,
          oldValue: oldData
        });
      }
    };

    AliasDataModel.prototype.describe = function(property, config) {
      if (property === this.alias) {
        return AliasDataModel.__super__.describe.call(this, property, config);
      } else {
        return this.parent.describe(property, config);
      }
    };

    AliasDataModel.prototype.getDataType = function(path) {
      var dataType, i, property, ref;
      i = path.indexOf(".");
      if (i > 0) {
        if (path.substring(0, i) === this.alias) {
          if (this._rootDataType) {
            property = (ref = this._rootDataType) != null ? ref.getProperty(path.substring(i + 1)) : void 0;
            dataType = property != null ? property.get("dataType") : void 0;
          }
          return dataType;
        } else {
          return this.parent.getDataType(path);
        }
      } else if (path === this.alias) {
        return this.dataType;
      } else {
        return this.parent.getDataType(path);
      }
    };

    AliasDataModel.prototype.getDefinition = function(name) {
      return this.parent.getDefinition(name);
    };

    AliasDataModel.prototype.regDefinition = function(definition) {
      return this.parent.regDefinition(definition);
    };

    AliasDataModel.prototype.unregDefinition = function(definition) {
      return this.parent.unregDefinition(definition);
    };

    AliasDataModel.prototype._bind = function(path, processor, nonCurrent) {
      var hasNonCurrent, i;
      hasNonCurrent = AliasDataModel.__super__._bind.call(this, path, processor, nonCurrent);
      i = path.indexOf(".");
      if (i > 0) {
        if (path.substring(0, i) !== this.alias) {
          this.model.watchAllMessages();
        }
      } else if (path !== this.alias) {
        this.model.watchAllMessages();
      }
      return hasNonCurrent;
    };

    AliasDataModel.prototype._processMessage = function(bindingPath, path, type, arg) {
      var i, l, len1, matching, part, relativePath, targetPart, targetPath;
      this._onDataMessage(path, type, arg);
      targetPath = this._targetPath;
      if (targetPath != null ? targetPath.length : void 0) {
        matching = true;
        for (i = l = 0, len1 = targetPath.length; l < len1; i = ++l) {
          targetPart = targetPath[i];
          part = path[i];
          if (part && part.charCodeAt(0) === 33) {
            part = part.substring(1);
          }
          if (part !== targetPart) {
            matching = false;
            break;
          }
        }
        if (matching) {
          relativePath = path.slice(targetPath.length);
          this._onDataMessage([this.alias].concat(relativePath), type, arg);
        }
      }
    };

    AliasDataModel.prototype.get = function(path, loadMode, context) {
      var alias, aliasLen, c, targetData;
      alias = this.alias;
      aliasLen = alias.length;
      if (path.substring(0, aliasLen) === alias) {
        c = path.charCodeAt(aliasLen);
        if (c === 46) {
          if (path.indexOf(".") > 0) {
            targetData = this._targetData;
            if (targetData instanceof cola.Entity) {
              return targetData.get(path.substring(aliasLen + 1), loadMode, context);
            } else if (targetData && typeof targetData === "object") {
              return targetData[path.substring(aliasLen + 1)];
            }
          }
        } else if (isNaN(c)) {
          return this._targetData;
        }
      }
      return this.parent.get(path, loadMode, context);
    };

    AliasDataModel.prototype.set = function(path, data, context) {
      var alias, aliasLen, c, ref;
      alias = this.alias;
      aliasLen = alias.length;
      if (path.substring(0, aliasLen) === alias) {
        c = path.charCodeAt(aliasLen);
        if (c === 46) {
          if (path.indexOf(".") > 0) {
            if ((ref = this._targetData) != null) {
              ref.set(path.substring(aliasLen + 1), data, context);
            }
            return this;
          }
        } else if (isNaN(c)) {
          this.setTargetData(data);
          return this;
        }
      }
      this.parent.set(path, data, context);
      return this;
    };

    AliasDataModel.prototype.dataType = function(path) {
      return this.parent.dataType(path);
    };

    AliasDataModel.prototype.regDefinition = function(name, definition) {
      this.parent.regDefinition(name, definition);
      return this;
    };

    AliasDataModel.prototype.unregDefinition = function(name) {
      return this.parent.unregDefinition(name);
    };

    AliasDataModel.prototype.flush = function(path, loadMode) {
      var alias, c, ref, ref1;
      alias = this.alias;
      if (path.substring(0, alias.length) === alias) {
        c = path.charCodeAt(1);
        if (c === 46) {
          if ((ref = this._targetData) != null) {
            ref.flush(path.substring(alias.length + 1), loadMode);
          }
          return this;
        } else if (isNaN(c)) {
          if ((ref1 = this._targetData) != null) {
            ref1.flush(loadMode);
          }
          return this;
        }
      }
      this.parent.flush(path, loadMode);
      return this;
    };

    AliasDataModel.prototype.disableObservers = function() {
      this.parent.disableObservers();
      return this;
    };

    AliasDataModel.prototype.enableObservers = function() {
      this.parent.enableObservers();
      return this;
    };

    AliasDataModel.prototype.isObserversDisabled = function() {
      return this.parent.isObserversDisabled();
    };

    return AliasDataModel;

  })(cola.AbstractDataModel);


  /*
  Root Model
   */

  new cola.Model(cola.constants.DEFAULT_PATH);


  /*
  Function
   */

  cola.data = function(config) {
    var dataType, k, name, provider, v;
    if (!config) {
      return config;
    }
    if (config.provider) {
      provider = config.provider;
    } else {
      provider = {};
      for (k in config) {
        v = config[k];
        if (k !== "dataType") {
          provider[k] = v;
        }
      }
    }
    dataType = config.dataType;
    if (dataType) {
      if (typeof dataType === "string") {
        name = dataType;
        dataType = cola.currentScope.dataType(name);
        if (!dataType) {
          throw new cola.Exception("Unrecognized DataType \"" + name + "\".");
        }
      } else if (!(dataType instanceof cola.DataType)) {
        dataType = new cola.EntityDataType(dataType);
      }
    }
    return {
      $dataType: dataType,
      $provider: provider
    };
  };


  /*
  Element binding
   */

  cola.ElementAttrBinding = (function() {
    function ElementAttrBinding(element1, attr1, expression1, scope) {
      var l, len1, p, path;
      this.element = element1;
      this.attr = attr1;
      this.expression = expression1;
      this.scope = scope;
      this.path = path = this.expression.path;
      if (!path && this.expression.hasCallStatement) {
        this.path = path = "**";
        this.watchingMoreMessage = this.expression.hasCallStatement || this.expression.convertors;
      }
      if (path) {
        if (typeof path === "string") {
          scope.data.bind(path, this);
        } else {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            scope.data.bind(p, this);
          }
        }
      }
    }

    ElementAttrBinding.prototype.destroy = function() {
      var l, len1, p, path, scope;
      path = this.path;
      if (path) {
        scope = this.scope;
        if (typeof path === "string") {
          scope.data.unbind(path, this);
        } else {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            this.scope.data.unbind(p, this);
          }
        }
      }
    };

    ElementAttrBinding.prototype._processMessage = function(bindingPath, path, type) {
      if ((cola.constants.MESSAGE_REFRESH <= type && type <= cola.constants.MESSAGE_CURRENT_CHANGE) || this.watchingMoreMessage) {
        this.refresh();
      }
    };

    ElementAttrBinding.prototype.evaluate = function(dataCtx) {
      if (dataCtx == null) {
        dataCtx = {};
      }
      return this.expression.evaluate(this.scope, "async", dataCtx);
    };

    ElementAttrBinding.prototype._refresh = function() {
      var element;
      value = this.evaluate(this.attr);
      element = this.element;
      element._duringBindingRefresh = true;
      try {
        element.set(this.attr, value);
      } finally {
        element._duringBindingRefresh = false;
      }
    };

    ElementAttrBinding.prototype.refresh = function() {
      if (!this._refresh) {
        return;
      }
      if (this.delay) {
        cola.util.delay(this, "refresh", 100, function() {
          this._refresh();
        });
      } else {
        this._refresh();
      }
    };

    return ElementAttrBinding;

  })();

  cola.model.defaultActions.not = function(value) {
    return !value;
  };

  cola.model.defaultActions.i18n = function() {
    var key, params;
    key = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return cola.i18n.apply(cola, [key].concat(slice.call(params)));
  };

  cola.submit = function(options, callback) {
    var data, filter, originalOptions, p, v;
    originalOptions = options;
    options = {};
    for (p in originalOptions) {
      v = originalOptions[p];
      options[p] = v;
    }
    data = options.data;
    if (data) {
      if (!(data instanceof cola.Entity || data instanceof cola.EntityList)) {
        throw new cola.Exception("Invalid submit data.");
      }
      if (this.dataFilter) {
        filter = cola.submit.filter[this.dataFilter];
        data = filter ? filter(data) : data;
      }
    }
    if (data || options.alwaysSubmit) {
      if (options.parameter) {
        options.data = {
          data: data,
          parameter: options.parameter
        };
      } else {
        options.data = data;
      }
      jQuery.post(options.url, options.data).done(function(result) {
        cola.callback(callback, true, result);
      }).fail(function(result) {
        cola.callback(callback, true, result);
      });
      return true;
    } else {
      return false;
    }
  };

  cola.submit.filter = {
    "dirty": function(data) {
      var filtered;
      if (data instanceof cola.EntityList) {
        filtered = [];
        data.each(function(entity) {
          if (entity.state !== cola.Entity.STATE_NONE) {
            filtered.push(entity);
          }
        });
      } else if (data.state !== cola.Entity.STATE_NONE) {
        filtered = data;
      }
      return filtered;
    },
    "child-dirty": function(data) {
      return data;
    },
    "dirty-tree": function(data) {
      return data;
    }
  };

  if (typeof exports !== "undefined" && exports !== null) {
    cola = require("./util");
    if (typeof module !== "undefined" && module !== null) {
      module.exports = cola;
    }
  } else {
    cola = this.cola;
  }

  _$ = $();

  _$.length = 1;

  this.$fly = function(dom) {
    _$[0] = dom;
    return _$;
  };

  doms = {};

  cola.util.cacheDom = function(ele) {
    if (!doms.hiddenDiv) {
      doms.hiddenDiv = $.xCreate({
        tagName: "div",
        id: "_hidden_div",
        style: {
          display: "none"
        }
      });
      doms.hiddenDiv.setAttribute(cola.constants.IGNORE_DIRECTIVE, "");
      document.body.appendChild(doms.hiddenDiv);
    }
    cola._ignoreNodeRemoved = true;
    doms.hiddenDiv.appendChild(ele);
    cola._ignoreNodeRemoved = false;
  };

  USER_DATA_KEY = cola.constants.DOM_USER_DATA_KEY;

  cola.util.userDataStore = {};

  cola.util.userData = function(node, key, data) {
    var i, id, store, text, userData;
    if (node.nodeType === 3) {
      return;
    }
    userData = cola.util.userDataStore;
    if (node.nodeType === 8) {
      text = node.nodeValue;
      i = text.indexOf("|");
      if (i > -1) {
        id = text.substring(i + 1);
      }
    } else {
      id = node.getAttribute(USER_DATA_KEY);
    }
    if (arguments.length === 3) {
      if (!id) {
        id = cola.uniqueId();
        if (node.nodeType === 8) {
          if (i > -1) {
            node.nodeValue = text.substring(0, i + 1) + id;
          } else {
            node.nodeValue = text ? text + "|" + id : "|" + id;
          }
        } else {
          node.setAttribute(USER_DATA_KEY, id);
        }
        userData[id] = store = {};
      } else {
        store = userData[id];
        if (!store) {
          userData[id] = store = {};
        }
      }
      store[key] = data;
    } else if (arguments.length === 2) {
      if (typeof key === "string") {
        if (id) {
          store = userData[id];
          return store != null ? store[key] : void 0;
        }
      } else if (key && typeof key === "object") {
        id = cola.uniqueId();
        if (node.nodeType === 8) {
          if (i > -1) {
            node.nodeValue = text.substring(0, i + 1) + id;
          } else {
            node.nodeValue = text ? text + "|" + id : "|" + id;
          }
        } else {
          node.setAttribute(USER_DATA_KEY, id);
        }
        userData[id] = key;
      }
    } else if (arguments.length === 1) {
      if (id) {
        return userData[id];
      }
    }
  };

  cola.util.removeUserData = function(node, key) {
    var id, store;
    id = node.getAttribute(USER_DATA_KEY);
    if (id) {
      store = cola.util.userDataStore[id];
      if (store) {
        delete store[key];
      }
    }
  };

  ON_NODE_REMOVED_KEY = "__onNodeRemoved";

  cola.detachNode = function(node) {
    if (!node.parentNode) {
      return;
    }
    cola._ignoreNodeRemoved = true;
    node.parentNode.removeChild(ele);
    cola._ignoreNodeRemoved = false;
  };

  cola.util.onNodeRemoved = function(node, listener) {
    var oldListener;
    oldListener = cola.util.userData(node, ON_NODE_REMOVED_KEY);
    if (oldListener) {
      if (oldListener instanceof Array) {
        oldListener.push(listener);
      } else {
        cola.util.userData(node, ON_NODE_REMOVED_KEY, [oldListener, listener]);
      }
    } else {
      cola.util.userData(node, ON_NODE_REMOVED_KEY, listener);
    }
  };

  _removeNodeData = function(node) {
    var i, id, l, len1, listener, nodeRemovedListener, store, text;
    if (node.nodeType === 3) {
      return;
    }
    if (node.nodeType === 8) {
      text = node.nodeValue;
      i = text.indexOf("|");
      if (i > -1) {
        id = text.substring(i + 1);
      }
    } else {
      id = node.getAttribute(USER_DATA_KEY);
    }
    if (id) {
      store = cola.util.userDataStore[id];
      if (store) {
        nodeRemovedListener = store[ON_NODE_REMOVED_KEY];
        if (nodeRemovedListener) {
          if (nodeRemovedListener instanceof Array) {
            for (l = 0, len1 = nodeRemovedListener.length; l < len1; l++) {
              listener = nodeRemovedListener[l];
              listener(node, store);
            }
          } else {
            nodeRemovedListener(node, store);
          }
        }
        delete cola.util.userDataStore[id];
      }
    }
  };

  _DOMNodeRemovedListener = function(evt) {
    var child, node;
    if (cola._ignoreNodeRemoved || window.closed) {
      return;
    }
    node = evt.target;
    if (!node) {
      return;
    }
    child = node.firstChild;
    while (child) {
      _removeNodeData(child);
      child = child.nextSibling;
    }
    _removeNodeData(node);
  };

  document.addEventListener("DOMNodeRemoved", _DOMNodeRemovedListener);

  $fly(window).on("unload", function() {
    document.removeEventListener("DOMNodeRemoved", _DOMNodeRemovedListener);
  });

  if (cola.device.mobile) {
    $fly(window).on("load", function() {
      FastClick.attach(document.body);
    });
  }

  if (cola.browser.webkit) {
    browser = "webkit";
    if (cola.browser.chrome) {
      browser += " chrome";
    } else if (cola.browser.safari) {
      browser += " safari";
    }
  } else if (cola.browser.ie) {
    browser = "ie";
  } else if (cola.browser.mozilla) {
    browser = "mozilla";
  } else {
    browser = "";
  }

  if (cola.os.android) {
    os = " android";
  } else if (cola.os.ios) {
    os = " ios";
  } else if (cola.os.windows) {
    os = " windows";
  } else {
    os = "";
  }

  if (cola.device.mobile) {
    os += " mobile";
  } else if (cola.device.desktop) {
    os += " desktop";
  }

  if (browser || os) {
    $fly(document.documentElement).addClass(browser + os);
  }

  if (cola.os.mobile) {
    $(function() {
      if (typeof FastClick !== "undefined" && FastClick !== null) {
        FastClick.attach(document.body);
      }
    });
  }

  cola.loadSubView = function(targetDom, context) {
    var cssUrl, cssUrls, failed, htmlUrl, jsUrl, jsUrls, l, len1, len2, len3, len4, loadingUrls, o, q, r, ref, ref1, resourceLoadCallback;
    loadingUrls = [];
    failed = false;
    resourceLoadCallback = function(success, context, url) {
      var error, errorMessage, i, initFunc, l, len1, ref;
      if (success) {
        if (!failed) {
          i = loadingUrls.indexOf(url);
          if (i > -1) {
            loadingUrls.splice(i, 1);
          }
          if (loadingUrls.length === 0) {
            $fly(targetDom).removeClass("loading");
            if (context.suspendedInitFuncs.length) {
              ref = context.suspendedInitFuncs;
              for (l = 0, len1 = ref.length; l < len1; l++) {
                initFunc = ref[l];
                initFunc(targetDom, context.model, context.param);
              }
            } else {
              cola(targetDom, context.model);
            }
            if (cola.getListeners("ready")) {
              cola.fire("ready", cola);
              cola.off("ready");
            }
            cola.callback(context.callback, true);
          }
        }
      } else {
        failed = true;
        error = context;
        if (cola.callback(context.callback, false, error) !== false) {
          if (error.xhr) {
            errorMessage = error.status + " " + error.statusText;
          } else {
            errorMessage = error.message;
          }
          throw new cola.Exception(("Failed to load resource from [" + url + "]. ") + errorMessage);
        }
      }
    };
    $fly(targetDom).addClass("loading");
    htmlUrl = context.htmlUrl;
    if (htmlUrl) {
      loadingUrls.push(htmlUrl);
    }
    if (context.jsUrl) {
      jsUrls = [];
      if (context.jsUrl instanceof Array) {
        ref = context.jsUrl;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          jsUrl = ref[l];
          jsUrl = _compileResourceUrl(jsUrl, htmlUrl, ".js");
          if (jsUrl) {
            loadingUrls.push(jsUrl);
            jsUrls.push(jsUrl);
          }
        }
      } else {
        jsUrl = _compileResourceUrl(context.jsUrl, htmlUrl, ".js");
        if (jsUrl) {
          loadingUrls.push(jsUrl);
          jsUrls.push(jsUrl);
        }
      }
    }
    if (context.cssUrl) {
      cssUrls = [];
      if (context.cssUrl instanceof Array) {
        ref1 = context.cssUrl;
        for (o = 0, len2 = ref1.length; o < len2; o++) {
          cssUrl = ref1[o];
          cssUrl = _compileResourceUrl(cssUrl, htmlUrl, ".css");
          if (cssUrl) {
            cssUrls.push(cssUrl);
          }
        }
      } else {
        cssUrl = _compileResourceUrl(context.cssUrl, htmlUrl, ".css");
        if (cssUrl) {
          cssUrls.push(cssUrl);
        }
      }
    }
    context.suspendedInitFuncs = [];
    if (htmlUrl) {
      _loadHtml(targetDom, htmlUrl, void 0, {
        complete: function(success, result) {
          return resourceLoadCallback(success, (success ? context : result), htmlUrl);
        }
      });
    }
    if (jsUrls) {
      for (q = 0, len3 = jsUrls.length; q < len3; q++) {
        jsUrl = jsUrls[q];
        _loadJs(context, jsUrl, {
          complete: function(success, result) {
            return resourceLoadCallback(success, (success ? context : result), jsUrl);
          }
        });
      }
    }
    if (cssUrls) {
      for (r = 0, len4 = cssUrls.length; r < len4; r++) {
        cssUrl = cssUrls[r];
        _loadCss(cssUrl);
      }
    }
  };

  _compileResourceUrl = function(resUrl, htmlUrl, suffix) {
    var defaultRes, i;
    if (resUrl === "$") {
      defaultRes = true;
    } else if (resUrl.indexOf("$.") === 0) {
      defaultRes = true;
      suffix = resUrl.substring(2);
    }
    if (defaultRes) {
      resUrl = null;
      if (htmlUrl) {
        i = htmlUrl.lastIndexOf(".");
        resUrl = (i > 0 ? htmlUrl.substring(0, i) : htmlUrl) + suffix;
      }
    }
    return resUrl;
  };

  _loadHtml = function(targetDom, url, data, callback) {
    $(targetDom).load(url, data, function(response, status, xhr) {
      if (status === "error") {
        cola.callback(callback, false, {
          xhr: xhr,
          status: xhr.status,
          statusText: xhr.statusText
        });
      } else {
        cola.callback(callback, true);
      }
    });
  };

  _jsCache = {};

  _loadJs = function(context, url, callback) {
    var initFuncs;
    initFuncs = _jsCache[url];
    if (initFuncs) {
      Array.prototype.push.apply(context.suspendedInitFuncs, initFuncs);
      cola.callback(callback, true);
    } else {
      $.ajax(url, {
        dataType: "text",
        cache: true
      }).done(function(script) {
        var e, head, scriptElement;
        scriptElement = $.xCreate({
          tagName: "script",
          language: "javascript",
          type: "text/javascript",
          charset: cola.setting("defaultCharset")
        });
        scriptElement.text = script;
        cola._suspendedInitFuncs = context.suspendedInitFuncs;
        try {
          try {
            head = document.querySelector("head") || document.documentElement;
            head.appendChild(scriptElement);
          } finally {
            delete cola._suspendedInitFuncs;
            _jsCache[url] = context.suspendedInitFuncs;
          }
          cola.callback(callback, true);
        } catch (_error) {
          e = _error;
          cola.callback(callback, false, e);
        }
      }).fail(function(xhr) {
        cola.callback(callback, false, {
          xhr: xhr,
          status: xhr.status,
          statusText: xhr.statusText
        });
      });
    }
  };

  _cssCache = {};

  _loadCss = function(url) {
    var head, linkElement;
    if (!_cssCache[url]) {
      linkElement = $.xCreate({
        tagName: "link",
        rel: "stylesheet",
        type: "text/css",
        charset: cola.setting("defaultCharset"),
        href: url
      });
      head = document.querySelector("head") || document.documentElement;
      head.appendChild(linkElement);
      _cssCache[url] = true;
    }
  };

  routerRegistry = null;

  currentRoutePath = null;

  currentRouter = null;

  trimPath = function(path) {
    if (path) {
      if (path.charCodeAt(0) === 47) {
        path = path.substring(1);
      }
      if (path.charCodeAt(path.length - 1) === 47) {
        path = path.substring(0, path.length - 1);
      }
    }
    return path || "";
  };

  cola.route = function(path, router) {
    var hasVariable, l, len1, optional, part, pathParts, ref, variable;
    if (routerRegistry == null) {
      routerRegistry = new cola.util.KeyedArray();
    }
    if (typeof router === "function") {
      router = {
        enter: router
      };
    }
    path = trimPath(path);
    router.path = path;
    if (router.model == null) {
      router.model = path || cola.constants.DEFAULT_PATH;
    }
    router.pathParts = pathParts = [];
    if (path) {
      hasVariable = false;
      ref = path.split("/");
      for (l = 0, len1 = ref.length; l < len1; l++) {
        part = ref[l];
        if (part.charCodeAt(0) === 58) {
          optional = part.charCodeAt(part.length - 1) === 63;
          if (optional) {
            variable = part.substring(1, part.length - 1);
          } else {
            variable = part.substring(1);
          }
          hasVariable = true;
          pathParts.push({
            variable: variable,
            optional: optional
          });
        } else {
          pathParts.push(part);
        }
      }
      router.hasVariable = hasVariable;
    }
    routerRegistry.add(path, router);
    return this;
  };

  cola.getCurrentRoutePath = function() {
    return currentRoutePath;
  };

  cola.getCurrentRouter = function() {
    return currentRouter;
  };

  cola.setRoutePath = function(path) {
    var routerMode;
    if (path && path.charCodeAt(0) === 35) {
      routerMode = "hash";
      path = path.substring(1);
    }
    if (routerMode === "hash") {
      if (path.charCodeAt(0) !== 47) {
        path = "/" + path;
      }
      if (window.location.hash !== path) {
        window.location.hash = path;
      }
    } else {
      window.history.pushState({
        path: path
      }, null, path);
      _onStateChange(path);
    }
  };

  _findRouter = function(path) {
    var defPart, defPathParts, gap, i, l, len1, len2, matching, o, param, pathParts, ref, router;
    if (!routerRegistry) {
      return null;
    }
    path || (path = trimPath(cola.setting("defaultRouterPath")));
    pathParts = path ? path.split(/[\/\?\#]/) : [];
    ref = routerRegistry.elements;
    for (l = 0, len1 = ref.length; l < len1; l++) {
      router = ref[l];
      defPathParts = router.pathParts;
      gap = defPathParts.length - pathParts.length;
      if (!(gap === 0 || gap === 1 && defPathParts.length > 0 && defPathParts[defPathParts.length - 1].optional)) {
        continue;
      }
      matching = true;
      param = {};
      for (i = o = 0, len2 = defPathParts.length; o < len2; i = ++o) {
        defPart = defPathParts[i];
        if (typeof defPart === "string") {
          if (defPart !== pathParts[i]) {
            matching = false;
            break;
          }
        } else {
          if (i >= pathParts.length && !defPart.optional) {
            matching = false;
            break;
          }
          param[defPart.variable] = pathParts[i];
        }
      }
      if (matching) {
        break;
      }
    }
    if (matching) {
      router.param = param;
      return router;
    } else {
      return null;
    }
  };

  _switchRouter = function(router, path) {
    var eventArg, model, oldModel, parentModel, parentModelName, target;
    if (router.redirectTo) {
      cola.setRoutePath(router.redirectTo);
      return;
    }
    eventArg = {
      path: path,
      prev: currentRouter,
      next: router
    };
    cola.fire("beforeRouterSwitch", cola, eventArg);
    if (currentRouter) {
      oldModel = currentRouter.realModel;
      if (typeof currentRouter.leave === "function") {
        currentRouter.leave(currentRouter, oldModel);
      }
      delete currentRouter.realModel;
      if (currentRouter.destroyModel) {
        if (oldModel != null) {
          oldModel.destroy();
        }
      }
    }
    if (router.templateUrl) {
      if (router.target) {
        if (router.target.nodeType) {
          target = router.target;
        } else {
          target = $(router.target)[0];
        }
      }
      if (!target) {
        target = document.getElementsByClassName(cola.constants.VIEW_PORT_CLASS)[0];
        if (!target) {
          target = document.getElementsByClassName(cola.constants.VIEW_CLASS)[0];
          if (!target) {
            target = document.body;
          }
        }
      }
      router.targetDom = target;
      $fly(target).empty();
    }
    currentRouter = router;
    if (typeof router.model === "string") {
      model = cola.model(router.model);
    } else if (router.model instanceof cola.Model) {
      model = router.model;
    }
    if (!model) {
      parentModelName = router.parentModel || cola.constants.DEFAULT_PATH;
      parentModel = cola.model(parentModelName);
      if (!parentModel) {
        throw new cola.Exception("Parent Model \"" + parentModelName + "\" is undefined.");
      }
      model = new cola.Model(router.model, parentModel);
      router.destroyModel = true;
    } else {
      router.destroyModel = false;
    }
    router.realModel = model;
    if (router.templateUrl) {
      cola.loadSubView(router.targetDom, {
        model: model,
        htmlUrl: router.templateUrl,
        jsUrl: router.jsUrl,
        cssUrl: router.cssUrl,
        data: router.data,
        param: router.param,
        callback: function() {
          if (typeof router.enter === "function") {
            router.enter(router, model);
          }
          if (router.title) {
            document.title = router.title;
          }
        }
      });
    } else {
      if (typeof router.enter === "function") {
        router.enter(router, model);
      }
      if (router.title) {
        document.title = router.title;
      }
    }
    cola.fire("routerSwitch", cola, eventArg);
  };

  _getHashPath = function() {
    var path;
    path = location.hash;
    if (path) {
      path = path.substring(1);
    }
    if ((path != null ? path.charCodeAt(0) : void 0) === 33) {
      path = path.substring(1);
    }
    path = trimPath(path);
    return path || "";
  };

  _onHashChange = function() {
    var path, router;
    path = _getHashPath();
    if (path === currentRoutePath) {
      return;
    }
    currentRoutePath = path;
    router = _findRouter(path);
    if (router) {
      _switchRouter(router, path);
    }
  };

  _onStateChange = function(path) {
    var i, router;
    path = trimPath(path);
    i = path.indexOf("#");
    if (i > -1) {
      path = path.substring(i + 1);
    } else {
      i = path.indexOf("?");
      if (i > -1) {
        path = path.substring(0, i);
      }
    }
    if (path === currentRoutePath) {
      return;
    }
    currentRoutePath = path;
    router = _findRouter(path);
    if (router) {
      _switchRouter(router, path);
    }
  };

  $(function() {
    setTimeout(function() {
      var path, router;
      $fly(window).on("hashchange", _onHashChange).on("popstate", function() {
        var state;
        if (!location.hash) {
          state = window.history.state;
          _onStateChange((state != null ? state.path : void 0) || "");
        }
      });
      $(document.body).delegate("a.state", "click", function() {
        var href;
        href = this.getAttribute("href");
        if (href) {
          cola.setRoutePath(href);
        }
        return false;
      });
      path = _getHashPath() || trimPath(cola.setting("defaultRouterPath"));
      router = _findRouter(path);
      if (router) {
        currentRoutePath = path;
        _switchRouter(router, path);
      }
    }, 0);
  });


  /*
  BindingFeature
   */

  cola._BindingFeature = (function() {
    function _BindingFeature() {}

    _BindingFeature.prototype.init = function() {};

    return _BindingFeature;

  })();

  cola._ExpressionFeature = (function(superClass) {
    extend(_ExpressionFeature, superClass);

    function _ExpressionFeature(expression1) {
      this.expression = expression1;
      if (this.expression) {
        this.isStatic = this.expression.isStatic;
        this.path = this.expression.path;
        if (!this.path && this.expression.hasCallStatement) {
          this.path = "**";
          this.delay = true;
        }
        this.watchingMoreMessage = this.expression.hasCallStatement || this.expression.convertors;
      }
    }

    _ExpressionFeature.prototype.evaluate = function(domBinding, dataCtx) {
      return this.expression.evaluate(domBinding.scope, "async", dataCtx);
    };

    _ExpressionFeature.prototype.refresh = function(domBinding, force, dataCtx) {
      if (dataCtx == null) {
        dataCtx = {};
      }
      if (!this._refresh) {
        return;
      }
      if (this.delay && !force) {
        cola.util.delay(this, "refresh", 100, function() {
          this._refresh(domBinding, dataCtx);
          if (this.isStatic && !dataCtx.unloaded) {
            this.disabled = true;
          }
        });
      } else {
        this._refresh(domBinding, dataCtx);
        if (this.isStatic && !dataCtx.unloaded) {
          this.disabled = true;
        }
      }
    };

    return _ExpressionFeature;

  })(cola._BindingFeature);

  cola._WatchFeature = (function(superClass) {
    extend(_WatchFeature, superClass);

    function _WatchFeature(action1, path1) {
      this.action = action1;
      this.path = path1;
      this.watchingMoreMessage = true;
    }

    _WatchFeature.prototype._processMessage = function(domBinding) {
      this.refresh(domBinding);
    };

    _WatchFeature.prototype.refresh = function(domBinding) {
      var action;
      action = domBinding.scope.action(this.action);
      if (!action) {
        throw new cola.Exception("No action named \"" + this.action + "\" found.");
      }
      action(domBinding.dom, domBinding.scope);
    };

    return _WatchFeature;

  })(cola._BindingFeature);

  cola._EventFeature = (function(superClass) {
    extend(_EventFeature, superClass);

    function _EventFeature(expression1, event1) {
      this.expression = expression1;
      this.event = event1;
    }

    _EventFeature.prototype.init = function(domBinding) {
      var expression;
      expression = this.expression;
      domBinding.$dom.bind(this.event, function() {
        var oldScope;
        oldScope = cola.currentScope;
        cola.currentScope = domBinding.scope;
        try {
          return expression.evaluate(domBinding.scope, "never");
        } finally {
          cola.currentScope = oldScope;
        }
      });
    };

    return _EventFeature;

  })(cola._ExpressionFeature);

  cola._AliasFeature = (function(superClass) {
    extend(_AliasFeature, superClass);

    function _AliasFeature(expression) {
      _AliasFeature.__super__.constructor.call(this, expression);
      this.alias = expression.alias;
    }

    _AliasFeature.prototype.init = function(domBinding) {
      domBinding.scope = new cola.AliasScope(domBinding.scope, this.expression);
      domBinding.subScopeCreated = true;
    };

    _AliasFeature.prototype._processMessage = function(domBinding, bindingPath, path, type, arg) {
      if ((cola.constants.MESSAGE_REFRESH <= type && type <= cola.constants.MESSAGE_CURRENT_CHANGE) || this.watchingMoreMessage) {
        this.refresh(domBinding);
      }
    };

    _AliasFeature.prototype._refresh = function(domBinding, dataCtx) {
      var data;
      data = this.evaluate(domBinding, dataCtx);
      domBinding.scope.data.setTargetData(data);
    };

    return _AliasFeature;

  })(cola._ExpressionFeature);

  cola._RepeatFeature = (function(superClass) {
    extend(_RepeatFeature, superClass);

    function _RepeatFeature(expression) {
      _RepeatFeature.__super__.constructor.call(this, expression);
      this.alias = expression.alias;
    }

    _RepeatFeature.prototype.init = function(domBinding) {
      var scope;
      domBinding.scope = scope = new cola.ItemsScope(domBinding.scope, this.expression);
      scope.onItemsRefresh = (function(_this) {
        return function() {
          _this.onItemsRefresh(domBinding);
        };
      })(this);
      scope.onCurrentItemChange = function(arg) {
        var currentItemDomBinding, itemId;
        if (domBinding.currentItemDom) {
          $fly(domBinding.currentItemDom).removeClass(cola.constants.COLLECTION_CURRENT_CLASS);
        }
        if (arg.current && domBinding.itemDomBindingMap) {
          itemId = cola.Entity._getEntityId(arg.current);
          if (itemId) {
            currentItemDomBinding = domBinding.itemDomBindingMap[itemId];
            if (currentItemDomBinding) {
              $fly(currentItemDomBinding.dom).addClass(cola.constants.COLLECTION_CURRENT_CLASS);
            }
          }
        }
        domBinding.currentItemDom = currentItemDomBinding.dom;
      };
      scope.onItemInsert = (function(_this) {
        return function(arg) {
          var headDom, insertMode, itemDom, refDom, refEntityId, tailDom, templateDom;
          headDom = domBinding.dom;
          tailDom = cola.util.userData(headDom, cola.constants.REPEAT_TAIL_KEY);
          templateDom = cola.util.userData(headDom, cola.constants.REPEAT_TEMPLATE_KEY);
          itemDom = _this.createNewItem(domBinding, templateDom, domBinding.scope, arg.entity);
          insertMode = arg.insertMode;
          if (!insertMode || insertMode === "end") {
            $fly(tailDom).before(itemDom);
          } else if (insertMode === "begin") {
            $fly(headDom).after(itemDom);
          } else if (domBinding.itemDomBindingMap) {
            refEntityId = cola.Entity._getEntityId(arg.refEntity);
            if (refEntityId) {
              refDom = domBinding.itemDomBindingMap[refEntityId] != null;
              if (refDom) {
                if (insertMode === "before") {
                  $fly(refDom).before(itemDom);
                } else {
                  $fly(refDom).after(itemDom);
                }
              }
            }
          }
        };
      })(this);
      scope.onItemRemove = function(arg) {
        var itemDomBinding, itemId;
        itemId = cola.Entity._getEntityId(arg.entity);
        if (itemId) {
          itemDomBinding = domBinding.itemDomBindingMap[itemId];
          if (itemDomBinding) {
            arg.itemsScope.unregItemScope(itemId);
            itemDomBinding.remove();
            if (itemDomBinding.dom === domBinding.currentItemDom) {
              delete domBinding.currentItemDom;
            }
          }
        }
      };
      domBinding.subScopeCreated = true;
    };

    _RepeatFeature.prototype._refresh = function(domBinding, dataCtx) {
      domBinding.scope.refreshItems(dataCtx);
    };

    _RepeatFeature.prototype.onItemsRefresh = function(domBinding) {
      var currentDom, documentFragment, headDom, itemDom, items, originItems, scope, tailDom, templateDom;
      scope = domBinding.scope;
      items = scope.items;
      originItems = scope.originData;
      if (items && !(items instanceof cola.EntityList) && !(items instanceof Array)) {
        throw new cola.Exception("Expression \"" + this.expression + "\" must bind to EntityList or Array.");
      }
      if (items !== domBinding.items || (items && items.timestamp !== domBinding.timestamp)) {
        domBinding.items = items;
        domBinding.timestamp = (items != null ? items.timestamp : void 0) || 0;
        headDom = domBinding.dom;
        tailDom = cola.util.userData(headDom, cola.constants.REPEAT_TAIL_KEY);
        templateDom = cola.util.userData(headDom, cola.constants.REPEAT_TEMPLATE_KEY);
        if (!tailDom) {
          tailDom = document.createComment("Repeat Tail ");
          $fly(headDom).after(tailDom);
          cola.util.userData(headDom, cola.constants.REPEAT_TAIL_KEY, tailDom);
        }
        currentDom = headDom;
        documentFragment = null;
        if (items) {
          domBinding.itemDomBindingMap = {};
          scope.resetItemScopeMap();
          if (domBinding.currentItemDom) {
            $fly(domBinding.currentItemDom).removeClass(cola.constants.COLLECTION_CURRENT_CLASS);
          }
          cola.each(items, (function(_this) {
            return function(item) {
              var itemDom, itemDomBinding, itemId, itemScope;
              if (item == null) {
                return;
              }
              itemDom = currentDom.nextSibling;
              if (itemDom === tailDom) {
                itemDom = null;
              }
              if (itemDom) {
                itemDomBinding = cola.util.userData(itemDom, cola.constants.DOM_BINDING_KEY);
                itemScope = itemDomBinding.scope;
                if (typeof item === "object") {
                  itemId = cola.Entity._getEntityId(item);
                } else {
                  itemId = cola.uniqueId();
                }
                scope.regItemScope(itemId, itemScope);
                itemDomBinding.itemId = itemId;
                domBinding.itemDomBindingMap[itemId] = itemDomBinding;
                itemScope.data.setTargetData(item);
              } else {
                itemDom = _this.createNewItem(domBinding, templateDom, scope, item);
                if (documentFragment == null) {
                  documentFragment = document.createDocumentFragment();
                }
                documentFragment.appendChild(itemDom);
                $fly(tailDom).before(itemDom);
              }
              if (item === (items.current || (originItems != null ? originItems.current : void 0))) {
                $fly(itemDom).addClass(cola.constants.COLLECTION_CURRENT_CLASS);
                domBinding.currentItemDom = itemDom;
              }
              currentDom = itemDom;
            };
          })(this));
        }
        if (!documentFragment) {
          itemDom = currentDom.nextSibling;
          while (itemDom && itemDom !== tailDom) {
            currentDom = itemDom;
            itemDom = currentDom.nextSibling;
            $fly(currentDom).remove();
          }
        } else {
          $fly(tailDom).before(documentFragment);
        }
      }
    };

    _RepeatFeature.prototype.createNewItem = function(repeatDomBinding, templateDom, scope, item) {
      var domBinding, itemDom, itemId, itemScope, templateDomBinding;
      itemScope = new cola.ItemScope(scope, this.alias);
      itemScope.data.setTargetData(item, true);
      itemDom = templateDom.cloneNode(true);
      this.deepCloneNodeData(itemDom, itemScope, false);
      templateDomBinding = cola.util.userData(templateDom, cola.constants.DOM_BINDING_KEY);
      domBinding = templateDomBinding.clone(itemDom, itemScope);
      this.refreshItemDomBinding(itemDom, itemScope);
      if (typeof item === "object") {
        itemId = cola.Entity._getEntityId(item);
      } else {
        itemId = cola.uniqueId();
      }
      scope.regItemScope(itemId, itemScope);
      domBinding.itemId = itemId;
      repeatDomBinding.itemDomBindingMap[itemId] = domBinding;
      return itemDom;
    };

    _RepeatFeature.prototype.deepCloneNodeData = function(node, scope, cloneDomBinding) {
      var child, clonedStore, k, store, v;
      store = cola.util.userData(node);
      if (store) {
        clonedStore = {};
        for (k in store) {
          v = store[k];
          if (k === cola.constants.DOM_BINDING_KEY) {
            if (cloneDomBinding) {
              v = v.clone(node, scope);
            }
          } else if (k.substring(0, 2) === "__") {
            continue;
          }
          clonedStore[k] = v;
        }
        cola.util.userData(node, clonedStore);
      }
      child = node.firstChild;
      while (child) {
        if (child.nodeType !== 3 && !(typeof child.hasAttribute === "function" ? child.hasAttribute(cola.constants.IGNORE_DIRECTIVE) : void 0)) {
          this.deepCloneNodeData(child, scope, true);
        }
        child = child.nextSibling;
      }
    };

    _RepeatFeature.prototype.refreshItemDomBinding = function(dom, itemScope) {
      var child, currentDom, domBinding, initializer, initializers, l, len1;
      domBinding = cola.util.userData(dom, cola.constants.DOM_BINDING_KEY);
      if (domBinding) {
        domBinding.refresh();
        itemScope = domBinding.subScope || domBinding.scope;
        if (domBinding instanceof cola._RepeatDomBinding) {
          currentDom = cola.util.userData(domBinding.dom, cola.constants.REPEAT_TAIL_KEY);
        }
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType !== 3 && !(typeof child.hasAttribute === "function" ? child.hasAttribute(cola.constants.IGNORE_DIRECTIVE) : void 0)) {
          child = this.refreshItemDomBinding(child, itemScope);
        }
        child = child.nextSibling;
      }
      initializers = cola.util.userData(dom, cola.constants.DOM_INITIALIZER_KEY);
      if (initializers) {
        for (l = 0, len1 = initializers.length; l < len1; l++) {
          initializer = initializers[l];
          initializer(itemScope, dom);
        }
        cola.util.removeUserData(dom, cola.constants.DOM_INITIALIZER_KEY);
      }
      return currentDom || dom;
    };

    return _RepeatFeature;

  })(cola._ExpressionFeature);

  cola._DomFeature = (function(superClass) {
    extend(_DomFeature, superClass);

    function _DomFeature() {
      return _DomFeature.__super__.constructor.apply(this, arguments);
    }

    _DomFeature.prototype.writeBack = function(domBinding, value) {
      var path;
      path = this.path;
      if (path && typeof path === "string") {
        this.ignoreMessage = true;
        domBinding.scope.set(path, value);
        this.ignoreMessage = false;
      }
    };

    _DomFeature.prototype._processMessage = function(domBinding, bindingPath, path, type, arg) {
      if ((cola.constants.MESSAGE_REFRESH <= type && type <= cola.constants.MESSAGE_CURRENT_CHANGE) || this.watchingMoreMessage) {
        this.refresh(domBinding);
      }
    };

    _DomFeature.prototype._refresh = function(domBinding, dataCtx) {
      if (this.ignoreMessage) {
        return;
      }
      value = this.evaluate(domBinding, dataCtx);
      this._doRender(domBinding, value);
    };

    return _DomFeature;

  })(cola._ExpressionFeature);

  cola._TextNodeFeature = (function(superClass) {
    extend(_TextNodeFeature, superClass);

    function _TextNodeFeature() {
      return _TextNodeFeature.__super__.constructor.apply(this, arguments);
    }

    _TextNodeFeature.prototype._doRender = function(domBinding, value) {
      $fly(domBinding.dom).text(value == null ? "" : value);
    };

    return _TextNodeFeature;

  })(cola._DomFeature);

  cola._DomAttrFeature = (function(superClass) {
    extend(_DomAttrFeature, superClass);

    function _DomAttrFeature(expression, attr1, isStyle) {
      this.attr = attr1;
      this.isStyle = isStyle;
      _DomAttrFeature.__super__.constructor.call(this, expression);
    }

    _DomAttrFeature.prototype._doRender = function(domBinding, value) {
      var attr;
      attr = this.attr;
      if (attr === "text") {
        domBinding.$dom.text(value == null ? "" : value);
      } else if (attr === "html") {
        domBinding.$dom.html(value == null ? "" : value);
      } else if (this.isStyle) {
        domBinding.$dom.css(attr, value);
      } else {
        domBinding.$dom.attr(attr, value == null ? "" : value);
      }
    };

    return _DomAttrFeature;

  })(cola._DomFeature);

  cola._DomClassFeature = (function(superClass) {
    extend(_DomClassFeature, superClass);

    function _DomClassFeature(expression, className1) {
      this.className = className1;
      _DomClassFeature.__super__.constructor.call(this, expression);
    }

    _DomClassFeature.prototype._doRender = function(domBinding, value) {
      domBinding.$dom[value ? "addClass" : "removeClass"](this.className);
    };

    return _DomClassFeature;

  })(cola._DomFeature);

  cola._TextBoxFeature = (function(superClass) {
    extend(_TextBoxFeature, superClass);

    function _TextBoxFeature() {
      return _TextBoxFeature.__super__.constructor.apply(this, arguments);
    }

    _TextBoxFeature.prototype.init = function(domBinding) {
      var feature;
      feature = this;
      domBinding.$dom.on("input", function() {
        feature.writeBack(domBinding, this.value);
      });
      _TextBoxFeature.__super__.init.call(this);
    };

    _TextBoxFeature.prototype._doRender = function(domBinding, value) {
      domBinding.dom.value = value || "";
    };

    return _TextBoxFeature;

  })(cola._DomFeature);

  cola._CheckboxFeature = (function(superClass) {
    extend(_CheckboxFeature, superClass);

    function _CheckboxFeature() {
      return _CheckboxFeature.__super__.constructor.apply(this, arguments);
    }

    _CheckboxFeature.prototype.init = function(domBinding) {
      var feature;
      feature = this;
      domBinding.$dom.on("click", function() {
        feature.writeBack(domBinding, this.checked);
      });
      _CheckboxFeature.__super__.init.call(this);
    };

    _CheckboxFeature.prototype._doRender = function(domBinding, value) {
      var checked;
      checked = cola.DataType.defaultDataTypes.boolean.parse(value);
      domBinding.dom.checked = checked;
    };

    return _CheckboxFeature;

  })(cola._DomFeature);

  cola._RadioFeature = (function(superClass) {
    extend(_RadioFeature, superClass);

    function _RadioFeature() {
      return _RadioFeature.__super__.constructor.apply(this, arguments);
    }

    _RadioFeature.prototype.init = function(domBinding) {
      domBinding.$dom.on("click", function() {
        var checked;
        checked = this.checked;
        if (checked) {
          this.writeBack(domBinding, checked);
        }
      });
      _RadioFeature.__super__.init.call(this);
    };

    _RadioFeature.prototype._doRender = function(domBinding, value) {
      domBinding.dom.checked = value === domBinding.dom.value;
    };

    return _RadioFeature;

  })(cola._DomFeature);

  cola._SelectFeature = (function(superClass) {
    extend(_SelectFeature, superClass);

    function _SelectFeature() {
      return _SelectFeature.__super__.constructor.apply(this, arguments);
    }

    _SelectFeature.prototype.init = function(domBinding) {
      var feature;
      feature = this;
      domBinding.$dom.on("change", function() {
        value = this.options[this.selectedIndex];
        feature.writeBack(domBinding, value != null ? value.value : void 0);
      });
      _SelectFeature.__super__.init.call(this);
    };

    _SelectFeature.prototype._doRender = function(domBinding, value) {
      domBinding.dom.value = value;
    };

    return _SelectFeature;

  })(cola._DomFeature);

  cola._DisplayFeature = (function(superClass) {
    extend(_DisplayFeature, superClass);

    function _DisplayFeature() {
      return _DisplayFeature.__super__.constructor.apply(this, arguments);
    }

    _DisplayFeature.prototype._doRender = function(domBinding, value) {
      domBinding.dom.style.display = value ? "" : "none";
    };

    return _DisplayFeature;

  })(cola._DomFeature);

  cola._SelectOptionsFeature = (function(superClass) {
    extend(_SelectOptionsFeature, superClass);

    function _SelectOptionsFeature() {
      return _SelectOptionsFeature.__super__.constructor.apply(this, arguments);
    }

    _SelectOptionsFeature.prototype._doRender = function(domBinding, optionValues) {
      var options;
      if (!(optionValues instanceof Array || optionValues instanceof cola.EntityList)) {
        return;
      }
      options = domBinding.dom.options;
      if (optionValues instanceof cola.EntityList) {
        options.length = optionValues.entityCount;
      } else {
        options.length = optionValues.length;
      }
      cola.each(optionValues, function(optionValue, i) {
        var option;
        option = options[i];
        if (cola.util.isSimpleValue(optionValue)) {
          $fly(option).removeAttr("value").text(optionValue);
        } else if (optionValue instanceof cola.Entity) {
          $fly(option).attr("value", optionValue.get("value") || optionValue.get("key")).text(optionValue.get("text") || optionValue.get("name"));
        } else {
          $fly(option).attr("value", optionValue.value || optionValue.key).text(optionValue.text || optionValue.name);
        }
      });
    };

    return _SelectOptionsFeature;

  })(cola._DomFeature);

  _destroyDomBinding = function(node, data) {
    var domBinding;
    domBinding = data[cola.constants.DOM_BINDING_KEY];
    if (domBinding != null) {
      domBinding.destroy();
    }
  };

  cola._DomBinding = (function() {
    function _DomBinding(dom, scope1, feature) {
      var f, l, len1;
      this.scope = scope1;
      this.dom = dom;
      this.$dom = $(dom);
      if (feature) {
        if (feature instanceof Array) {
          for (l = 0, len1 = feature.length; l < len1; l++) {
            f = feature[l];
            this.addFeature(f);
          }
        } else {
          this.addFeature(feature);
        }
      }
      cola.util.userData(dom, cola.constants.DOM_BINDING_KEY, this);
      cola.util.onNodeRemoved(dom, _destroyDomBinding);
    }

    _DomBinding.prototype.destroy = function() {
      var _feature, feature, l, len1;
      _feature = this.feature;
      if (_feature) {
        if (_feature instanceof Array) {
          for (l = 0, len1 = _feature.length; l < len1; l++) {
            feature = _feature[l];
            this.unbindFeature(feature);
          }
        } else {
          this.unbindFeature(_feature);
        }
      }
      delete this.dom;
      delete this.$dom;
    };

    _DomBinding.prototype.bindFeature = function(feature) {
      var l, len1, p, path;
      if (!feature._processMessage) {
        return;
      }
      path = feature.path;
      if (path) {
        if (typeof path === "string") {
          this.bind(path, feature);
        } else {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            this.bind(p, feature);
          }
        }
      }
    };

    _DomBinding.prototype.unbindFeature = function(feature) {
      var l, len1, p, path;
      if (!feature._processMessage) {
        return;
      }
      path = feature.path;
      if (path) {
        if (typeof path === "string") {
          this.unbind(path, feature);
        } else {
          for (l = 0, len1 = path.length; l < len1; l++) {
            p = path[l];
            this.unbind(p, feature);
          }
        }
      }
    };

    _DomBinding.prototype.addFeature = function(feature) {
      if (feature.id == null) {
        feature.id = cola.uniqueId();
      }
      if (typeof feature.init === "function") {
        feature.init(this);
      }
      if (!this.feature) {
        this.feature = feature;
      } else if (this.feature instanceof Array) {
        this.feature.push(feature);
      } else {
        this.feature = [this.feature, feature];
      }
      this.bindFeature(feature);
    };

    _DomBinding.prototype.removeFeature = function(feature) {
      var _feature, i;
      _feature = this.feature;
      if (_feature) {
        if (_feature === feature) {
          delete this.feature;
          if (_feature.length === 1) {
            delete this.feature;
          }
        } else {
          i = _feature.indexOf(feature);
          if (i > -1) {
            _feature.splice(i, 1);
          }
        }
        this.unbindFeature(feature);
      }
    };

    _DomBinding.prototype.bind = function(path, feature) {
      var pipe;
      pipe = {
        _processMessage: (function(_this) {
          return function(bindingPath, path, type, arg) {
            if (!feature.disabled) {
              feature._processMessage(_this, bindingPath, path, type, arg);
              if (feature.disabled) {
                pipe.disabled = true;
              }
            } else {
              pipe.disabled = true;
            }
          };
        })(this)
      };
      this.scope.data.bind(path, pipe);
      this[feature.id] = pipe;
    };

    _DomBinding.prototype.unbind = function(path, feature) {
      var pipe;
      pipe = this[feature.id];
      delete this[feature.id];
      this.scope.data.unbind(path, pipe);
    };

    _DomBinding.prototype.refresh = function(force) {
      var f, feature, l, len1;
      feature = this.feature;
      if (feature instanceof Array) {
        for (l = 0, len1 = feature.length; l < len1; l++) {
          f = feature[l];
          f.refresh(this, force);
        }
      } else if (feature) {
        feature.refresh(this, force);
      }
    };

    _DomBinding.prototype.clone = function(dom, scope) {
      return new this.constructor(dom, scope, this.feature, true);
    };

    return _DomBinding;

  })();

  cola._AliasDomBinding = (function(superClass) {
    extend(_AliasDomBinding, superClass);

    function _AliasDomBinding() {
      return _AliasDomBinding.__super__.constructor.apply(this, arguments);
    }

    _AliasDomBinding.prototype.destroy = function() {
      _AliasDomBinding.__super__.destroy.call(this);
      if (this.subScopeCreated) {
        this.scope.destroy();
      }
    };

    return _AliasDomBinding;

  })(cola._DomBinding);

  cola._RepeatDomBinding = (function(superClass) {
    extend(_RepeatDomBinding, superClass);

    function _RepeatDomBinding(dom, scope, feature, clone) {
      var f, headerNode, l, len1, repeatItemDomBinding;
      if (clone) {
        _RepeatDomBinding.__super__.constructor.call(this, dom, scope, feature);
      } else {
        this.scope = scope;
        headerNode = document.createComment("Repeat Head ");
        cola._ignoreNodeRemoved = true;
        dom.parentNode.replaceChild(headerNode, dom);
        cola.util.cacheDom(dom);
        cola._ignoreNodeRemoved = false;
        this.dom = headerNode;
        cola.util.userData(headerNode, cola.constants.DOM_BINDING_KEY, this);
        cola.util.userData(headerNode, cola.constants.REPEAT_TEMPLATE_KEY, dom);
        cola.util.onNodeRemoved(headerNode, _destroyDomBinding);
        repeatItemDomBinding = new cola._RepeatItemDomBinding(dom, null);
        repeatItemDomBinding.repeatDomBinding = this;
        repeatItemDomBinding.isTemplate = true;
        if (feature) {
          if (feature instanceof Array) {
            for (l = 0, len1 = feature.length; l < len1; l++) {
              f = feature[l];
              if (f instanceof cola._RepeatFeature) {
                this.addFeature(f);
              } else {
                repeatItemDomBinding.addFeature(f);
              }
            }
          } else {
            if (feature instanceof cola._RepeatFeature) {
              this.addFeature(feature);
            } else {
              repeatItemDomBinding.addFeature(feature);
            }
          }
        }
      }
    }

    _RepeatDomBinding.prototype.destroy = function() {
      _RepeatDomBinding.__super__.destroy.call(this);
      if (this.subScopeCreated) {
        this.scope.destroy();
      }
      delete this.currentItemDom;
    };

    return _RepeatDomBinding;

  })(cola._DomBinding);

  cola._RepeatItemDomBinding = (function(superClass) {
    extend(_RepeatItemDomBinding, superClass);

    function _RepeatItemDomBinding() {
      return _RepeatItemDomBinding.__super__.constructor.apply(this, arguments);
    }

    _RepeatItemDomBinding.prototype.destroy = function() {
      var ref;
      _RepeatItemDomBinding.__super__.destroy.call(this);
      if (!this.isTemplate) {
        if ((ref = this.repeatDomBinding.itemDomBindingMap) != null) {
          delete ref[this.itemId];
        }
      }
    };

    _RepeatItemDomBinding.prototype.clone = function(dom, scope) {
      var cloned;
      cloned = _RepeatItemDomBinding.__super__.clone.call(this, dom, scope);
      cloned.repeatDomBinding = this.repeatDomBinding;
      return cloned;
    };

    _RepeatItemDomBinding.prototype.bind = function(path, feature) {
      if (this.isTemplate) {
        return;
      }
      return _RepeatItemDomBinding.__super__.bind.call(this, path, feature);
    };

    _RepeatItemDomBinding.prototype.bindFeature = function(feature) {
      if (this.isTemplate) {
        return;
      }
      return _RepeatItemDomBinding.__super__.bindFeature.call(this, feature);
    };

    _RepeatItemDomBinding.prototype.processDataMessage = function(path, type, arg) {
      if (!this.isTemplate) {
        this.scope.data._processMessage("**", path, type, arg);
      }
    };

    _RepeatItemDomBinding.prototype.refresh = function() {
      if (this.isTemplate) {
        return;
      }
      return _RepeatItemDomBinding.__super__.refresh.call(this);
    };

    _RepeatItemDomBinding.prototype.remove = function() {
      if (!this.isTemplate) {
        this.$dom.remove();
      }
    };

    return _RepeatItemDomBinding;

  })(cola._AliasDomBinding);

  IGNORE_NODES = ["SCRIPT", "STYLE", "META", "TEMPLATE"];

  ALIAS_REGEXP = new RegExp("\\$default", "g");

  cola._mainInitFuncs = [];

  cola._rootFunc = function() {
    var arg, fn, init, l, len1, model, modelName, targetDom;
    fn = null;
    targetDom = null;
    modelName = null;
    for (l = 0, len1 = arguments.length; l < len1; l++) {
      arg = arguments[l];
      if (typeof arg === "function") {
        fn = arg;
      } else if (typeof arg === "string") {
        modelName = arg;
      } else if ((arg != null ? arg.nodeType : void 0) || typeof arg === "object" && arg.length > 0) {
        targetDom = arg;
      }
    }
    init = function(dom, model, param) {
      var len2, o, oldScope, viewDoms;
      oldScope = cola.currentScope;
      cola.currentScope = model;
      try {
        if (typeof fn === "function") {
          fn(model, param);
        }
        if (!dom) {
          viewDoms = document.getElementsByClassName(cola.constants.VIEW_CLASS);
          if (viewDoms != null ? viewDoms.length : void 0) {
            dom = viewDoms;
          }
        }
        if (dom == null) {
          dom = document.body;
        }
        if (dom.length) {
          doms = dom;
          for (o = 0, len2 = doms.length; o < len2; o++) {
            dom = doms[o];
            cola._renderDomTemplate(dom, model);
          }
        } else {
          cola._renderDomTemplate(dom, model);
        }
      } finally {
        cola.currentScope = oldScope;
      }
    };
    if (cola._suspendedInitFuncs) {
      cola._suspendedInitFuncs.push(init);
    } else {
      if (modelName == null) {
        modelName = cola.constants.DEFAULT_PATH;
      }
      model = cola.model(modelName);
      if (model == null) {
        model = new cola.Model(modelName);
      }
      if (cola._mainInitFuncs) {
        cola._mainInitFuncs.push({
          targetDom: targetDom,
          model: model,
          init: init
        });
      } else {
        init(targetDom, model);
      }
    }
    return cola;
  };

  $(function() {
    var initFunc, initFuncs, l, len1;
    initFuncs = cola._mainInitFuncs;
    delete cola._mainInitFuncs;
    for (l = 0, len1 = initFuncs.length; l < len1; l++) {
      initFunc = initFuncs[l];
      initFunc.init(initFunc.targetDom, initFunc.model);
    }
    if (cola.getListeners("ready")) {
      cola.fire("ready", cola);
      cola.off("ready");
    }
  });

  cola._userDomCompiler = {
    $: []
  };

  $.xCreate.templateProcessors.push(function(template) {
    var dom;
    if (template instanceof cola.Widget) {
      dom = template.getDom();
      dom.setAttribute(cola.constants.IGNORE_DIRECTIVE, "");
      return dom;
    }
  });

  $.xCreate.attributeProcessor["c-widget"] = function($dom, attrName, attrValue, context) {
    var configKey, widgetConfigs;
    if (!attrValue) {
      return;
    }
    if (typeof attrValue === "string") {
      $dom.attr(attrName, attrValue);
    } else if (context) {
      configKey = cola.uniqueId();
      $dom.attr("widget-config", configKey);
      widgetConfigs = context.widgetConfigs;
      if (!widgetConfigs) {
        context.widgetConfigs = widgetConfigs = {};
      }
      widgetConfigs[configKey] = attrValue;
    }
  };

  cola.xRender = function(template, model, context) {
    var child, div, documentFragment, dom, l, len1, next, node, oldScope, widget;
    if (!template) {
      return;
    }
    if (template.nodeType) {
      dom = template;
    } else if (typeof template === "string") {
      documentFragment = document.createDocumentFragment();
      div = document.createElement("div");
      div.innerHTML = template;
      child = div.firstChild;
      while (child) {
        next = child.nextSibling;
        documentFragment.appendChild(child);
        child = next;
      }
    } else {
      oldScope = cola.currentScope;
      cola.currentScope = model;
      try {
        if (context == null) {
          context = {};
        }
        if (template instanceof Array) {
          documentFragment = document.createDocumentFragment();
          for (l = 0, len1 = template.length; l < len1; l++) {
            node = template[l];
            if (node.tagName) {
              child = $.xCreate(node, context);
            } else {
              if (node instanceof cola.Widget) {
                widget = node;
              } else {

              }
              widget = cola.widget(node, context.namespace);
              child = widget.getDom();
              child.setAttribute(cola.constants.IGNORE_DIRECTIVE, "");
            }
            documentFragment.appendChild(child);
          }
        } else {
          if (template.tagName) {
            dom = $.xCreate(template, context);
          } else {
            if (template instanceof cola.Widget) {
              widget = template;
            } else {
              widget = cola.widget(template, context.namespace);
            }
            dom = widget.getDom();
            dom.setAttribute(cola.constants.IGNORE_DIRECTIVE, "");
          }
        }
      } finally {
        cola.currentScope = oldScope;
      }
    }
    if (dom) {
      cola._renderDomTemplate(dom, model, context);
    } else if (documentFragment) {
      cola._renderDomTemplate(documentFragment, model, context);
      if (documentFragment.firstChild === documentFragment.lastChild) {
        dom = documentFragment.firstChild;
      } else {
        dom = documentFragment;
      }
    }
    return dom;
  };

  cola._renderDomTemplate = function(dom, scope, context) {
    if (context == null) {
      context = {};
    }
    _doRrenderDomTemplate(dom, scope, context);
  };

  _doRrenderDomTemplate = function(dom, scope, context) {
    var attr, attrName, attrValue, bindingExpr, bindingType, child, childContext, customDomCompiler, defaultPath, domBinding, expression, feature, features, initializer, initializers, k, l, len1, len2, len3, len4, newFeatures, o, parts, q, r, ref, ref1, removeAttr, removeAttrs, result, tailDom, v;
    if (dom.nodeType === 8) {
      return dom;
    }
    if (dom.nodeType === 1 && dom.hasAttribute(cola.constants.IGNORE_DIRECTIVE)) {
      return dom;
    }
    if (IGNORE_NODES.indexOf(dom.nodeName) > -1) {
      return dom;
    }
    if (dom.nodeType === 3) {
      bindingExpr = dom.nodeValue;
      parts = cola._compileText(bindingExpr);
      if (parts != null ? parts.length : void 0) {
        buildContent(parts, dom, scope);
      }
      return dom;
    } else if (dom.nodeType === 11) {
      child = dom.firstChild;
      while (child) {
        child = _doRrenderDomTemplate(child, scope, context);
        child = child.nextSibling;
      }
      return dom;
    }
    initializers = null;
    features = null;
    removeAttrs = null;
    bindingExpr = dom.getAttribute("c-repeat");
    if (bindingExpr) {
      bindingExpr = bindingExpr.replace(ALIAS_REGEXP, context.defaultPath);
      dom.removeAttribute("c-repeat");
      expression = cola._compileExpression(bindingExpr, "repeat");
      if (expression) {
        bindingType = "repeat";
        feature = buildRepeatFeature(expression);
        if (features == null) {
          features = [];
        }
        features.push(feature);
      }
    } else {
      bindingExpr = dom.getAttribute("c-alias");
      if (bindingExpr) {
        bindingExpr = bindingExpr.replace(ALIAS_REGEXP, context.defaultPath);
        dom.removeAttribute("c-alias");
        bindingType = "alias";
        expression = cola._compileExpression(bindingExpr, "alias");
        if (expression) {
          feature = buildAliasFeature(expression);
          if (features == null) {
            features = [];
          }
          features.push(feature);
        }
      }
    }
    bindingExpr = dom.getAttribute("c-bind");
    if (bindingExpr) {
      bindingExpr = bindingExpr.replace(ALIAS_REGEXP, context.defaultPath);
      dom.removeAttribute("c-bind");
      expression = cola._compileExpression(bindingExpr);
      if (expression) {
        feature = buildBindFeature(expression, dom);
        if (features == null) {
          features = [];
        }
        features.push(feature);
      }
    }
    ref = dom.attributes;
    for (l = 0, len1 = ref.length; l < len1; l++) {
      attr = ref[l];
      attrName = attr.name;
      if (attrName.substring(0, 2) === "c-") {
        if (removeAttrs == null) {
          removeAttrs = [];
        }
        removeAttrs.push(attrName);
        attrValue = attr.value;
        if (attrValue && context.defaultPath) {
          attrValue = attrValue.replace(ALIAS_REGEXP, context.defaultPath);
        }
        attrName = attrName.substring(2);
        if (attrName === "style") {
          newFeatures = buildStyleFeature(attrValue);
          features = features ? features.concat(newFeatures) : newFeatures;
        } else if (attrName === "class") {
          newFeatures = buildClassFeature(attrValue);
          features = features ? features.concat(newFeatures) : newFeatures;
        } else {
          customDomCompiler = cola._userDomCompiler[attrName];
          if (customDomCompiler) {
            result = customDomCompiler(scope, dom, context);
            if (result) {
              if (result instanceof cola._BindingFeature) {
                features.push(result);
              }
              if (typeof result === "function") {
                if (initializers == null) {
                  initializers = [];
                }
                initializers.push(result);
              }
            }
          } else {
            if (attrName.substring(0, 2) === "on") {
              feature = buildEvent(scope, dom, attrName.substring(2), attrValue);
            } else if (attrName === "i18n") {
              feature = buildI18NFeature(scope, dom, attrValue);
            } else if (attrName === "watch") {
              feature = buildWatchFeature(scope, dom, attrValue);
            } else {
              feature = buildAttrFeature(dom, attrName, attrValue);
            }
            if (feature) {
              if (features == null) {
                features = [];
              }
              features.push(feature);
            }
          }
        }
      }
    }
    ref1 = cola._userDomCompiler.$;
    for (o = 0, len2 = ref1.length; o < len2; o++) {
      customDomCompiler = ref1[o];
      result = customDomCompiler(scope, dom, context);
      if (result) {
        if (result instanceof cola._BindingFeature) {
          features.push(result);
        }
        if (typeof result === "function") {
          if (initializers == null) {
            initializers = [];
          }
          initializers.push(result);
        }
      }
    }
    if (removeAttrs) {
      for (q = 0, len3 = removeAttrs.length; q < len3; q++) {
        removeAttr = removeAttrs[q];
        dom.removeAttribute(removeAttr);
      }
    }
    childContext = {};
    for (k in context) {
      v = context[k];
      childContext[k] = v;
    }
    childContext.inRepeatTemplate = context.inRepeatTemplate || bindingType === "repeat";
    if (defaultPath) {
      childContext.defaultPath = defaultPath;
    }
    child = dom.firstChild;
    while (child) {
      child = _doRrenderDomTemplate(child, scope, childContext);
      child = child.nextSibling;
    }
    if (features != null ? features.length : void 0) {
      if (bindingType === "repeat") {
        domBinding = new cola._RepeatDomBinding(dom, scope, features);
        scope = domBinding.scope;
        defaultPath = scope.data.alias;
      } else if (bindingType === "alias") {
        domBinding = new cola._AliasDomBinding(dom, scope, features);
        scope = domBinding.scope;
        defaultPath = scope.data.alias;
      } else {
        domBinding = new cola._DomBinding(dom, scope, features);
      }
      if (!domBinding.feature) {
        domBinding = null;
      }
    }
    if (initializers) {
      if (context.inRepeatTemplate || (domBinding && domBinding instanceof cola._RepeatDomBinding)) {
        cola.util.userData(dom, cola.constants.DOM_INITIALIZER_KEY, initializers);
      } else {
        for (r = 0, len4 = initializers.length; r < len4; r++) {
          initializer = initializers[r];
          initializer(scope, dom);
        }
      }
    }
    if (domBinding) {
      if (!context.inRepeatTemplate) {
        domBinding.refresh(true);
      }
      if (domBinding instanceof cola._RepeatDomBinding) {
        tailDom = cola.util.userData(domBinding.dom, cola.constants.REPEAT_TAIL_KEY);
        dom = tailDom || domBinding.dom;
      }
    }
    return dom;
  };

  buildAliasFeature = function(expression) {
    return new cola._AliasFeature(expression);
  };

  buildRepeatFeature = function(expression) {
    return new cola._RepeatFeature(expression);
  };

  buildBindFeature = function(expression, dom) {
    var feature, nodeName, type;
    nodeName = dom.nodeName;
    if (nodeName === "INPUT") {
      type = dom.type;
      if (type === "checkbox") {
        feature = new cola._CheckboxFeature(expression);
      } else if (type === "radio") {
        feature = new cola._RadioFeature(expression);
      } else {
        feature = new cola._TextBoxFeature(expression);
      }
    } else if (nodeName === "SELECT") {
      feature = new cola._SelectFeature(expression);
    } else if (nodeName === "TEXTAREA") {
      feature = new cola._TextBoxFeature(expression);
    } else {
      feature = new cola._DomAttrFeature(expression, "text", false);
    }
    return feature;
  };

  createContentPart = function(part, scope) {
    var domBinding, expression, feature, textNode;
    if (part instanceof cola.Expression) {
      expression = part;
      textNode = document.createElement("span");
      feature = new cola._TextNodeFeature(expression);
      domBinding = new cola._DomBinding(textNode, scope, feature);
      domBinding.refresh();
    } else {
      textNode = document.createTextNode(part);
    }
    return textNode;
  };

  buildContent = function(parts, dom, scope) {
    var childNode, l, len1, part, partNode;
    if (parts.length === 1) {
      childNode = createContentPart(parts[0], scope);
    } else {
      childNode = document.createDocumentFragment();
      for (l = 0, len1 = parts.length; l < len1; l++) {
        part = parts[l];
        partNode = createContentPart(part, scope);
        childNode.appendChild(partNode);
      }
    }
    cola._ignoreNodeRemoved = true;
    dom.parentNode.replaceChild(childNode, dom);
    cola._ignoreNodeRemoved = false;
  };

  buildStyleFeature = function(styleStr) {
    var expression, feature, features, style, styleExpr, styleProp;
    if (!styleStr) {
      return false;
    }
    style = cola.util.parseStyleLikeString(styleStr);
    features = [];
    for (styleProp in style) {
      styleExpr = style[styleProp];
      expression = cola._compileExpression(styleExpr);
      if (expression) {
        feature = new cola._DomAttrFeature(expression, styleProp, true);
        features.push(feature);
      }
    }
    return features;
  };

  buildClassFeature = function(classStr) {
    var classConfig, classExpr, className, expression, feature, features;
    if (!classStr) {
      return false;
    }
    classConfig = cola.util.parseStyleLikeString(classStr);
    features = [];
    for (className in classConfig) {
      classExpr = classConfig[className];
      expression = cola._compileExpression(classExpr);
      if (expression) {
        feature = new cola._DomClassFeature(expression, className, true);
        features.push(feature);
      }
    }
    return features;
  };

  buildAttrFeature = function(dom, attr, expr) {
    var expression, feature;
    expression = cola._compileExpression(expr);
    if (expression) {
      if (attr === "display") {
        feature = new cola._DisplayFeature(expression);
      } else if (attr === "options" && dom.nodeName === "SELECT") {
        feature = new cola._SelectOptionsFeature(expression);
      } else {
        feature = new cola._DomAttrFeature(expression, attr, false);
      }
    }
    return feature;
  };

  buildI18NFeature = function(scope, dom, expr) {
    expr = cola.util.trim(expr);
    if (expr) {
      $fly(dom).text(cola.i18n(expr));
    }
  };

  buildWatchFeature = function(scope, dom, expr) {
    var action, feature, i, l, len1, path, pathStr, paths, ref;
    i = expr.indexOf(" on ");
    if (i > 0) {
      action = expr.substring(0, i);
      pathStr = expr.substring(i + 4);
      if (pathStr) {
        paths = [];
        ref = pathStr.split(",");
        for (l = 0, len1 = ref.length; l < len1; l++) {
          path = ref[l];
          path = cola.util.trim(path);
          if (path) {
            paths.push(path);
          }
        }
        if (paths.length) {
          feature = new cola._WatchFeature(action, paths);
        }
      }
    }
    if (!feature) {
      throw new cola.Exception("\"" + expr + "\" is not a valid watch expression.");
    }
    return feature;
  };

  buildEvent = function(scope, dom, event, expr) {
    var expression, feature;
    expression = cola._compileExpression(expr);
    if (expression) {
      feature = new cola._EventFeature(expression, event);
    }
    return feature;
  };

}).call(this);
