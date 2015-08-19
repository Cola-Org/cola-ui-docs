(function() {
  var BLANK_PATH, containerEmptyChildren, currentDate, currentHours, currentMinutes, currentMonth, currentSeconds, currentYear, dateTimeSlotConfigs, dateTypeConfig, now, slotAttributeGetter, slotAttributeSetter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  containerEmptyChildren = [];

  cola.AbstractContainer = (function(superClass) {
    extend(AbstractContainer, superClass);

    function AbstractContainer() {
      return AbstractContainer.__super__.constructor.apply(this, arguments);
    }

    AbstractContainer.ATTRIBUTES = {
      content: {
        setter: function(value) {
          this._setContent(value, "content");
          return this;
        }
      }
    };

    AbstractContainer.prototype._initDom = function(dom) {
      var el, k, len, ref;
      if (this._content) {
        ref = this._content;
        for (k = 0, len = ref.length; k < len; k++) {
          el = ref[k];
          this._render(el, "content");
        }
      }
    };

    AbstractContainer.prototype._parseDom = function(dom) {
      var child, widget;
      if (this._content == null) {
        this._content = [];
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget) {
            this._content.push(widget);
          }
        }
        child = child.nextSibling;
      }
    };

    AbstractContainer.prototype.getContentContainer = function() {
      return this.getDom();
    };

    AbstractContainer.prototype._clearContent = function(target) {
      var el, k, len, old;
      old = this["_" + target];
      if (old) {
        for (k = 0, len = old.length; k < len; k++) {
          el = old[k];
          if (el instanceof cola.widget) {
            el.destroy();
          }
        }
        this["_" + target] = [];
      }
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._doms[target]) {
        $(this._doms[target]).empty();
      }
    };

    AbstractContainer.prototype._setContent = function(value, target) {
      var el, k, len, result;
      this._clearContent(target);
      if (value instanceof Array) {
        for (k = 0, len = value.length; k < len; k++) {
          el = value[k];
          result = cola.xRender(el, this._scope);
          if (result) {
            this._addContentElement(result, target);
          }
        }
      } else {
        result = cola.xRender(value, this._scope);
        if (result) {
          this._addContentElement(result, target);
        }
      }
    };

    AbstractContainer.prototype._makeContentDom = function(target) {
      if (this._doms == null) {
        this._doms = {};
      }
      this._doms[target] = this._dom;
      return this._dom;
    };

    AbstractContainer.prototype._addContentElement = function(element, target) {
      var dom, name, targetList;
      name = "_" + target;
      if (this[name] == null) {
        this[name] = [];
      }
      targetList = this[name];
      dom = null;
      if (element instanceof cola.Widget) {
        targetList.push(element);
        if (this._dom) {
          dom = element.getDom();
        }
      } else if (element.nodeType === 1) {
        targetList.push(element);
        dom = element;
      }
      if (dom && this._dom) {
        this._render(dom, target);
      }
    };

    AbstractContainer.prototype._render = function(node, target) {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms[target]) {
        this._makeContentDom(target);
      }
      dom = node;
      if (node instanceof cola.Widget) {
        dom = node.getDom();
      }
      if (dom.parentNode !== this._doms[target]) {
        this._doms[target].appendChild(dom);
      }
    };

    AbstractContainer.prototype.destroy = function() {
      var child, k, len, ref;
      if (this._destroyed) {
        return;
      }
      if (this._content) {
        ref = this._content;
        for (k = 0, len = ref.length; k < len; k++) {
          child = ref[k];
          if (typeof child.destroy === "function") {
            child.destroy();
          }
        }
        delete this._content;
      }
      AbstractContainer.__super__.destroy.call(this);
      return this;
    };

    return AbstractContainer;

  })(cola.Widget);

  cola.Link = (function(superClass) {
    extend(Link, superClass);

    function Link() {
      return Link.__super__.constructor.apply(this, arguments);
    }

    Link.TAG_NAME = "a";

    Link.ATTRIBUTES = {
      href: {
        refreshDom: true
      },
      target: {
        refreshDom: true
      }
    };

    Link.prototype._setDom = function(dom, parseChild) {
      var href, target;
      if (parseChild) {
        if (!this._href) {
          href = dom.getAttribute("href");
          if (href) {
            this._href = href;
          }
        }
        if (!this._target) {
          target = dom.getAttribute("target");
          if (target) {
            this._target = target;
          }
        }
      }
      return Link.__super__._setDom.call(this, dom, parseChild);
    };

    Link.prototype._doRefreshDom = function() {
      var $dom;
      if (!this._dom) {
        return;
      }
      Link.__super__._doRefreshDom.call(this);
      $dom = this.get$Dom();
      if (this._href) {
        $dom.attr("href", this._href);
      } else {
        $dom.removeAttr("href");
      }
      return $dom.attr("target", this._target || "");
    };

    return Link;

  })(cola.AbstractContainer);


  /*
      按钮的抽象类
   */

  cola.AbstractButton = (function(superClass) {
    extend(AbstractButton, superClass);

    function AbstractButton() {
      return AbstractButton.__super__.constructor.apply(this, arguments);
    }

    AbstractButton.ATTRIBUTES = {
      size: {
        "enum": ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"],
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._size;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue);
          }
          this._size = value;
        }
      },
      color: {
        refreshDom: true,
        "enum": ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey", "black"],
        setter: function(value) {
          var oldValue;
          oldValue = this._color;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue);
          }
          this._color = value;
        }
      },
      attached: {
        refreshDom: true,
        defaultValue: "",
        "enum": ["left", "right", "top", "bottom", ""],
        setter: function(value) {
          var oldValue;
          oldValue = this._attached;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue + " attached", true);
          }
          this._attached = value;
        }
      }
    };

    AbstractButton.prototype._doRefreshDom = function() {
      var attached, color, size;
      if (!this._dom) {
        return;
      }
      AbstractButton.__super__._doRefreshDom.call(this);
      size = this.get("size");
      if (size) {
        this._classNamePool.add(size);
      }
      color = this.get("color");
      if (color) {
        this._classNamePool.add(color);
      }
      attached = this.get("attached");
      if (attached) {
        this._classNamePool.add(attached + " attached");
      }
    };

    return AbstractButton;

  })(cola.Widget);

  cola.Button = (function(superClass) {
    extend(Button, superClass);

    function Button() {
      return Button.__super__.constructor.apply(this, arguments);
    }

    Button.SEMANTIC_CLASS = ["left floated", "right floated", "top attached", "bottom attached", "left attached", "right attached"];

    Button.CLASS_NAME = "button";

    Button.ATTRIBUTES = {
      caption: {
        refreshDom: true
      },
      icon: {
        refreshDom: true,
        setter: function(value) {
          var oldValue, ref;
          oldValue = this._icon;
          this._icon = value;
          if (oldValue && oldValue !== value && this._dom && ((ref = this._doms) != null ? ref.iconDom : void 0)) {
            $fly(this._doms.iconDom).removeClass(oldValue);
          }
        }
      },
      iconPosition: {
        refreshDom: true,
        defaultValue: "left",
        "enum": ["left", "right"]
      },
      focusable: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      disabled: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      states: {
        refreshDom: true,
        defaultValue: "",
        "enum": ["loading", "active", ""],
        setter: function(value) {
          var oldValue;
          oldValue = this._states;
          if (oldValue && oldValue !== value && this._dom) {
            $fly(this._dom).removeClass(oldValue);
          }
          this._states = value;
        }
      }
    };

    Button.prototype._parseDom = function(dom) {
      var child, text;
      if (!this._caption) {
        child = dom.firstChild;
        while (child) {
          if (child.nodeType === 3) {
            text = child.textContent;
            if (text) {
              this._caption = text;
              child.textContent = "";
              break;
            }
          }
          child = child.nextSibling;
        }
      }
    };

    Button.prototype._refreshIcon = function() {
      var $dom, base, caption, icon, iconDom, iconPosition;
      if (!this._dom) {
        return;
      }
      $dom = this.get$Dom();
      this._classNamePool.remove("right labeled");
      this._classNamePool.remove("left labeled");
      this._classNamePool.remove("labeled");
      this._classNamePool.remove("icon");
      icon = this.get("icon");
      iconPosition = this.get("iconPosition");
      caption = this.get("caption");
      if (icon) {
        if (caption) {
          if (iconPosition === "right") {
            this._classNamePool.add("right labeled");
          } else {
            this._classNamePool.add("labeled");
          }
        }
        this._classNamePool.add("icon");
        if ((base = this._doms).iconDom == null) {
          base.iconDom = document.createElement("i");
        }
        iconDom = this._doms.iconDom;
        $fly(iconDom).addClass(icon + " icon");
        if (iconDom.parentNode !== this._dom) {
          $dom.append(iconDom);
        }
      } else if (this._doms.iconDom) {
        $fly(this._doms.iconDom).remove();
      }
    };

    Button.prototype._doRefreshDom = function() {
      var $dom, caption, captionDom, classNamePool, states;
      if (!this._dom) {
        return;
      }
      Button.__super__._doRefreshDom.call(this);
      $dom = this.get$Dom();
      classNamePool = this._classNamePool;
      caption = this._caption;
      captionDom = this._doms.captionDom;
      if (caption) {
        if (!captionDom) {
          captionDom = document.createElement("span");
          this._doms.captionDom = captionDom;
        }
        $fly(captionDom).text(caption);
        if (captionDom.parentNode !== this._dom) {
          $dom.append(captionDom);
        }
      } else {
        if (captionDom) {
          $fly(captionDom).remove();
        }
      }
      if (this.get("focusable")) {
        $dom.attr("tabindex", "0");
      } else {
        $dom.removeAttr("tabindex");
      }
      this._refreshIcon();
      states = this._states;
      if (states) {
        classNamePool.add(states);
      }
      classNamePool.toggle("disabled", this._disabled);
    };

    return Button;

  })(cola.AbstractButton);

  cola.buttonGroup = {};

  cola.buttonGroup.Separator = (function(superClass) {
    extend(Separator, superClass);

    function Separator() {
      return Separator.__super__.constructor.apply(this, arguments);
    }

    Separator.SEMANTIC_CLASS = [];

    Separator.CLASS_NAME = "or";

    Separator.ATTRIBUTES = {
      text: {
        defaultValue: "or",
        refreshDom: true
      }
    };

    Separator.prototype._parseDom = function(dom) {
      var text;
      if (!dom) {
        return;
      }
      if (!this._text) {
        text = this._dom.getAttribute("data-text");
        if (text) {
          this._text = text;
        }
      }
    };

    Separator.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Separator.__super__._doRefreshDom.call(this);
      if (this._dom) {
        this.get$Dom().attr("data-text", this._text);
      }
      return this;
    };

    return Separator;

  })(cola.Widget);

  cola.buttonGroup.emptyItems = [];

  cola.ButtonGroup = (function(superClass) {
    extend(ButtonGroup, superClass);

    function ButtonGroup() {
      return ButtonGroup.__super__.constructor.apply(this, arguments);
    }

    ButtonGroup.SEMANTIC_CLASS = ["left floated", "right floated", "top attached", "bottom attached", "left attached", "right attached"];

    ButtonGroup.CHILDREN_TYPE_NAMESPACE = "button-group";

    ButtonGroup.CLASS_NAME = "buttons";

    ButtonGroup.ATTRIBUTES = {
      fluid: {
        type: "boolean",
        refreshDom: true,
        attrName: "c-fuild",
        defaultValue: false
      },
      mutuallyExclusive: {
        type: "boolean",
        refreshDom: true,
        defaultValue: true
      },
      items: {
        setter: function(value) {
          var item, k, len;
          this.clear();
          if (value instanceof Array) {
            for (k = 0, len = value.length; k < len; k++) {
              item = value[k];
              this.addItem(item);
            }
          }
        }
      }
    };

    ButtonGroup.prototype._setDom = function(dom, parseChild) {
      var activeExclusive, item, itemDom, k, len, ref, ref1;
      ButtonGroup.__super__._setDom.call(this, dom, parseChild);
      if ((ref = this._items) != null ? ref.length : void 0) {
        ref1 = this._items;
        for (k = 0, len = ref1.length; k < len; k++) {
          item = ref1[k];
          itemDom = item.getDom();
          if (itemDom.parentNode !== dom) {
            item.appendTo(this._dom);
          }
        }
      }
      activeExclusive = (function(_this) {
        return function(targetDom) {
          var targetBtn;
          if (!_this._mutuallyExclusive) {
            return;
          }
          if (cola.util.hasClass(targetDom, "disabled") || cola.util.hasClass(targetDom, "loading") || cola.util.hasClass(targetDom, "active")) {
            return;
          }
          $(">.ui.button.active", _this._dom).each(function(index, itemDom) {
            var button;
            if (itemDom !== targetDom) {
              button = cola.widget(itemDom);
              if (button) {
                button.set("states", "");
              } else {
                $(itemDom).removeClass("active");
              }
            }
          });
          targetBtn = cola.widget(targetDom);
          if (targetBtn) {
            targetBtn.set("states", "active");
          } else {
            $fly(targetDom).addClass("active");
          }
        };
      })(this);
      return this.get$Dom().delegate(">.ui.button", "click", function(event) {
        return activeExclusive(this, event);
      });
    };

    ButtonGroup.prototype._parseDom = function(dom) {
      var child, widget;
      if (!dom) {
        return;
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget) {
            if (widget instanceof cola.Button || widget instanceof cola.buttonGroup.Separator) {
              this.addItem(widget);
            }
          }
        }
        child = child.nextSibling;
      }
    };

    ButtonGroup.prototype._resetFluid = function() {
      var $dom, attrName, fluid, item, items, k, len, newFluid, oldFluid;
      if (!this._dom) {
        return;
      }
      $dom = this.get$Dom();
      attrName = this.constructor.ATTRIBUTES.fluid.attrName;
      oldFluid = $dom.attr(attrName);
      newFluid = 0;
      items = this._items || [];
      for (k = 0, len = items.length; k < len; k++) {
        item = items[k];
        if (item instanceof cola.Button) {
          newFluid++;
        }
      }
      if (newFluid !== oldFluid) {
        if (oldFluid) {
          this._classNamePool.remove("" + oldFluid);
        }
      }
      fluid = this.get("fluid");
      if (!!fluid) {
        this._classNamePool.add("" + newFluid);
        this._classNamePool.add("fluid");
        $dom.attr(attrName, newFluid);
      }
    };

    ButtonGroup.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      ButtonGroup.__super__._doRefreshDom.call(this);
      this._resetFluid();
    };

    ButtonGroup.prototype.addItem = function(item) {
      var itemDom, itemObj;
      if (this._destroyed) {
        return this;
      }
      if (this._items == null) {
        this._items = [];
      }
      itemObj = null;
      if (item instanceof cola.Widget) {
        itemObj = item;
      } else if (item.$type) {
        if (item.$type === "Separator" || item.$type === "-") {
          delete item["$type"];
          itemObj = new cola.buttonGroup.Separator(item);
        } else {
          itemObj = cola.widget(item);
        }
      } else if (typeof item === "string") {
        itemObj = new cola.buttonGroup.Separator({
          text: item
        });
      }
      if (itemObj) {
        this._items.push(itemObj);
        if (this._dom) {
          itemDom = itemObj.getDom();
          if (itemDom.parentNode !== this._dom) {
            this.get$Dom().append(itemDom);
            cola.util.delay(this, "refreshDom", 50, this._refreshDom);
          }
        }
      }
      return this;
    };

    ButtonGroup.prototype.add = function() {
      var arg, k, len;
      for (k = 0, len = arguments.length; k < len; k++) {
        arg = arguments[k];
        this.addItem(arg);
      }
      return this;
    };

    ButtonGroup.prototype.removeItem = function(item) {
      var index;
      if (!this._items) {
        return this;
      }
      index = this._items.indexOf(item);
      if (index > -1) {
        this._items.splice(index, 1);
        item.remove();
        cola.util.delay(this, "refreshDom", 50, this._refreshDom);
      }
      return this;
    };

    ButtonGroup.prototype.destroy = function() {
      var item, k, len, ref;
      if (this._destroyed) {
        return;
      }
      if (this._items) {
        ref = this._items;
        for (k = 0, len = ref.length; k < len; k++) {
          item = ref[k];
          item.destroy();
        }
        delete this._items;
      }
      ButtonGroup.__super__.destroy.call(this);
    };

    ButtonGroup.prototype.clear = function() {
      var item, k, len, ref, ref1;
      if ((ref = this._items) != null ? ref.length : void 0) {
        ref1 = this._items;
        for (k = 0, len = ref1.length; k < len; k++) {
          item = ref1[k];
          item.destroy();
        }
        this._items = [];
        cola.util.delay(this, "refreshDom", 50, this._refreshDom);
      }
    };

    ButtonGroup.prototype.getItem = function(index) {
      var ref;
      return (ref = this._items) != null ? ref[index] : void 0;
    };

    ButtonGroup.prototype.getItems = function() {
      return this._items || cola.buttonGroup.emptyItems;
    };

    return ButtonGroup;

  })(cola.AbstractButton);

  cola.registerType("button-group", "_default", cola.Button);

  cola.registerType("button-group", "Separator", cola.buttonGroup.Separator);

  cola.registerTypeResolver("button-group", function(config) {
    return cola.resolveType("widget", config);
  });

  if (cola.slotPicker == null) {
    cola.slotPicker = {};
  }

  cola.slotPicker.ZyngaScroller = (function(superClass) {
    extend(ZyngaScroller, superClass);

    ZyngaScroller.EVENTS = {
      scrolled: null
    };

    function ZyngaScroller(container, options) {
      var self;
      self = this;
      if (options == null) {
        options = {};
      }
      this.options = options;
      this.container = container;
      if ($fly(container).css("position") === "static") {
        $fly(container).css("position", "relative");
      }
      self.container.style.overflowX = "hidden";
      self.container.style.overflowY = "hidden";
      self.content = $fly(container).children(":first")[0];
      self.render = options.render;
      options.scrollingX = false;
      options.scrollingY = true;
      options.scrollingComplete = function() {
        return cola.util.delay(self, "scrolled", 50, self._scrolled);
      };
      self.scroller = new Scroller(function(left, top, zoom) {
        self.render(left, top, zoom);
        cola.util.delay(self, "scrolled", 50, self._scrolled);
        self._scrolling(left, top, zoom);
      }, options);
      this._bindEvents();
    }

    ZyngaScroller.prototype.scrollSize = function(dir, container, content) {
      var result, translate;
      translate = cola.Fx.getElementTranslate(content);
      cola.Fx.cancelTranslateElement(content);
      if (dir === "h") {
        result = Math.max(container.scrollWidth, content.clientWidth);
      } else {
        result = Math.max(container.scrollHeight, content.clientHeight);
      }
      cola.Fx.translateElement(content, translate.left, translate.top);
      return result;
    };

    ZyngaScroller.prototype.update = function() {
      var content, scrollHeight, scrollLeft, scrollTop, scrollWidth, viewHeight, viewWidth;
      if (!this._contentInited) {
        content = this.content = this.container.children[0];
        this._contentInited = !!this.content;
      }
      if (!this.content) {
        return;
      }
      viewWidth = this.container.clientWidth;
      viewHeight = this.container.clientHeight;
      scrollWidth = this.scrollSize("h", this.container, this.content);
      scrollHeight = this.scrollSize("v", this.container, this.content);
      this.scroller.options.scrollingX = false;
      this.scroller.options.scrollingY = true;
      this.scrollHeight = scrollHeight;
      this.scroller.setDimensions(viewWidth, viewHeight, scrollWidth, scrollHeight);
      if (this.snapHeight || this.snapWidth) {
        this.scroller.setSnapSize(this.snapWidth || 100, this.snapHeight || 100);
      }
      scrollTop = this.defaultScrollTop;
      scrollLeft = this.defaultScrollLeft;
      if (scrollTop !== void 0 || scrollLeft !== void 0) {
        this.scroller.scrollTo(scrollLeft, scrollTop, false);
        this.defaultScrollTop = void 0;
        this.defaultScrollLeft = void 0;
      }
      return this;
    };

    ZyngaScroller.prototype._scrolled = function() {
      var oldValue, top, value;
      value = this.getValues();
      oldValue = this._scrollTop;
      if (oldValue === value.top) {
        return;
      }
      top = Math.round(value.top / 60) * 60;
      this._scrollTop = top;
      this.scrollTo(value.left, top, true);
      this.fire("scrolled", this, {
        left: value,
        top: top
      });
    };

    ZyngaScroller.prototype._scrolling = function() {};

    ZyngaScroller.prototype._bindEvents = function() {
      var handleEnd, handleMouseWheel, handleMove, handleStart, self;
      self = this;
      handleStart = this._handleStart = function() {
        var event;
        event = window.event;
        if (event.target.tagName.match(/input|select/i)) {
          event.stopPropagation();
          return;
        }
        if (cola.os.mobile) {
          self.scroller.doTouchStart(event.touches, event.timeStamp);
        } else {
          self.scroller.doTouchStart([
            {
              pageX: event.pageX,
              pageY: event.pageY
            }
          ], event.timeStamp);
        }
        self._touchStart = true;
        event.preventDefault();
      };
      handleMove = this._handleMove = function() {
        var event;
        event = window.event;
        if (!self._touchStart) {
          return;
        }
        if (cola.os.mobile) {
          self.scroller.doTouchMove(event.touches, event.timeStamp);
        } else {
          self.scroller.doTouchMove([
            {
              pageX: event.pageX,
              pageY: event.pageY
            }
          ], event.timeStamp);
        }
      };
      handleEnd = this._handleEnd = function() {
        var event;
        if (!self._touchStart) {
          return;
        }
        event = window.event;
        self.scroller.doTouchEnd(event.timeStamp);
        self._touchStart = false;
      };
      handleMouseWheel = this._handleMouseWheel = function(event) {
        self.scroller.scrollBy(0, event.wheelDelta, true);
      };
      self.container.addEventListener("mousewheel", handleMouseWheel);
      if (cola.os.mobile) {
        $(self.container).on("touchstart", handleStart).on("touchmove", handleMove).on("touchend", handleEnd);
      } else {
        $(self.container).on("mousedown", handleStart).on("mousemove", handleMove).on("mouseup", handleEnd);
      }
      return this;
    };

    ZyngaScroller.prototype.scrollTo = function(left, top, animate) {
      this.scroller.scrollTo(left, top, animate);
    };

    ZyngaScroller.prototype.scrollBy = function(left, top) {
      this.scroller.scrollBy(left, top, animate);
    };

    ZyngaScroller.prototype.getValues = function() {
      return this.scroller.getValues();
    };

    ZyngaScroller.prototype.destroy = function() {
      cola.util.cancelDelay(this, "scrolled");
      if (cola.os.mobile) {
        $(this.container).off("touchstart", this._handleStart).off("touchmove", this._handleMove).off("touchend", this._handleEnd);
      } else {
        $(this.container).off("mousedown", this._handleStart).off("mousemove", this._handleMove).off("mouseup", this._handleEnd);
      }
      delete this.container;
      delete this.content;
    };

    return ZyngaScroller;

  })(cola.Element);

  cola.AbstractSlotList = (function(superClass) {
    extend(AbstractSlotList, superClass);

    function AbstractSlotList() {
      return AbstractSlotList.__super__.constructor.apply(this, arguments);
    }

    AbstractSlotList.prototype._resetDimension = function() {};

    AbstractSlotList.prototype._setDom = function(dom) {};

    AbstractSlotList.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      AbstractSlotList.__super__._doRefreshDom.call(this);
      this._resetDimension();
    };

    AbstractSlotList.prototype.getDom = function() {
      var arg, dom;
      if (this._destroyed) {
        return null;
      }
      if (!this._dom) {
        dom = this._dom = this._createDom();
        this._setDom(dom);
        arg = {
          dom: dom,
          returnValue: null
        };
        this.fire("createDom", this, arg);
      }
      return this._dom;
    };

    AbstractSlotList.prototype.get$Dom = function() {
      if (this._destroyed) {
        return null;
      }
      if (this._$dom == null) {
        this._$dom = $(this.getDom());
      }
      return this._$dom;
    };

    AbstractSlotList.prototype.refresh = function() {
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

    AbstractSlotList.prototype.appendTo = function(dom) {
      if (dom && this.getDom()) {
        $(dom).append(this._dom);
      }
      return this;
    };

    AbstractSlotList.prototype.remove = function() {
      if (this._dom) {
        this.get$Dom().remove();
      }
      return this;
    };

    return AbstractSlotList;

  })(cola.RenderableElement);

  cola.SlotList = (function(superClass) {
    extend(SlotList, superClass);

    function SlotList() {
      return SlotList.__super__.constructor.apply(this, arguments);
    }

    SlotList.CLASS_NAME = "list";

    SlotList.ATTRIBUTES = {
      viewItemCount: {
        type: "number",
        refreshDom: true,
        defalutValue: 3
      },
      items: {
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._items;
          this._oldItems = oldValue || [];
          this._items = value;
          if (this._dom) {
            return this._itemChanged = true;
          }
        }
      },
      value: {
        getter: function() {
          var currentIndex, items;
          items = this.doGetItems();
          currentIndex = this._currentIndex || 0;
          if (items && currentIndex !== void 0) {
            return items[currentIndex];
          }
          return void 0;
        },
        setter: function(value) {
          var items, newIndex, oldIndex;
          items = this.doGetItems();
          oldIndex = this._currentIndex;
          newIndex = items.indexOf(value);
          if (newIndex === oldIndex) {
            return;
          }
          this._currentIndex = items.indexOf(value);
          if (this._dom) {
            return this.syncScroll();
          }
        }
      },
      defaultValue: null,
      currentIndex: {
        type: "number",
        refreshDom: true,
        defaultValue: 0
      },
      formatter: null
    };

    SlotList.EVENTS = {
      onValueChange: null
    };

    SlotList.prototype.doTouchStart = function(touches, timeStamp) {
      var ref;
      cola.slotPicker._activePicker = this;
      if ((ref = this._scroller) != null) {
        ref.doTouchMove(touches, timeStamp);
      }
    };

    SlotList.prototype.doTouchMove = function(touches, timeStamp) {
      var ref;
      if ((ref = this._scroller) != null) {
        ref.doTouchMove(touches, timeStamp);
      }
    };

    SlotList.prototype.doTouchEnd = function(timeStamp) {
      var ref;
      if ((ref = this._scroller) != null) {
        ref.doTouchEnd(timeStamp);
      }
      cola.slotPicker._activePicker = null;
    };

    SlotList.prototype.syncScroll = function() {
      var doms, item, value;
      if (!this._zyngaScroller) {
        return;
      }
      doms = this._doms;
      value = this.get("value");
      if (value !== void 0) {
        item = $fly(doms.body).find(" > .slot-item")[this._currentIndex];
        if (item) {
          this._disableScrollEvent = true;
          this._zyngaScroller.scrollTo(0, item.offsetTop - 60, false);
          return this._disableScrollEvent = false;
        }
      }
    };

    SlotList.prototype._createDom = function() {
      var dom, doms, dummyItemCount, formatter, i, itemDom, items, list, viewItemCount;
      list = this;
      if (this._doms == null) {
        this._doms = {};
      }
      doms = this._doms;
      dom = $.xCreate({
        "class": this.constructor.CLASS_NAME,
        content: [
          {
            "class": "items-wrap",
            contextKey: "body"
          }
        ]
      }, this._doms);
      viewItemCount = this._viewItemCount || 3;
      dummyItemCount = Math.floor(viewItemCount / 2);
      i = 0;
      while (i < dummyItemCount) {
        itemDom = document.createElement("div");
        itemDom.className = "dummy-item";
        doms.body.appendChild(itemDom);
        i++;
      }
      items = list.doGetItems();
      formatter = this._formatter || function(index, value) {
        return value;
      };
      i = 0;
      while (i < items.length) {
        itemDom = document.createElement("div");
        itemDom.className = "slot-item";
        itemDom.innerHTML = formatter(i, items[i]);
        doms.body.appendChild(itemDom);
        i++;
      }
      i = 0;
      while (i < dummyItemCount) {
        itemDom = document.createElement("div");
        itemDom.className = "dummy-item";
        doms.body.appendChild(itemDom);
        i++;
      }
      return dom;
    };

    SlotList.prototype._setDom = function(dom) {
      var defaultValue, index, item, items, list, position, scrollTop;
      list = this;
      items = this.doGetItems();
      defaultValue = this._defaultValue;
      scrollTop = 0;
      if (defaultValue !== void 0) {
        index = this._currentIndex = items.indexOf(defaultValue);
        item = $fly(this._doms.body).find(" > *")[index];
        position = $fly(item).position();
        scrollTop = position.top;
      }
      list._zyngaScroller = new cola.slotPicker.ZyngaScroller(dom, {
        render: cola.util.getScrollerRender(this._doms.body)
      });
      list._zyngaScroller.on("scrolled", function(self, arg) {
        var itemIndex, value;
        itemIndex = Math.round(arg.top / 60);
        position = itemIndex * 60;
        if (position === arg.top) {
          list._currentIndex = Math.abs(itemIndex);
          value = list.get("value");
          return list.fire("onValueChange", list, {
            currentIndex: Math.abs(itemIndex),
            value: value
          });
        }
      });
    };

    SlotList.prototype._updateScroller = function() {
      var dom, doms, rect;
      if (this._scroller) {
        rect = this._dom.getBoundingClientRect();
        dom = this._dom;
        doms = this._doms;
        this._scroller.setPosition(rect.left + dom.clientLeft, rect.top + dom.clientTop);
        return this._scroller.setDimensions(dom.clientWidth, dom.clientHeight, doms.body.offsetWidth, doms.body.offsetHeight);
      }
    };

    SlotList.prototype._refreshItemDoms = function() {
      var doms, dummyItemCount, finalLength, formatter, i, insertSize, itemDom, items, nodeLength, refDom, removeSize, viewItemCount;
      items = this.doGetItems();
      doms = this._doms;
      viewItemCount = this._viewItemCount || 3;
      dummyItemCount = Math.floor(viewItemCount / 2);
      formatter = this._formatter || function(index, value) {
        return value;
      };
      nodeLength = doms.body.children.length;
      finalLength = items.length + dummyItemCount * 2;
      if (finalLength > nodeLength) {
        refDom = doms.body.children[nodeLength - dummyItemCount];
        insertSize = finalLength - nodeLength;
        i = 0;
        while (i < insertSize) {
          itemDom = document.createElement("div");
          itemDom.className = "slot-item";
          doms.body.insertBefore(itemDom, refDom);
          i++;
        }
      } else if (finalLength < nodeLength) {
        removeSize = nodeLength - finalLength;
        i = 0;
        while (i < removeSize) {
          $fly(doms.body.children[finalLength - dummyItemCount]).remove();
          i++;
        }
      }
      i = 0;
      while (i < items.length) {
        itemDom = doms.body.children[i + 1];
        itemDom.className = "slot-item";
        itemDom.innerHTML = formatter(i, items[i]);
        i++;
      }
      return this._itemChanged = false;
    };

    SlotList.prototype._doRefreshDom = function() {
      var list;
      if (!this._dom) {
        return;
      }
      list = this;
      this._refreshItemDoms();
      if (list._zyngaScroller) {
        list._zyngaScroller.update();
        return list.syncScroll();
      }
    };

    SlotList.prototype.doGetItems = function() {
      return this._items || [];
    };

    return SlotList;

  })(cola.AbstractSlotList);

  cola.RangeSlotList = (function(superClass) {
    extend(RangeSlotList, superClass);

    function RangeSlotList() {
      return RangeSlotList.__super__.constructor.apply(this, arguments);
    }

    RangeSlotList.ATTRIBUTES = {
      range: {
        refreshDom: true,
        setter: function(value) {
          this._oldItems = this.doGetItems();
          this._range = value;
          if (this._dom) {
            this._itemChanged = true;
          }
          return this;
        }
      },
      step: {
        defaultValue: 1
      }
    };

    RangeSlotList.prototype.doGetItems = function() {
      var i, itemCount, items, range, start, step;
      range = this._range;
      items = [];
      if (range && range.length === 2) {
        start = range[0];
        step = this._step;
        itemCount = (range[1] - start) / step + 1;
        i = 0;
        while (i < itemCount) {
          items.push(start + i * step);
          i++;
        }
      }
      return items;
    };

    return RangeSlotList;

  })(cola.SlotList);

  cola.MultiSlotPicker = (function(superClass) {
    extend(MultiSlotPicker, superClass);

    MultiSlotPicker.CLASS_NAME = "multi-slot-picker";

    MultiSlotPicker.slotConfigs = [];

    MultiSlotPicker.ATTRIBUTES = {
      height: null
    };

    MultiSlotPicker.prototype._createDom = function() {
      var dom, domContext, doms, i, itemDom, items, j, list, picker, slotConfig, slotConfigs, slotDom, slotLists, slotName;
      picker = this;
      doms = {};
      dom = $.xCreate({
        "class": this.constructor.CLASS_NAME,
        content: [
          {
            "class": "body",
            contextKey: "body"
          }
        ]
      }, doms);
      picker._doms = doms;
      picker._slotListMap = {};
      slotConfigs = picker.slotConfigs;
      items = [];
      slotLists = [];
      i = 0;
      j = slotConfigs.length;
      while (i < j) {
        slotConfig = slotConfigs[i];
        slotName = slotConfig.name;
        domContext = {};
        itemDom = $.xCreate({
          "class": "slot-picker",
          style: {
            webkitBoxFlex: 1
          },
          content: [
            {
              content: slotConfig.unit || "",
              "class": "unit"
            }, {
              "class": "slot",
              contextKey: "slot",
              content: [
                {
                  "class": "mask",
                  content: {
                    "class": "bar"
                  }
                }
              ]
            }
          ]
        }, domContext);
        slotDom = domContext.slot;
        if (slotConfig.$type === "Range") {
          list = new cola.RangeSlotList({
            range: slotConfig.range,
            formatter: slotConfig.formatter,
            defaultValue: slotConfig.defaultValue,
            onValueChange: function(self, arg) {
              var value;
              value = arg.value;
              return picker.setSlotValue(self._slotIndex, value);
            }
          });
        } else {
          list = new cola.SlotList({
            items: slotConfig.items,
            formatter: slotConfig.formatter,
            defaultValue: slotConfig.defaultValue,
            onValueChange: function(self, arg) {
              var value;
              value = arg.value;
              return picker.setSlotValue(self._slotIndex, value);
            }
          });
        }
        list._slotIndex = i;
        picker._slotListMap[slotName] = list;
        list.appendTo(slotDom);
        doms.body.appendChild(itemDom);
        slotLists.push(list);
        items.push(slotDom);
        i++;
      }
      picker._slotLists = slotLists;
      picker._items = items;
      return dom;
    };

    function MultiSlotPicker(config) {
      if (this.slotConfigs) {
        this.initSlotConfigs();
      }
      MultiSlotPicker.__super__.constructor.call(this, config);
    }

    MultiSlotPicker.prototype.initSlotConfigs = function() {
      var config, i, j, name, slotConfigs, slotMap, values;
      slotConfigs = this.slotConfigs;
      slotMap = this._slotMap = {};
      values = this._values = [];
      i = 0;
      j = slotConfigs.length;
      while (i < j) {
        config = slotConfigs[i];
        name = config.name;
        config["class"] = config.className || "slot";
        config.range = config.range || [null, null];
        slotMap[name] = config;
        values[i] = config.defaultValue;
        i++;
      }
    };

    MultiSlotPicker.prototype.getSlotValue = function(slotIndex) {
      if (typeof slotIndex === "string") {
        slotIndex = this.getSlotIndexByName(slotIndex);
      }
      return this._values[slotIndex];
    };

    MultiSlotPicker.prototype.setSlotValue = function(slotIndex, value) {
      var config, maxValue, minValue, picker, range;
      picker = this;
      if (typeof slotIndex === "string") {
        slotIndex = picker.getSlotIndexByName(slotIndex);
      }
      if (slotIndex < 0) {
        return;
      }
      if (value !== null) {
        config = picker.slotConfigs[slotIndex];
        range = config.range || [];
        minValue = range[0];
        maxValue = range[1];
        value = parseInt(value, 10);
        if (isNaN(value)) {
          value = config.defaultValue || 0;
        }
        if (maxValue !== null && value > maxValue) {
          value = maxValue;
        } else if (minValue !== null && value < minValue) {
          value = minValue;
        }
      }
      this._values[slotIndex] = value;
      if (this._dom && this._slotLists) {
        return this._slotLists[slotIndex].set("value", value);
      }
    };

    MultiSlotPicker.prototype.getSlotText = function(slotIndex) {
      var config, i, negative, num, picker, text;
      picker = this;
      if (typeof slotIndex === "string") {
        slotIndex = picker.getSlotIndexByName(slotIndex);
      }
      if (slotIndex < 0) {
        return "";
      }
      config = picker.slotConfigs[slotIndex];
      text = picker.getSlotValue(slotIndex);
      if (text === null) {
        if (config.digit > 0) {
          text = '';
          i = 0;
          while (i < config.digit) {
            text += "&nbsp;";
            i++;
          }
        } else {
          text = "&nbsp;";
        }
      } else {
        num = text;
        negative = num < 0;
        text = Math.abs(num) + "";
        if (config.digit > 0 && text.length < config.digit) {
          i = text.length;
          while (i <= config.digit - 1) {
            text = '0' + text;
            i++;
          }
        }
        text = (negative != null ? negative : {
          '-': ''
        }) + text;
      }
      return text;
    };

    MultiSlotPicker.prototype.getText = function() {
      var config, i, picker, slotConfigs, text;
      picker = this;
      slotConfigs = picker.slotConfigs;
      text = "";
      i = 0;
      while (i < slotConfigs.length) {
        config = slotConfigs[i];
        text += config.prefix || "";
        text += picker.getSlotText(i);
        text += config.suffix || "";
        i++;
      }
      return text;
    };

    MultiSlotPicker.prototype.getSlotIndexByName = function(name) {
      var config;
      if (!this._slotMap) {
        this.initSlotConfigs();
      }
      config = this._slotMap[name];
      if (config) {
        return this.slotConfigs.indexOf(config);
      } else {
        return -1;
      }
    };

    MultiSlotPicker.prototype.doOnResize = function() {
      var columnCount, dom, flex, flexes, i, index, item, items, k, lastWidth, len, picker, results, totalFlex, unitWidth, viewWidth, width;
      picker = this;
      items = picker._items || [];
      dom = picker._dom;
      flexes = [];
      for (index = k = 0, len = items.length; k < len; index = ++k) {
        item = items[index];
        width = picker.slotConfigs[index].width || 90;
        flexes.push(width);
      }
      viewWidth = dom.clientWidth;
      columnCount = flexes.length;
      totalFlex = 0;
      i = 0;
      while (i < columnCount) {
        flex = flexes[i];
        totalFlex += parseInt(flex, 10) || 90;
        i++;
      }
      unitWidth = viewWidth / totalFlex;
      lastWidth = 0;
      i = 0;
      results = [];
      while (i < columnCount) {
        if (i !== columnCount - 1) {
          $fly(items[i]).css({
            width: Math.floor(unitWidth * flexes[i])
          });
          lastWidth += Math.floor(unitWidth * flexes[i]);
        } else {
          $fly(items[i]).css({
            width: viewWidth - lastWidth
          });
        }
        results.push(i++);
      }
      return results;
    };

    MultiSlotPicker.prototype.updateItems = function() {
      var k, len, list, ref;
      ref = this._slotLists;
      for (k = 0, len = ref.length; k < len; k++) {
        list = ref[k];
        list.refresh();
      }
      return this;
    };

    return MultiSlotPicker;

  })(cola.AbstractSlotList);

  now = new Date();

  currentYear = now.getFullYear();

  currentMonth = now.getMonth() + 1;

  currentDate = now.getDate();

  currentHours = now.getHours();

  currentMinutes = now.getMinutes();

  currentSeconds = now.getSeconds();

  dateTimeSlotConfigs = {
    year: {
      $type: "Range",
      name: "year",
      range: [currentYear - 50, currentYear + 50],
      defaultValue: currentYear,
      unit: "年",
      width: 120
    },
    month: {
      $type: "Range",
      name: "month",
      range: [1, 12],
      defaultValue: currentMonth,
      unit: "月",
      width: 90
    },
    date: {
      $type: "Range",
      name: "date",
      range: [1, 31],
      defaultValue: currentDate,
      unit: "日",
      width: 90
    },
    hours: {
      $type: "Range",
      name: "hours",
      range: [0, 23],
      defaultValue: currentHours,
      unit: "时",
      width: 90
    },
    minutes: {
      $type: "Range",
      name: "minutes",
      range: [0, 59],
      defaultValue: 0,
      unit: "分",
      width: 90
    },
    seconds: {
      $type: "Range",
      name: "seconds",
      range: [0, 59],
      defaultValue: 0,
      unit: "秒",
      width: 90
    }
  };

  slotAttributeGetter = function(attr) {
    return this.getSlotValue(attr);
  };

  slotAttributeSetter = function(value, attr) {
    return this.setSlotValue(attr, value);
  };

  dateTypeConfig = {
    year: [dateTimeSlotConfigs.year],
    month: [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month],
    date: [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date],
    time: [dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes, dateTimeSlotConfigs.seconds],
    dateTime: [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes, dateTimeSlotConfigs.seconds],
    hours: [dateTimeSlotConfigs.hours],
    minutes: [dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes],
    dateHours: [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours],
    dateMinutes: [dateTimeSlotConfigs.year, dateTimeSlotConfigs.month, dateTimeSlotConfigs.date, dateTimeSlotConfigs.hours, dateTimeSlotConfigs.minutes]
  };

  if (cola.mobile == null) {
    cola.mobile = {};
  }

  cola.mobile.DateTimePicker = (function(superClass) {
    extend(DateTimePicker, superClass);

    function DateTimePicker() {
      return DateTimePicker.__super__.constructor.apply(this, arguments);
    }

    DateTimePicker.CLASS_NAME = "multi-slot-picker";

    DateTimePicker.slotConfigs = [];

    DateTimePicker.ATTRIBUTES = {
      type: {
        "enum": ["year", "month", "date", "time", "datetime", "hours", "minutes", "dateHours", "dateMinutes"],
        defaultValue: "date"
      },
      year: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      month: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      date: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      hours: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      minutes: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      seconds: {
        getter: slotAttributeGetter,
        setter: slotAttributeSetter
      },
      value: {
        getter: function() {
          var date, hours, minutes, month, seconds, year;
          year = this.getSlotValue("year") || 1980;
          month = (this.getSlotValue("month") - 1) || 0;
          date = this.getSlotValue("date") || 1;
          hours = this.getSlotValue("hours") || 0;
          minutes = this.getSlotValue("minutes") || 0;
          seconds = this.getSlotValue("seconds") || 0;
          return new Date(year, month, date, hours, minutes, seconds);
        },
        setter: function(d) {
          var date, hours, minutes, month, seconds, year;
          year = 0;
          month = 1;
          date = 1;
          hours = 0;
          minutes = 1;
          seconds = 1;
          if (d) {
            year = d.getFullYear();
            month = d.getMonth() + 1;
            date = d.getDate();
            hours = d.getHours();
            minutes = d.getMinutes();
            seconds = d.getSeconds();
          }
          this.setSlotValue("year", year);
          this.setSlotValue("month", month);
          this.setSlotValue("date", date);
          this.setSlotValue("hours", hours);
          this.setSlotValue("minutes", minutes);
          return this.setSlotValue("seconds", seconds);
        }
      }
    };

    DateTimePicker.prototype._createDom = function() {
      var configs, dayCount, dom, month, picker, type, year;
      picker = this;
      type = picker._type;
      configs = dateTypeConfig[type];
      picker.slotConfigs = configs;
      picker.initSlotConfigs();
      dom = DateTimePicker.__super__._createDom.call(this);
      if (picker._slotMap["date"]) {
        year = picker.getSlotValue("year");
        month = picker.getSlotValue("month");
        dayCount = XDate.getDaysInMonth(year, month - 1);
        picker.refreshSlotList("date", {
          range: [1, dayCount]
        });
      }
      return dom;
    };

    DateTimePicker.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      DateTimePicker.__super__._doRefreshDom.call(this);
      this._classNamePool.add("multi-slot-picker");
    };

    DateTimePicker.prototype.refreshSlotList = function(slotName, value) {
      var picker, slotList;
      picker = this;
      slotList = picker._slotListMap[slotName];
      if (slotList && value !== void 0) {
        slotList.set(value);
      }
      return this;
    };

    DateTimePicker.prototype.setSlotValue = function(slotIndex, value) {
      var config, date, dateSlotIndex, dayCount, month, newDate, picker, slotName, year;
      picker = this;
      if (value === null) {
        DateTimePicker.__super__.setSlotValue.call(this, slotIndex, value);
        return;
      }
      if (typeof slotIndex === "number") {
        config = picker.slotConfigs[slotIndex];
        if (config) {
          slotName = config.name;
        }
      } else {
        slotName = slotIndex;
        slotIndex = picker.getSlotIndexByName(slotName);
      }
      if (!slotName || !picker._slotMap[slotName]) {
        return;
      }
      if (!picker._slotMap["date"]) {
        DateTimePicker.__super__.setSlotValue.call(this, slotIndex, value);
        return;
      }
      dateSlotIndex = picker.getSlotIndexByName("date");
      date = picker._values[dateSlotIndex];
      newDate = 0;
      year = slotIndex === 0 ? value : picker._values[0];
      month = slotIndex === 1 ? value : picker._values[1];
      dayCount = XDate.getDaysInMonth(year, month - 1);
      if (slotName === "year" || slotName === "month") {
        picker.refreshSlotList("date", {
          range: [1, dayCount]
        });
      }
      if (date >= 28 && date > dayCount) {
        newDate = dayCount;
      }
      if (newDate) {
        if (slotName === "year" || slotName === "month") {
          picker.setSlotValue("date", newDate);
          picker._slotListMap[slotName]._value = newDate;
          picker.refreshSlotList("date");
          return DateTimePicker.__super__.setSlotValue.call(this, slotIndex, value);
        } else {
          return DateTimePicker.__super__.setSlotValue.call(this, slotIndex, newDate);
        }
      } else {
        return DateTimePicker.__super__.setSlotValue.call(this, slotIndex, value);
      }
    };

    return DateTimePicker;

  })(cola.MultiSlotPicker);

  cola.mobile.showDateTimePicker = function(options) {
    var actionDom, layerDom, picker, timerLayer;
    timerLayer = cola.mobile._cacheDateTimer;
    if (timerLayer) {
      if (options.type !== timerLayer._picker.get("type")) {
        timerLayer.destroy();
        cola.mobile._cacheDateTimer = null;
        timerLayer = null;
      }
    }
    if (!timerLayer) {
      picker = new cola.mobile.DateTimePicker({
        type: options.type || "date"
      });
      timerLayer = new cola.Layer({
        animation: "slide down",
        vertical: true,
        horizontal: true,
        "class": "date-timer"
      });
      timerLayer._picker = picker;
      layerDom = timerLayer.getDom();
      layerDom.appendChild(picker.getDom());
      actionDom = $.xCreate({
        "class": "actions ui two fluid bottom attached buttons",
        content: [
          {
            "class": "ui button",
            content: "取消",
            click: function() {
              cola.commonDimmer.hide();
              return timerLayer.hide();
            }
          }, {
            "class": "ui positive button",
            content: "确定",
            click: function() {
              cola.commonDimmer.hide();
              timerLayer.hide();
              if (typeof timerLayer._hideCallback === "function") {
                timerLayer._hideCallback(picker);
              }
              return delete timerLayer._hideCallback;
            }
          }
        ]
      });
      layerDom.appendChild(actionDom);
      $fly(layerDom).css("top", "auto");
      window.document.body.appendChild(layerDom);
      cola.mobile._cacheDateTimer = timerLayer;
    }
    timerLayer = cola.mobile._cacheDateTimer;
    if (options == null) {
      options = {};
    }
    if (options.onHide) {
      timerLayer._hideCallback = options.onHide;
      delete options.onHide;
    }
    cola.commonDimmer.show();
    timerLayer.show(function() {
      timerLayer._picker.set(options);
      return timerLayer._picker.updateItems();
    });
    return timerLayer._picker;
  };

  (function() {
    var DateHelper, getCellPosition, getDateTableState;
    getCellPosition = function(event) {
      var column, element, row, tagName;
      element = event.srcElement || event.target;
      row = -1;
      column = -1;
      while (element && element !== element.ownerDocument.body) {
        tagName = element.tagName.toLowerCase();
        if (tagName === "td") {
          row = element.parentNode.rowIndex;
          column = element.cellIndex;
          break;
        }
        element = element.parentNode;
      }
      if (element !== element.ownerDocument.body) {
        return {
          row: row,
          column: column,
          element: element
        };
      }
      return null;
    };
    if (cola.calendar == null) {
      cola.calendar = {};
    }
    cola.calendar.DateGrid = (function(superClass) {
      extend(DateGrid, superClass);

      function DateGrid() {
        return DateGrid.__super__.constructor.apply(this, arguments);
      }

      DateGrid.ATTRIBUTES = {
        calendar: null,
        columnCount: {
          type: "number",
          defaultValue: 1
        },
        rowCount: {
          type: "number",
          defaultValue: 1
        },
        cellClassName: null,
        selectedCellClassName: "",
        rowClassName: null,
        tableClassName: null
      };

      DateGrid.EVENTS = {
        cellClick: null,
        refreshCellDom: null
      };

      DateGrid.prototype._createDom = function() {
        var columnCount, dom, i, j, picker, rowCount, td, tr;
        picker = this;
        columnCount = this._columnCount;
        rowCount = this._rowCount;
        if (this._doms == null) {
          this._doms = {};
        }
        dom = $.xCreate({
          tagName: "table",
          cellSpacing: 0,
          "class": (picker._className || "") + " " + (picker._tableClassName || ""),
          content: {
            tagName: "tbody",
            contextKey: "body"
          }
        }, this._doms);
        i = 0;
        while (i < rowCount) {
          tr = document.createElement("tr");
          j = 0;
          while (j < columnCount) {
            td = document.createElement("td");
            if (this._cellClassName) {
              td.className = this._cellClassName;
            }
            this.doRenderCell(td, i, j);
            tr.appendChild(td);
            j++;
          }
          if (this._rowClassName) {
            tr.className = this._rowClassName;
          }
          this._doms.body.appendChild(tr);
          i++;
        }
        $fly(dom).on("click", function(event) {
          var position;
          position = getCellPosition(event);
          if (position && position.element) {
            if (position.row >= picker._rowCount) {
              return;
            }
            return picker.fire("cellClick", picker, position);
          }
        });
        return dom;
      };

      DateGrid.prototype.doFireRefreshEvent = function(eventArg) {
        this.fire("refreshCellDom", this, eventArg);
        return this;
      };

      DateGrid.prototype.refreshGrid = function() {
        var cell, columnCount, dom, eventArg, i, j, lastSelectedCell, picker, rowCount, rows;
        picker = this;
        dom = this._doms.body;
        columnCount = this._columnCount;
        rowCount = this._rowCount;
        lastSelectedCell = this._lastSelectedCell;
        if (lastSelectedCell) {
          $fly(lastSelectedCell).removeClass(this._selectedCellClassName || "selected");
          this._lastSelectedCell = null;
        }
        i = 0;
        while (i < rowCount) {
          rows = dom.rows[i];
          j = 0;
          while (j < columnCount) {
            cell = rows.cells[j];
            if (picker._cellClassName) {
              cell.className = picker._cellClassName;
            }
            eventArg = {
              cell: cell,
              row: i,
              column: j
            };
            this.doFireRefreshEvent(eventArg);
            if (eventArg.processDefault !== false) {
              this.doRefreshCell(cell, i, j);
            }
            j++;
          }
          i++;
        }
        return this;
      };

      DateGrid.prototype.setSelectionCell = function(row, column) {
        var cell, lastSelectedCell, picker, tbody;
        picker = this;
        lastSelectedCell = this._lastSelectedCell;
        row = null;
        column = null;
        if (!this._dom) {
          this._selectionPosition = {
            row: row,
            column: column
          };
          return this;
        }
        if (lastSelectedCell) {
          $fly(lastSelectedCell).removeClass(this._selectedCellClassName || "selected");
          this._lastSelectedCell = null;
        }
        tbody = picker._doms.body;
        if (tbody.rows[row]) {
          cell = tbody.rows[row].cells[column];
        }
        if (!cell) {
          return this;
        }
        $fly(cell).addClass(this._selectedCellClassName || "selected");
        this._lastSelectedCell = cell;
        return this;
      };

      DateGrid.prototype.getYMForState = function(cellState) {
        var month, year;
        month = this._month;
        year = this._year;
        if (cellState.type === "prev-month") {
          year = month === 0 ? year - 1 : year;
          month = month === 0 ? 11 : month - 1;
        } else if (cellState.type === "next-month") {
          year = month === 11 ? year + 1 : year;
          month = month === 11 ? 0 : month + 1;
        }
        return {
          year: year,
          month: month
        };
      };

      DateGrid.prototype.doFireRefreshEvent = function(eventArg) {
        var cellState, column, row, ym;
        row = eventArg.row;
        column = eventArg.column;
        if (this._state && this._year && this._month) {
          cellState = this._state[row * 7 + column];
          ym = this.getYMForState(cellState);
          eventArg.date = new Date(ym.year, ym.month, cellState.text);
        }
        this.fire("refreshCellDom", this, eventArg);
        return this;
      };

      DateGrid.prototype.doRenderCell = function(cell, row, column) {
        var label;
        label = document.createElement("div");
        label.className = "label";
        cell.appendChild(label);
      };

      DateGrid.prototype.getDateCellDom = function(date) {
        var ddd, value;
        value = new XDate(date).toString("yyyy-M-d");
        ddd = $(this._dom).find("td[c-date='" + value + "']");
        console.log(ddd);
        return ddd;
      };

      DateGrid.prototype.doRefreshCell = function(cell, row, column) {
        var cellState, state, ym;
        state = this._state;
        if (!state) {
          return;
        }
        cellState = state[row * 7 + column];
        $fly(cell).removeClass("prev-month next-month").addClass(cellState.type).find(".label").html(cellState.text);
        ym = this.getYMForState(cellState);
        $fly(cell).attr("c-date", ym.year + "-" + (ym.month + 1) + "-" + cellState.text);
        if (cellState.type === "normal") {
          if (this._year === this._calendar._year && this._month === this._calendar._month && cellState.text === this._calendar._monthDate) {
            $fly(cell).addClass("selected");
            return this._lastSelectedCell = cell;
          }
        }
      };

      DateGrid.prototype.setState = function(year, month) {
        var oldMonth, oldYear;
        oldYear = this._year;
        oldMonth = this._month;
        if (oldYear !== year || oldMonth !== month) {
          this._year = year;
          this._month = month;
          this._state = getDateTableState(new Date(year, month, 1));
          this.refreshGrid();
        }
        return this.onCalDateChange();
      };

      DateGrid.prototype.onCalDateChange = function() {
        var cell, column, date, delta, firstDayPosition, month, monthDate, row, state, tbody, year;
        if (!this._dom) {
          return this;
        }
        date = this._calendar._date;
        year = this._year;
        month = this._month;
        if (date && year === date.getFullYear() && month === date.getMonth() && date.getDate()) {
          monthDate = date.getDate();
          state = this._state;
          firstDayPosition = state.firstDayPosition;
          delta = monthDate + firstDayPosition - 1;
          column = delta % 7;
          row = Math.floor(delta / 7);
          tbody = this._doms.body;
          cell = tbody.rows[row].cells[column];
          if (this._lastSelectedCell) {
            $fly(this._lastSelectedCell).removeClass("selected");
          }
          if (cell) {
            $fly(cell).addClass("selected");
          }
          this._lastSelectedCell = cell;
        } else {
          if (this._lastSelectedCell) {
            $fly(this._lastSelectedCell).removeClass("selected");
          }
          this._lastSelectedCell = null;
        }
        return this;
      };

      return DateGrid;

    })(cola.RenderableElement);
    cola.calendar.SwipePicker = (function(superClass) {
      extend(SwipePicker, superClass);

      function SwipePicker() {
        return SwipePicker.__super__.constructor.apply(this, arguments);
      }

      SwipePicker.CLASS_NAME = "ui swipe-picker";

      SwipePicker.ATTRIBUTES = {
        calendar: null
      };

      SwipePicker.EVENTS = {
        change: null
      };

      SwipePicker.prototype.createDateTable = function(dom) {
        var calendar, dateTable;
        calendar = this._calendar;
        dateTable = new cola.calendar.DateGrid({
          rowCount: 6,
          columnCount: 7,
          calendar: calendar,
          tableClassName: "date-table",
          refreshCellDom: function(self, arg) {
            return calendar.doFireCellRefresh(arg);
          },
          cellClick: function(self, arg) {
            var cellState, element, state;
            element = arg.element;
            state = self._state;
            if (!element) {
              return;
            }
            cellState = state[arg.row * 7 + arg.column];
            if (cellState.type === "prev-month") {
              calendar.prevMonth();
            } else if (cellState.type === "next-month") {
              calendar.nextMonth();
            }
            calendar.setDate(cellState.text);
            calendar.fire("change", calendar, {
              date: calendar._date
            });
            return calendar.fire("cellClick", calendar, {
              date: calendar._date,
              element: element
            });
          }
        });
        dateTable.appendTo(dom);
        return dateTable;
      };

      SwipePicker.prototype.doOnSwipeNext = function() {
        this._calendar.nextMonth();
        return this;
      };

      SwipePicker.prototype.doOnSwipePrev = function() {
        this._calendar.prevMonth();
        return this;
      };

      SwipePicker.prototype.setState = function(year, month) {
        var nextM, nextY, prevM, prevY;
        this._current.setState(year, month);
        prevY = month === 0 ? year - 1 : year;
        prevM = month === 0 ? 11 : month - 1;
        this._prev.setState(prevY, prevM);
        nextY = month === 11 ? year + 1 : year;
        nextM = month === 11 ? 0 : month + 1;
        this._next.setState(nextY, nextM);
        return this;
      };

      SwipePicker.prototype.setDate = function() {
        if (!this._dom) {
          return this;
        }
        this._current.onCalDateChange();
        this._prev.onCalDateChange();
        this._next.onCalDateChange();
        return this;
      };

      SwipePicker.prototype._createDom = function() {
        var dom, picker, setType, stackDom;
        dom = document.createElement("div");
        picker = this;
        dom.className = "date-table-wrapper";
        setType = function(type) {
          picker["_" + type] = this;
        };
        this._stack = new cola.Stack({
          change: (function(_this) {
            return function(self, arg) {
              var cDom;
              cDom = _this._current.getDom();
              if (arg.prev === cDom.parentNode) {
                return _this.doNext();
              } else {
                return _this.doPrev();
              }
            };
          })(this)
        });
        stackDom = this._stack.getDom();
        dom.appendChild(stackDom);
        this._current = this.createDateTable(this._stack._currentItem);
        this._current.setType = setType;
        this._current.setType("current");
        this._next = this.createDateTable(this._stack._nextItem);
        this._next.setType = setType;
        this._next.setType("next");
        this._prev = this.createDateTable(this._stack._prevItem);
        this._prev.setType = setType;
        this._prev.setType("prev");
        return dom;
      };

      SwipePicker.prototype.doNext = function() {
        var current, next, picker, prev;
        picker = this;
        current = picker._current;
        prev = picker._prev;
        next = picker._next;
        current.setType("prev");
        next.setType("current");
        prev.setType("next");
        return this.fire("change", this, {
          target: "next"
        });
      };

      SwipePicker.prototype.doPrev = function() {
        var current, next, picker, prev;
        picker = this;
        current = picker._current;
        prev = picker._prev;
        next = picker._next;
        current.setType("next");
        next.setType("prev");
        prev.setType("current");
        return this.fire("change", this, {
          target: "prev"
        });
      };

      SwipePicker.prototype.next = function(callback) {
        this._stack.next();
        if (typeof callback === "function") {
          callback();
        }
        return this;
      };

      SwipePicker.prototype.prev = function(callback) {
        this._stack.prev();
        if (typeof callback === "function") {
          callback();
        }
        return this;
      };

      SwipePicker.prototype.getDateCellDom = function(date) {
        return this._current.getDateCellDom(date);
      };

      return SwipePicker;

    })(cola.RenderableElement);
    DateHelper = {
      getDayCountOfMonth: function(year, month) {
        if (month === 3 || month === 5 || month === 8 || month === 10) {
          return 30;
        }
        if (month === 1) {
          if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
            return 29;
          } else {
            return 28;
          }
        }
        return 31;
      },
      getFirstDayOfMonth: function(date) {
        var temp;
        temp = new Date(date.getTime());
        temp.setDate(1);
        return temp.getDay();
      },
      getWeekNumber: function(date) {
        var d;
        d = new Date(+date);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
      }
    };
    getDateTableState = function(date) {
      var cell, cells, count, day, firstDayPosition, i, j, lastM, lastMonthDay, maxDay;
      day = date.getDay();
      maxDay = DateHelper.getDayCountOfMonth(date.getFullYear(), date.getMonth());
      lastM = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
      lastMonthDay = DateHelper.getDayCountOfMonth(date.getFullYear(), lastM);
      day = day === 0 ? 7 : day;
      cells = [];
      count = 1;
      firstDayPosition = null;
      i = 0;
      while (i < 6) {
        j = 0;
        while (j < 7) {
          cell = {
            row: i,
            column: j,
            type: "normal"
          };
          if (i === 0) {
            if (j >= day) {
              cell.text = count++;
              if (count === 2) {
                firstDayPosition = i * 7 + j;
              }
            } else {
              cell.text = lastMonthDay - (day - j % 7) + 1;
              cell.type = "prev-month";
            }
          } else {
            if (count <= maxDay) {
              cell.text = count++;
              if (count === 2) {
                firstDayPosition = i * 7 + j;
              }
            } else {
              cell.text = count++ - maxDay;
              cell.type = "next-month";
            }
          }
          cells.push(cell);
          j++;
        }
        i++;
      }
      cells.firstDayPosition = firstDayPosition;
      return cells;
    };
    return cola.Calendar = (function(superClass) {
      extend(Calendar, superClass);

      function Calendar() {
        return Calendar.__super__.constructor.apply(this, arguments);
      }

      Calendar.CLASS_NAME = "calendar";

      Calendar.ATTRIBUTES = {
        date: {
          getter: function() {
            return this._date || new Date();
          }
        }
      };

      Calendar.EVENTS = {
        refreshCellDom: null,
        change: null,
        cellClick: null
      };

      Calendar.prototype.doFireCellRefresh = function(arg) {
        return this.fire("refreshCellDom", this, arg);
      };

      Calendar.prototype.bindButtonsEvent = function() {
        var cal, doms, picker;
        cal = this;
        doms = this._doms;
        picker = this._datePicker;
        $fly(doms.prevMonthButton).on("click", function() {
          return picker.prev();
        });
        $fly(doms.nextMonthButton).on("click", function() {
          return picker.next();
        });
        $fly(doms.prevYearButton).on("click", function() {
          return cal.prevYear();
        });
        return $fly(doms.nextYearButton).on("click", function() {
          return cal.nextYear();
        });
      };

      Calendar.prototype._createDom = function() {
        var allWeeks, cal, dom, picker, weeks;
        allWeeks = "日,一,二,三,四,五,六";
        weeks = allWeeks.split(",");
        cal = this;
        if (this._doms == null) {
          this._doms = {};
        }
        dom = $.xCreate({
          tagName: "div",
          content: [
            {
              tagName: "div",
              "class": "header",
              contextKey: "header",
              content: [
                {
                  tagName: "div",
                  "class": "month",
                  content: [
                    {
                      tagName: "span",
                      "class": "button prev",
                      contextKey: "prevMonthButton"
                    }, {
                      tagName: "span",
                      "class": "button next",
                      contextKey: "nextMonthButton"
                    }, {
                      tagName: "div",
                      "class": "label",
                      contextKey: "monthLabel"
                    }
                  ]
                }, {
                  tagName: "div",
                  "class": "year",
                  content: [
                    {
                      tagName: "span",
                      "class": "button prev",
                      contextKey: "prevYearButton"
                    }, {
                      tagName: "span",
                      "class": "button next",
                      contextKey: "nextYearButton"
                    }, {
                      tagName: "div",
                      "class": "label",
                      contextKey: "yearLabel"
                    }
                  ]
                }
              ]
            }, {
              tagName: "table",
              cellPadding: 0,
              cellSpacing: 0,
              border: 0,
              "class": "date-header",
              contextKey: "dateHeader",
              content: [
                {
                  tagName: "tr",
                  "class": "header",
                  content: [
                    {
                      tagName: "td",
                      content: weeks[0]
                    }, {
                      tagName: "td",
                      content: weeks[1]
                    }, {
                      tagName: "td",
                      content: weeks[2]
                    }, {
                      tagName: "td",
                      content: weeks[3]
                    }, {
                      tagName: "td",
                      content: weeks[4]
                    }, {
                      tagName: "td",
                      content: weeks[5]
                    }, {
                      tagName: "td",
                      content: weeks[6]
                    }
                  ]
                }
              ]
            }
          ]
        }, this._doms);
        picker = cal._datePicker = new cola.calendar.SwipePicker({
          className: "date-table-wrapper",
          calendar: cal,
          change: function(self, arg) {
            if (arg.target === "next") {
              return cal.nextMonth();
            } else {
              return cal.prevMonth();
            }
          }
        });
        picker.appendTo(dom);
        this._doms.dateTableWrapper = picker._dom;
        cal.bindButtonsEvent();
        return dom;
      };

      Calendar.prototype.setState = function(year, month) {
        var doms;
        doms = this._doms;
        this._year = year;
        this._month = month;
        $fly(doms.monthLabel).html(month + 1 || "");
        $fly(doms.yearLabel).html(year || "");
        return this._datePicker.setState(year, month);
      };

      Calendar.prototype.setDate = function(date) {
        this._date = new Date(this._year, this._month, date);
        this._monthDate = date;
        return this._datePicker.setDate(date);
      };

      Calendar.prototype.prevMonth = function() {
        var month, newMonth, newYear, year;
        year = this._year;
        month = this._month;
        if (year !== void 0 && month !== void 0) {
          newYear = month === 0 ? year - 1 : year;
          newMonth = month === 0 ? 11 : month - 1;
          return this.setState(newYear, newMonth);
        }
      };

      Calendar.prototype.nextMonth = function() {
        var month, newMonth, newYear, year;
        year = this._year;
        month = this._month;
        if (year !== void 0 && month !== void 0) {
          newYear = month === 11 ? year + 1 : year;
          newMonth = month === 11 ? 0 : month + 1;
          return this.setState(newYear, newMonth);
        }
      };

      Calendar.prototype.prevYear = function() {
        var month, year;
        year = this._year;
        month = this._month;
        if (year !== void 0 && month !== void 0) {
          return this.setState(year - 1, month);
        }
      };

      Calendar.prototype.setYear = function(newYear) {
        var month, year;
        year = this._year;
        month = this._month;
        if (year !== void 0 && month !== void 0) {
          return this.setState(newYear, month);
        }
      };

      Calendar.prototype.nextYear = function() {
        var month, year;
        year = this._year;
        month = this._month;
        if (year !== void 0 && month !== void 0) {
          return this.setState(year + 1, month);
        }
      };

      Calendar.prototype._doRefreshDom = function() {
        var date;
        if (!this._dom) {
          return;
        }
        Calendar.__super__._doRefreshDom.call(this);
        date = this.get("date");
        if (date) {
          this.setState(date.getFullYear(), date.getMonth());
          return this.setDate(date.getDate());
        }
      };

      Calendar.prototype.getDateCellDom = function(date) {
        return this._datePicker.getDateCellDom(date);
      };

      return Calendar;

    })(cola.Widget);
  })();

  cola.Divider = (function(superClass) {
    extend(Divider, superClass);

    function Divider() {
      return Divider.__super__.constructor.apply(this, arguments);
    }

    Divider.CLASS_NAME = "divider";

    Divider.ATTRIBUTES = {
      direction: {
        "enum": ["vertical", "horizontal", ""],
        defaultValue: "",
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._direction;
          this._direction = value;
          if (this._dom && oldValue && oldValue !== value) {
            this.removeClass(oldValue);
          }
        }
      }
    };

    Divider.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Divider.__super__._doRefreshDom.call(this);
      if (this._direction) {
        this._classNamePool.add(this._direction);
      }
    };

    return Divider;

  })(cola.AbstractContainer);

  BLANK_PATH = "about:blank";

  cola.IFrame = (function(superClass) {
    extend(IFrame, superClass);

    function IFrame() {
      return IFrame.__super__.constructor.apply(this, arguments);
    }

    IFrame.CLASS_NAME = "iframe";

    IFrame.ATTRIBUTES = {
      path: {
        defaultValue: BLANK_PATH,
        setter: function(value) {
          var oldValue;
          oldValue = this._path;
          this._path = value;
          if (oldValue === value || !this._dom) {
            return;
          }
          this._loaded = false;
          this._replaceUrl(this._path);
        }
      },
      loadingText: null
    };

    IFrame.EVENTS = {
      load: null
    };

    IFrame.prototype._initDom = function(dom) {
      var $dom, frame, frameDoms;
      frame = this;
      frameDoms = this._doms;
      $dom = $(dom);
      $dom.addClass("loading").empty().append($.xCreate([
        {
          tagName: "div",
          "class": "ui active inverted dimmer",
          content: {
            tagName: "div",
            "class": "ui medium text loader",
            content: this._loadingText || "",
            contextKey: "loader"
          },
          contextKey: "dimmer"
        }, {
          tagName: "iframe",
          contextKey: "iframe",
          scrolling: cola.os.ios ? "no" : "auto",
          frameBorder: 0
        }
      ], frameDoms));
      $(frameDoms.iframe).load(function() {
        frame.fire("load", this, {});
        frame._loaded = true;
        return $(frameDoms.dimmer).removeClass("active");
      }).attr("src", this._path);
    };

    IFrame.prototype.getLoaderContainer = function() {
      if (!this._dom) {
        this.getDom();
      }
      return this._doms.dimmer;
    };

    IFrame.prototype.getContentWindow = function() {
      var contentWindow, e;
      if (this._doms == null) {
        this._doms = {};
      }
      try {
        if (this._doms.iframe) {
          contentWindow = this._doms.iframe.contentWindow;
        }
      } catch (_error) {
        e = _error;
      }
      return contentWindow;
    };

    IFrame.prototype.open = function(path) {
      this.set("path", path);
    };

    IFrame.prototype.reload = function() {
      this._replaceUrl(this._path);
      return this;
    };

    IFrame.prototype._replaceUrl = function(url) {
      var contentWindow;
      if (this._doms) {
        $fly(this._doms.dimmer).addClass("active");
      }
      contentWindow = this.getContentWindow();
      if (contentWindow) {
        contentWindow.location.replace(url);
      } else {
        $fly(this._doms.iframe).prop("src", url);
      }
      return this;
    };

    return IFrame;

  })(cola.Widget);

  cola.SubView = (function(superClass) {
    extend(SubView, superClass);

    function SubView() {
      return SubView.__super__.constructor.apply(this, arguments);
    }

    SubView.CLASS_NAME = "sub-view";

    SubView.ATTRIBUTES = {
      loading: null,
      url: {
        readOnlyAfterCreate: true
      },
      jsUrl: {
        readOnlyAfterCreate: true
      },
      cssUrl: {
        readOnlyAfterCreate: true
      },
      model: {
        readOnly: true,
        getter: function() {
          if (this._dom) {
            return cola.util.userData(this._dom, "_model");
          } else {
            return null;
          }
        }
      },
      param: {
        readOnlyAfterCreate: true
      }
    };

    SubView.EVENTS = {
      load: null,
      loadError: null,
      unload: null
    };

    SubView.prototype._initDom = function(dom) {
      if (this._url) {
        this.load({
          url: this._url,
          jsUrl: this._jsUrl,
          cssUrl: this._cssUrl,
          param: this._param
        });
      }
    };

    SubView.prototype.load = function(options, callback) {
      var dom, model;
      dom = this._dom;
      this.unload();
      model = new cola.Model(this._scope);
      cola.util.userData(dom, "_model", model);
      this._url = options.url;
      this._jsUrl = options.jsUrl;
      this._cssUrl = options.cssUrl;
      this._param = options.param;
      this._loading = true;
      cola.loadSubView(this._dom, {
        model: model,
        htmlUrl: this._url,
        jsUrl: this._jsUrl,
        cssUrl: this._cssUrl,
        param: this._param,
        callback: {
          callback: (function(_this) {
            return function(success, result) {
              _this._loading = false;
              if (success) {
                _this.fire("load", _this);
              } else {
                _this.fire("loadError", _this, {
                  error: result
                });
              }
              cola.callback(callback, success, result);
            };
          })(this)
        }
      });
    };

    SubView.prototype.loadIfNecessary = function(options, callback) {
      if (this._url === options.url) {
        cola.callback(callback, true);
      } else {
        this.load(options, callback);
      }
    };

    SubView.prototype.unload = function() {
      var dom, model;
      dom = this._dom;
      delete this._url;
      delete this._jsUrl;
      delete this._cssUrl;
      delete this._param;
      model = cola.util.userData(dom, "_model");
      if (model != null) {
        model.destroy();
      }
      cola.util.removeUserData(dom, "_model");
      $fly(dom).empty();
      this.fire("unload", this);
    };

    return SubView;

  })(cola.Widget);

  cola.Image = (function(superClass) {
    extend(Image, superClass);

    function Image() {
      return Image.__super__.constructor.apply(this, arguments);
    }

    Image.CLASS_NAME = "image";

    Image.TAG_NAME = "img";

    Image.ATTRIBUTES = {
      src: {
        refreshDom: true
      },
      size: {
        "enum": ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"],
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this["_size"];
          if (oldValue && oldValue !== value && this._dom) {
            this.get$Dom().removeClass(oldValue);
          }
          this["_size"] = value;
        }
      },
      disabled: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      }
    };

    Image.prototype._parseDom = function(dom) {
      var src;
      if (!dom) {
        return;
      }
      if (!this._src) {
        src = dom.getAttribute("src");
        if (src) {
          return this._src = src;
        }
      }
    };

    Image.prototype._doRefreshDom = function() {
      var $dom, classNamePool, size;
      if (!this._dom) {
        return;
      }
      Image.__super__._doRefreshDom.call(this);
      $dom = this.get$Dom();
      classNamePool = this._classNamePool;
      size = this.get("size");
      if (size) {
        classNamePool.add(size);
      }
      $dom.attr("src", this._src);
      classNamePool.toggle("disabled", this._disabled);
    };

    return Image;

  })(cola.Widget);

  cola.Avatar = (function(superClass) {
    extend(Avatar, superClass);

    function Avatar() {
      return Avatar.__super__.constructor.apply(this, arguments);
    }

    Avatar.CLASS_NAME = "avatar image";

    return Avatar;

  })(cola.Image);

  cola.Label = (function(superClass) {
    extend(Label, superClass);

    function Label() {
      return Label.__super__.constructor.apply(this, arguments);
    }

    Label.SEMANTIC_CLASS = ["left floated", "right floated", "left top attached", "right top attached", "right bottom attached", "left bottom attached", "top attached", "bottom attached", "left ribbon", "right ribbon", "center aligned"];

    Label.CLASS_NAME = "label";

    Label.ATTRIBUTES = {
      size: {
        "enum": ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"],
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._size;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue);
          }
          this._size = value;
        }
      },
      text: {
        refreshDom: true
      },
      icon: {
        refreshDom: true,
        setter: function(value) {
          var oldValue, ref;
          oldValue = this._icon;
          this._icon = value;
          if (oldValue !== value && this._dom && ((ref = this._doms) != null ? ref.iconDom : void 0)) {
            $fly(this._doms.iconDom).removeClass(oldValue);
          }
        }
      },
      iconPosition: {
        refreshDom: true,
        defaultValue: "left",
        "enum": ["left", "right"]
      },
      horizontal: {
        type: "boolean",
        defaultValue: false,
        refreshDom: true
      },
      color: {
        refreshDom: true,
        "enum": ["black", "yellow", "green", "blue", "orange", "purple", "red", "pink", "teal"],
        setter: function(value) {
          var oldValue;
          oldValue = this._color;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue);
          }
          this._color = value;
        }
      },
      attached: {
        refreshDom: true,
        defaultValue: "",
        "enum": ["left top", "left bottom", "right top", "right bottom", "top", "bottom", ""],
        setter: function(value) {
          var oldValue;
          oldValue = this._attached;
          if (oldValue && this._dom) {
            this.removeClass(oldValue + " attached", true);
          }
          this._attached = value;
        }
      }
    };

    Label.prototype._parseDom = function(dom) {
      var text;
      if (!dom) {
        return;
      }
      if (!this._text) {
        text = cola.util.getTextChildData(dom);
        if (text) {
          this._text = text;
        }
      }
      return this.get$Dom().empty();
    };

    Label.prototype._refreshIcon = function() {
      var base, icon, iconDom, iconPosition;
      if (!this._dom) {
        return;
      }
      if (this._doms == null) {
        this._doms = {};
      }
      icon = this._icon;
      iconPosition = this._iconPosition;
      if (icon) {
        if ((base = this._doms).iconDom == null) {
          base.iconDom = document.createElement("i");
        }
        iconDom = this._doms.iconDom;
        $(iconDom).addClass(icon + " icon");
        if (iconPosition === "left" && this._doms.textDom) {
          $(this._doms.textDom).before(iconDom);
        } else {
          this._dom.appendChild(iconDom);
        }
      } else if (this._doms.iconDom) {
        cola.detachNode(this._doms.iconDom);
      }
    };

    Label.prototype._doRefreshDom = function() {
      var attached, classNamePool, color, size, text, textDom;
      if (!this._dom) {
        return;
      }
      Label.__super__._doRefreshDom.call(this);
      classNamePool = this._classNamePool;
      text = this._text || "";
      textDom = this._doms.textDom;
      if (text) {
        if (!textDom) {
          textDom = document.createElement("span");
          this._doms.textDom = textDom;
        }
        $fly(textDom).text(text);
        this._dom.appendChild(textDom);
      } else {
        if (textDom) {
          cola.detachNode(textDom);
        }
      }
      size = this.get("size");
      if (size) {
        classNamePool.add(size);
      }
      color = this.get("color");
      if (color) {
        classNamePool.add(color);
      }
      this._refreshIcon();
      attached = this.get("attached");
      if (attached) {
        classNamePool.add(attached + " attached");
      }
    };

    return Label;

  })(cola.Widget);

  cola.ImageLabel = (function(superClass) {
    extend(ImageLabel, superClass);

    function ImageLabel() {
      return ImageLabel.__super__.constructor.apply(this, arguments);
    }

    ImageLabel.CLASS_NAME = "image label";

    ImageLabel.ATTRIBUTES = {
      image: null,
      iconPosition: {
        refreshDom: true,
        defaultValue: "right",
        "enum": ["left", "right"]
      },
      detail: null
    };

    ImageLabel.prototype._doRefreshDom = function() {
      var detailDom;
      if (!this._dom) {
        return;
      }
      ImageLabel.__super__._doRefreshDom.call(this);
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._image) {
        if (!this._doms.image) {
          this._doms.image = $.xCreate({
            tagName: "img",
            src: this._image
          });
        }
        if (this._doms.image.parentNode !== this._dom) {
          this.get$Dom().prepend(this._doms.image);
        }
        $fly(this._doms.image).attr("src", this._image);
      } else {
        if (this._doms.image) {
          cola.detachNode(this._doms.image);
        }
      }
      detailDom = $(".detail", this._dom);
      if (this._detail) {
        if (detailDom.length > 0) {
          return detailDom.text(this._detail);
        } else {
          detailDom = $.xCreate({
            tagName: "div",
            "class": "detail",
            content: this._detail
          });
          return this._dom.appendChild(detailDom);
        }
      } else {
        return detailDom.remove();
      }
    };

    return ImageLabel;

  })(cola.Label);

  cola.PointingLabel = (function(superClass) {
    extend(PointingLabel, superClass);

    function PointingLabel() {
      return PointingLabel.__super__.constructor.apply(this, arguments);
    }

    PointingLabel.CLASS_NAME = "pointing label";

    PointingLabel.ATTRIBUTES = {
      pointing: {
        refreshDom: true,
        defaultValue: "top",
        "enum": ["left", "right", "top", "bottom"],
        setter: function(value) {
          var oldValue;
          oldValue = this._pointing;
          if (oldValue && this._dom) {
            this.removeClass(oldValue);
          }
          this._pointing = value;
        }
      }
    };

    PointingLabel.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      PointingLabel.__super__._doRefreshDom.call(this);
      if (this._pointing) {
        return this._classNamePool.add(this._pointing);
      }
    };

    return PointingLabel;

  })(cola.Label);

  cola.Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.CLASS_NAME = "tag label";

    return Tag;

  })(cola.Label);

  cola.Corner = (function(superClass) {
    extend(Corner, superClass);

    function Corner() {
      return Corner.__super__.constructor.apply(this, arguments);
    }

    Corner.CLASS_NAME = "corner label";

    Corner.ATTRIBUTES = {
      position: {
        "enum": ["left", "right"],
        defaultValue: "right",
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._position;
          if (oldValue && oldValue !== value && this._dom) {
            this.removeClass(oldValue);
          }
          this._position = value;
        }
      }
    };

    Corner.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Corner.__super__._doRefreshDom.call(this);
      return this._classNamePool.add(this._position);
    };

    return Corner;

  })(cola.Label);

  cola.Ribbon = (function(superClass) {
    extend(Ribbon, superClass);

    function Ribbon() {
      return Ribbon.__super__.constructor.apply(this, arguments);
    }

    Ribbon.CLASS_NAME = "ribbon label";

    Ribbon.ATTRIBUTES = {
      position: {
        "enum": ["left", "right"],
        defaultValue: "left",
        setter: function(value) {
          var oldValue;
          oldValue = this._position;
          if (oldValue === value) {
            return;
          }
          if (oldValue === "right" && this._dom) {
            this.removeClass("right ribbon", true);
            this.addClass("ribbon");
          }
          this._position = value;
        }
      }
    };

    Ribbon.prototype._doRefreshDom = function() {
      var position;
      if (!this._dom) {
        return;
      }
      Ribbon.__super__._doRefreshDom.call(this);
      position = this._position;
      if (position === "right") {
        this._classNamePool.remove("ribbon");
        return this._classNamePool.add("right ribbon");
      }
    };

    return Ribbon;

  })(cola.Label);

  (function() {
    var createMessageBoxDom, messageBox;
    cola.commonDimmer = {
      show: function() {
        var _dimmerDom;
        _dimmerDom = cola.commonDimmer._dom;
        if (!_dimmerDom) {
          _dimmerDom = $.xCreate({
            tagName: "Div",
            "class": "ui dimmer sys-dimmer",
            contextKey: "dimmer"
          });
          window.document.body.appendChild(_dimmerDom);
          cola.commonDimmer._dom = _dimmerDom;
        }
        $(_dimmerDom).addClass("active");
      },
      hide: function() {
        return $(cola.commonDimmer._dom).removeClass("active");
      }
    };
    messageBox = {
      animation: cola.device.phone ? "slide up" : "scale",
      settings: {
        info: {
          title: "消息",
          icon: "blue info icon"
        },
        warning: {
          title: "警告",
          icon: "yellow warning sign icon"
        },
        error: {
          title: "错误",
          icon: "red warning sign icon"
        },
        question: {
          title: "确认框",
          icon: "black help circle icon"
        }
      },
      "class": "standard",
      level: {
        WARNING: "warning",
        ERROR: "error",
        INFO: "info",
        QUESTION: "question"
      },
      _executeCallback: function(name) {
        var _eventName;
        _eventName = "_on" + name;
        if (!messageBox[_eventName]) {
          return;
        }
        setTimeout(function() {
          var config;
          config = messageBox[_eventName];
          if (typeof config === "function") {
            config.apply(null, []);
          }
          return messageBox[_eventName] = null;
        }, 0);
      },
      _doShow: function() {
        var $dom, animation, css, height, pHeight, pWidth, width;
        animation = messageBox.animation;
        css = {
          zIndex: cola.floatWidget.zIndex()
        };
        $dom = $(messageBox._dom);
        if (!cola.device.phone) {
          width = $dom.width();
          height = $dom.height();
          pWidth = $(window).width();
          pHeight = $(window).height();
          css.left = (pWidth - width) / 2;
          css.top = (pHeight - height) / 2;
        }
        $dom.css(css);
        $dom.transition(animation);
        return cola.commonDimmer.show();
      },
      _doApprove: function() {
        messageBox._executeCallback("approve");
        messageBox._doHide();
      },
      _doDeny: function() {
        messageBox._executeCallback("deny");
        messageBox._doHide();
      },
      _doHide: function() {
        $(messageBox._dom).transition(messageBox.animation);
        cola.commonDimmer.hide();
        messageBox._executeCallback("hide");
      },
      getDom: function() {
        if (!messageBox._dom) {
          createMessageBoxDom();
        }
        return messageBox._dom;
      },
      show: function(options) {
        var $dom, dom, doms, isAlert, level, oldUI, settings, ui;
        dom = messageBox.getDom();
        settings = messageBox.settings;
        level = options.level || messageBox.level.INFO;
        $dom = $(dom);
        if (options.title == null) {
          options.title = settings[level].title;
        }
        if (options.icon == null) {
          options.icon = settings[level].icon;
        }
        messageBox._onDeny = options.onDeny;
        messageBox._onApprove = options.onApprove;
        messageBox._onHide = options.onHide;
        $dom.removeClass("warning error info question").addClass(level);
        oldUI = $dom.attr("_ui");
        ui = options.ui || messageBox.ui;
        if (oldUI !== ui) {
          if (oldUI) {
            $dom.removeClass(oldUI);
          }
          $dom.addClass(ui).attr("_ui", ui);
        }
        doms = messageBox._doms;
        isAlert = options.mode === "alert";
        $(doms.actions).toggleClass("hidden", isAlert);
        $(doms.close).toggleClass("hidden", !isAlert);
        $(doms.description).html(options.content);
        $(doms.title).text(options.title);
        doms.icon.className = options.icon;
        messageBox._doShow();
        return this;
      }
    };
    createMessageBoxDom = function() {
      var actionsDom, bodyNode, dom, doms;
      doms = {};
      dom = $.xCreate({
        tagName: "Div",
        "class": "ui " + (cola.device.phone ? "mobile layer" : "desktop") + " message-box transition hidden",
        contextKey: "messageBox",
        content: {
          "class": "content-container ",
          contextKey: "contentContainer",
          content: [
            {
              tagName: "div",
              "class": "header",
              content: [
                {
                  tagName: "div",
                  "class": "caption",
                  contextKey: "title"
                }, {
                  tagName: "div",
                  contextKey: "close",
                  "class": " close-btn",
                  click: messageBox._doHide,
                  content: {
                    tagName: "i",
                    "class": "close icon"
                  }
                }
              ]
            }, {
              tagName: "div",
              "class": "image content",
              contextKey: "content",
              content: [
                {
                  tagName: "div",
                  "class": "image",
                  content: {
                    tagName: "i",
                    "class": "announcement icon",
                    contextKey: "icon",
                    style: {
                      "font-size": "4rem"
                    }
                  }
                }, {
                  tagName: "div",
                  "class": "description",
                  contextKey: "description"
                }
              ]
            }
          ]
        }
      }, doms);
      actionsDom = $.xCreate({
        tagName: "div",
        "class": "actions " + (cola.device.phone ? "ui buttons two fluid top attached" : ""),
        contextKey: "actions",
        content: [
          {
            tagName: "div",
            contextKey: "no",
            content: "取消",
            click: messageBox._doDeny,
            "class": "ui button"
          }, {
            tagName: "div",
            contextKey: "yes",
            click: messageBox._doApprove,
            "class": "ui positive right labeled icon button ",
            content: [
              {
                tagName: "i",
                "class": "checkmark icon"
              }, {
                tagName: "span",
                content: "确认",
                contextKey: "yesCaption"
              }
            ]
          }
        ]
      }, doms);
      if (cola.device.phone) {
        $(doms.content).before(actionsDom);
      } else {
        doms.contentContainer.appendChild(actionsDom);
      }
      bodyNode = window.document.body;
      if (bodyNode) {
        bodyNode.appendChild(dom);
      } else {
        $(window).on("load", function() {
          return $(window.document.body).append(dom);
        });
      }
      messageBox._dom = dom;
      messageBox._doms = doms;
      return dom;
    };
    cola.alert = function(msg, options) {
      var key, settings, value;
      settings = {};
      if (options) {
        if (typeof options === "function") {
          settings.onHide = options;
        } else {
          for (key in options) {
            value = options[key];
            settings[key] = value;
          }
        }
      }
      settings.content = msg;
      settings.mode = "alert";
      messageBox.show(settings);
      return this;
    };
    cola.confirm = function(msg, options) {
      var key, settings, value;
      settings = {};
      settings.actions = "block";
      if (options) {
        if (typeof options === "function") {
          settings.onApprove = options;
        } else {
          for (key in options) {
            value = options[key];
            settings[key] = value;
          }
        }
      }
      settings.content = msg;
      settings.level = messageBox.level.QUESTION;
      if (settings.title == null) {
        settings.title = messageBox.settings.question.title;
      }
      if (settings.icon == null) {
        settings.icon = messageBox.settings.question.icon;
      }
      settings.mode = "confirm";
      messageBox.show(settings);
      return this;
    };
    if (cola.os.mobile) {
      messageBox.getDom();
    }
    return cola.MessageBox = messageBox;
  })();


  /*
  Reveal 组件
   */

  cola.Reveal = (function(superClass) {
    extend(Reveal, superClass);

    function Reveal() {
      return Reveal.__super__.constructor.apply(this, arguments);
    }

    Reveal.CLASS_NAME = "ui reveal";

    Reveal.ATTRIBUTES = {
      type: {
        refreshDom: true,
        defaultValue: "fade",
        "enum": ["fade", "move", "rotate"],
        setter: function(value) {
          var oldValue;
          oldValue = this["_type"];
          if (oldValue && this._dom && oldValue !== value) {
            this.get$Dom().removeClass(oldValue);
          }
          this["_type"] = value;
        }
      },
      direction: {
        refreshDom: true,
        "enum": ["left", "right", "up", "down"],
        defaultValue: "left",
        setter: function(value) {
          var oldValue;
          oldValue = this["_direction"];
          if (oldValue && this._dom && oldValue !== value) {
            this.get$Dom().removeClass(oldValue);
          }
          this["_direction"] = value;
        }
      },
      active: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      instant: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      disabled: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      visibleContent: {
        refreshDom: true,
        setter: function(value) {
          this._setContent(value, "visibleContent");
          return this;
        }
      },
      hiddenContent: {
        refreshDom: true,
        setter: function(value) {
          this._setContent(value, "hiddenContent");
          return this;
        }
      }
    };

    Reveal.prototype._initDom = function(dom) {
      var container, el, k, key, l, len, len1, ref, ref1, ref2;
      Reveal.__super__._initDom.call(this, dom);
      ref = ["visibleContent", "hiddenContent"];
      for (k = 0, len = ref.length; k < len; k++) {
        container = ref[k];
        key = "_" + container;
        if ((ref1 = this[key]) != null ? ref1.length : void 0) {
          ref2 = this[key];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            el = ref2[l];
            this._render(el, container);
          }
        }
      }
    };

    Reveal.prototype._parseDom = function(dom) {
      var $child, child, results, widget, widget$Dom;
      if (!dom) {
        return;
      }
      if (this._doms == null) {
        this._doms = {};
      }
      child = dom.firstChild;
      results = [];
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget) {
            widget$Dom = widget.get$Dom();
            if (widget$Dom.has("visible content")) {
              this._visibleContent = widget;
            }
            if (widget$Dom.has("hidden content")) {
              this._hiddenContent = widget;
            }
          } else {
            $child = $(child);
            if ($child.has("visible content")) {
              this._doms.visibleContent = widget;
            }
            if ($child.has("hidden content")) {
              this._doms.hiddenContent = widget;
            }
          }
        }
        results.push(child = child.nextSibling);
      }
      return results;
    };

    Reveal.prototype._clearContent = function(target) {
      var el, k, len, old;
      old = this["_" + target];
      if (old) {
        for (k = 0, len = old.length; k < len; k++) {
          el = old[k];
          if (el instanceof cola.widget) {
            el.destroy();
          }
        }
        this["_" + target] = [];
      }
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._doms[target]) {
        $fly(this._doms[target]).empty();
      }
    };

    Reveal.prototype._setContent = function(value, target) {
      var el, k, len, result;
      this._clearContent(target);
      if (value instanceof Array) {
        for (k = 0, len = value.length; k < len; k++) {
          el = value[k];
          result = cola.xRender(el, this._scope);
          if (result) {
            this._addContentElement(result, target);
          }
        }
      } else {
        result = cola.xRender(value, this._scope);
        if (result) {
          this._addContentElement(result, target);
        }
      }
    };

    Reveal.prototype._makeContentDom = function(target) {
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms[target]) {
        this._doms[target] = document.createElement("div");
        this._doms[target].className = (target === "visibleContent" ? "visible" : "hidden") + " content";
        this._dom.appendChild(this._doms[target]);
      }
      return this._doms[target];
    };

    Reveal.prototype._addContentElement = function(element, target) {
      var name, targetList;
      name = "_" + target;
      if (this[name] == null) {
        this[name] = [];
      }
      targetList = this[name];
      targetList.push(element);
      if (element && this._dom) {
        this._render(element, target);
      }
    };

    Reveal.prototype._render = function(node, target) {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      if (!this._doms[target]) {
        this._makeContentDom(target);
      }
      dom = node;
      if (node instanceof cola.Widget) {
        dom = node.getDom();
      }
      if (dom.parentNode !== this._doms[target]) {
        this._doms[target].appendChild(dom);
      }
    };

    Reveal.prototype._doRefreshDom = function() {
      var classNamePool, direction, type;
      if (!this._dom) {
        return;
      }
      Reveal.__super__._doRefreshDom.call(this);
      classNamePool = this._classNamePool;
      ["active", "instant", "disabled"].forEach((function(_this) {
        return function(property) {
          var value;
          value = _this.get(property);
          return classNamePool.toggle(property, !!value);
        };
      })(this));
      type = this.get("type");
      if (type) {
        classNamePool.add(type);
      }
      direction = this.get("direction");
      if (direction) {
        classNamePool.add(direction);
      }
    };

    Reveal.prototype._getContentContainer = function(target) {
      if (!this._dom) {
        return;
      }
      if (!this._doms[target]) {
        this._makeContentDom(target);
      }
      return this._doms[target];
    };

    Reveal.prototype.getVisibleContentContainer = function() {
      return this._getContentContainer("visible");
    };

    Reveal.prototype.getHiddenContentContainer = function() {
      return this._getContentContainer("hidden");
    };

    return Reveal;

  })(cola.Widget);

}).call(this);
