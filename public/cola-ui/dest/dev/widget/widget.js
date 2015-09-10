(function() {
  var ACTIVE_PINCH_REG, ACTIVE_ROTATE_REG, ALIAS_REGEXP, PAN_VERTICAL_EVENTS, SWIPE_VERTICAL_EVENTS, TEMP_TEMPLATE, _destroyRenderableElement, _findWidgetConfig,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function() {
    var escape, isStyleFuncSupported;
    escape = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
      CSSStyleDeclaration.prototype.getPropertyValue = function(a) {
        return this.getAttribute(a);
      };
      CSSStyleDeclaration.prototype.setProperty = function(styleName, value, priority) {
        var rule;
        this.setAttribute(styleName, value);
        priority = typeof priority !== 'undefined' ? priority : '';
        if (priority !== '') {
          rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value)(+'(\\s*;)?', 'gmi'));
          return this.cssText = this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
        }
      };
      CSSStyleDeclaration.prototype.removeProperty = function(a) {
        return this.removeAttribute(a);
      };
      return CSSStyleDeclaration.prototype.getPropertyPriority = function(styleName) {
        var rule;
        rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?', 'gmi');
        if (rule.test(this.cssText)) {
          return 'important';
        } else {
          return '';
        }
      };
    }
  })();

  cola.util.addClass = function(dom, value, continuous) {
    var className;
    if (!continuous) {
      $(dom).addClass(value);
      return cola.util;
    }
    if (dom.nodeType === 1) {
      className = dom.className ? (" " + dom.className + " ").replace(cola.constants.CLASS_REG, " ") : " ";
      if (className.indexOf(" " + value + " ") < 0) {
        className += value + " ";
        dom.className = $.trim(className);
      }
    }
    return cola.util;
  };

  cola.util.removeClass = function(dom, value, continuous) {
    var className;
    if (!continuous) {
      $(dom).removeClass(value);
      return cola.util;
    }
    if (dom.nodeType === 1) {
      className = dom.className ? (" " + dom.className + " ").replace(cola.constants.CLASS_REG, " ") : " ";
      if (className.indexOf(" " + value + " ") >= 0) {
        className = className.replace(" " + value + " ", " ");
        dom.className = $.trim(className);
      }
    }
    return cola.util;
  };

  cola.util.toggleClass = function(dom, value, stateVal, continuous) {
    if (!continuous) {
      $(dom).toggleClass(value, !!stateVal);
      return;
    }
    if (dom.nodeType === 1) {
      if (!!stateVal) {
        this._addClass(dom, value, true);
      } else {
        this._removeClass(dom, value, true);
      }
    }
    return cola.util;
  };

  cola.util.hasClass = function(dom, className) {
    var domClassName, j, len, name, names;
    names = className.split(/\s+/g);
    domClassName = dom.className ? (" " + dom.className + " ").replace(cola.constants.CLASS_REG, " ") : " ";
    for (j = 0, len = names.length; j < len; j++) {
      name = names[j];
      if (domClassName.indexOf(" " + name + " ") < 0) {
        return false;
      }
    }
    return true;
  };

  cola.util.style = function(dom, styleName, value, priority) {
    var style;
    style = dom.style;
    if (typeof styleName !== 'undefined') {
      if (typeof value !== 'undefined') {
        priority = typeof priority !== 'undefined' ? priority : '';
        return style.setProperty(styleName, value, priority);
      } else {
        return style.getPropertyValue(styleName);
      }
    } else {
      return style;
    }
  };

  cola.util.getTextChildData = function(dom) {
    var child;
    child = dom.firstChild;
    while (child) {
      if (child.nodeType === 3) {
        return child.textContent;
      }
      child = child.nextSibling;
    }
    return null;
  };

  cola.util.eachNodeChild = function(node, fn) {
    var child;
    if (!node || !fn) {
      return cola.util;
    }
    child = node.firstChild;
    while (child) {
      if (fn(child) === false) {
        break;
      }
      child = child.nextSibling;
    }
    return cola.util;
  };

  cola.util.getScrollerRender = function(element) {
    var helperElem, perspectiveProperty, transformProperty;
    helperElem = document.createElement("div");
    perspectiveProperty = cola.Fx.perspectiveProperty;
    transformProperty = cola.Fx.transformProperty;
    if (helperElem.style[perspectiveProperty] !== void 0) {
      return function(left, top, zoom) {
        element.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
      };
    } else if (helperElem.style[transformProperty] !== void 0) {
      return function(left, top, zoom) {
        element.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
      };
    } else {
      return function(left, top, zoom) {
        element.style.marginLeft = left ? (-left / zoom) + 'px' : '';
        element.style.marginTop = top ? (-top / zoom) + 'px' : '';
        element.style.zoom = zoom || '';
      };
    }
  };

  cola.util.getType = (function() {
    var classToType, j, len, name, ref;
    classToType = {};
    ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  cola.util.typeOf = function(obj, type) {
    return cola.util.getType(obj) === type;
  };

  cola.util.getDomRect = function(dom) {
    var rect;
    rect = dom.getBoundingClientRect();
    if (isNaN(rect.height)) {
      rect.height = rect.bottom - rect.top;
    }
    if (isNaN(rect.width)) {
      rect.width = rect.right - rect.left;
    }
    return rect;
  };

  (function() {
    var cancelTranslateElement, cssPrefix, docStyle, engine, getTranslate, helperElem, perspectiveProperty, transformProperty, transformStyleName, transitionEndProperty, transitionProperty, transitionStyleName, translate3d, translateElement, vendorPrefix;
    docStyle = window.document.documentElement.style;
    translate3d = false;
    if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
      engine = 'presto';
    } else if ('MozAppearance' in docStyle) {
      engine = 'gecko';
    } else if ('WebkitAppearance' in docStyle) {
      engine = 'webkit';
    } else if (typeof navigator.cpuClass === 'string') {
      engine = 'trident';
    }
    vendorPrefix = {
      trident: 'ms',
      gecko: 'Moz',
      webkit: 'Webkit',
      presto: 'O'
    }[engine];
    cssPrefix = {
      trident: '-ms-',
      gecko: '-moz-',
      webkit: '-webkit-',
      presto: '-o-'
    }[engine];
    helperElem = document.createElement("div");
    perspectiveProperty = vendorPrefix + "Perspective";
    transformProperty = vendorPrefix + "Transform";
    transformStyleName = cssPrefix + "transform";
    transitionProperty = vendorPrefix + "Transition";
    transitionStyleName = cssPrefix + "transition";
    transitionEndProperty = vendorPrefix.toLowerCase() + "TransitionEnd";
    if (helperElem.style[perspectiveProperty] !== void 0) {
      translate3d = true;
    }
    getTranslate = function(element) {
      var matches, result, transform;
      result = {
        left: 0,
        top: 0
      };
      if (element === null || element.style === null) {
        return result;
      }
      transform = element.style[transformProperty];
      matches = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g.exec(transform);
      if (matches) {
        result.left = +matches[1];
        result.top = +matches[3];
      }
      return result;
    };
    cancelTranslateElement = function(element) {
      var transformValue;
      if (element === null || element.style === null) {
        return;
      }
      transformValue = element.style[transformProperty];
      if (transformValue) {
        transformValue = transformValue.replace(/translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g, "");
        return element.style[transformProperty] = transformValue;
      }
    };
    translateElement = function(element, x, y) {
      var translate, value;
      if (x === null && y === null) {
        return;
      }
      if (element === null || element.style === null) {
        return;
      }
      if (!element.style[transformProperty] && x === 0 && y === 0) {
        return;
      }
      if (x === null || y === null) {
        translate = getTranslate(element);
        if (x == null) {
          x = translate.left;
        }
        if (y == null) {
          y = translate.top;
        }
      }
      cancelTranslateElement(element);
      value = ' translate(' + (x ? x + 'px' : '0px') + ',' + (y ? y + 'px' : '0px') + ')';
      if (translate3d) {
        value += ' translateZ(0px)';
      }
      element.style[transformProperty] += value;
      return element;
    };
    return cola.Fx = {
      transitionEndProperty: transitionEndProperty,
      translate3d: translate3d,
      transformProperty: transformProperty,
      transformStyleName: transformStyleName,
      transitionProperty: transitionProperty,
      transitionStyleName: transitionStyleName,
      perspectiveProperty: perspectiveProperty,
      getElementTranslate: getTranslate,
      translateElement: translateElement,
      cancelTranslateElement: cancelTranslateElement
    };
  })();

  cola.Model.prototype.widgetConfig = function(id, config) {
    var k, ref, v;
    if (arguments.length === 1) {
      if (typeof id === "string") {
        return (ref = this._widgetConfig) != null ? ref[id] : void 0;
      } else {
        config = id;
        for (k in config) {
          v = config[k];
          this.widgetConfig(k, v);
        }
      }
    } else {
      if (this._widgetConfig == null) {
        this._widgetConfig = {};
      }
      this._widgetConfig[id] = config;
    }
  };

  cola._userDomCompiler.widget = function() {};

  ALIAS_REGEXP = new RegExp("\\$default", "g");

  _findWidgetConfig = function(scope, name) {
    var ref, widgetConfig;
    while (scope) {
      widgetConfig = (ref = scope._widgetConfig) != null ? ref[name] : void 0;
      if (widgetConfig) {
        break;
      }
      scope = scope.parent;
    }
    return widgetConfig;
  };

  cola._userDomCompiler.$.push(function(scope, dom, context) {
    var config, configKey, constr, importConfig, importName, importNames, ip, iv, j, jsonConfig, k, len, oldParentConstr, p, ref, v, widgetConfigStr;
    if (cola.util.userData(dom, cola.constants.DOM_ELEMENT_KEY)) {
      return null;
    }
    if (dom.id) {
      jsonConfig = _findWidgetConfig(scope, dom.id);
    }
    configKey = dom.getAttribute("widget-config");
    if (configKey) {
      dom.removeAttribute("widget-config");
      config = (ref = context.widgetConfigs) != null ? ref[configKey] : void 0;
    } else {
      widgetConfigStr = dom.getAttribute("c-widget");
      if (widgetConfigStr) {
        dom.removeAttribute("c-widget");
        if (context.defaultPath) {
          widgetConfigStr = widgetConfigStr.replace(ALIAS_REGEXP, context.defaultPath);
        }
        config = cola.util.parseStyleLikeString(widgetConfigStr, "$type");
        if (config) {
          importNames = null;
          for (p in config) {
            v = config[p];
            importName = null;
            if (p.charCodeAt(0) === 35) {
              importName = p.substring(1);
            } else if (p === "$type" && typeof v === "string" && v.charCodeAt(0) === 35) {
              importName = v.substring(1);
            }
            if (importName) {
              delete config[p];
              if (importNames == null) {
                importNames = [];
              }
              importNames.push(importName);
            }
          }
          if (importNames) {
            for (j = 0, len = importNames.length; j < len; j++) {
              importName = importNames[j];
              importConfig = _findWidgetConfig(scope, importName);
              if (importConfig) {
                for (ip in importConfig) {
                  iv = importConfig[ip];
                  config[ip] = iv;
                }
              }
            }
          }
        }
      }
    }
    if (!(config || jsonConfig)) {
      return null;
    }
    if (config == null) {
      config = {};
    }
    if (jsonConfig) {
      for (k in jsonConfig) {
        v = jsonConfig[k];
        config[k] = v;
      }
    }
    if (typeof config === "string") {
      config = {
        $type: config
      };
    }
    oldParentConstr = context.constr;
    constr = cola.resolveType((oldParentConstr != null ? oldParentConstr.CHILDREN_TYPE_NAMESPACE : void 0) || "widget", config, cola.Widget);
    config.$constr = context.constr = constr;
    return function(scope, dom) {
      var oldScope, widget;
      context.constr = oldParentConstr;
      config.dom = dom;
      oldScope = cola.currentScope;
      cola.currentScope = scope;
      try {
        widget = cola.widget(config);
        return widget;
      } finally {
        cola.currentScope = oldScope;
      }
    };
  });

  cola.registerTypeResolver("widget", function(config) {
    if (!(config && config.$type)) {
      return;
    }
    return cola[cola.util.capitalize(config.$type)];
  });

  cola.registerType("widget", "_default", cola.Widget);

  cola.widget = function(config, namespace) {
    var c, constr, e, ele, group, j, l, len, len1, widget;
    if (!config) {
      return null;
    }
    if (typeof config === "string") {
      ele = window[config];
      if (!ele) {
        return null;
      }
      if (ele.nodeType) {
        widget = cola.util.userData(ele, cola.constants.DOM_ELEMENT_KEY);
        if (widget instanceof cola.Widget) {
          return widget;
        } else {
          return null;
        }
      } else {
        group = [];
        for (j = 0, len = ele.length; j < len; j++) {
          e = ele[j];
          widget = cola.util.userData(e, cola.constants.DOM_ELEMENT_KEY);
          if (widget instanceof cola.Widget) {
            group.push(widget);
          }
        }
        if (group.length) {
          return cola.Element.createGroup(group);
        } else {
          return null;
        }
      }
    } else {
      if (config instanceof Array) {
        group = [];
        for (l = 0, len1 = config.length; l < len1; l++) {
          c = config[l];
          group.push(cola.widget(c));
        }
        return cola.Element.createGroup(group);
      } else if (config.nodeType === 1) {
        widget = cola.util.userData(config, cola.constants.DOM_ELEMENT_KEY);
        if (widget instanceof cola.Widget) {
          return widget;
        } else {
          return null;
        }
      } else {
        constr = config.$constr || cola.resolveType(namespace || "widget", config, cola.Widget);
        return new constr(config);
      }
    }
  };

  cola.findWidget = function(dom, type) {
    var widget;
    if (type && typeof type === "string") {
      type = cola.resolveType("widget", {
        $type: type
      });
      if (!type) {
        return null;
      }
    }
    while (dom) {
      widget = cola.util.userData(dom, cola.constants.DOM_ELEMENT_KEY);
      if (widget) {
        if (!type || widget instanceof type) {
          return widget;
        }
      }
      dom = dom.parentNode;
    }
    return null;
  };

  TEMP_TEMPLATE = null;

  cola.TemplateSupport = {
    destroy: function() {
      var name;
      if (this._templates) {
        for (name in this._templates) {
          delete this._templates[name];
        }
      }
    },
    _parseTemplates: function() {
      var child;
      if (!this._dom) {
        return;
      }
      child = this._dom.firstChild;
      while (child) {
        if (child.nodeName === "TEMPLATE") {
          this._regTemplate(child);
        }
        child = child.nextSibling;
      }
      this._regDefaultTempaltes();
    },
    _trimTemplate: function(dom) {
      var child, next;
      child = dom.firstChild;
      while (child) {
        next = child.nextSibling;
        if (child.nodeType === 3) {
          if ($.trim(child.nodeValue) === "") {
            dom.removeChild(child);
          }
        }
        child = next;
      }
    },
    _regTemplate: function(name, template) {
      if (arguments.length === 1) {
        template = name;
        if (template.nodeType) {
          name = template.getAttribute("name");
        } else {
          name = template.name;
        }
      }
      if (this._templates == null) {
        this._templates = {};
      }
      this._templates[name || "default"] = template;
    },
    _regDefaultTempaltes: function() {
      var name, ref, ref1, template;
      ref = this.constructor.TEMPLATES;
      for (name in ref) {
        template = ref[name];
        if (((ref1 = this._templates) != null ? ref1.hasOwnProperty(name) : void 0) || !template) {
          continue;
        }
        this._regTemplate(name, template);
      }
    },
    _getTemplate: function(name, defaultName) {
      var c, child, html, k, ref, template, templs, widgetConfigs;
      if (name == null) {
        name = "default";
      }
      if (!this._templates) {
        return null;
      }
      template = this._templates[name];
      if (!template && defaultName) {
        name = defaultName;
        template = this._templates[name];
      }
      if (template && !template._trimed) {
        if (template.nodeType) {
          if (template.nodeName === "TEMPLATE") {
            if (!template.firstChild) {
              html = template.innerHTML;
              if (html) {
                if (TEMP_TEMPLATE == null) {
                  TEMP_TEMPLATE = document.createElement("div");
                }
                template = TEMP_TEMPLATE;
                template.innerHTML = html;
              }
            }
            this._trimTemplate(template);
            if (template.firstChild === template.lastChild) {
              template = template.firstChild;
            } else {
              templs = [];
              child = template.firstChild;
              while (child) {
                templs.push(child);
                child = child.nextSibling;
              }
              template = templs;
            }
          }
          this._templates[name] = template;
        } else {
          if (this._doms == null) {
            this._doms = {};
          }
          template = $.xCreate(template, this._doms);
          if (this._doms.widgetConfigs) {
            if (this._templateContext == null) {
              this._templateContext = {};
            }
            if (this._templateContext.widgetConfigs) {
              widgetConfigs = this._templateContext.widgetConfigs;
              ref = this._doms.widgetConfigs;
              for (k in ref) {
                c = ref[k];
                widgetConfigs[k] = c;
              }
            } else {
              this._templateContext.widgetConfigs = this._doms.widgetConfigs;
            }
          }
          this._templates[name] = template;
        }
        template._trimed = true;
      }
      return template;
    },
    _cloneTemplate: function(template, supportMultiNodes) {
      var templ;
      if (template instanceof Array) {
        if (supportMultiNodes) {
          return (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = template.length; j < len; j++) {
              templ = template[j];
              results.push(templ.cloneNode(true));
            }
            return results;
          })();
        } else {
          return template[0].cloneNode(true);
        }
      } else {
        return template.cloneNode(true);
      }
    }
  };

  cola.DataWidgetMixin = {
    _bindSetter: function(bindStr) {
      var bindInfo, bindProcessor, expression, i, j, l, len, len1, len2, m, p, path, paths, ref, ref1;
      if (this._bindStr === bindStr) {
        return;
      }
      if (this._bindInfo) {
        bindInfo = this._bindInfo;
        if (this._watchingPaths) {
          ref = this._watchingPaths;
          for (j = 0, len = ref.length; j < len; j++) {
            path = ref[j];
            this._scope.data.unbind(path.join("."), this._bindProcessor);
          }
        }
        delete this._bindInfo;
      }
      this._bindStr = bindStr;
      if (bindStr && this._scope) {
        this._bindInfo = bindInfo = {};
        bindInfo.expression = expression = cola._compileExpression(bindStr);
        if (expression.repeat || expression.setAlias) {
          throw new cola.Exception("Expression \"" + bindStr + "\" must be a simple expression.");
        }
        if ((expression.type === "MemberExpression" || expression.type === "Identifier") && !expression.hasCallStatement && !expression.convertors) {
          bindInfo.isWriteable = true;
          i = bindStr.lastIndexOf(".");
          if (i > 0) {
            bindInfo.entityPath = bindStr.substring(0, i);
            bindInfo.property = bindStr.substring(i + 1);
          } else {
            bindInfo.entityPath = null;
            bindInfo.property = bindStr;
          }
        }
        if (!this._bindProcessor) {
          this._bindProcessor = bindProcessor = {
            _processMessage: (function(_this) {
              return function(bindingPath, path, type, arg) {
                if (_this._filterDataMessage) {
                  if (!_this._filterDataMessage(path, type, arg)) {
                    return;
                  }
                } else {
                  if (!((cola.constants.MESSAGE_REFRESH <= type && type <= cola.constants.MESSAGE_CURRENT_CHANGE) || _this._watchingMoreMessage)) {
                    return;
                  }
                }
                if (_this._bindInfo.watchingMoreMessage) {
                  cola.util.delay(_this, "processMessage", 100, function() {
                    if (this._processDataMessage) {
                      this._processDataMessage(this._bindInfo.watchingPaths[0], cola.constants.MESSAGE_REFRESH, {});
                    } else {
                      this._refreshBindingValue();
                    }
                  });
                } else {
                  if (_this._processDataMessage) {
                    _this._processDataMessage(path, type, arg);
                  } else {
                    _this._refreshBindingValue();
                  }
                }
              };
            })(this)
          };
        }
        path = expression.path;
        if (!path) {
          if (expression.hasCallStatement) {
            path = "**";
            bindInfo.watchingMoreMessage = expression.hasCallStatement || expression.convertors;
          }
        } else {
          if (typeof expression.path === "string") {
            bindInfo.expressionPaths = [expression.path.split(".")];
          }
          if (expression.path instanceof Array) {
            paths = [];
            ref1 = expression.path;
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              p = ref1[l];
              paths.push(p.split("."));
            }
            bindInfo.expressionPaths = paths;
          }
        }
        if (path) {
          if (typeof path === "string") {
            paths = [path];
          } else {
            paths = path;
          }
          this._watchingPaths = paths;
          for (i = m = 0, len2 = paths.length; m < len2; i = ++m) {
            p = paths[i];
            this._scope.data.bind(p, bindProcessor);
            paths[i] = p.split(".");
          }
          if (this._processDataMessage) {
            this._processDataMessage(null, cola.constants.MESSAGE_REFRESH, {});
          } else {
            this._refreshBindingValue();
          }
        }
      }
    },
    destroy: function() {
      var j, len, path, ref;
      if (this._watchingPaths) {
        ref = this._watchingPaths;
        for (j = 0, len = ref.length; j < len; j++) {
          path = ref[j];
          this._scope.data.unbind(path.join("."), this._bindProcessor);
        }
      }
    },
    _readBindingValue: function(dataCtx) {
      var ref;
      if (!((ref = this._bindInfo) != null ? ref.expression : void 0)) {
        return;
      }
      if (dataCtx == null) {
        dataCtx = {};
      }
      return this._bindInfo.expression.evaluate(this._scope, "async", dataCtx);
    },
    _writeBindingValue: function(value) {
      var ref;
      if (!((ref = this._bindInfo) != null ? ref.expression : void 0)) {
        return;
      }
      if (!this._bindInfo.isWriteable) {
        throw new cola.Exception("Expression \"" + this._bindStr + "\" is not writable.");
      }
      this._scope.set(this._bindStr, value);
    },
    _getBindingProperty: function() {
      var ref;
      if (!(((ref = this._bindInfo) != null ? ref.expression : void 0) && this._bindInfo.isWriteable)) {
        return;
      }
      return this._scope.data.getProperty(this._bindStr);
    },
    _getBindingDataType: function() {
      var ref;
      if (!(((ref = this._bindInfo) != null ? ref.expression : void 0) && this._bindInfo.isWriteable)) {
        return;
      }
      return this._scope.data.getDataType(this._bindStr);
    },
    _isRootOfTarget: function(changedPath, targetPath) {
      var i, isRoot, j, l, len, len1, len2, m, part, targetPaths;
      if (!changedPath || !targetPath) {
        return true;
      }
      if (targetPath instanceof Array) {
        targetPaths = targetPath;
        for (j = 0, len = targetPaths.length; j < len; j++) {
          targetPath = targetPaths[j];
          isRoot = true;
          for (i = l = 0, len1 = changedPath.length; l < len1; i = ++l) {
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
        for (i = m = 0, len2 = changedPath.length; m < len2; i = ++m) {
          part = changedPath[i];
          if (part !== targetPath[i]) {
            return false;
          }
        }
        return true;
      }
    }
  };

  cola.DataItemsWidgetMixin = {
    _alias: "item",
    _bindSetter: function(bindStr) {
      var expression;
      if (this._bindStr === bindStr) {
        return;
      }
      this._bindStr = bindStr;
      this._itemsRetrieved = false;
      if (bindStr && this._scope) {
        expression = cola._compileExpression(bindStr, "repeat");
        if (!expression.repeat) {
          throw new cola.Exception("Expression \"" + bindStr + "\" must be a repeat expression.");
        }
        this._alias = expression.alias;
      }
      this._itemsScope.setExpression(expression);
    },
    constructor: function() {
      var itemsScope;
      this._itemsScope = itemsScope = new cola.ItemsScope(this._scope);
      itemsScope.onItemsRefresh = (function(_this) {
        return function(arg) {
          return _this._onItemsRefresh(arg);
        };
      })(this);
      itemsScope.onItemRefresh = (function(_this) {
        return function(arg) {
          return _this._onItemRefresh(arg);
        };
      })(this);
      itemsScope.onItemInsert = (function(_this) {
        return function(arg) {
          return _this._onItemInsert(arg);
        };
      })(this);
      itemsScope.onItemRemove = (function(_this) {
        return function(arg) {
          return _this._onItemRemove(arg);
        };
      })(this);
      if (this._onCurrentItemChange) {
        return itemsScope.onCurrentItemChange = (function(_this) {
          return function(arg) {
            return _this._onCurrentItemChange(arg);
          };
        })(this);
      }
    },
    _getItems: function() {
      if (!this._itemsRetrieved) {
        this._itemsRetrieved = true;
        this._itemsScope.retrieveItems();
      }
      return {
        items: this._itemsScope.items,
        originItems: this._itemsScope.originItems
      };
    }
  };

  cola.semantic = {

    /*
    	fixVisibilityOnUpdate和fixVisibilityOnRefresh方法用于修正SemanticUI中visibility的一处计算错误。
       当我们尝试利用visibility处理非body的滚动时，SemanticUI中的一处对jQuery.offset()的误用导致获得对象偏移量总是相对于document的，而非实际滚动的容器。
       使用时，将fixVisibilityOnUpdate和fixVisibilityOnRefresh方法分别定义为visibility的onUpdate和onRefresh监听器。
     */
    fixVisibilityOnUpdate: function(calculations) {
      if (this._offset == null) {
        this._offset = {
          left: this.offsetLeft,
          top: this.offsetTop
        };
      }
      calculations.offset = this._offset;
    },
    fixVisibilityOnRefresh: function() {
      this._offset = {
        left: this.offsetLeft,
        top: this.offsetTop
      };
    }
  };

  ACTIVE_PINCH_REG = /^pinch/i;

  ACTIVE_ROTATE_REG = /^rotate/i;

  PAN_VERTICAL_EVENTS = ["panUp", "panDown"];

  SWIPE_VERTICAL_EVENTS = ["swipeUp", "swipeDown"];


  /*
      ClassName池对象
      用于刷新组件时频繁的编辑class name提高性能
   */

  cola.ClassNamePool = (function() {
    function ClassNamePool(domClass, semanticList) {
      if (semanticList == null) {
        semanticList = [];
      }
      this.elements = [];
      domClass = domClass ? (" " + domClass + " ").replace(cola.constants.CLASS_REG, " ") : " ";
      semanticList.forEach((function(_this) {
        return function(name) {
          var klass;
          klass = " " + name + " ";
          if (domClass.indexOf(klass) > -1) {
            domClass = domClass.replace(klass, " ");
            _this.add(name);
          }
        };
      })(this));
      $.trim(domClass).split(" ").forEach((function(_this) {
        return function(klass) {
          _this.add(klass);
        };
      })(this));
    }

    ClassNamePool.prototype.add = function(className) {
      var index;
      if (!className) {
        return;
      }
      index = this.elements.indexOf(className);
      if (index > -1) {
        return;
      }
      return this.elements.push(className);
    };

    ClassNamePool.prototype.remove = function(className) {
      var i;
      i = this.elements.indexOf(className);
      if (i > -1) {
        this.elements.splice(i, 1);
      }
      return this;
    };

    ClassNamePool.prototype.destroy = function() {
      return delete this["elements"];
    };

    ClassNamePool.prototype.join = function() {
      return this.elements.join(" ");
    };

    ClassNamePool.prototype.toggle = function(className, status) {
      if (!!status) {
        this.add(className);
      } else {
        this.remove(className);
      }
    };

    return ClassNamePool;

  })();

  _destroyRenderableElement = function(node, data) {
    var element;
    element = data[cola.constants.DOM_ELEMENT_KEY];
    if (!(typeof element === "function" ? element(_destroyed) : void 0)) {
      element._domRemoved = true;
      element.destroy();
    }
  };


  /*
      可渲染元素
   */

  cola.RenderableElement = (function(superClass) {
    extend(RenderableElement, superClass);

    RenderableElement.TAG_NAME = "DIV";

    function RenderableElement(config) {
      var dom;
      if (config) {
        dom = config.dom;
        if (dom) {
          delete config.dom;
        }
      }
      if (this._doms == null) {
        this._doms = {};
      }
      RenderableElement.__super__.constructor.call(this, config);
      if (dom) {
        this._setDom(dom, true);
      }
    }

    RenderableElement.prototype._initDom = function(dom) {};

    RenderableElement.prototype._parseDom = function(dom) {};

    RenderableElement.prototype._setDom = function(dom, parseChild) {
      if (!dom) {
        return;
      }
      this._dom = dom;
      cola.util.userData(dom, cola.constants.DOM_ELEMENT_KEY, this);
      cola.util.onNodeRemoved(dom, _destroyRenderableElement);
      if (parseChild) {
        this._parseDom(dom);
      }
      this._initDom(dom);
      this._refreshDom();
      this._rendered = true;
    };

    RenderableElement.prototype._createDom = function() {
      var className, dom;
      dom = document.createElement(this.constructor.TAG_NAME || "div");
      className = this.constructor.CLASS_NAME || "";
      dom.className = "ui " + className;
      return dom;
    };

    RenderableElement.prototype._doSet = function(attr, attrConfig, value) {
      if ((attrConfig != null ? attrConfig.refreshDom : void 0) && this._dom) {
        cola.util.delay(this, "refreshDom", 50, this._refreshDom);
      }
      return RenderableElement.__super__._doSet.call(this, attr, attrConfig, value);
    };

    RenderableElement.prototype._doRefreshDom = function() {
      var className, j, len, name, names;
      cola.util.cancelDelay(this, "_refreshDom");
      if (!this._dom) {
        return;
      }
      this._classNamePool.add("ui");
      className = this.constructor.CLASS_NAME;
      if (className) {
        names = $.trim(className).split(" ");
        for (j = 0, len = names.length; j < len; j++) {
          name = names[j];
          this._classNamePool.add(name);
        }
      }
      this._resetDimension();
    };

    RenderableElement.prototype._refreshDom = function() {
      var newClassName;
      if (!(this._dom || !this._destroyed)) {
        return;
      }
      this._classNamePool = new cola.ClassNamePool(this._dom.className, this.constructor.SEMANTIC_CLASS);
      this._doRefreshDom();
      newClassName = $.trim(this._classNamePool.join());
      this._dom.className = newClassName;
      this._classNamePool.destroy();
      delete this["_classNamePool"];
    };

    RenderableElement.prototype._resetDimension = function() {};

    RenderableElement.prototype.getDom = function() {
      var arg, dom;
      if (this._destroyed) {
        return null;
      }
      if (!this._dom) {
        dom = this._createDom();
        this._setDom(dom);
        arg = {
          dom: dom,
          returnValue: null
        };
        this.fire("createDom", this, arg);
      }
      return this._dom;
    };

    RenderableElement.prototype.get$Dom = function() {
      if (this._destroyed) {
        return null;
      }
      if (this._$dom == null) {
        this._$dom = $(this.getDom());
      }
      return this._$dom;
    };

    RenderableElement.prototype.refresh = function() {
      var arg;
      if (!this._dom) {
        return this;
      }
      this._refreshDom();
      arg = {
        dom: this._dom,
        returnValue: null
      };
      this.fire("refreshDom", this, arg);
      return this;
    };

    RenderableElement.prototype.appendTo = function(parentNode) {
      if (parentNode && this.getDom()) {
        $(parentNode).append(this._dom);
      }
      return this;
    };

    RenderableElement.prototype.remove = function() {
      this.get$Dom().remove();
      return this;
    };

    RenderableElement.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      cola.util.cancelDelay(this, "refreshDom");
      if (this._dom) {
        if (!this._domRemoved) {
          this.remove();
        }
        delete this._dom;
        delete this._$dom;
      }
      RenderableElement.__super__.destroy.call(this);
      this._destroyed = true;
    };

    RenderableElement.prototype.addClass = function(value, continuous) {
      if (continuous) {
        cola.util.addClass(this._dom, value, true);
      } else {
        this.get$Dom().addClass(value);
      }
      return this;
    };

    RenderableElement.prototype.removeClass = function(value, continuous) {
      if (continuous) {
        cola.util.removeClass(this._dom, value, true);
      } else {
        this.get$Dom().removeClass(value);
      }
      return this;
    };

    RenderableElement.prototype.toggleClass = function(value, state, continuous) {
      if (continuous) {
        cola.util.toggleClass(this._dom, value, state, true);
      } else {
        this.get$Dom().toggleClass(value, state);
      }
      return this;
    };

    RenderableElement.prototype.hasClass = function(value, continuous) {
      if (continuous) {
        return cola.util.hasClass(this._dom, value, true);
      } else {
        return this.get$Dom().hasClass(value);
      }
    };

    return RenderableElement;

  })(cola.Element);


  /*
  Dorado 基础组件
   */

  cola.Widget = (function(superClass) {
    extend(Widget, superClass);

    function Widget() {
      return Widget.__super__.constructor.apply(this, arguments);
    }

    Widget.CLASS_NAME = "control";

    Widget.SEMANTIC_CLASS = ["left floated", "right floated"];

    Widget.ATTRIBUTES = {
      display: {
        defaultValue: true,
        refreshDom: true,
        type: "boolean"
      },
      float: {
        refreshDom: true,
        "enum": ["left", "right", ""],
        defaultValue: "",
        setter: function(value) {
          var oldValue;
          oldValue = this["_float"];
          if (this._dom && oldValue && oldValue !== value) {
            cola.util.removeClass(this._dom, oldValue + " floated", true);
          }
          this["_float"] = value;
        }
      },
      "class": {
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this["_class"];
          if (oldValue && this._dom && oldValue !== value) {
            this.get$Dom().removeClass(oldValue);
          }
          this["_class"] = value;
        }
      },
      popup: {
        setter: function(value) {
          var options;
          options = {};
          if (typeof value === "string") {
            options.content = value;
          } else if (value.constructor === Object.prototype.constructor && value.tagName) {
            options.html = $.xCreate(value);
          } else if (value.nodeType === 1) {
            options.html = value;
          } else {
            options = value;
          }
          this._popup = options;
          if (this._dom) {
            this.get$Dom().popup(this._popup);
          }
        }
      },
      dimmer: {
        setter: function(value) {
          var k, v;
          if (this._dimmer == null) {
            this._dimmer = {};
          }
          for (k in value) {
            v = value[k];
            this._dimmer[k] = v;
          }
        }
      },
      height: {
        refreshDom: true
      },
      width: {
        refreshDom: true
      }
    };

    Widget.EVENTS = {
      createDom: null,
      refreshDom: null,
      click: {
        $event: "click"
      },
      dblClick: {
        $event: "dblclick"
      },
      mouseDown: {
        $event: "mousedown"
      },
      mouseUp: {
        $event: "mouseup"
      },
      tap: {
        hammerEvent: "tap"
      },
      press: {
        hammerEvent: "press"
      },
      panStart: {
        hammerEvent: "panstart"
      },
      panMove: {
        hammerEvent: "panmove"
      },
      panEnd: {
        hammerEvent: "panend"
      },
      panCancel: {
        hammerEvent: "pancancel"
      },
      panLeft: {
        hammerEvent: "panleft"
      },
      panRight: {
        hammerEvent: "panright"
      },
      panUp: {
        hammerEvent: "panup"
      },
      panDown: {
        hammerEvent: "pandown"
      },
      pinchStart: {
        hammerEvent: "pinchstart"
      },
      pinchMove: {
        hammerEvent: "pinchmove"
      },
      pinchEnd: {
        hammerEvent: "pinchend"
      },
      pinchCancel: {
        hammerEvent: "pinchcancel"
      },
      pinchIn: {
        hammerEvent: "pinchin"
      },
      pinchOut: {
        hammerEvent: "pinchout"
      },
      rotateStart: {
        hammerEvent: "rotatestart"
      },
      rotateMove: {
        hammerEvent: "rotatemove"
      },
      rotateEnd: {
        hammerEvent: "rotateend"
      },
      rotateCancel: {
        hammerEvent: "rotatecancel"
      },
      swipeLeft: {
        hammerEvent: "swipeleft"
      },
      swipeRight: {
        hammerEvent: "swiperight"
      },
      swipeUp: {
        hammerEvent: "swipeup"
      },
      swipeDown: {
        hammerEvent: "swipedown"
      }
    };

    Widget.prototype._setDom = function(dom, parseChild) {
      var eventName;
      if (!dom) {
        return;
      }
      Widget.__super__._setDom.call(this, dom, parseChild);
      for (eventName in this.constructor.EVENTS) {
        if (this.getListeners(eventName)) {
          this._bindEvent(eventName);
        }
      }
      if (this._popup) {
        $(dom).popup(this._popup);
      }
    };

    Widget.prototype._on = function(eventName, listener, alias) {
      Widget.__super__._on.call(this, eventName, listener, alias);
      if (this._dom) {
        this._bindEvent(eventName);
      }
      return this;
    };

    Widget.prototype.fire = function(eventName, self, arg) {
      var eventConfig;
      if (!this._eventRegistry) {
        return true;
      }
      eventConfig = this.constructor.EVENTS[eventName];
      if (this.constructor.ATTRIBUTES.hasOwnProperty("disabled") && this.get("disabled") && eventConfig && (eventConfig.$event || eventConfig.hammerEvent)) {
        return true;
      }
      if (!this["_hasFireTapEvent"]) {
        this["_hasFireTapEvent"] = eventName === "tap";
      }
      if (eventName === "click" && this["_hasFireTapEvent"]) {
        return true;
      }
      return Widget.__super__.fire.call(this, eventName, self, arg);
    };

    Widget.prototype._doRefreshDom = function() {
      var j, len, name, ref;
      if (!this._dom) {
        return;
      }
      Widget.__super__._doRefreshDom.call(this);
      if (this._float) {
        this._classNamePool.add(this._float + " floated");
      }
      this._classNamePool.toggle("display-none", !!!this._display);
      if (!this._rendered && this._class) {
        ref = this._class.split(" ");
        for (j = 0, len = ref.length; j < len; j++) {
          name = ref[j];
          this._classNamePool.add(name);
        }
      }
    };

    Widget.prototype._bindEvent = function(eventName) {
      var $dom, eventConfig;
      if (!this._dom) {
        return;
      }
      if (this._bindedEvents == null) {
        this._bindedEvents = {};
      }
      if (this._bindedEvents[eventName]) {
        return;
      }
      $dom = this.get$Dom();
      eventConfig = this.constructor.EVENTS[eventName];
      if (eventConfig != null ? eventConfig.$event : void 0) {
        $dom.on(eventConfig.$event, (function(_this) {
          return function(evt) {
            var arg;
            arg = {
              dom: _this._dom,
              event: evt,
              returnValue: null
            };
            _this.fire(eventName, _this, arg);
          };
        })(this));
        this._bindedEvents[eventName] = true;
        return;
      }
      if (eventConfig != null ? eventConfig.hammerEvent : void 0) {
        if (this._hammer == null) {
          this._hammer = new Hammer(this._dom, {});
        }
        if (ACTIVE_PINCH_REG.test(eventName)) {
          this._hammer.get("pinch").set({
            enable: true
          });
        }
        if (ACTIVE_ROTATE_REG.test(eventName)) {
          this._hammer.get("rotate").set({
            enable: true
          });
        }
        if (PAN_VERTICAL_EVENTS.indexOf(eventName) >= 0) {
          this._hammer.get("pan").set({
            direction: Hammer.DIRECTION_ALL
          });
        }
        if (SWIPE_VERTICAL_EVENTS.indexOf(eventName) >= 0) {
          this._hammer.get("swipe").set({
            direction: Hammer.DIRECTION_ALL
          });
        }
        this._hammer.on(eventConfig.hammerEvent, (function(_this) {
          return function(evt) {
            var arg;
            arg = {
              dom: _this._dom,
              event: evt,
              returnValue: null,
              eventName: eventName
            };
            return _this.fire(eventName, _this, arg);
          };
        })(this));
        this._bindedEvents[eventName] = true;
        return;
      }
    };

    Widget.prototype._resetDimension = function() {
      var $dom, height, unit, width;
      $dom = this.get$Dom();
      unit = cola.constants.WIDGET_DIMENSION_UNIT;
      height = this.get("height");
      if (isFinite(height)) {
        height = "" + (parseInt(height)) + unit;
      }
      if (height) {
        $dom.css("height", height);
      }
      width = this.get("width");
      if (isFinite(width)) {
        width = "" + (parseInt(width)) + unit;
      }
      if (width) {
        $dom.css("width", width);
      }
    };

    Widget.prototype.showDimmer = function(options) {
      var $dom, content, dimmer, dimmerContent, k, v;
      if (options == null) {
        options = {};
      }
      if (!this._dom) {
        return this;
      }
      content = options.content;
      if (!content && this._dimmer) {
        content = this._dimmer.content;
      }
      if (content) {
        if (typeof content === "string") {
          dimmerContent = $.xCreate({
            tagName: "div",
            content: content
          });
        } else if (content.constructor === Object.prototype.constructor && content.tagName) {
          dimmerContent = $.xCreate(content);
        } else if (content.nodeType === 1) {
          dimmerContent = content;
        }
      }
      if (this._dimmer == null) {
        this._dimmer = {};
      }
      for (k in options) {
        v = options[k];
        if (k !== "content") {
          this._dimmer[k] = v;
        }
      }
      $dom = this.get$Dom();
      dimmer = $dom.dimmer("get dimmer");
      if (dimmerContent) {
        if (dimmer) {
          $(dimmer).empty();
        } else {
          $dom.dimmer("create");
        }
        $dom.dimmer("add content", dimmerContent);
      }
      $dom.dimmer(this._dimmer);
      $dom.dimmer("show");
      return this;
    };

    Widget.prototype.hideDimmer = function() {
      if (!this._dom) {
        return this;
      }
      this.get$Dom().dimmer("hide");
      return this;
    };

    Widget.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      if (this._dom) {
        delete this._hammer;
        delete this._bindedEvents;
        delete this._parent;
        delete this._doms;
      }
      Widget.__super__.destroy.call(this);
      this._destroyed = true;
    };

    return Widget;

  })(cola.RenderableElement);

  cola.floatWidget = {
    _zIndex: 1100,
    zIndex: function() {
      return ++cola.floatWidget._zIndex;
    }
  };

}).call(this);
