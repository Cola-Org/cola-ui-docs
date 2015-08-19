(function() {
  var _removeTranslateStyle,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  cola.Segment = (function(superClass) {
    extend(Segment, superClass);

    function Segment() {
      return Segment.__super__.constructor.apply(this, arguments);
    }

    Segment.CLASS_NAME = "segment";

    Segment.SEMANTIC_CLASS = ["left floated", "right floated", "top attached", "bottom attached", "left attached", "right attached", "very basic", "left aligned", "right aligned", "center aligned", "vertical segment", "horizontal segment"];

    Segment.ATTRIBUTES = {
      textAlign: {
        refreshDom: true,
        "enum": ["left", "right", "center"],
        setter: function(value) {
          var oldValue;
          oldValue = this["_textAlign"];
          if (oldValue && this._dom && oldValue !== value) {
            cola.util.removeClass(this._dom, oldValue + " aligned", true);
          }
          this["_textAlign"] = value;
        }
      },
      attached: {
        refreshDom: true,
        "enum": ["left", "right", "top", "bottom"],
        setter: function(value) {
          var oldValue;
          oldValue = this["_attached"];
          if (oldValue && this._dom && oldValue !== value) {
            $removeClass(this._dom, oldValue + " attached", true);
          }
          this["_attached"] = value;
        }
      },
      color: {
        refreshDom: true,
        "enum": ["black", "yellow", "green", "blue", "orange", "purple", "red", "pink", "teal"],
        setter: function(value) {
          var oldValue;
          oldValue = this["_color"];
          this["_color"] = value;
          if (oldValue && oldValue !== value && this._dom) {
            this.get$Dom().removeClass(oldValue);
          }
        }
      }
    };

    Segment.prototype._doRefreshDom = function() {
      var attached, classNamePool, color, textAlign;
      if (!this._dom) {
        return;
      }
      Segment.__super__._doRefreshDom.call(this);
      classNamePool = this._classNamePool;
      color = this.get("color");
      if (color) {
        classNamePool.add(color);
      }
      attached = this.get("attached");
      if (attached) {
        classNamePool.add(attached + " attached");
      }
      textAlign = this.get("textAlign");
      if (textAlign) {
        classNamePool.add(textAlign + " aligned");
      }
    };

    return Segment;

  })(cola.AbstractContainer);

  _removeTranslateStyle = function(element) {
    var i, len, prefix, ref;
    ref = ['Moz', 'Webkit', 'O', 'ms'];
    for (i = 0, len = ref.length; i < len; i++) {
      prefix = ref[i];
      element.style[prefix + "Transform"] = "";
    }
    return element.style.transform = "";
  };

  cola.Layer = (function(superClass) {
    extend(Layer, superClass);

    function Layer() {
      return Layer.__super__.constructor.apply(this, arguments);
    }

    Layer.CLASS_NAME = "layer transition hidden";

    Layer.ATTRIBUTES = {
      animation: {
        defaultValue: "slide left",
        "enum": ["scale", "drop", "browse right", "browse", "slide left", "slide right", "slide up", "slide down", "fade left", "fade right", "fade up", "fade down", "fly left", "fly right", "fly up", "fly down", "swing left", "swing right", "swing up", "swing down", "horizontal flip", "vertical flip"]
      },
      duration: {
        defaultValue: 300
      },
      visible: {
        readOnly: true,
        getter: function() {
          return this.isVisible();
        }
      }
    };

    Layer.EVENTS = {
      show: null,
      hide: null,
      beforeShow: null,
      beforeHide: null
    };

    Layer.SLIDE_ANIMATIONS = ["slide left", "slide right", "slide up", "slide down"];

    Layer.prototype._onShow = function() {};

    Layer.prototype._onHide = function() {};

    Layer.prototype._initDom = function() {};

    Layer.prototype._doTransition = function(options, callback) {
      var $dom, animation, configs, duration, height, isHorizontal, isShow, layer, onComplete, width, x, y;
      layer = this;
      onComplete = function() {
        if (typeof callback === "function") {
          callback.call(layer);
        }
        if (options.target === "show") {
          layer._onShow();
        } else {
          layer._onHide();
        }
        layer.fire(options.target, layer, {});
        return null;
      };
      if (options.animation === "none") {
        this.get$Dom().transition(options.target);
        onComplete();
        return this;
      }
      animation = options.animation || this._animation || "slide left";
      duration = options.duration || this._duration || 300;
      if (this.constructor.SLIDE_ANIMATIONS.indexOf(animation) < 0) {
        this.get$Dom().transition({
          animation: animation,
          duration: duration,
          onComplete: onComplete,
          queue: true
        });
      } else {
        $dom = this.get$Dom();
        width = $dom.width();
        height = $dom.height();
        isHorizontal = animation === "slide left" || animation === "slide right";
        if (animation === "slide left") {
          x = width;
          y = 0;
        } else if (animation === "slide right") {
          x = -width;
          y = 0;
        } else if (animation === "slide up") {
          x = 0;
          y = height;
        } else {
          x = 0;
          y = -height;
        }
        isShow = options.target === "show";
        if (isShow) {
          cola.Fx.translateElement(this._dom, x, y);
        }
        configs = {
          duration: duration,
          complete: (function(_this) {
            return function() {
              if (!isShow) {
                $dom.removeClass("visible").addClass("hidden");
              }
              _removeTranslateStyle(_this._dom);
              return onComplete();
            };
          })(this)
        };
        if (isHorizontal) {
          configs.x = isShow ? 0 : x;
        } else {
          configs.y = isShow ? 0 : y;
        }
        $dom.removeClass("hidden").addClass("visible").transit(configs);
      }
    };

    Layer.prototype._transition = function(options, callback) {
      if (this.fire("before" + (cola.util.capitalize(options.target)), this, {}) === false) {
        return false;
      }
      this._doTransition(options, callback);
      return this;
    };

    Layer.prototype.show = function(options, callback) {
      if (options == null) {
        options = {};
      }
      if (!this._dom || this.isVisible()) {
        return this;
      }
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options.target = "show";
      this._transition(options, callback);
      return this;
    };

    Layer.prototype.hide = function(options, callback) {
      if (options == null) {
        options = {};
      }
      if (!this._dom || !this.isVisible()) {
        return this;
      }
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options.target = "hide";
      this._transition(options, callback);
      return this;
    };

    Layer.prototype.toggle = function() {
      return this[this.isVisible() ? "hide" : "show"].apply(this, arguments);
    };

    Layer.prototype.isVisible = function() {
      return this.get$Dom().transition("stop all").transition("is visible");
    };

    return Layer;

  })(cola.AbstractContainer);

  cola.Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.CLASS_NAME = "dialog transition v-box hidden";

    Dialog.ATTRIBUTES = {
      context: null,
      animation: {
        defaultValue: "scale",
        "enum": ["scale", "drop", "browse right", "browse", "slide left", "slide right", "slide up", "slide down", "fade left", "fade right", "fade up", "fade down", "fly left", "fly right", "fly up", "fly down", "swing left", "swing right", "swing up", "swing down", "horizontal flip", "vertical flip"]
      },
      header: {
        setter: function(value) {
          this._setContent(value, "header");
          return this;
        }
      },
      actions: {
        setter: function(value) {
          this._setContent(value, "actions");
          return this;
        }
      },
      modal: {
        defaultValue: true
      },
      closeable: {
        defaultValue: true
      },
      modalOpacity: {
        defaultValue: 0.6
      },
      dimmerClose: {
        defaultValue: false
      }
    };

    Dialog.prototype.getContentContainer = function() {
      if (!this._dom) {
        return null;
      }
      if (!this._doms.content) {
        this._makeContentDom("content");
      }
      return this._doms.content;
    };

    Dialog.prototype._initDom = function(dom) {
      var container, el, i, j, key, len, len1, ref, ref1, ref2;
      Dialog.__super__._initDom.call(this, dom);
      ref = ["header", "actions"];
      for (i = 0, len = ref.length; i < len; i++) {
        container = ref[i];
        key = "_" + container;
        if ((ref1 = this[key]) != null ? ref1.length : void 0) {
          ref2 = this[key];
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            el = ref2[j];
            this._render(el, container);
          }
        }
      }
    };

    Dialog.prototype._createCloseButton = function() {
      var dom;
      dom = this._closeBtn = $.xCreate({
        tagName: "div",
        "class": "ui icon button close-btn",
        content: [
          {
            tagName: "i",
            "class": "close icon"
          }
        ],
        click: (function(_this) {
          return function() {
            return _this.hide();
          };
        })(this)
      });
      return dom;
    };

    Dialog.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Dialog.__super__._doRefreshDom.call(this);
      if (this.get("closeable")) {
        if (!this._closeBtn) {
          this._createCloseButton();
        }
        if (this._closeBtn.parentNode !== this._dom) {
          return this._dom.appendChild(this._closeBtn);
        }
      } else {
        return $(this._closeBtn).remove();
      }
    };

    Dialog.prototype._onShow = function() {
      var actionsDom, actionsHeight, headerHeight, height, minHeight;
      height = this._dom.offsetHeight;
      actionsDom = this._doms.actions;
      if (actionsDom) {
        actionsHeight = actionsDom.offsetHeight;
        headerHeight = 0;
        if (this._doms.header) {
          headerHeight = this._doms.header.offsetHeight;
        }
        minHeight = height - actionsHeight - headerHeight;
        $(this._doms.content).css("min-height", minHeight + "px");
      }
      return Dialog.__super__._onShow.call(this);
    };

    Dialog.prototype._transition = function(options, callback) {
      var $dom, height, isShow, pHeight, pWidth, parentNode, width;
      if (this.fire("before" + (cola.util.capitalize(options.target)), this, {}) === false) {
        return false;
      }
      $dom = this.get$Dom();
      isShow = options.target === "show";
      if (this.get("modal")) {
        if (isShow) {
          this._showModalLayer();
        } else {
          this._hideModalLayer();
        }
      }
      if (isShow) {
        width = $dom.width();
        height = $dom.height();
        parentNode = this._context || this._dom.parentNode;
        pWidth = $(parentNode).width();
        pHeight = $(parentNode).height();
        $dom.css({
          left: (pWidth - width) / 2,
          top: (pHeight - height) / 2,
          zIndex: cola.floatWidget.zIndex()
        });
      }
      options.animation = options.animation || this._animation || "scale";
      return this._doTransition(options, callback);
    };

    Dialog.prototype._makeContentDom = function(target) {
      var afterEl, dom, flex;
      if (this._doms == null) {
        this._doms = {};
      }
      dom = document.createElement("div");
      dom.className = target;
      if (target === "content") {
        if (this._doms["actions"]) {
          $(this._doms["actions"]).before(dom);
        } else {
          this._dom.appendChild(dom);
        }
      } else if (target === "header") {
        afterEl = this._doms["content"] || this._doms["actions"];
        if (afterEl) {
          $(afterEl).before(dom);
        } else {
          this._dom.appendChild(dom);
        }
      } else {
        this._dom.appendChild(dom);
      }
      flex = target === "content" ? "flex-box" : "box";
      $fly(dom).addClass(flex);
      this._doms[target] = dom;
      return dom;
    };

    Dialog.prototype._parseDom = function(dom) {
      var $child, _parseChild, child, className, i, len, ref;
      if (this._doms == null) {
        this._doms = {};
      }
      _parseChild = (function(_this) {
        return function(node, target) {
          var childNode, widget;
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              widget = cola.widget(childNode);
              _this._addContentElement(widget || childNode, target);
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (child.nodeName === "I") {
            this._doms.icon = child;
            if (this._icon == null) {
              this._icon = child.className;
            }
          } else {
            $child = $(child);
            ref = ["header", "content", "actions"];
            for (i = 0, len = ref.length; i < len; i++) {
              className = ref[i];
              if (!$child.hasClass(className)) {
                continue;
              }
              this._doms[className] = child;
              _parseChild(child, className);
              break;
            }
          }
        }
        child = child.nextSibling;
      }
    };

    Dialog.prototype._showModalLayer = function() {
      var _dimmerDom, container;
      if (this._doms == null) {
        this._doms = {};
      }
      _dimmerDom = this._doms.modalLayer;
      if (!_dimmerDom) {
        _dimmerDom = $.xCreate({
          tagName: "Div",
          "class": "ui dimmer",
          contextKey: "dimmer"
        });
        if (this._dimmerClose) {
          $(_dimmerDom).on("click", (function(_this) {
            return function() {
              return _this.hide();
            };
          })(this));
        }
        container = this._context || this._dom.parentNode;
        container.appendChild(_dimmerDom);
        this._doms.modalLayer = _dimmerDom;
      }
      $(_dimmerDom).css({
        opacity: this.get("modalOpacity"),
        zIndex: cola.floatWidget.zIndex()
      }).addClass("active");
    };

    Dialog.prototype._hideModalLayer = function() {
      var _dimmerDom;
      if (this._doms == null) {
        this._doms = {};
      }
      _dimmerDom = this._doms.modalLayer;
      return $(_dimmerDom).removeClass("active");
    };

    return Dialog;

  })(cola.Layer);

  cola.Sidebar = (function(superClass) {
    extend(Sidebar, superClass);

    function Sidebar() {
      return Sidebar.__super__.constructor.apply(this, arguments);
    }

    Sidebar.CLASS_NAME = "ui sidebar";

    Sidebar.ATTRIBUTES = {
      direction: {
        defaultValue: "left",
        "enum": ["left", "right", "top", "bottom"]
      },
      size: {
        defaultValue: 100
      },
      duration: {
        defaultValue: 200
      },
      transition: {
        defaultValue: "overlay",
        "enum": ["overlay", "push"]
      },
      mobileTransition: {
        defaultValue: "overlay",
        "enum": ["overlay", "push"]
      },
      closable: {
        defaultValue: true
      }
    };

    Sidebar.EVENTS = {
      beforeShow: null,
      beforeHide: null,
      show: null,
      hide: null
    };

    Sidebar.prototype.isHidden = function() {
      if (!this._dom) {
        return false;
      }
      return this.get$Dom().sidebar("is", "hidden");
    };

    Sidebar.prototype.isVisible = function() {
      if (!this._dom) {
        return false;
      }
      return this.get$Dom().sidebar("is", "visible");
    };

    Sidebar.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Sidebar.__super__._doRefreshDom.call(this);
      return this._classNamePool.add(this._direction || "left");
    };

    Sidebar.prototype.show = function(callback) {
      var $dom;
      if (this.fire("beforeShow", this, {
        dom: this._dom
      }) === false) {
        return;
      }
      $dom = this.get$Dom();
      if (!this._initialized) {
        this._initialized = true;
        this._setSize();
        $dom.sidebar('setting', {
          duration: this._duration || 200,
          transition: this._transition,
          closable: false,
          mobileTransition: this._mobileTransition,
          onShow: (function(_this) {
            return function() {
              return _this.fire("show", _this, {});
            };
          })(this),
          onHide: (function(_this) {
            return function() {
              return _this.fire("hide", _this, {});
            };
          })(this)
        });
      }
      return $dom.sidebar("show", callback);
    };

    Sidebar.prototype.hide = function(callback) {
      if (this.fire("beforeHide", this, {
        dom: this._dom
      }) === false) {
        return;
      }
      return this.get$Dom().sidebar("hide", callback);
    };

    Sidebar.prototype._setSize = function() {
      var direction, size, style, unit;
      unit = cola.constants.WIDGET_DIMENSION_UNIT;
      size = this.get("size");
      if (isFinite(size)) {
        size = "" + (parseInt(size)) + unit;
      }
      direction = this._direction || "left";
      style = direction === "left" || direction === "right" ? "width" : "height";
      this.get$Dom().css(style, size);
    };

    return Sidebar;

  })(cola.AbstractContainer);

  cola.Drawer = (function(superClass) {
    extend(Drawer, superClass);

    function Drawer() {
      return Drawer.__super__.constructor.apply(this, arguments);
    }

    Drawer.CLASS_NAME = "ui drawer pushable";

    Drawer.prototype.getPusherDom = function() {
      if (!this._dom) {
        return;
      }
      return $(this._dom).find("> .pusher")[0];
    };

    Drawer.prototype._initDom = function(dom) {
      var pusher;
      Drawer.__super__._initDom.call(this, dom);
      pusher = this.getPusherDom();
      if (!pusher) {
        dom.appendChild($.xCreate({
          tagName: "div",
          "class": "pusher"
        }));
      }
    };

    Drawer.prototype._initPusher = function() {
      this._pusher = this.getPusherDom();
      $(this._pusher).on("click", (function(_this) {
        return function() {
          var event;
          _this._hideSidebar();
          event = window.event;
          if (event) {
            event.stopImmediatePropagation();
            return event.preventDefault();
          }
        };
      })(this));
    };

    Drawer.prototype._hideSidebar = function() {
      var child, results, widget;
      child = this._dom.firstChild;
      results = [];
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget && widget instanceof cola.Sidebar && widget.isVisible()) {
            widget.hide();
          }
        }
        results.push(child = child.nextSibling);
      }
      return results;
    };

    Drawer.prototype._getFirstSidebar = function() {
      var sideDom;
      sideDom = $(this._dom).find("> .ui.sidebar")[0];
      if (!sideDom) {
        return;
      }
      return cola.widget(sideDom);
    };

    Drawer.prototype.showSidebar = function(id, callback) {
      var sidebar, sidebarDom;
      if (id) {
        if (typeof id === "function") {
          callback = id;
          sidebar = this._getFirstSidebar();
        } else {
          sidebar = cola.widget(id);
        }
      } else {
        sidebar = this._getFirstSidebar();
      }
      if (!sidebar) {
        return;
      }
      sidebarDom = sidebar.getDom();
      if (sidebarDom.parentNode !== this._dom) {
        return;
      }
      if (!this._pusher) {
        $(this._dom).find("> .ui.sidebar").sidebar({
          context: this._dom
        });
        this._initPusher();
      }
      return sidebar.show(callback);
    };

    Drawer.prototype.hideSidebar = function(id, callback) {
      var sidebar;
      if (id) {
        if (typeof id === "function") {
          callback = id;
          sidebar = this._getFirstSidebar();
        } else {
          sidebar = cola.widget(id);
        }
      } else {
        sidebar = this._getFirstSidebar();
      }
      if (!sidebar) {
        return;
      }
      sidebar.hide(callback);
      return this;
    };

    return Drawer;

  })(cola.AbstractContainer);

  if (cola.tab == null) {
    cola.tab = {};
  }

  cola.tab.AbstractTabButton = (function(superClass) {
    extend(AbstractTabButton, superClass);

    function AbstractTabButton() {
      return AbstractTabButton.__super__.constructor.apply(this, arguments);
    }

    AbstractTabButton.TAG_NAME = "li";

    AbstractTabButton.CLASS_NAME = "tab-button";

    AbstractTabButton.ATTRIBUTES = {
      icon: {
        refreshDom: true,
        setter: function(value) {
          var oldValue, ref;
          oldValue = this["_icon"];
          this["_icon"] = value;
          if (oldValue && oldValue !== value && this._dom && ((ref = this._doms) != null ? ref.icon : void 0)) {
            $(this._doms.icon).removeClass(oldValue);
          }
        }
      },
      closeable: {
        refreshDom: true,
        defaultValue: false
      },
      caption: {
        refreshDom: true
      },
      name: null
    };

    AbstractTabButton.prototype.getCaptionDom = function() {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms.caption) {
        dom = this._doms.caption = document.createElement("div");
        dom.className = "caption";
        this._dom.appendChild(dom);
      }
      return this._doms.caption;
    };

    AbstractTabButton.prototype.getCloseDom = function() {
      var base, tabItem;
      if (this._doms == null) {
        this._doms = {};
      }
      tabItem = this;
      if ((base = this._doms)._closeBtn == null) {
        base._closeBtn = $.xCreate({
          tagName: "div",
          "class": "close-btn",
          content: {
            tagName: "i",
            "class": "close icon"
          },
          click: function() {
            tabItem.close();
            return false;
          }
        });
      }
      return this._doms._closeBtn;
    };

    AbstractTabButton.prototype._refreshIcon = function() {
      var base, captionDom, dom;
      if (!this._dom) {
        return;
      }
      if (this._icon) {
        captionDom = this.getCaptionDom();
        if ((base = this._doms).icon == null) {
          base.icon = document.createElement("i");
        }
        dom = this._doms.icon;
        $(dom).addClass(this._icon + " icon");
        if (dom.parentNode !== captionDom) {
          captionDom.appendChild(dom);
        }
      } else {
        if (this._doms.iconDom) {
          $(this._doms.iconDom).remove();
        }
      }
    };

    AbstractTabButton.prototype._refreshCaption = function() {
      var base, captionDom, span;
      if (!this._dom) {
        return;
      }
      if (this._caption) {
        captionDom = this.getCaptionDom();
        if ((base = this._doms).span == null) {
          base.span = document.createElement("span");
        }
        span = this._doms.span;
        $(span).text(this._caption);
        if (span.parentNode !== captionDom) {
          captionDom.appendChild(span);
        }
      } else if (this._doms.span) {
        $(this._doms.span).remove();
      }
    };

    AbstractTabButton.prototype._parseDom = function(dom) {
      var child, parseCaption, tabItem;
      child = dom.firstChild;
      tabItem = this;
      if (this._doms == null) {
        this._doms = {};
      }
      parseCaption = (function(_this) {
        return function(node) {
          var childNode;
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              if (childNode.nodeName === "SPAN") {
                _this._doms.span = childNode;
                if (_this._caption == null) {
                  _this._caption = cola.util.getTextChildData(childNode);
                }
              }
              if (childNode.nodeName === "I") {
                _this._doms.icon = childNode;
                if (_this._icon == null) {
                  _this._icon = childNode.className;
                }
              }
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      while (child) {
        if (child.nodeType === 1) {
          if (!this._doms.caption && cola.util.hasClass(child, "caption")) {
            this._doms.caption = child;
            parseCaption(child);
          } else if (!this._doms.closeBtn && cola.util.hasClass(child, "close-btn")) {
            this._doms._closeBtn = child;
            $(child).on("click", function() {
              tabItem.close();
              return false;
            });
          }
        }
        child = child.nextSibling;
      }
    };

    AbstractTabButton.prototype._doRefreshDom = function() {
      var closeDom;
      if (!this._dom) {
        return;
      }
      AbstractTabButton.__super__._doRefreshDom.call(this);
      this._refreshIcon();
      this._refreshCaption();
      if (!!this._closeable) {
        closeDom = this.getCloseDom();
        if (closeDom.parentNode !== this._dom) {
          this._dom.appendChild(closeDom);
        }
      } else if (this._doms && this._doms.closeDom) {
        $(this._doms.closeDom).remove();
      }
    };

    AbstractTabButton.prototype._createCaptionDom = function() {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      dom = $.xCreate({
        tagName: "div",
        "class": "caption",
        contextKey: "caption",
        content: [
          {
            tagName: "i",
            contextKey: "icon",
            "class": "icon"
          }, {
            tagName: "span",
            contextKey: "span",
            content: this._caption || ""
          }
        ]
      }, this._doms);
      return this._dom.appendChild(dom);
    };

    AbstractTabButton.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      AbstractTabButton.__super__.destroy.call(this);
      delete this._doms;
      return this;
    };

    return AbstractTabButton;

  })(cola.Widget);

  cola.TabButton = (function(superClass) {
    extend(TabButton, superClass);

    function TabButton() {
      return TabButton.__super__.constructor.apply(this, arguments);
    }

    TabButton.ATTRIBUTES = {
      control: {
        setter: function(control) {
          var old, widget;
          old = this._control;
          if (old) {
            if (old.nodeType === 1) {
              $(old).remove();
            } else if (old instanceof cola.Widget) {
              old.destroy();
            }
          }
          if (control.nodeType === 1) {
            widget = cola.widget(control);
          }
          this._control = widget || control;
        }
      },
      contentContainer: null,
      parent: null
    };

    TabButton.EVENTS = {
      beforeClose: null,
      afterClose: null
    };

    TabButton.prototype.close = function() {
      var arg, ref;
      arg = {
        tab: this
      };
      this.fire("beforeClose", this, arg);
      if (arg.processDefault === false) {
        return this;
      }
      if ((ref = this._parent) != null) {
        ref.removeTab(this);
      }
      this.destroy();
      this.fire("afterClose", this, arg);
      return this;
    };

    TabButton.prototype.getControlDom = function() {
      var control, dom;
      control = this._control;
      if (control.nodeType !== 1) {
        if (control instanceof cola.Widget) {
          dom = control.getDom();
        } else if (control.constructor === Object.prototype.constructor) {
          if (control.$type) {
            control = this._control = cola.widget(control);
            dom = control.getDom();
          } else {
            dom = this._control = $.xCreate(control);
          }
        }
      }
      return dom || control;
    };

    TabButton.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      TabButton.__super__.destroy.call(this);
      delete this._control;
      delete this._contentContainer;
      delete this._parent;
      return this;
    };

    return TabButton;

  })(cola.tab.AbstractTabButton);

  cola.Tab = (function(superClass) {
    extend(Tab, superClass);

    function Tab() {
      return Tab.__super__.constructor.apply(this, arguments);
    }

    Tab.CLASS_NAME = "c-tab";

    Tab.TAG_NAME = "div";

    Tab.CHILDREN_TYPE_NAMESPACE = "tab";

    Tab.ATTRIBUTES = {
      direction: {
        refreshDom: true,
        "enum": ["left", "right", "top", "bottom"],
        defaultValue: "top",
        setter: function(value) {
          var oldValue;
          oldValue = this._direction;
          if (oldValue && oldValue !== value && this._dom) {
            this.get$Dom().removeClass(oldValue + "-bar");
          }
          this._direction = value;
          return this;
        }
      },
      tabs: {
        setter: function(list) {
          var i, len, tab;
          this.clear();
          for (i = 0, len = list.length; i < len; i++) {
            tab = list[i];
            this.addTab(tab);
          }
        }
      },
      currentTab: {
        getter: function() {
          var index, tab;
          index = this._currentTab;
          tab = this.getTab(index);
          this._currentTab = tab;
          return tab;
        },
        setter: function(index) {
          this.setCurrentIndex(index);
          return this;
        }
      }
    };

    Tab.EVENTS = {
      beforeChange: null,
      afterChange: null
    };

    Tab.prototype._tabContentRender = function(tab) {
      var container, contentsContainer, controlDom, tagName;
      contentsContainer = this.getContentsContainer();
      container = tab.get("contentContainer");
      if (container && container.parentNode === contentsContainer) {
        return;
      }
      tagName = contentsContainer.nodeName === "UL" ? "li" : "div";
      container = $.xCreate({
        tagName: tagName,
        "class": "item"
      });
      contentsContainer.appendChild(container);
      tab.set("contentContainer", container);
      controlDom = tab.getControlDom();
      if (controlDom) {
        return container.appendChild(controlDom);
      }
    };

    Tab.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Tab.__super__._doRefreshDom.call(this);
      this._classNamePool.remove("top-bar");
      this._classNamePool.add(this._direction + "-bar");
    };

    Tab.prototype.setCurrentTab = function(index) {
      var arg, container, newTab, oldTab;
      oldTab = this.get("currentTab");
      newTab = this.getTab(index);
      if (oldTab === newTab) {
        return true;
      }
      arg = {
        oldTab: oldTab,
        newTab: newTab
      };
      this.fire("beforeChange", this, arg);
      if (arg.processDefault === false) {
        return false;
      }
      if (oldTab) {
        oldTab.get$Dom().removeClass("active");
        $(oldTab.get("contentContainer")).removeClass("active");
      }
      newTab.get$Dom().addClass("active");
      container = newTab.get("contentContainer");
      if (!container) {
        this._tabContentRender(newTab);
        container = newTab.get("contentContainer");
      }
      $(container).addClass("active");
      this._currentTab = newTab;
      this.fire("afterChange", this, arg);
      return true;
    };

    Tab.prototype._setDom = function(dom, parseChild) {
      var activeExclusive, i, len, ref, tab;
      Tab.__super__._setDom.call(this, dom, parseChild);
      activeExclusive = (function(_this) {
        return function(targetDom) {
          var tab;
          tab = cola.widget(targetDom);
          if (tab && tab instanceof cola.TabButton) {
            _this.setCurrentTab(tab);
          }
        };
      })(this);
      $(dom).delegate("> .tab-bar > .tabs > .tab-button", "click", function(event) {
        return activeExclusive(this, event);
      });
      if (!this._tabs) {
        return this;
      }
      ref = this._tabs;
      for (i = 0, len = ref.length; i < len; i++) {
        tab = ref[i];
        this._tabRender(tab);
      }
      this.setCurrentTab(this._currentTab || 0);
      return this;
    };

    Tab.prototype._parseTabBarDom = function(dom) {
      var child, parseTabs;
      if (this._doms == null) {
        this._doms = {};
      }
      parseTabs = (function(_this) {
        return function(node) {
          var childNode, name, tab;
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              tab = cola.widget(childNode);
              name = $(childNode).attr("name");
              if (!tab && name) {
                tab = new cola.TabButton({
                  dom: childNode
                });
              }
              if (tab && name) {
                tab.set("name", name);
              }
              if (tab && tab instanceof cola.TabButton) {
                _this.addTab(tab);
              }
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1 && !this._doms.tabs && cola.util.hasClass(child, "tabs")) {
          this._doms.tabs = child;
          parseTabs(child);
        }
        child = child.nextSibling;
      }
    };

    Tab.prototype._parseDom = function(dom) {
      var _contents, child, control, i, item, len, name, parseContents, tab, tabs;
      child = dom.firstChild;
      if (this._doms == null) {
        this._doms = {};
      }
      _contents = {};
      parseContents = function(node) {
        var contentNode, name;
        contentNode = node.firstChild;
        while (contentNode) {
          if (contentNode.nodeType === 1) {
            name = $(contentNode).attr("name");
            _contents[name] = contentNode;
            $(contentNode).addClass("item");
          }
          contentNode = contentNode.nextSibling;
        }
      };
      while (child) {
        if (child.nodeType === 1) {
          if (!this._doms.contents && cola.util.hasClass(child, "contents")) {
            this._doms.contents = child;
            parseContents(child);
          } else if (!this._doms.tabs && cola.util.hasClass(child, "tab-bar")) {
            this._doms.tabBar = child;
            this._parseTabBarDom(child);
          }
        }
        child = child.nextSibling;
      }
      tabs = this._tabs || [];
      for (i = 0, len = tabs.length; i < len; i++) {
        tab = tabs[i];
        name = tab.get("name");
        if (name && _contents[name]) {
          item = _contents[name];
          control = item.children[0];
          tab.set("control", _contents[name]);
          tab.set("contentContainer", item);
        }
      }
    };

    Tab.prototype.getTabBarDom = function() {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms.tabBar) {
        dom = this._doms.tabBar = $.xCreate({
          tagName: "nav",
          "class": "tab-bar"
        });
        this._dom.appendChild(dom);
      }
      return this._doms.tabs;
    };

    Tab.prototype.getTabsContainer = function() {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms.tabs) {
        dom = this._doms.tabs = $.xCreate({
          tagName: "ul",
          "class": "tabs"
        });
        this.getTabBarDom().appendChild(dom);
      }
      return this._doms.tabs;
    };

    Tab.prototype.getContentsContainer = function() {
      var dom;
      if (!this._doms.contents) {
        dom = this._doms.contents = $.xCreate({
          tagName: "ul",
          "class": "contents"
        });
        this._dom.appendChild(dom);
      }
      return this._doms.contents;
    };

    Tab.prototype._tabRender = function(tab) {
      var container, dom;
      container = this.getTabsContainer();
      dom = tab.getDom();
      if (dom.parentNode !== container) {
        container.appendChild(dom);
      }
    };

    Tab.prototype.addTab = function(tab) {
      if (this._tabs == null) {
        this._tabs = [];
      }
      if (this._tabs.indexOf(tab) > -1) {
        return this;
      }
      this._tabs.push(tab);
      tab.set("parent", this);
      if (this._dom) {
        this._tabRender(tab);
      }
      return this;
    };

    Tab.prototype.getTab = function(index) {
      var i, len, tab, tabs;
      tabs = this._tabs || [];
      if (typeof index === "string") {
        for (i = 0, len = tabs.length; i < len; i++) {
          tab = tabs[i];
          if (tab.get("name") === index) {
            return tab;
          }
        }
      } else if (typeof index === "number") {
        return tabs[index];
      } else if (index instanceof cola.TabButton) {
        return index;
      }
      return null;
    };

    Tab.prototype.removeTab = function(tab) {
      var contentContainer, index, newIndex, obj;
      index = -1;
      if (typeof tab === "number") {
        index = tab;
        obj = this._tabs[index];
      } else if (tab instanceof cola.TabButton) {
        index = this._tabs.indexOf(tab);
        obj = tab;
      } else if (typeof tab === "string") {
        obj = this.getTab(tab);
        index = this._tabs.indexOf(obj);
      }
      if (index > -1 && obj) {
        if (this.get("currentTab") === obj) {
          newIndex = index === (this._tabs.length - 1) ? index - 1 : index + 1;
          if (!this.setCurrentTab(newIndex)) {
            return false;
          }
        }
        this._tabs.splice(index, 1);
        obj.remove();
        contentContainer = obj.get("contentContainer");
        if ((contentContainer != null ? contentContainer.parentNode : void 0) === this._doms.tabs) {
          $(contentContainer).remove();
        }
      }
      return true;
    };

    Tab.prototype.clear = function() {
      var i, len, tab, tabs;
      tabs = this._tabs || [];
      if (tabs.length < 1) {
        return this;
      }
      for (i = 0, len = tabs.length; i < len; i++) {
        tab = tabs[i];
        tab.destroy();
      }
      return this._tabs = [];
    };

    return Tab;

  })(cola.Widget);

}).call(this);
