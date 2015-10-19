(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  cola.AbstractItemGroup = (function(superClass) {
    extend(AbstractItemGroup, superClass);

    AbstractItemGroup.ATTRIBUTES = {
      items: {
        setter: function(value) {
          var item, j, len;
          this.clearItems();
          for (j = 0, len = value.length; j < len; j++) {
            item = value[j];
            this.addItem(item);
          }
          return this;
        }
      },
      currentIndex: {
        type: "boolean",
        defaultValue: -1,
        setter: function(value) {
          this.setCurrentIndex(value);
          return this;
        }
      }
    };

    function AbstractItemGroup(config) {
      this._items = [];
      AbstractItemGroup.__super__.constructor.call(this, config);
    }

    AbstractItemGroup.prototype.getContentContainer = function() {
      return this.getDom();
    };

    AbstractItemGroup.prototype.getItems = function() {
      return this._items;
    };

    AbstractItemGroup.prototype.getItemDom = function(item) {
      var itemConfig, itemDom;
      itemConfig = item;
      if (typeof item === "number") {
        itemConfig = this._items[item];
      }
      if (itemConfig instanceof cola.Widget) {
        itemDom = itemConfig.getDom();
      } else if (itemConfig.nodeType === 1) {
        itemDom = itemConfig;
      }
      return itemDom;
    };

    AbstractItemGroup.prototype._addItemToDom = function(item) {
      var container, itemDom;
      container = this.getContentContainer();
      itemDom = this.getItemDom(item);
      if (itemDom.parentNode !== container) {
        container.appendChild(itemDom);
      }
    };

    AbstractItemGroup.prototype._itemsRender = function() {
      var item, j, len, ref;
      if (!this._items) {
        return;
      }
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        this._addItemToDom(item);
      }
    };

    AbstractItemGroup.prototype.setCurrentIndex = function(index) {
      var newItemDom, oldItemDom;
      if (this._currentIndex == null) {
        this._currentIndex = -1;
      }
      if (this._currentIndex === index) {
        return this;
      }
      if (this._currentIndex > -1) {
        oldItemDom = this.getItemDom(this._currentIndex);
        if (oldItemDom) {
          $(oldItemDom).removeClass("active");
        }
      }
      if (index > -1) {
        newItemDom = this.getItemDom(index);
        if (newItemDom) {
          $(newItemDom).addClass("active");
        }
      }
      this._currentIndex = index;
      return this;
    };

    AbstractItemGroup.prototype._doOnItemsChange = function() {
      return cola.util.delay(this, "_refreshItems", 50, this.refreshItems);
    };

    AbstractItemGroup.prototype.refreshItems = function() {
      cola.util.cancelDelay(this, "_refreshItems");
      return this;
    };

    AbstractItemGroup.prototype.addItem = function(config) {
      var active, item;
      item = cola.xRender(config, this._scope);
      if (!item) {
        return this;
      }
      active = cola.util.hasClass(item, "active");
      this._items.push(item);
      this._addItemToDom(item);
      if (active) {
        this.setCurrentIndex(this._items.indexOf(item));
      }
      this._doOnItemsChange();
      return item;
    };

    AbstractItemGroup.prototype.clearItems = function() {
      var item, j, len, ref;
      if (this._items.length === 0) {
        return this;
      }
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item instanceof cola.Widget) {
          item.destroy();
        } else {
          $(item).remove();
        }
      }
      this._items = [];
      this._doOnItemsChange();
      return this;
    };

    AbstractItemGroup.prototype.removeItem = function(item) {
      var index, itemObj;
      if (typeof item === "number") {
        itemObj = this._items[item];
        index = item;
      } else {
        itemObj = item;
        index = this._items.indexOf(item);
      }
      this._items.splice(index, 1);
      if (itemObj instanceof cola.Widget) {
        itemObj.destroy();
      } else {
        $(itemObj).remove();
      }
      this._doOnItemsChange();
      return itemObj;
    };

    AbstractItemGroup.prototype.destroy = function() {
      cola.util.cancelDelay(this, "_refreshItems");
      this.clearItems();
      delete this._items;
      return AbstractItemGroup.__super__.destroy.call(this);
    };

    return AbstractItemGroup;

  })(cola.Widget);

  if (cola.breadcrumb == null) {
    cola.breadcrumb = {};
  }

  cola.breadcrumb.Section = (function(superClass) {
    extend(Section, superClass);

    function Section() {
      return Section.__super__.constructor.apply(this, arguments);
    }

    Section.CLASS_NAME = "section";

    Section.TAG_NAME = "a";

    Section.ATTRIBUTES = {
      text: {
        refreshDom: true
      },
      active: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      href: {
        refreshDom: true
      },
      target: {
        refreshDom: true
      }
    };

    Section.prototype._parseDom = function(dom) {
      var href, target, text;
      if (!this._text) {
        text = cola.util.getTextChildData(dom);
        if (text) {
          this._text = text;
        }
      }
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
    };

    Section.prototype._doRefreshDom = function() {
      var $dom, text;
      if (!this._dom) {
        return;
      }
      Section.__super__._doRefreshDom.call(this);
      text = this.get("text");
      this.get$Dom().text(text || "");
      this._classNamePool.toggle("active", this._active);
      $dom = this.get$Dom();
      if (this._href) {
        $dom.attr("href", this._href);
      } else {
        $dom.removeAttr("href");
      }
      $dom.attr("target", this._target || "");
    };

    return Section;

  })(cola.Widget);

  cola.Breadcrumb = (function(superClass) {
    extend(Breadcrumb, superClass);

    function Breadcrumb() {
      return Breadcrumb.__super__.constructor.apply(this, arguments);
    }

    Breadcrumb.CHILDREN_TYPE_NAMESPACE = "breadcrumb";

    Breadcrumb.CLASS_NAME = "breadcrumb";

    Breadcrumb.ATTRIBUTES = {
      divider: {
        "enum": ["chevron", "slash"],
        defaultValue: "chevron"
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
          return this;
        }
      },
      sections: {
        refreshDom: true,
        setter: function(value) {
          var j, len, section;
          this.clear();
          for (j = 0, len = value.length; j < len; j++) {
            section = value[j];
            this.addSection(section);
          }
          return this;
        }
      },
      currentIndex: {
        type: "number",
        setter: function(value) {
          this._currentIndex = value;
          return this.setCurrent(value);
        },
        getter: function() {
          if (this._current && this._sections) {
            return this._sections.indexOf(this._current);
          } else {
            return -1;
          }
        }
      }
    };

    Breadcrumb.EVENTS = {
      sectionClick: null,
      change: null
    };

    Breadcrumb.prototype._initDom = function(dom) {
      var active, activeSection, j, len, ref, ref1, section;
      Breadcrumb.__super__._initDom.call(this, dom);
      if ((ref = this._sections) != null ? ref.length : void 0) {
        ref1 = this._sections;
        for (j = 0, len = ref1.length; j < len; j++) {
          section = ref1[j];
          this._rendSection(section);
          if (section.get("active")) {
            active = section;
          }
        }
        if (active) {
          this._doChange(active);
        }
      }
      activeSection = (function(_this) {
        return function(targetDom) {
          _this.fire("sectionClick", _this, {
            sectionDom: targetDom
          });
          return _this._doChange(targetDom);
        };
      })(this);
      return this.get$Dom().delegate(">.section", "click", function(event) {
        return activeSection(this, event);
      });
    };

    Breadcrumb.prototype._parseDom = function(dom) {
      var child, section, sectionConfig;
      if (!dom) {
        return;
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          section = cola.widget(child);
          if (!section && cola.util.hasClass(child, "section")) {
            sectionConfig = {
              dom: child
            };
            if (cola.util.hasClass(child, "active")) {
              sectionConfig.active = true;
            }
            section = new cola.breadcrumb.Section(sectionConfig);
          }
          if (section instanceof cola.breadcrumb.Section) {
            this.addSection(section);
          }
        }
        child = child.nextSibling;
      }
    };

    Breadcrumb.prototype._doRefreshDom = function() {
      var size;
      if (!this._dom) {
        return;
      }
      Breadcrumb.__super__._doRefreshDom.call(this);
      size = this.get("size");
      if (size) {
        this._classNamePool.add(size);
      }
    };

    Breadcrumb.prototype._makeDivider = function() {
      var divider;
      divider = this.get("divider");
      if (divider === "chevron") {
        return $.xCreate({
          tagName: "i",
          "class": "right chevron icon divider"
        });
      } else {
        return $.xCreate({
          tagName: "div",
          "class": "divider",
          content: "/"
        });
      }
    };

    Breadcrumb.prototype._rendSection = function(section) {
      var divider, index, prev, sectionDom;
      index = this._sections.indexOf(section);
      if (this._dividers == null) {
        this._dividers = [];
      }
      sectionDom = section.getDom();
      if (sectionDom.parentNode !== this._dom) {
        if (this._dividers.length < index) {
          divider = this._makeDivider();
          this._dividers.push(divider);
          this._dom.appendChild(divider);
        }
        this._dom.appendChild(section.getDom());
      } else if (index > 0) {
        prev = sectionDom.previousElementSibling;
        if (prev && !cola.util.hasClass(prev, "divider")) {
          divider = this._makeDivider();
          this._dividers.push(divider);
          section.get$Dom().before(divider);
        }
      }
    };

    Breadcrumb.prototype._doChange = function(section) {
      var j, len, ref, s, targetDom, targetSection;
      if (section.nodeType === 1) {
        targetDom = section;
      } else if (section instanceof cola.breadcrumb.Section) {
        targetDom = section.getDom();
      } else {
        return;
      }
      $(">.section.active", this._dom).each(function(index, itemDom) {
        if (itemDom !== targetDom) {
          section = cola.widget(itemDom);
          if (section) {
            section.set("active", false);
          } else {
            $fly(itemDom).removeClass("active");
          }
        }
      });
      targetSection = cola.widget(targetDom);
      ref = this._sections;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        if (s !== targetSection) {
          s.set("active", false);
        }
      }
      this._current = targetSection;
      if (targetSection) {
        targetSection.set("active", true);
      } else {
        $fly(targetDom).addClass("active");
      }
      if (this._rendered) {
        this.fire("change", this, {
          currentDom: targetDom
        });
      }
    };

    Breadcrumb.prototype.addSection = function(config) {
      var active, section;
      if (this._destroyed) {
        return this;
      }
      if (this._sections == null) {
        this._sections = [];
      }
      if (config instanceof cola.breadcrumb.Section) {
        section = config;
      } else if (typeof config === "string") {
        section = new cola.breadcrumb.Section({
          text: config
        });
      } else if (config.constructor === Object.prototype.constructor) {
        section = new cola.breadcrumb.Section(config);
      }
      if (section) {
        this._sections.push(section);
        if (this._dom) {
          this._rendSection(section);
        }
        active = section.get("active");
        if (active) {
          this._doChange(section);
        }
      }
      return this;
    };

    Breadcrumb.prototype.removeSection = function(section) {
      if (!this._sections) {
        return this;
      }
      if (typeof section === "number") {
        section = this._sections[section];
      }
      if (section) {
        this._doRemove(section);
      }
      return this;
    };

    Breadcrumb.prototype._doRemove = function(section) {
      var dIndex, divider, index;
      index = this._sections.indexOf(section);
      if (index > -1) {
        this._sections.splice(index, 1);
        step.remove();
        if (index > 0 && this._dividers) {
          dIndex = index - 1;
          divider = this._dividers[dIndex];
          $(divider).remove();
          this._dividers.splice(dIndex, 1);
        }
      }
    };

    Breadcrumb.prototype.clear = function() {
      if (!this._sections) {
        return this;
      }
      if (this._dom) {
        this.get$Dom().empty();
      }
      if (this._sections.length) {
        this._sections = [];
      }
      return this;
    };

    Breadcrumb.prototype.getSection = function(index) {
      var el, j, len, section, sections;
      sections = this._sections || [];
      if (typeof index === "number") {
        section = sections[index];
      } else if (typeof index === "string") {
        for (j = 0, len = sections.length; j < len; j++) {
          el = sections[j];
          if (index === el.get("text")) {
            section = el;
            break;
          }
        }
      }
      return section;
    };

    Breadcrumb.prototype.setCurrent = function(section) {
      var currentSection;
      if (section instanceof cola.breadcrumb.Section) {
        currentSection = section;
      } else {
        currentSection = this.getSection(section);
      }
      if (currentSection) {
        this._doChange(currentSection);
      }
      return this;
    };

    Breadcrumb.prototype.getCurrent = function() {
      return this._current;
    };

    Breadcrumb.prototype.getCurrentIndex = function() {
      if (this._cuurent) {
        return this._sections.indexOf(this._current);
      }
    };

    Breadcrumb.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      Breadcrumb.__super__.destroy.call(this);
      delete this._current;
      delete this._sections;
      delete this._dividers;
    };

    return Breadcrumb;

  })(cola.Widget);

  cola.registerType("breadcrumb", "_default", cola.breadcrumb.Section);

  cola.registerType("breadcrumb", "section", cola.breadcrumb.Section);

  cola.registerTypeResolver("breadcrumb", function(config) {
    return cola.resolveType("widget", config);
  });

  cola.CardBook = (function(superClass) {
    extend(CardBook, superClass);

    function CardBook() {
      return CardBook.__super__.constructor.apply(this, arguments);
    }

    CardBook.CLASS_NAME = "card-book";

    CardBook.EVENTS = {
      beforeChange: null,
      change: null
    };

    CardBook.prototype._parseDom = function(dom) {
      var child;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (cola.util.hasClass(child, "item")) {
            if (child.nodeType === 1) {
              this.addItem(child);
            }
          }
        }
        child = child.nextSibling;
      }
      return null;
    };

    CardBook.prototype._initDom = function(dom) {
      CardBook.__super__._initDom.call(this, dom);
      if (this._items) {
        this._itemsRender();
      }
    };

    CardBook.prototype.setCurrentIndex = function(index) {
      var arg, newItem, newItemDom, oldItem, oldItemDom;
      if (this._currentIndex == null) {
        this._currentIndex = -1;
      }
      if (this._currentIndex === index) {
        return this;
      }
      arg = {};
      if (this._currentIndex > -1) {
        oldItem = this._items[this._currentIndex];
        oldItemDom = this.getItemDom(this._currentIndex);
      }
      if (index > -1) {
        newItem = this._items[index];
        newItemDom = this.getItemDom(index);
      }
      arg = {
        oldItem: oldItem,
        newItem: newItem
      };
      if (this.fire("beforeChange", this, arg) === false) {
        return this;
      }
      if (oldItemDom) {
        $(oldItemDom).removeClass("active");
      }
      if (newItemDom) {
        $(newItemDom).addClass("active");
      }
      this._currentIndex = index;
      this.fire("change", this, arg);
      return this;
    };

    return CardBook;

  })(cola.AbstractItemGroup);

  cola.Carousel = (function(superClass) {
    extend(Carousel, superClass);

    function Carousel() {
      return Carousel.__super__.constructor.apply(this, arguments);
    }

    Carousel.CLASS_NAME = "carousel";

    Carousel.ATTRIBUTES = {
      bind: {
        readonlyAfterCreate: true,
        setter: function(bindStr) {
          return this._bindSetter(bindStr);
        }
      },
      orientation: {
        defaultValue: "horizontal",
        "enum": ["horizontal", "vertical"]
      },
      controls: {
        defaultValue: true
      },
      pause: {
        defaultValue: 3000
      }
    };

    Carousel.EVENTS = {
      change: null
    };

    Carousel.prototype.getContentContainer = function() {
      if (!this._doms.wrap) {
        this._createItemsWrap(dom);
      }
      return this._doms.wrap;
    };

    Carousel.prototype._parseDom = function(dom) {
      var child, doms, parseItem;
      parseItem = (function(_this) {
        return function(node) {
          var childNode;
          _this._items = [];
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              _this.addItem(childNode);
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      doms = this._doms;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (cola.util.hasClass(child, "items-wrap")) {
            doms.wrap = child;
            parseItem(child);
          } else if (!doms.indicators && cola.util.hasClass(child, "indicators")) {
            doms.indicators = child;
          } else if (child.nodeName === "TEMPLATE") {
            this._regTemplate(child);
          }
        }
        child = child.nextSibling;
      }
      if (!doms.indicators) {
        this._createIndicatorContainer(dom);
      }
      if (!doms.wrap) {
        this._createItemsWrap(dom);
      }
    };

    Carousel.prototype._createIndicatorContainer = function(dom) {
      var carousel;
      if (this._doms == null) {
        this._doms = {};
      }
      this._doms.indicators = $.xCreate({
        tagName: "div",
        "class": "indicators indicators-" + this._orientation,
        contextKey: "indicators"
      });
      carousel = this;
      dom.appendChild(this._doms.indicators);
      $(this._doms.indicators).delegate(">span", "click", function() {
        return carousel.goTo($fly(this).index());
      });
      return null;
    };

    Carousel.prototype._createItemsWrap = function(dom) {
      if (this._doms == null) {
        this._doms = {};
      }
      this._doms.wrap = $.xCreate({
        tagName: "div",
        "class": "items-wrap",
        contextKey: "wrap"
      });
      dom.appendChild(this._doms.wrap);
      return null;
    };

    Carousel.prototype._initDom = function(dom) {
      var carousel, template;
      if (!this._doms.indicators) {
        this._createIndicatorContainer(dom);
      }
      if (!this._doms.wrap) {
        this._createItemsWrap(dom);
      }
      template = this._getTemplate();
      if (template) {
        if (this._bindStr) {
          $fly(template).attr("c-repeat", this._bindStr);
        }
        this._doms.wrap.appendChild(template);
        cola.xRender(template, this._scope);
      }
      if (this._items) {
        this._itemsRender();
        this.refreshIndicators();
      }
      this.setCurrentIndex(0);
      carousel = this;
      setTimeout(function() {
        return carousel._scroller = new Swipe(carousel._dom, {
          vertical: carousel._orientation === "vertical",
          disableScroll: false,
          continuous: true,
          callback: function(pos) {
            carousel.setCurrentIndex(pos);
          }
        });
      }, 0);
      if (this._controls) {
        dom.appendChild($.xCreate({
          tagName: "div",
          "class": "controls",
          content: [
            {
              tagName: "A",
              "class": "prev",
              click: (function(_this) {
                return function() {
                  _this.replay();
                  return carousel.previous();
                };
              })(this)
            }, {
              tagName: "A",
              "class": "next",
              click: (function(_this) {
                return function() {
                  _this.replay();
                  return carousel.next();
                };
              })(this)
            }
          ]
        }));
      }
    };

    Carousel.prototype.setCurrentIndex = function(index) {
      var activeSpan, e, pos;
      this.fire("change", this, {
        index: index
      });
      this._currentIndex = index;
      if (this._dom) {
        if (this._doms.indicators) {
          try {
            $(".active", this._doms.indicators).removeClass("active");
            activeSpan = this._doms.indicators.children[index];
            if (activeSpan != null) {
              activeSpan.className = "active";
            }
          } catch (_error) {
            e = _error;
          }
        }
        if (this._scroller) {
          pos = this._scroller.getPos();
          if (pos !== index) {
            this._scroller.slide(index);
          }
        }
      }
      return this;
    };

    Carousel.prototype.refreshIndicators = function() {
      var currentIndex, i, indicatorCount, itemsCount, ref, ref1, span;
      itemsCount = (ref = this._items) != null ? ref.length : void 0;
      if (!((ref1 = this._doms) != null ? ref1.indicators : void 0)) {
        return;
      }
      indicatorCount = this._doms.indicators.children.length;
      if (indicatorCount < itemsCount) {
        i = indicatorCount;
        while (i < itemsCount) {
          span = document.createElement("span");
          this._doms.indicators.appendChild(span);
          i++;
        }
      } else if (indicatorCount > itemsCount) {
        i = itemsCount;
        while (i < indicatorCount) {
          $(this._doms.indicators.firstChild).remove();
          i++;
        }
      }
      if (this._currentIndex == null) {
        this._currentIndex = -1;
      }
      currentIndex = this._currentIndex;
      $("span", this._doms.indicators).removeClass("active");
      if (currentIndex !== -1) {
        jQuery("span:nth-child(" + (currentIndex + 1) + ")", this._doms.indicators).addClass("indicator-active");
      }
      return this;
    };

    Carousel.prototype.next = function() {
      var pos;
      if (this._scroller) {
        pos = this._scroller.getPos();
        if (pos === (this._items.length - 1)) {
          this.goTo(0);
        } else {
          this._scroller.next();
        }
      }
      return this;
    };

    Carousel.prototype.previous = function() {
      var pos;
      if (this._scroller) {
        pos = this._scroller.getPos();
        if (pos === 0) {
          this.goTo(this._items.length - 1);
        } else {
          this._scroller.prev();
        }
      }
      return this;
    };

    Carousel.prototype.refreshItems = function() {
      var ref;
      Carousel.__super__.refreshItems.call(this);
      if ((ref = this._scroller) != null) {
        ref.refresh();
      }
      this.refreshIndicators();
      this.setCurrentIndex(0);
      return this;
    };

    Carousel.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Carousel.__super__._doRefreshDom.call(this);
      this._classNamePool.add("carousel-" + this._orientation);
      this.refreshIndicators();
    };

    Carousel.prototype._onItemsRefresh = function(arg) {
      return this._itemDomsChanged();
    };

    Carousel.prototype._onItemInsert = function(arg) {
      return this._itemDomsChanged();
    };

    Carousel.prototype._onItemRemove = function(arg) {
      return this._itemDomsChanged();
    };

    Carousel.prototype._itemDomsChanged = function() {
      setTimeout((function(_this) {
        return function() {
          _this._parseDom(_this._dom);
        };
      })(this), 0);
    };

    Carousel.prototype.play = function(pause) {
      var carousel;
      if (this._interval) {
        clearInterval(this._interval);
      }
      carousel = this;
      if (pause) {
        this._pause = pause;
      }
      this._interval = setInterval(function() {
        return carousel.next();
      }, this._pause);
      return this;
    };

    Carousel.prototype.replay = function() {
      if (this._interval) {
        return this.play();
      }
    };

    Carousel.prototype.pause = function() {
      if (this._interval) {
        clearInterval(this._interval);
      }
      return this;
    };

    Carousel.prototype.goTo = function(index) {
      if (index == null) {
        index = 0;
      }
      this.replay();
      return this.setCurrentIndex(index);
    };

    return Carousel;

  })(cola.AbstractItemGroup);

  cola.Element.mixin(cola.Carousel, cola.TemplateSupport);

  cola.Element.mixin(cola.Carousel, cola.DataItemsWidgetMixin);

  if (cola.menu == null) {
    cola.menu = {};
  }

  cola.menu.AbstractMenuItem = (function(superClass) {
    extend(AbstractMenuItem, superClass);

    function AbstractMenuItem() {
      return AbstractMenuItem.__super__.constructor.apply(this, arguments);
    }

    AbstractMenuItem.ATTRIBUTES = {
      parent: null,
      active: {
        type: "boolean",
        defaultValue: false,
        setter: function(value) {
          var oldValue;
          oldValue = this._active;
          this._active = value;
          if (oldValue !== value && value) {
            return this.onActive(this);
          }
        },
        getter: function() {
          if (!this._active && this._rendered) {
            this._active = this.get$Dom().hasClass("active");
          }
          return this._active;
        }
      }
    };

    AbstractMenuItem.prototype.onItemClick = function(event, item) {
      var parentMenu;
      parentMenu = this._parent;
      if (parentMenu instanceof cola.Menu) {
        parentMenu.onItemClick(event, item);
      }
    };

    AbstractMenuItem.prototype.onActive = function(item) {
      var parentMenu;
      parentMenu = this._parent;
      if (parentMenu instanceof cola.Menu) {
        return parentMenu.setActiveItem(item);
      }
    };

    AbstractMenuItem.prototype.getParent = function() {
      return this._parent;
    };

    AbstractMenuItem.prototype.hasSubMenu = function() {
      return !!this._subMenu;
    };

    AbstractMenuItem.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      AbstractMenuItem.__super__.destroy.call(this);
      return delete this._parent;
    };

    return AbstractMenuItem;

  })(cola.AbstractContainer);

  cola.menu.MenuItem = (function(superClass) {
    extend(MenuItem, superClass);

    function MenuItem() {
      return MenuItem.__super__.constructor.apply(this, arguments);
    }

    MenuItem.CLASS_NAME = "item";

    MenuItem.TAG_NAME = "a";

    MenuItem.ATTRIBUTES = {
      caption: {
        refreshDom: true
      },
      icon: {
        refreshDom: true
      },
      href: {
        refreshDom: true
      },
      target: {
        refreshDom: true
      },
      items: {
        setter: function(value) {
          return this._resetSubMenu(value);
        },
        getter: function() {
          var ref;
          return (ref = this._subMenu) != null ? ref.get("items") : void 0;
        }
      }
    };

    MenuItem.prototype._parseDom = function(dom) {
      var child, subMenu;
      child = dom.firstChild;
      if (this._doms == null) {
        this._doms = {};
      }
      while (child) {
        if (child.nodeType === 1) {
          subMenu = cola.widget(child);
          if (subMenu instanceof cola.Menu) {
            this._subMenu = subMenu;
            subMenu._isSubMemu = true;
          } else if (child.nodeName === "I") {
            this._doms.iconDom = child;
            if (this._icon == null) {
              this._icon = child.className;
            }
          } else if (cola.util.hasClass(child, "caption")) {
            this._doms.captionDom = child;
          }
        }
        child = child.nextSibling;
      }
      if (!this._doms.captionDom) {
        this._doms.captionDom = $.xCreate({
          tagName: "span",
          content: this._caption || ""
        });
        if (this._doms.iconDom) {
          $fly(this._doms.iconDom).after(this._doms.captionDom);
        } else {
          $fly(dom).prepend(this._doms.captionDom);
        }
      }
    };

    MenuItem.prototype._initDom = function(dom) {
      var subMenuDom;
      MenuItem.__super__._initDom.call(this, dom);
      if (this._$dom == null) {
        this._$dom = $(dom);
      }
      this._$dom.click((function(_this) {
        return function(event) {
          if (_this._subMenu) {
            return;
          }
          return _this.onItemClick(event, _this);
        };
      })(this));
      if (this._subMenu) {
        subMenuDom = this._subMenu.getDom();
        if (subMenuDom.parentNode !== dom) {
          dom.appendChild(subMenuDom);
        }
      }
    };

    MenuItem.prototype._setDom = function(dom, parseChild) {
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
      return MenuItem.__super__._setDom.call(this, dom, parseChild);
    };

    MenuItem.prototype._createDom = function() {
      var caption, icon;
      icon = this.get("icon") || "";
      caption = this.get("caption") || "";
      return $.xCreate({
        tagName: "A",
        "class": this.constructor.CLASS_NAME,
        content: [
          {
            tagName: "span",
            content: caption,
            contextKey: "captionDom"
          }
        ]
      }, this._doms);
    };

    MenuItem.prototype._refreshIcon = function() {
      var $dom;
      $dom = this.get$Dom();
      if (this._icon && !this._caption) {
        this._classNamePool.add("icon");
      }
      if (this._icon) {
        if (!this._doms.iconDom) {
          this._doms.iconDom = $.xCreate({
            tagName: "i",
            "class": "icon"
          });
        }
        if (this._doms.iconDom.parentNode !== this._dom) {
          $dom.prepend(this._doms.iconDom);
        }
        return $fly(this._doms.iconDom).addClass(this._icon);
      } else {
        return $fly(this._doms.iconDom).remove();
      }
    };

    MenuItem.prototype._doRefreshDom = function() {
      var $dom, subMenuDom;
      if (!this._dom) {
        return;
      }
      MenuItem.__super__._doRefreshDom.call(this);
      $dom = this.get$Dom();
      $dom.find(">.ui.menu").removeClass("ui");
      this._refreshIcon();
      $fly(this._doms.captionDom).text(this._caption || "");
      if (this._subMenu) {
        subMenuDom = this._subMenu.getDom();
        if (subMenuDom.parentNode !== this._dom) {
          this._dom.appendChild(subMenuDom);
        }
      }
      if (this._href) {
        $dom.attr("href", this._href);
      } else {
        $dom.removeAttr("href");
      }
      $dom.attr("target", this._target || "");
    };

    MenuItem.prototype._resetSubMenu = function(config) {
      var ref;
      if ((ref = this._subMenu) != null) {
        ref.destroy();
      }
      if (config) {
        this._subMenu = new cola.Menu({
          items: config
        });
        this._subMenu._parent = this;
        return this._subMenu._isSubMemu = true;
      } else {
        return delete this._subMenu;
      }
    };

    MenuItem.prototype.destroy = function() {
      var ref;
      if (this._destroyed) {
        return;
      }
      if ((ref = this._subMenu) != null) {
        ref.destroy();
      }
      return MenuItem.__super__.destroy.call(this);
    };

    return MenuItem;

  })(cola.menu.AbstractMenuItem);

  cola.menu.DropdownMenuItem = (function(superClass) {
    extend(DropdownMenuItem, superClass);

    function DropdownMenuItem() {
      return DropdownMenuItem.__super__.constructor.apply(this, arguments);
    }

    DropdownMenuItem.CLASS_NAME = "dropdown item";

    DropdownMenuItem.ATTRIBUTES = {
      icon: {
        refreshDom: true,
        defaultValue: "dropdown"
      }
    };

    DropdownMenuItem.prototype._createDom = function() {
      var caption;
      caption = this.get("caption") || "";
      return $.xCreate({
        tagName: "DIV",
        "class": this.constructor.CLASS_NAME,
        content: [
          {
            tagName: "span",
            content: caption,
            contextKey: "captionDom"
          }, {
            tagName: "i",
            "class": "dropdown icon",
            contextKey: "iconDom"
          }
        ]
      }, this._doms);
    };

    DropdownMenuItem.prototype._refreshIcon = function() {
      if (!this._doms.iconDom) {
        this._doms.iconDom = document.createElement("i");
        this._dom.appendChild(this._doms.iconDom);
      }
      return this._doms.iconDom.className = (this._icon || "dropdown") + " icon";
    };

    return DropdownMenuItem;

  })(cola.menu.MenuItem);

  cola.menu.ControlMenuItem = (function(superClass) {
    extend(ControlMenuItem, superClass);

    function ControlMenuItem() {
      return ControlMenuItem.__super__.constructor.apply(this, arguments);
    }

    ControlMenuItem.CLASS_NAME = "item";

    ControlMenuItem.ATTRIBUTES = {
      control: {
        setter: function(value) {
          var control;
          $fly(this._control).remove();
          control = cola.xRender(value);
          this._control = control;
          if (control && this._dom) {
            this._dom.appendChild(control);
          }
          return this;
        }
      }
    };

    ControlMenuItem.prototype._parseDom = function(dom) {
      var child, widget;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget) {
            this._control = widget;
            break;
          }
        }
        child = child.nextSibling;
      }
    };

    ControlMenuItem.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      ControlMenuItem.__super__._doRefreshDom.call(this);
      return this._classNamePool.remove("ui");
    };

    ControlMenuItem.prototype._setDom = function(dom, parseChild) {
      var control;
      ControlMenuItem.__super__._setDom.call(this, dom, parseChild);
      control = this._control;
      if (!control) {
        return;
      }
      if (control instanceof cola.RenderableElement) {
        dom.appendChild(control.getDom());
      } else if (control.nodeType === 1) {
        dom.appendChild(control);
      }
    };

    return ControlMenuItem;

  })(cola.menu.AbstractMenuItem);

  cola.menu.HeaderMenuItem = (function(superClass) {
    extend(HeaderMenuItem, superClass);

    function HeaderMenuItem() {
      return HeaderMenuItem.__super__.constructor.apply(this, arguments);
    }

    HeaderMenuItem.CLASS_NAME = "header item";

    HeaderMenuItem.ATTRIBUTES = {
      text: null
    };

    HeaderMenuItem.prototype._setDom = function(dom, parseChild) {
      HeaderMenuItem.__super__._setDom.call(this, dom, parseChild);
      if (this._text) {
        this.get$Dom(this._text);
      }
    };

    HeaderMenuItem.prototype._doRefreshDom = function() {
      var text;
      if (!this._dom) {
        return;
      }
      HeaderMenuItem.__super__._doRefreshDom.call(this);
      this._classNamePool.remove("ui");
      text = this.get("text") || "";
      this.get$Dom().text(text);
    };

    return HeaderMenuItem;

  })(cola.menu.AbstractMenuItem);

  cola.Menu = (function(superClass) {
    extend(Menu, superClass);

    function Menu() {
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.CLASS_NAME = "ui menu";

    Menu.CHILDREN_TYPE_NAMESPACE = "menu";

    Menu.SEMANTIC_CLASS = ["top fixed", "right fixed", "bottom fixed", "left fixed"];

    Menu.ATTRIBUTES = {
      items: {
        setter: function(value) {
          var item, j, len, results;
          if (this["_items"]) {
            this.clearItems();
          }
          if (value) {
            results = [];
            for (j = 0, len = value.length; j < len; j++) {
              item = value[j];
              results.push(this.addItem(item));
            }
            return results;
          }
        }
      },
      showActivity: {
        type: "boolean",
        defaultValue: true
      },
      rightItems: {
        setter: function(value) {
          var item, j, len, results;
          if (this["_rightItems"]) {
            this.clearRightItems();
          }
          if (value) {
            results = [];
            for (j = 0, len = value.length; j < len; j++) {
              item = value[j];
              results.push(this.addRightItem(item));
            }
            return results;
          }
        }
      },
      centered: {
        type: "boolean",
        defaultValue: false
      }
    };

    Menu.EVENTS = {
      itemClick: null
    };

    Menu.prototype._parseDom = function(dom) {
      var container, parseItems, parseRightMenu;
      if (this._items == null) {
        this._items = [];
      }
      parseRightMenu = (function(_this) {
        return function(node) {
          var childNode, menuItem;
          childNode = node.firstChild;
          if (_this._rightItems == null) {
            _this._rightItems = [];
          }
          while (childNode) {
            if (childNode.nodeType === 1) {
              menuItem = cola.widget(childNode);
              if (menuItem) {
                _this.addRightItem(menuItem);
              } else if (cola.util.hasClass(childNode, "item")) {
                menuItem = new cola.menu.MenuItem({
                  dom: childNode
                });
                _this.addRightItem(menuItem);
              }
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      parseItems = (function(_this) {
        return function(node) {
          var childNode, menuItem;
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              menuItem = cola.widget(childNode);
              if (menuItem) {
                _this.addItem(menuItem);
              } else if (!_this._rightMenuDom && cola.util.hasClass(childNode, "right menu")) {
                _this._rightMenuDom = childNode;
                parseRightMenu(childNode);
              } else if (cola.util.hasClass(childNode, "item")) {
                menuItem = new cola.menu.MenuItem({
                  dom: childNode
                });
                _this.addItem(menuItem);
              }
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      container = $(dom).find(">.container");
      if (container.length) {
        this._centered = true;
        this._containerDom = container[0];
        parseItems(this._containerDom);
      } else {
        parseItems(dom);
      }
    };

    Menu.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      Menu.__super__._doRefreshDom.call(this);
      $(this._containerDom).toggleClass("ui container", !!this._centered);
      if (this._isSubMemu) {
        this._classNamePool.remove("ui");
      }
    };

    Menu.prototype._initDom = function(dom) {
      var container, item, itemDom, j, k, len, len1, menu, menuItems, rItemDom, rightMenuItems;
      menuItems = this._items;
      rightMenuItems = this._rightItems;
      menu = this;
      if (menuItems) {
        container = this._getItemsContainer();
        for (j = 0, len = menuItems.length; j < len; j++) {
          item = menuItems[j];
          itemDom = item.getDom();
          if (itemDom.parentNode !== container) {
            container.appendChild(itemDom);
          }
        }
      }
      if (rightMenuItems) {
        if (!this._rightMenuDom) {
          this._rightMenuDom = this._createRightMenu();
          dom.appendChild(this._rightMenuDom);
        }
        for (k = 0, len1 = rightMenuItems.length; k < len1; k++) {
          item = rightMenuItems[k];
          rItemDom = item.getDom();
          if (rItemDom.parentNode !== this._rightMenuDom) {
            this._rightMenuDom.appendChild(rItemDom);
          }
        }
      }
      $(dom).prepend($.xCreate({
        tagName: "div",
        "class": "left-items"
      })).hover(function() {
        return menu._bindToSemantic();
      }).delegate(">.item,.right.menu>.item", "click", function() {
        return menu._setActive(this);
      });
      setTimeout(function() {
        menu._bindToSemantic();
      }, 300);
    };

    Menu.prototype._bindToSemantic = function() {
      var $dom;
      if (this._parent instanceof cola.menu.MenuItem) {
        return;
      }
      $dom = this.get$Dom();
      $dom.find(">.dropdown.item,.right.menu>.dropdown.item").each((function(_this) {
        return function(index, item) {
          var $item;
          $item = $(item);
          if ($item.hasClass("c-dropdown")) {
            return;
          }
          $item.addClass("c-dropdown");
          $item.find(".dropdown.item").addClass("c-dropdown");
          return $item.dropdown({
            on: "hover"
          });
        };
      })(this));
    };

    Menu.prototype._setDom = function(dom, parseChild) {
      Menu.__super__._setDom.call(this, dom, parseChild);
      if (this._activeItem) {
        this._setActive(this._activeItem.getDom());
      }
    };

    Menu.prototype.setActiveItem = function(item) {
      if (!item.get("active")) {
        item.set("active", true);
      }
      this._activeItem = item;
      if (this._rendered) {
        this._setActive(item.getDom());
      }
    };

    Menu.prototype.getActiveItem = function() {
      return this._activeItem;
    };

    Menu.prototype._setActive = function(itemDom) {
      if (this._parent && this._parent instanceof cola.menu.DropdownMenuItem) {
        return;
      }
      if (!this._showActivity) {
        return;
      }
      $(">a.item:not(.dropdown),.right.menu>a.item:not(.dropdown)", this._dom).each(function() {
        if (itemDom === this) {
          $fly(this).addClass("active");
        } else {
          $fly(this).removeClass("active").find(".item").removeClass("active");
        }
      });
      if ($fly(itemDom).hasClass("dropdown")) {
        return;
      }
      if ($(">.menu", itemDom).length && !this._isSubMemu) {
        $fly(itemDom).removeClass("active");
      }
    };

    Menu.prototype._getItemsContainer = function() {
      if (this._centered) {
        if (!this._containerDom) {
          this._containerDom = $.xCreate({
            tagName: "div",
            "class": "container"
          });
          this._dom.appendChild(this._containerDom);
        }
      }
      return this._containerDom || this._dom;
    };

    Menu.prototype.getParent = function() {
      return this._parent;
    };

    Menu.prototype.onItemClick = function(event, item) {
      var arg, parentMenu;
      parentMenu = this.getParent();
      arg = {
        item: item,
        event: event
      };
      this.fire("itemClick", this, arg);
      if (!parentMenu) {
        return;
      }
      if (parentMenu instanceof cola.menu.AbstractMenuItem || parentMenu instanceof cola.Menu || parentMenu instanceof cola.Button) {
        parentMenu.onItemClick(event, item);
      }
    };

    Menu.prototype._createItem = function(config) {
      var menuItem;
      menuItem = null;
      if (config.constructor === Object.prototype.constructor) {
        if (config.$type) {
          if (config.$type === "dropdown") {
            menuItem = new cola.menu.DropdownMenuItem(config);
          } else if (config.$type === "headerItem") {
            menuItem = new cola.menu.HeaderMenuItem(config);
          } else {
            menuItem = new cola.menu.ControlMenuItem({
              control: config
            });
          }
        } else {
          menuItem = new cola.menu.MenuItem(config);
        }
      } else if (config instanceof cola.menu.AbstractMenuItem) {
        menuItem = config;
      }
      return menuItem;
    };

    Menu.prototype.addItem = function(config) {
      var active, container, itemDom, menuItem;
      menuItem = this._createItem(config);
      if (!menuItem) {
        return;
      }
      menuItem._parent = this;
      if (this._items == null) {
        this._items = [];
      }
      this._items.push(menuItem);
      active = menuItem.get("active");
      if (active) {
        this._activeItem = menuItem;
      }
      if (this._dom) {
        container = this._getItemsContainer();
        itemDom = menuItem.getDom();
        if (itemDom.parentNode !== container) {
          if (this._rightMenuDom) {
            $(this._rightMenuDom).before(itemDom);
          } else {
            container.appendChild(itemDom);
          }
        }
      }
      return itemDom;
    };

    Menu.prototype.addRightItem = function(config) {
      var active, container, itemDom, menuItem;
      menuItem = this._createItem(config);
      if (!menuItem) {
        return this;
      }
      menuItem._parent = this;
      if (this._rightItems == null) {
        this._rightItems = [];
      }
      this._rightItems.push(menuItem);
      active = menuItem.get("active");
      if (active) {
        this._activeItem = menuItem;
      }
      if (this._dom) {
        container = this._getItemsContainer();
        itemDom = menuItem.getDom();
        if (!this._rightMenuDom) {
          this._rightMenuDom = this._createRightMenu();
          container.appendChild(this._rightMenuDom);
        }
        if (itemDom.parentNode !== this._rightMenuDom) {
          this._rightMenuDom.appendChild(itemDom);
        }
      }
      return itemDom;
    };

    Menu.prototype.clearItems = function() {
      var item, j, len, menuItems;
      menuItems = this._items;
      if (menuItems != null ? menuItems.length : void 0) {
        for (j = 0, len = menuItems.length; j < len; j++) {
          item = menuItems[j];
          item.destroy();
        }
        this._items = [];
      }
      return this;
    };

    Menu.prototype.clearRightItems = function() {
      var item, j, len, menuItems;
      menuItems = this._rightItems;
      if (menuItems != null ? menuItems.length : void 0) {
        for (j = 0, len = menuItems.length; j < len; j++) {
          item = menuItems[j];
          item.destroy();
        }
        this._rightItems = [];
      }
      return this;
    };

    Menu.prototype._doRemove = function(array, item) {
      var index;
      index = array.indexOf(item);
      if (index > -1) {
        array.splice(index, 1);
        item.destroy();
      }
    };

    Menu.prototype.removeItem = function(item) {
      var menuItems;
      menuItems = this._items;
      if (!menuItems) {
        return this;
      }
      if (typeof item === "number") {
        item = menuItems[item];
      }
      if (item) {
        this._doRemove(menuItems, item);
      }
      return this;
    };

    Menu.prototype.removeRightItem = function(item) {
      var menuItems;
      menuItems = this._rightItems;
      if (!menuItems) {
        return this;
      }
      if (typeof item === "number") {
        item = menuItems[item];
      }
      if (item) {
        this._doRemove(menuItems, item);
      }
      return this;
    };

    Menu.prototype.getItem = function(index) {
      var ref;
      return (ref = this._items) != null ? ref[index] : void 0;
    };

    Menu.prototype.getRightItem = function(index) {
      var ref;
      return (ref = this._rightItems) != null ? ref[index] : void 0;
    };

    Menu.prototype._createRightMenu = function() {
      return $.xCreate({
        tagName: "DIV",
        "class": "right menu"
      });
    };

    Menu.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      Menu.__super__.destroy.call(this);
      delete this._activeItem;
      this.clearRightItems();
      this.clearItems();
      delete this._containerDom;
      return this;
    };

    return Menu;

  })(cola.Widget);

  cola.TitleBar = (function(superClass) {
    extend(TitleBar, superClass);

    function TitleBar() {
      return TitleBar.__super__.constructor.apply(this, arguments);
    }

    TitleBar.CLASS_NAME = "menu title-bar";

    TitleBar.CHILDREN_TYPE_NAMESPACE = "menu";

    TitleBar.ATTRIBUTES = {
      title: {
        refreshDom: true
      }
    };

    TitleBar.prototype._parseDom = function(dom) {
      var child, firstChild;
      child = dom.firstChild;
      if (this._doms == null) {
        this._doms = {};
      }
      while (child) {
        if (child.nodeType === 1) {
          if (!this._doms.title && cola.util.hasClass(child, "title")) {
            this._doms.title = child;
            if (this._title == null) {
              this._title = cola.util.getTextChildData(child);
            }
            break;
          }
        }
        child = child.nextSibling;
      }
      TitleBar.__super__._parseDom.call(this, dom);
      firstChild = dom.children[0];
      if (this._doms.title && firstChild !== this._doms.title) {
        $(this._doms.title).remove();
        $(firstChild).before(this._doms.title);
      }
    };

    TitleBar.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      TitleBar.__super__._doRefreshDom.call(this);
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._title) {
        if (!this._doms.title) {
          this._doms.title = $.xCreate({
            tagName: "div",
            "class": "title"
          });
          this.get$Dom().prepend(this._doms.title);
        }
        $(this._doms.title).text(this._title);
      } else {
        $(this._doms.title).empty();
      }
      return null;
    };

    return TitleBar;

  })(cola.Menu);

  cola.registerType("menu", "_default", cola.menu.MenuItem);

  cola.registerType("menu", "item", cola.menu.MenuItem);

  cola.registerType("menu", "dropdownItem", cola.menu.DropdownMenuItem);

  cola.registerType("menu", "controlItem", cola.menu.ControlMenuItem);

  cola.registerType("menu", "headerItem", cola.menu.HeaderMenuItem);

  cola.registerTypeResolver("menu", function(config) {
    return cola.resolveType("widget", config);
  });

  cola.ButtonMenu = (function(superClass) {
    extend(ButtonMenu, superClass);

    function ButtonMenu() {
      return ButtonMenu.__super__.constructor.apply(this, arguments);
    }

    ButtonMenu.prototype.onItemClick = function(event, item) {
      var ref;
      if ((ref = this._parent) != null) {
        ref.onItemClick(event, item);
      }
      return null;
    };

    ButtonMenu.prototype._toDropDown = function(item) {
      if (!(this._parent instanceof cola.MenuButton)) {
        ButtonMenu.__super__._toDropDown.call(this, item);
      }
      return null;
    };

    return ButtonMenu;

  })(cola.Menu);

  cola.MenuButton = (function(superClass) {
    extend(MenuButton, superClass);

    function MenuButton() {
      return MenuButton.__super__.constructor.apply(this, arguments);
    }

    MenuButton.CLASS_NAME = "dropdown button";

    MenuButton.ATTRIBUTES = {
      menuItems: {
        setter: function(value) {
          return this._resetMenu(value);
        },
        getter: function() {
          var ref;
          return (ref = this._menu) != null ? ref.get("items") : void 0;
        }
      }
    };

    MenuButton.EVENTS = {
      menuItemClick: null
    };

    MenuButton.prototype._setDom = function(dom, parseChild) {
      var menuDom;
      MenuButton.__super__._setDom.call(this, dom, parseChild);
      if (this._menu) {
        menuDom = this._menu.getDom();
        if (menuDom.parentNode !== this._dom) {
          this._dom.appendChild(menuDom);
        }
      }
      this.get$Dom().dropdown();
    };

    MenuButton.prototype._parseDom = function(dom) {
      var child, menu;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          menu = cola.widget(child);
          if (menu && menu instanceof cola.Menu) {
            this._menu = menu;
            menu._parent = this;
            break;
          }
        }
        child = child.nextSibling;
      }
    };

    MenuButton.prototype.onItemClick = function(event, item) {
      this.fire("menuItemClick", this, {
        item: item,
        event: event
      });
    };

    MenuButton.prototype._resetMenu = function(menuItems) {
      var ref;
      if ((ref = this._menu) != null) {
        ref.destroy();
      }
      this._menu = new cola.ButtonMenu({
        items: menuItems
      });
      this._menu._parent = this;
      if (this._dom) {
        this.get$Dom().append(this._menu.getDom());
      }
    };

    MenuButton.prototype.destroy = function() {
      var ref;
      if (this._destroyed) {
        return;
      }
      if ((ref = this._menu) != null) {
        ref.destroy();
      }
      delete this._menu;
      MenuButton.__super__.destroy.call(this);
    };

    MenuButton.prototype.addMenuItem = function(config) {
      var ref;
      if ((ref = this._menu) != null) {
        ref.addItem(config);
      }
      return this;
    };

    MenuButton.prototype.clearMenuItems = function() {
      var ref;
      if ((ref = this._menu) != null) {
        ref.clearItems();
      }
      return this;
    };

    MenuButton.prototype.removeMenuItem = function(item) {
      var ref;
      if ((ref = this._menu) != null) {
        ref.removeItem(item);
      }
      return this;
    };

    MenuButton.prototype.getMenuItem = function(index) {
      var ref;
      return (ref = this._menu) != null ? ref.getItem(index) : void 0;
    };

    return MenuButton;

  })(cola.Button);

  cola.registerType("menuButton", "_default", cola.ButtonMenu);

  cola.registerType("menuButton", "menu", cola.ButtonMenu);

  cola.registerTypeResolver("menuButton", function(config) {
    return cola.resolveType("widget", config);
  });

  cola.Shape = (function(superClass) {
    extend(Shape, superClass);

    function Shape() {
      return Shape.__super__.constructor.apply(this, arguments);
    }

    Shape.CLASS_NAME = "shape";

    Shape.ATTRIBUTES = {
      bind: {
        readonlyAfterCreate: true,
        setter: function(bindStr) {
          return this._bindSetter(bindStr);
        }
      }
    };

    Shape.EVENTS = {
      beforeChange: null,
      afterChange: null
    };

    Shape.directions = ["up", "down", "left", "right", "over", "back"];

    Shape.prototype.getContentContainer = function() {
      if (!this._doms.wrap) {
        this._createItemsWrap(dom);
      }
      return this._doms.wrap;
    };

    Shape.prototype._createItemsWrap = function(dom) {
      if (this._doms == null) {
        this._doms = {};
      }
      this._doms.wrap = $.xCreate({
        tagName: "div",
        "class": "sides"
      });
      dom.appendChild(this._doms.wrap);
      return null;
    };

    Shape.prototype.setCurrentIndex = function(index) {
      var currentDom, oldIndex, sides, targetDom;
      this._currentIndex = index;
      if (!this._dom) {
        return;
      }
      currentDom = this._current;
      if (this._doms) {
        sides = $(this._doms.wrap).find(".side");
        if (currentDom) {
          oldIndex = sides.index(currentDom);
          console.log(oldIndex);
          if (index === oldIndex) {
            return;
          }
        }
        sides.removeClass("active");
        targetDom = sides.eq(index).addClass("active");
      }
      return this;
    };

    Shape.prototype._parseDom = function(dom) {
      var child, doms, parseItem;
      parseItem = (function(_this) {
        return function(node) {
          var childNode;
          _this._items = [];
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              _this.addItem(childNode);
            }
            $fly(childNode).addClass("side");
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      if (this._doms == null) {
        this._doms = {};
      }
      doms = this._doms;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (cola.util.hasClass(child, "sides")) {
            doms.wrap = child;
            parseItem(child);
          } else if (child.nodeName === "TEMPLATE") {
            this._regTemplate(child);
          }
        }
        child = child.nextSibling;
      }
    };

    Shape.prototype._initDom = function(dom) {
      var shape, template;
      if (!this._doms.wrap) {
        this._createItemsWrap(dom);
      }
      template = this._getTemplate();
      if (template) {
        if (this._bindStr) {
          $fly(template).attr("c-repeat", this._bindStr);
        }
        this._doms.wrap.appendChild(template);
        cola.xRender(template, this._scope);
      }
      if (this._items) {
        this._itemsRender();
      }
      shape = this;
      setTimeout(function() {
        return $(dom).shape({
          beforeChange: function() {
            shape.fire("beforeChange", shape, {
              current: shape._current
            });
          },
          onChange: function(activeDom) {
            shape._current = activeDom;
            shape.fire("afterChange", shape, {
              current: activeDom
            });
          }
        });
      }, 0);
      this.setCurrentIndex(0);
    };

    Shape.prototype.flip = function(direction) {
      var $dom;
      if (direction == null) {
        direction = "right";
      }
      if (this.constructor.directions.indexOf(direction) >= 0) {
        cola._ignoreNodeRemoved = true;
        $dom = this.get$Dom();
        if (!$dom.shape("is animating")) {
          $dom.shape("flip " + direction);
        }
        cola._ignoreNodeRemoved = false;
      }
      return this;
    };

    Shape.prototype.setNextSide = function(selector) {
      if (!this._dom) {
        return;
      }
      this.get$Dom().shape("set next side", selector);
      return this;
    };

    return Shape;

  })(cola.AbstractItemGroup);

  cola.Element.mixin(cola.Shape, cola.TemplateSupport);

  cola.Element.mixin(cola.Shape, cola.DataItemsWidgetMixin);

  if (cola.steps == null) {
    cola.steps = {};
  }

  cola.steps.Step = (function(superClass) {
    extend(Step, superClass);

    function Step() {
      return Step.__super__.constructor.apply(this, arguments);
    }

    Step.CLASS_NAME = "step";

    Step.ATTRIBUTES = {
      icon: {
        refreshDom: true
      },
      content: {
        refreshDom: true
      },
      states: {
        refreshDom: true,
        "enum": ["completed", "active", ""],
        defaultValue: "",
        setter: function(value) {
          var oldValue;
          oldValue = this._states;
          this._states = value;
          if (this._dom && value !== oldValue && oldValue) {
            $fly(this._dom).removeClass(oldValue);
          }
          return this;
        }
      },
      disabled: {
        type: "boolean",
        defaultValue: false
      }
    };

    Step.prototype._parseDom = function(dom) {
      var $cc, $child, cc, child, j, len, parseContent, parseDescription, parseTitle, ref;
      if (this._doms == null) {
        this._doms = {};
      }
      parseTitle = (function(_this) {
        return function(node) {
          var content, title;
          _this._doms.title = node;
          title = cola.util.getTextChildData(node);
          content = _this._content || {};
          if (!content.title && title) {
            if (_this._content == null) {
              _this._content = {};
            }
            _this._doms.titleDom = node;
            _this._content.title = title;
          }
        };
      })(this);
      parseDescription = (function(_this) {
        return function(node) {
          var content, description;
          _this._doms.description = node;
          description = cola.util.getTextChildData(node);
          content = _this._content || {};
          if (description && !content.description) {
            if (_this._content == null) {
              _this._content = {};
            }
            _this._doms.descriptionDom = node;
            _this._content.description = description;
          }
        };
      })(this);
      parseContent = (function(_this) {
        return function(node) {
          var content;
          content = cola.util.getTextChildData(node);
          if (!_this._content && content) {
            _this._content = content;
          }
        };
      })(this);
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (child.nodeName === "I") {
            this._doms.iconDom = child;
            if (!this._icon) {
              this._icon = child.className;
            }
          } else {
            $child = $(child);
            if ($child.hasClass("content")) {
              this._doms.contentDom = child;
              ref = child.childNodes;
              for (j = 0, len = ref.length; j < len; j++) {
                cc = ref[j];
                if (child.nodeType !== 1) {
                  continue;
                }
                $cc = $(cc);
                if ($cc.hasClass("title")) {
                  parseTitle(cc);
                }
                if ($cc.hasClass("description")) {
                  parseDescription(cc);
                }
              }
              if (!this._content) {
                parseContent(child);
              }
            } else if ($child.hasClass("title")) {
              parseTitle(child);
            } else if ($child.hasClass("description")) {
              parseDescription(child);
            }
          }
        }
        child = child.nextSibling;
      }
      parseContent(dom);
    };

    Step.prototype._doRefreshDom = function() {
      var $contentDom, $dom, base, base1, base2, base3, classNamePool, content, icon;
      if (!this._dom) {
        return;
      }
      Step.__super__._doRefreshDom.call(this);
      if (this._doms == null) {
        this._doms = {};
      }
      content = this.get("content");
      $dom = this.get$Dom();
      $dom.empty();
      icon = this.get("icon");
      if (icon) {
        if ((base = this._doms).iconDom == null) {
          base.iconDom = document.createElement("i");
        }
        this._doms.iconDom.className = icon + " icon";
        $dom.append(this._doms.iconDom);
      } else {
        $fly(this._doms.iconDom).remove();
      }
      if (content) {
        if ((base1 = this._doms).contentDom == null) {
          base1.contentDom = document.createElement("div");
        }
        $contentDom = $(this._doms.contentDom);
        $contentDom.addClass("content").empty();
        if (typeof content === "string") {
          $contentDom.text(content);
        } else {
          if (content.title) {
            if ((base2 = this._doms).titleDom == null) {
              base2.titleDom = document.createElement("div");
            }
            $fly(this._doms.titleDom).addClass("title").text(content.title);
            $contentDom.append(this._doms.titleDom);
          }
          if (content.description) {
            if ((base3 = this._doms).descriptionDom == null) {
              base3.descriptionDom = document.createElement("div");
            }
            $fly(this._doms.descriptionDom).addClass("description").text(content.description);
            $contentDom.append(this._doms.descriptionDom);
          }
        }
        $dom.append($contentDom);
      }
      classNamePool = this._classNamePool;
      if (this._states) {
        classNamePool.add(this._states);
      }
      return classNamePool.toggle("disabled", this._disabled);
    };

    Step.prototype.destroy = function() {
      if (this._destroyed) {
        return;
      }
      Step.__super__.destroy.call(this);
      return delete this._doms;
    };

    return Step;

  })(cola.Widget);

  cola.Steps = (function(superClass) {
    extend(Steps, superClass);

    function Steps() {
      return Steps.__super__.constructor.apply(this, arguments);
    }

    Steps.CHILDREN_TYPE_NAMESPACE = "steps";

    Steps.CLASS_NAME = "steps";

    Steps.SEMANTIC_CLASS = ["tablet stackable", "left floated", "right floated"];

    Steps.ATTRIBUTES = {
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
      steps: {
        refreshDom: true,
        setter: function(value) {
          var j, len, step;
          this.clear();
          for (j = 0, len = value.length; j < len; j++) {
            step = value[j];
            if (step instanceof cola.steps.Step) {
              this.addStep(step);
            } else if (step.constructor === Object.prototype.constructor) {
              this.addStep(new cola.steps.Step(step));
            }
          }
        }
      },
      currentIndex: {
        type: "number",
        setter: function(value) {
          this["_currentIndex"] = value;
          return this.setCurrent(value);
        },
        getter: function() {
          if (this._current && this._steps) {
            return this._steps.indexOf(this._current);
          } else {
            return -1;
          }
        }
      },
      autoComplete: {
        type: "boolean",
        defaultValue: true
      }
    };

    Steps.EVENTS = {
      beforeChange: null,
      change: null,
      complete: null
    };

    Steps.prototype._doRefreshDom = function() {
      var size;
      if (!this._dom) {
        return;
      }
      Steps.__super__._doRefreshDom.call(this);
      size = this.get("size");
      if (size) {
        return this._classNamePool.add(size);
      }
    };

    Steps.prototype._doRemove = function(step) {
      var index;
      index = this._steps.indexOf(step);
      if (index > -1) {
        this._steps.splice(index, 1);
        step.remove();
      }
    };

    Steps.prototype._setDom = function(dom, parseChild) {
      var j, len, ref, ref1, step, stepDom;
      Steps.__super__._setDom.call(this, dom, parseChild);
      if (!((ref = this._steps) != null ? ref.length : void 0)) {
        return;
      }
      ref1 = this._steps;
      for (j = 0, len = ref1.length; j < len; j++) {
        step = ref1[j];
        stepDom = step.getDom();
        if (stepDom.parentNode !== this._dom) {
          step.appendTo(this._dom);
        }
      }
    };

    Steps.prototype._parseDom = function(dom) {
      var child, step;
      if (!dom) {
        return;
      }
      if (this._steps == null) {
        this._steps = [];
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          step = cola.widget(child);
          if (step && step instanceof cola.steps.Step) {
            this.addStep(step);
          }
        }
        child = child.nextSibling;
      }
    };

    Steps.prototype._doChange = function(index) {
      var arg, newCurrent, oldCurrent;
      oldCurrent = this._current;
      if (index > -1 && index < this._steps.length) {
        newCurrent = this._steps[index];
      }
      if (oldCurrent === newCurrent) {
        return;
      }
      arg = {
        oldCurrent: oldCurrent,
        newCurrent: newCurrent
      };
      if (this.fire("beforeChange", this, arg) === false) {
        if (newCurrent) {
          newCurrent.set("states", "");
        }
        return;
      }
      this._current = newCurrent;
      if (oldCurrent) {
        oldCurrent.set("states", "");
      }
      if (newCurrent) {
        newCurrent.set("states", "active");
      }
      if (index >= this._steps.length) {
        this.fire("complete", this, {});
      }
      this.fire("change", this, arg);
      this._doComplete(index);
    };

    Steps.prototype.getStep = function(index) {
      var ref;
      return (ref = this._steps) != null ? ref[index] : void 0;
    };

    Steps.prototype.setCurrent = function(step) {
      var currentIndex, el, index, j, len, ref;
      currentIndex = step;
      if (typeof step === "string") {
        ref = this._steps;
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
          el = ref[index];
          if (step === el.get("content")) {
            currentIndex = index;
            break;
          }
        }
      } else if (step instanceof cola.steps.Step) {
        currentIndex = this._steps.indexOf(step);
      }
      this._doChange(currentIndex);
      return this;
    };

    Steps.prototype._doComplete = function(index) {
      var completeIndex, dIndex, results;
      if (this._autoComplete) {
        completeIndex = index - 1;
        while (completeIndex > -1) {
          this._steps[completeIndex].set("states", "completed");
          completeIndex--;
        }
        dIndex = index + 1;
        results = [];
        while (dIndex < this._steps.length) {
          this._steps[dIndex].set("states", "");
          results.push(dIndex++);
        }
        return results;
      }
    };

    Steps.prototype.getCurrent = function() {
      return this._current;
    };

    Steps.prototype.add = function() {
      var arg, j, len, step;
      for (j = 0, len = arguments.length; j < len; j++) {
        arg = arguments[j];
        step = arg;
        if (step instanceof cola.steps.Step) {
          this.addStep(step);
        } else if (step.constructor === Object.prototype.constructor) {
          this.addStep(new cola.steps.Step(step));
        }
      }
      return this;
    };

    Steps.prototype.addStep = function(step) {
      var states, stepDom;
      if (this._destroyed) {
        return this;
      }
      if (this._steps == null) {
        this._steps = [];
      }
      if (step.constructor === Object.prototype.constructor) {
        step = new cola.steps.Step(step);
      }
      if (!(step instanceof cola.steps.Step)) {
        return this;
      }
      if (this._steps.indexOf(step) > -1) {
        return this;
      }
      this._steps.push(step);
      if (this._dom) {
        stepDom = step.getDom();
        if (stepDom.parentNode !== this._dom) {
          step.appendTo(this._dom);
        }
      }
      states = step.get("states");
      if (states === "active") {
        this._doChange(this._steps.length - 1);
      }
      return this;
    };

    Steps.prototype.removeStep = function(step) {
      if (!this._steps) {
        return this;
      }
      if (typeof step === "number") {
        step = this._steps[step];
      }
      if (step) {
        this._doRemove(step);
      }
      return this;
    };

    Steps.prototype.clear = function() {
      if (!this._steps) {
        return this;
      }
      if (this._dom) {
        this.get$Dom().empty();
      }
      if (this._steps.length) {
        this._steps = [];
      }
      return this;
    };

    Steps.prototype.next = function() {
      var currentIndex;
      currentIndex = this.get("currentIndex");
      this.setCurrent(++currentIndex);
      return this;
    };

    Steps.prototype.complete = function() {
      return this.setCurrent(this._steps.length);
    };

    Steps.prototype.previous = function() {
      var currentIndex;
      currentIndex = this.get("currentIndex");
      this.setCurrent(--currentIndex);
      return this;
    };

    Steps.prototype.goTo = function(index) {
      this.setCurrent(index);
      return this;
    };

    Steps.prototype.getStepIndex = function(step) {
      var ref;
      return (ref = this._steps) != null ? ref.indexOf(step) : void 0;
    };

    return Steps;

  })(cola.Widget);

  cola.registerType("steps", "_default", cola.steps.Step);

  cola.registerType("steps", "Step", cola.steps.Step);

  cola.registerTypeResolver("steps", function(config) {
    return cola.resolveType("widget", config);
  });

  cola.Stack = (function(superClass) {
    extend(Stack, superClass);

    function Stack() {
      return Stack.__super__.constructor.apply(this, arguments);
    }

    Stack.CLASS_NAME = "stack";

    Stack.EVENTS = {
      change: null,
      beforeChange: null
    };

    Stack.duration = 200;

    Stack.prototype._initDom = function(dom) {
      var itemsWrap;
      if (this._doms == null) {
        this._doms = {};
      }
      itemsWrap = this.getItemsWrap();
      if (!this._doms.prevItem) {
        this._doms.prevItem = $.xCreate({
          "class": "prev item"
        });
        $fly(itemsWrap).prepend(this._doms.prevItem);
      }
      if (!this._doms.currentItem) {
        this._doms.currentItem = $.xCreate({
          "class": "current item"
        });
        $fly(this._doms.prevItem).after(this._doms.currentItem);
      }
      if (!this._doms.nextItem) {
        this._doms.nextItem = $.xCreate({
          "class": "next item"
        });
        $fly(this._doms.currentItem).after(this._doms.nextItem);
      }
      this._prevItem = this._doms.prevItem;
      this._currentItem = this._doms.currentItem;
      this._nextItem = this._doms.nextItem;
      return $fly(this._currentItem).css({
        display: "block"
      });
    };

    Stack.prototype._parseDom = function(dom) {
      var child, doms, parseItem, results;
      parseItem = (function(_this) {
        return function(node) {
          var childNode;
          _this._items = [];
          childNode = node.firstChild;
          while (childNode) {
            if (childNode.nodeType === 1) {
              if ($fly(childNode).hasClass("prev")) {
                _this._doms.prevItem = childNode;
              } else if ($fly(childNode).hasClass("current")) {
                _this._doms.currentItem = childNode;
              } else if ($fly(childNode).hasClass("next")) {
                _this._doms.nextItem = childNode;
              }
            }
            childNode = childNode.nextSibling;
          }
        };
      })(this);
      doms = this._doms;
      child = dom.firstChild;
      results = [];
      while (child) {
        if (child.nodeType === 1) {
          if (cola.util.hasClass(child, "items-wrap")) {
            doms.wrap = child;
            parseItem(child);
          }
        }
        results.push(child = child.nextSibling);
      }
      return results;
    };

    Stack.prototype.getItemContainer = function(key) {
      return this["_" + key + "Item"];
    };

    Stack.prototype.getItemsWrap = function() {
      var wrap;
      if (!this._doms.itemsWrap) {
        wrap = $.xCreate({
          "class": "items-wrap"
        });
        this._doms.itemsWrap = wrap;
        this._dom.appendChild(wrap);
      }
      return this._doms.itemsWrap;
    };

    Stack.prototype._setDom = function(dom, parseChild) {
      var stack;
      Stack.__super__._setDom.call(this, dom, parseChild);
      stack = this;
      return $(dom).on("touchstart", function(evt) {
        return stack._onTouchStart(evt);
      }).on("touchmove", function(evt) {
        return stack._onTouchMove(evt);
      }).on("touchend", function(evt) {
        return stack._onTouchEnd(evt);
      });
    };

    Stack.prototype._getTouchPoint = function(evt) {
      var touches;
      touches = evt.originalEvent.touches;
      if (!touches.length) {
        touches = evt.originalEvent.changedTouches;
      }
      return touches[0];
    };

    Stack.prototype._onTouchStart = function(evt) {
      var touch;
      this._touchStart = true;
      touch = evt.originalEvent.touches[0];
      this._touchStartX = touch.pageX;
      this._touchStartY = touch.pageY;
      this._moveTotal = 0;
      this._touchTimestamp = new Date();
      evt.stopImmediatePropagation();
      return this;
    };

    Stack.prototype._onTouchMove = function(evt) {
      var direction, distanceX, distanceY, factor, timestamp, touchPoint, width;
      if (!this._touchStart) {
        return;
      }
      touchPoint = this._getTouchPoint(evt);
      this._touchLastX = touchPoint.pageX;
      this._touchLastY = touchPoint.pageY;
      distanceX = this._touchLastX - this._touchStartX;
      distanceY = this._touchLastY - this._touchStartY;
      timestamp = new Date();
      this._touchMoveSpeed = distanceX / (timestamp - this._touchLastTimstamp);
      this._touchLastTimstamp = timestamp;
      if (distanceX < 0) {
        direction = "left";
        factor = 1;
      } else {
        direction = "right";
        factor = -1;
      }
      this._touchDirection = direction;
      this._factor = factor;
      width = this._currentItem.clientWidth;
      this._distanceX = Math.abs(distanceX);
      this._moveTotal = (this._moveTotal || 0) + Math.abs(distanceX);
      if (this._moveTotal < 8) {
        return;
      }
      $fly(this._currentItem).css("transform", "translate(" + distanceX + "px,0)");
      if (direction === "left") {
        $fly(this._prevItem).css("display", "none");
        $fly(this._nextItem).css({
          transform: "translate(" + (width + distanceX) + "px,0)",
          display: "block"
        });
      } else {
        $fly(this._nextItem).css("display", "none");
        $fly(this._prevItem).css({
          transform: "translate(" + (factor * width + distanceX) + "px,0)",
          display: "block"
        });
      }
      evt.stopImmediatePropagation();
      return false;
    };

    Stack.prototype._onTouchEnd = function(evt) {
      var arg, duration, restore, width;
      if (!this._touchStart) {
        return;
      }
      duration = this.constructor.duration;
      width = this._currentItem.clientWidth;
      this._touchStart = false;
      restore = (function(_this) {
        return function() {
          $(_this._currentItem).transit({
            x: 0,
            duration: duration
          });
          if (_this._touchDirection === "left") {
            $(_this._nextItem).transit({
              x: width,
              duration: duration
            });
          } else {
            $(_this._prevItem).transit({
              x: -1 * width,
              duration: duration
            });
          }
        };
      })(this);
      if (this._moveTotal < 8) {
        restore();
        return;
      }
      arg = {
        current: this._currentItem,
        prev: this._prevItem,
        next: this._nextItem,
        action: "over"
      };
      if (this._distanceX > width / 3) {
        if (this._touchDirection === "left") {
          if (this.fire("beforeChange", this, arg) === false) {
            restore();
            return;
          }
          $(this._currentItem).transit({
            x: -1 * width,
            duration: duration
          });
          $(this._nextItem).transit({
            x: 0,
            duration: duration
          });
          this._doNext();
        } else {
          arg.action = "back";
          if (this.fire("beforeChange", this, arg) === false) {
            restore();
            return;
          }
          $(this._currentItem).transit({
            x: width,
            duration: duration
          });
          $(this._prevItem).transit({
            x: 0,
            duration: duration
          });
          this._doPrev();
        }
      } else {
        restore();
      }
    };

    Stack.prototype.next = function() {
      var arg, duration, stack, width;
      if (this._animating) {
        return;
      }
      arg = {
        current: this._currentItem,
        prev: this._prevItem,
        next: this._nextItem,
        action: "over"
      };
      if (this.fire("beforeChange", this, arg) === false) {
        return;
      }
      this._animating = true;
      width = this._currentItem.clientWidth;
      stack = this;
      duration = this.constructor.duration;
      $fly(this._nextItem).css({
        transform: "translate(" + width + "px,0)",
        display: "block"
      });
      $(this._currentItem).transit({
        x: -1 * width,
        duration: duration * 2,
        complete: function() {
          stack._animating = false;
          $(stack._currentItem).css("display", "none");
          return stack._doNext();
        }
      });
      $(this._nextItem).transit({
        x: 0,
        duration: duration * 2
      });
      return this;
    };

    Stack.prototype.prev = function() {
      var arg, duration, stack, width;
      if (this._animating) {
        return;
      }
      arg = {
        current: this._currentItem,
        prev: this._prevItem,
        next: this._nextItem,
        action: "back"
      };
      if (this.fire("beforeChange", this, arg) === false) {
        return;
      }
      this._animating = true;
      width = this._currentItem.clientWidth;
      stack = this;
      duration = this.constructor.duration;
      $fly(this._prevItem).css({
        transform: "translate(-" + width + "px,0)",
        display: "block"
      });
      $(this._currentItem).transit({
        x: width,
        duration: duration * 2,
        complete: function() {
          $(stack._currentItem).css("display", "none");
          stack._animating = false;
          return stack._doPrev();
        }
      });
      $(this._prevItem).transit({
        x: 0,
        duration: duration * 2
      });
      return this;
    };

    Stack.prototype._doNext = function() {
      var currentItem, nextItem, prevItem;
      prevItem = this._prevItem;
      currentItem = this._currentItem;
      nextItem = this._nextItem;
      this._prevItem = currentItem;
      this._nextItem = prevItem;
      this._currentItem = nextItem;
      this.fire("change", this, {
        current: this._currentItem,
        prev: this._prevItem,
        next: this._nextItem,
        action: "over"
      });
      return null;
    };

    Stack.prototype._doPrev = function() {
      var currentItem, nextItem, prevItem;
      prevItem = this._prevItem;
      currentItem = this._currentItem;
      nextItem = this._nextItem;
      this._prevItem = nextItem;
      this._nextItem = currentItem;
      this._currentItem = prevItem;
      this.fire("change", this, {
        current: this._currentItem,
        prev: this._prevItem,
        next: this._nextItem,
        action: "back"
      });
      return null;
    };

    return Stack;

  })(cola.Widget);

}).call(this);
