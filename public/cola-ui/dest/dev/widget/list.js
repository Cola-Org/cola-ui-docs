(function() {
  var Column, ContentColumn, DataColumn, GroupColumn, LIST_SIZE_PREFIXS, NestedListBind, NestedListNode, SAFE_PULL_EFFECT, SAFE_SLIDE_EFFECT, SLIDE_ANIMATION_SPEED, SelectColumn, TreeNode, TreeNodeBind, _columnsSetter, _createGroupArray, _getEntityId,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _getEntityId = cola.Entity._getEntityId;

  cola.ItemsView = (function(superClass) {
    extend(ItemsView, superClass);

    function ItemsView() {
      return ItemsView.__super__.constructor.apply(this, arguments);
    }

    ItemsView.ATTRIBUTES = {
      allowNoCurrent: {
        type: "boolean",
        defaultValue: true
      },
      currentItem: {
        getter: function() {
          var item;
          if (this._currentItemDom) {
            item = cola.util.userData(this._currentItemDom, "item");
          }
          return item;
        },
        setter: function(currentItem) {
          var currentItemDom;
          if (currentItem) {
            currentItemDom = this._itemDomMap[_getEntityId(currentItem)];
          }
          this._setCurrentItemDom(currentItemDom);
        }
      },
      highlightCurrentItem: {
        type: "boolean",
        defaultValue: true
      },
      autoLoadPage: {
        type: "boolean",
        defaultValue: true
      },
      changeCurrentitem: null,
      pullDown: {
        readOnlyAfterCreate: true
      },
      pullUp: {
        readOnlyAfterCreate: true
      },
      filterCriteria: {
        refreshItems: true
      }
    };

    ItemsView.EVENTS = {
      renderItem: null,
      itemClick: null,
      itemDoubleClick: null,
      itemPress: null,
      pullStart: null,
      pullStep: null,
      pullComplete: null,
      pullCancel: null,
      filterItem: {
        singleListener: true
      }
    };

    ItemsView.prototype.destroy = function() {
      ItemsView.__super__.destroy.call(this);
      delete this._emptyItemDom;
    };

    ItemsView.prototype._doSet = function(attr, attrConfig, value) {
      if (attrConfig != null ? attrConfig.refreshItems : void 0) {
        attrConfig.refreshDom = true;
        this._refreshItemsScheduled = true;
      }
      return ItemsView.__super__._doSet.call(this, attr, attrConfig, value);
    };

    ItemsView.prototype._createDom = function() {
      var dom;
      if (this._doms == null) {
        this._doms = {};
      }
      dom = $.xCreate({
        tagName: "div",
        content: {
          tagName: "ul",
          contextKey: "itemsWrapper"
        }
      }, this._doms);
      return dom;
    };

    ItemsView.prototype._parseDom = function(dom) {
      var child, itemsWrapper, next, nodeName;
      if (!dom) {
        return;
      }
      if (this._doms == null) {
        this._doms = {};
      }
      child = dom.firstChild;
      while (child) {
        next = child.nextSibling;
        nodeName = child.nodeName;
        if (!itemsWrapper && nodeName === "UL") {
          itemsWrapper = child;
        } else if (nodeName === "TEMPLATE") {
          this._regTemplate(child);
        } else {
          dom.removeChild(child);
        }
        child = next;
      }
      if (!itemsWrapper) {
        itemsWrapper = document.createElement("ul");
        dom.appendChild(itemsWrapper);
      }
      this._doms.itemsWrapper = itemsWrapper;
    };

    ItemsView.prototype._initDom = function(dom) {
      var $itemsWrapper;
      this._regDefaultTempaltes();
      if (this._templateContext == null) {
        this._templateContext = {};
      }
      $itemsWrapper = $fly(this._doms.itemsWrapper);
      $itemsWrapper.addClass("items").delegate(".list.item", "click", (function(_this) {
        return function(evt) {
          return _this._onItemClick(evt);
        };
      })(this)).delegate(".list.item", "dblclick", (function(_this) {
        return function(evt) {
          return _this._onItemDoubleClick(evt);
        };
      })(this));
      if (this._onItemsWrapperScroll) {
        $itemsWrapper.on("scroll", (function(_this) {
          return function(evt) {
            _this._onItemsWrapperScroll(evt);
            return true;
          };
        })(this));
      }
      this._$dom = $(dom);
    };

    ItemsView.prototype._onItemsWrapperScroll = function() {
      var itemsWrapper, realItems;
      realItems = this._realItems;
      if (this._autoLoadPage && !this._loadingNextPage && (realItems === this._realOriginItems || !this._realOriginItems)) {
        if (realItems instanceof cola.EntityList && (realItems.pageNo < realItems.pageCount || !realItems.pageCountDetermined)) {
          itemsWrapper = this._doms.itemsWrapper;
          if (itemsWrapper.scrollTop + itemsWrapper.clientHeight === itemsWrapper.scrollHeight) {
            this._loadingNextPage = true;
            realItems.loadPage(realItems.pageNo + 1, (function(_this) {
              return function() {
                _this._loadingNextPage = false;
              };
            })(this));
          }
        }
      }
    };

    ItemsView.prototype.getItems = function() {
      return this._realItems;
    };

    ItemsView.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      ItemsView.__super__._doRefreshDom.call(this);
      if (this._refreshItemsScheduled) {
        delete this._refreshItemsScheduled;
        this._refreshItems();
      }
    };

    ItemsView.prototype._getItemType = function(item) {
      var ref;
      if (item != null ? item.isDataWrapper : void 0) {
        return ((ref = item._data) != null ? ref._itemType : void 0) || "default";
      } else {
        return item._itemType || "default";
      }
    };

    ItemsView.prototype._onItemsRefresh = function() {
      return this._refreshItems();
    };

    ItemsView.prototype._onItemInsert = function(arg) {
      var insertMode, item, itemDom, itemType, itemsWrapper, refDom, refEntityId;
      if (this._realItems === this._realOriginItems) {
        this._refreshEmptyItemDom();
        item = arg.entity;
        itemType = this._getItemType(item);
        itemsWrapper = this._doms.itemsWrapper;
        insertMode = arg.insertMode;
        if (!insertMode || insertMode === "end") {
          itemDom = this._createNewItem(itemType, item);
          this._refreshItemDom(itemDom, item);
          $fly(itemsWrapper).append(itemDom);
        } else if (insertMode === "begin") {
          itemDom = this._createNewItem(itemType, item);
          this._refreshItemDom(itemDom, item);
          $fly(itemsWrapper.firstChild).before(itemDom);
        } else if (this._itemDomMap) {
          refEntityId = _getEntityId(arg.refEntity);
          if (refEntityId) {
            refDom = this._itemDomMap[refEntityId] != null;
            if (refDom) {
              itemDom = this._createNewItem(itemType, item);
              this._refreshItemDom(itemDom, item);
              if (insertMode === "before") {
                $fly(refDom).before(itemDom);
              } else {
                $fly(refDom).after(itemDom);
              }
            }
          }
        }
      } else {
        this._refreshItems();
      }
    };

    ItemsView.prototype._onItemRemove = function(arg) {
      var itemDom, itemId;
      itemId = _getEntityId(arg.entity);
      if (itemId) {
        arg.itemsScope.unregItemScope(itemId);
        itemDom = this._itemDomMap[itemId];
        delete this._itemDomMap[itemId];
        if (itemDom) {
          $fly(itemDom).remove();
          if (itemDom === this._currentItemDom) {
            this._currentItemDom = null;
          }
        }
      }
      this._refreshEmptyItemDom();
    };

    ItemsView.prototype._setCurrentItemDom = function(currentItemDom) {
      if (this._currentItemDom) {
        $fly(this._currentItemDom).removeClass(cola.constants.COLLECTION_CURRENT_CLASS);
      }
      this._currentItemDom = currentItemDom;
      if (currentItemDom && this._highlightCurrentItem) {
        $fly(currentItemDom).addClass(cola.constants.COLLECTION_CURRENT_CLASS);
      }
    };

    ItemsView.prototype._onCurrentItemChange = function(arg) {
      var currentItemDom, itemId;
      if (arg.current && this._itemDomMap) {
        itemId = _getEntityId(arg.current);
        if (itemId) {
          currentItemDom = this._itemDomMap[itemId];
          if (!currentItemDom) {
            this._refreshItems();
            return;
          }
        }
      }
      this._setCurrentItemDom(currentItemDom);
    };

    ItemsView.prototype._convertItems = function(items) {
      var arg;
      if (this._filterCriteria) {
        if (this.getListeners("filterItem")) {
          arg = {
            filterCriteria: this._filterCriteria
          };
          items = cola.convertor.filter(items, (function(_this) {
            return function(item) {
              arg.item = item;
              return _this.fire("filterItem", _this, arg);
            };
          })(this));
        } else {
          items = cola.convertor.filter(items, this._filterCriteria);
        }
      }
      return items;
    };

    ItemsView.prototype._refreshEmptyItemDom = function() {
      var emptyItemDom, items, itemsWrapper;
      emptyItemDom = this._emptyItemDom = this._getTemplate("empty-item");
      if (emptyItemDom) {
        items = this._realItems;
        if (items instanceof cola.EntityList && items.entityCount === 0 || items instanceof Array && items.length === 0) {
          $fly(emptyItemDom).show();
          itemsWrapper = this._doms.itemsWrapper;
          if (emptyItemDom.parentNode !== itemsWrapper) {
            $fly(emptyItemDom).addClass("protected");
            cola.xRender(emptyItemDom, this._scope);
            itemsWrapper.appendChild(emptyItemDom);
          }
        } else {
          $fly(emptyItemDom).hide();
        }
      }
    };

    ItemsView.prototype._refreshItems = function() {
      if (!this._dom) {
        this._refreshItemsScheduled = true;
        return;
      }
      return this._doRefreshItems(this._doms.itemsWrapper);
    };

    ItemsView.prototype._doRefreshItems = function(itemsWrapper) {
      var counter, currentItem, currentPageNo, documentFragment, hasPullAction, itemDom, items, lastItem, limit, nextItemDom, pullDownPane, pullUpPane, ref, ret;
      if (this._itemDomMap == null) {
        this._itemDomMap = {};
      }
      ret = this._getItems();
      items = ret.items;
      this._realOriginItems = ret.originItems;
      if (this._convertItems && items) {
        items = this._convertItems(items);
      }
      this._realItems = items;
      if (items) {
        documentFragment = null;
        nextItemDom = itemsWrapper.firstChild;
        currentItem = items.current;
        if (this._currentItemDom) {
          if (!currentItem) {
            currentItem = cola.util.userData(this._currentItemDom, "item");
          }
          $fly(this._currentItemDom).removeClass(cola.constants.COLLECTION_CURRENT_CLASS);
          delete this._currentItemDom;
        }
        this._currentItem = currentItem;
        this._itemsScope.resetItemScopeMap();
        counter = 0;
        limit = 0;
        if (this._autoLoadPage && !this._realOriginItems && items instanceof cola.EntityList) {
          limit = items.pageNo;
        }
        this._refreshEmptyItemDom();
        lastItem = null;
        cola.each(items, (function(_this) {
          return function(item) {
            var _nextItemDom, itemDom, itemType, ref;
            if (limit) {
              if (items instanceof cola.EntityList) {
                if (((ref = item._page) != null ? ref.pageNo : void 0) > limit) {
                  return false;
                }
              } else {
                counter++;
                if (counter > limit) {
                  return false;
                }
              }
            }
            lastItem = item;
            itemType = _this._getItemType(item);
            if (nextItemDom) {
              while (nextItemDom) {
                if (nextItemDom._itemType === itemType) {
                  break;
                } else {
                  _nextItemDom = nextItemDom.nextSibling;
                  if (!cola.util.hasClass(nextItemDom, "protected")) {
                    itemsWrapper.removeChild(nextItemDom);
                  }
                  nextItemDom = _nextItemDom;
                }
              }
              itemDom = nextItemDom;
              if (nextItemDom) {
                nextItemDom = nextItemDom.nextSibling;
              }
            } else {
              itemDom = null;
            }
            if (itemDom) {
              _this._refreshItemDom(itemDom, item);
            } else {
              itemDom = _this._createNewItem(itemType, item);
              _this._refreshItemDom(itemDom, item);
              if (documentFragment == null) {
                documentFragment = document.createDocumentFragment();
              }
              documentFragment.appendChild(itemDom);
            }
          };
        })(this));
        if (nextItemDom) {
          itemDom = nextItemDom;
          while (itemDom) {
            nextItemDom = itemDom.nextSibling;
            if (!cola.util.hasClass(itemDom, "protected")) {
              itemsWrapper.removeChild(itemDom);
              if (itemDom._itemId) {
                delete this._itemDomMap[itemDom._itemId];
              }
            }
            itemDom = nextItemDom;
          }
        }
        delete this._currentItem;
        if (this._currentItemDom && this._highlightCurrentItem) {
          $fly(this._currentItemDom).addClass(cola.constants.COLLECTION_CURRENT_CLASS);
        }
        if (documentFragment) {
          itemsWrapper.appendChild(documentFragment);
        }
        if (this._autoLoadPage && !this._loadingNextPage && (items === this._realOriginItems || !this._realOriginItems) && items instanceof cola.EntityList && items.pageSize > 0) {
          currentPageNo = lastItem != null ? (ref = lastItem._page) != null ? ref.pageNo : void 0 : void 0;
          if (currentPageNo && (currentPageNo < items.pageCount || !items.pageCountDetermined)) {
            if (itemsWrapper.scrollHeight && (itemsWrapper.scrollTop + itemsWrapper.clientHeight) < itemsWrapper.scrollHeight) {
              setTimeout(function() {
                items.loadPage(currentPageNo + 1, cola._EMPTY_FUNC);
              }, 0);
            }
          }
        }
      }
      if (this._pullAction === void 0) {
        this._pullAction = null;
        if (this._pullDown) {
          hasPullAction = true;
          pullDownPane = this._getTemplate("pull-down-pane");
          if (pullDownPane == null) {
            pullDownPane = $.xCreate({
              tagName: "div"
            });
          }
          this._doms.pullDownPane = pullDownPane;
        }
        if (this._pullUp) {
          hasPullAction = true;
          pullUpPane = this._getTemplate("pull-up-pane");
          if (pullUpPane == null) {
            pullUpPane = $.xCreate({
              tagName: "div"
            });
          }
          this._doms.pullUpPane = pullUpPane;
        }
        if (hasPullAction) {
          cola.util.delay(this, "createPullAction", 200, this._createPullAction);
        }
      }
    };

    ItemsView.prototype._refreshItemDom = function(itemDom, item, parentScope) {
      var alias, itemId, itemScope, oldScope, originItem;
      if (parentScope == null) {
        parentScope = this._itemsScope;
      }
      if (item === this._currentItem) {
        this._currentItemDom = itemDom;
      } else if (!this._currentItemDom && !this._allowNoCurrent) {
        this._currentItemDom = itemDom;
      }
      if (item != null ? item.isDataWrapper : void 0) {
        originItem = item;
        item = item._data;
      } else {
        originItem = item;
      }
      if (typeof item === "object") {
        itemId = _getEntityId(item);
      }
      alias = item._alias;
      if (!alias) {
        alias = originItem != null ? originItem._alias : void 0;
        if (alias == null) {
          alias = this._alias;
        }
      }
      this._templateContext.defaultPath = (typeof this._getDefaultBindPath === "function" ? this._getDefaultBindPath(originItem) : void 0) || alias;
      itemScope = cola.util.userData(itemDom, "scope");
      oldScope = cola.currentScope;
      try {
        if (!itemScope) {
          itemScope = new cola.ItemScope(parentScope, alias);
          cola.currentScope = itemScope;
          itemScope.data.setTargetData(item, true);
          cola.util.userData(itemDom, "scope", itemScope);
          cola.util.userData(itemDom, "item", originItem);
          if (typeof this._doRefreshItemDom === "function") {
            this._doRefreshItemDom(itemDom, item, itemScope);
          }
          cola.xRender(itemDom, itemScope, this._templateContext);
        } else {
          cola.currentScope = itemScope;
          if (itemScope.data.getTargetData() !== item) {
            if (itemDom._itemId) {
              delete this._itemDomMap[itemDom._itemId];
            }
            if (itemScope.data.alias !== alias) {
              throw new cola.Exception("Repeat alias mismatch. Expect \"" + itemScope.alias + "\" but \"" + alias + "\".");
            }
            cola.util.userData(itemDom, "item", originItem);
            itemScope.data.setTargetData(item);
          }
          if (typeof this._doRefreshItemDom === "function") {
            this._doRefreshItemDom(itemDom, item, itemScope);
          }
        }
        if (itemId) {
          parentScope.regItemScope(itemId, itemScope);
        }
        if (this.getListeners("renderItem")) {
          this.fire("renderItem", this, {
            item: originItem,
            dom: itemDom,
            scope: itemScope
          });
        }
      } finally {
        cola.currentScope = oldScope;
      }
      if (itemId) {
        itemDom._itemId = itemId;
        this._itemDomMap[itemId] = itemDom;
      }
      return itemScope;
    };

    ItemsView.prototype.refreshItem = function(item) {
      var itemDom, itemId;
      itemId = _getEntityId(item);
      itemDom = this._itemDomMap[itemId];
      if (itemDom) {
        if (typeof this._doRefreshItemDom === "function") {
          this._doRefreshItemDom(itemDom, item, this._itemsScope);
        }
      }
    };

    ItemsView.prototype._onItemRefresh = function(arg) {
      var item;
      item = arg.entity;
      if (typeof item === "object") {
        this.refreshItem(item);
      }
    };

    ItemsView.prototype._findItemDom = function(target) {
      var itemDom;
      while (target) {
        if (target._itemType) {
          itemDom = target;
          break;
        }
        target = target.parentNode;
      }
      return itemDom;
    };

    ItemsView.prototype._onItemClick = function(evt) {
      var item, itemDom;
      itemDom = evt.currentTarget;
      if (!itemDom) {
        return;
      }
      item = cola.util.userData(itemDom, "item");
      if (itemDom._itemType === "default") {
        if (item) {
          if (this._changeCurrentitem && item._parent instanceof cola.EntityList) {
            item._parent.setCurrent(item);
          } else {
            this._setCurrentItemDom(itemDom);
          }
        }
      }
      this.fire("itemClick", this, {
        event: evt,
        item: item,
        dom: itemDom
      });
    };

    ItemsView.prototype._onItemDoubleClick = function(evt) {
      var item, itemDom;
      itemDom = evt.currentTarget;
      if (!itemDom) {
        return;
      }
      item = cola.util.userData(itemDom, "item");
      this.fire("itemDoubleClick", this, {
        event: evt,
        item: item,
        dom: itemDom
      });
    };

    ItemsView.prototype._bindEvent = function(eventName) {
      if (eventName === "itemPress") {
        this._on("press", (function(_this) {
          return function(self, arg) {
            var itemDom;
            itemDom = _this._findItemDom(arg.event.target);
            if (itemDom) {
              arg.itemDom = itemDom;
              arg.item = cola.util.userData(itemDom, "item");
              _this.fire("itemPress", list, arg);
            }
          };
        })(this));
      } else {
        return ItemsView.__super__._bindEvent.call(this, eventName);
      }
    };

    ItemsView.prototype._createPullAction = function() {
      this._pullAction = new cola.PullAction(this._doms.itemsWrapper, {
        pullDownPane: this._doms.pullDownPane,
        pullUpPane: this._doms.pullUpPane,
        pullStart: (function(_this) {
          return function(evt, pullPane, pullState) {
            var collection;
            if (_this.getListeners("pullStart")) {
              return _this.fire("pullStart", _this, {
                event: evt,
                pullPane: pullPane,
                direction: pullState
              });
            } else if (pullState === "up" && !_this.getListeners("pullComplete")) {
              collection = _this._realItems;
              if (collection instanceof cola.EntityList) {
                return collection.pageNo < collection.pageCount;
              }
            }
          };
        })(this),
        pullStep: (function(_this) {
          return function(evt, pullPane, pullState, distance, theshold) {
            return _this.fire("pullStep", _this, {
              event: evt,
              pullPane: pullPane,
              direction: pullState,
              distance: distance,
              theshold: theshold
            });
          };
        })(this),
        pullComplete: (function(_this) {
          return function(evt, pullPane, pullState, done) {
            var collection;
            if (_this.getListeners("pullComplete")) {
              return _this.fire("pullComplete", _this, {
                event: evt,
                pullPane: pullPane,
                direction: pullState,
                done: done
              });
            } else {
              if (pullState === "down") {
                collection = _this._realOriginItems || _this._realItems;
                if (collection instanceof cola.EntityList) {
                  collection.flush(done);
                } else {
                  done();
                }
              } else if (pullState === "up") {
                collection = _this._realItems;
                if (collection instanceof cola.EntityList) {
                  collection.nextPage(done);
                } else {
                  done();
                }
              }
            }
          };
        })(this),
        pullCancel: (function(_this) {
          return function(evt, pullPane, pullState) {
            return _this.fire("pullCancel", _this, {
              event: evt,
              pullPane: pullPane,
              direction: pullState
            });
          };
        })(this)
      });
    };

    return ItemsView;

  })(cola.Widget);

  cola.Element.mixin(cola.ItemsView, cola.TemplateSupport);

  cola.Element.mixin(cola.ItemsView, cola.DataItemsWidgetMixin);

  SAFE_PULL_EFFECT = cola.os.android && !cola.browser.chrome;

  cola.PullAction = (function() {
    function PullAction(content, options) {
      var k, pullDownPane, pullUpPane, v;
      this.content = content;
      this.contentWrapper = this.content.parentNode;
      this.options = {
        resistance: 2.5,
        startTheshold: 10,
        pullTheshold: 0.4
      };
      for (k in options) {
        v = options[k];
        this.options[k] = v;
      }
      pullDownPane = this.options.pullDownPane;
      if (pullDownPane && typeof pullDownPane === "string") {
        pullDownPane = document.body.querySelector(pullDownPane);
      }
      if (pullDownPane) {
        this.pullDownPane = pullDownPane;
        if (this.content.previousSibling !== pullDownPane) {
          $fly(this.content).before(pullDownPane);
        }
        $fly(pullDownPane).addClass("pull-down-pane");
        this.pullDownDistance = pullDownPane.offsetHeight;
        this.contentWrapper.scrollTop = this.pullDownDistance;
      }
      pullUpPane = this.options.pullUpPane;
      if (pullUpPane && typeof pullUpPane === "string") {
        pullUpPane = document.body.querySelector(pullUpPane);
      }
      if (pullUpPane) {
        this.pullUpPane = pullUpPane;
        if (this.content.nextSibling !== pullUpPane) {
          $fly(this.content).after(pullUpPane);
        }
        $fly(pullUpPane).addClass("pull-up-pane");
        this.pullUpDistance = pullUpPane.offsetHeight;
      }
      $(this.content).on("touchstart", (function(_this) {
        return function(evt) {
          return _this._onTouchStart(evt);
        };
      })(this)).on("touchmove", (function(_this) {
        return function(evt) {
          return _this._onTouchMove(evt);
        };
      })(this)).on("touchend", (function(_this) {
        return function(evt) {
          return _this._onTouchEnd(evt);
        };
      })(this));
    }

    PullAction.prototype._getTouchPoint = function(evt) {
      var touches;
      touches = evt.originalEvent.touches;
      if (!touches.length) {
        touches = evt.originalEvent.changedTouches;
      }
      return touches[0];
    };

    PullAction.prototype._onTouchStart = function(evt) {
      var touchPoint;
      if (this._disabled) {
        this.pullState = null;
        this._watchingTouchMove = false;
      } else {
        this._scrollTop = this.content.scrollTop;
        if (this.options.pullDownPane && this._scrollTop <= 0) {
          this.pullState = "pre-down";
          this._watchingTouchMove = true;
        } else if (this.options.pullUpPane && (this._scrollTop + this.content.clientHeight) >= this.content.scrollHeight) {
          this.pullState = "pre-up";
          this._watchingTouchMove = true;
        } else {
          this.pullState = null;
          this._watchingTouchMove = false;
        }
      }
      this.pullReached = false;
      this._panStarted = 0;
      if (this._watchingTouchMove) {
        touchPoint = this._getTouchPoint(evt);
        this._touchStartX = touchPoint.pageX;
        this._touchStartY = touchPoint.pageY;
        if (cola.os.ios) {
          if (this._scrollTop < 0 || (this._scrollTop + this.content.clientHeight) > this.content.scrollHeight) {
            return false;
          }
        }
      }
    };

    PullAction.prototype._onTouchMove = function(evt) {
      var base, distanceX, distanceY, pullPane, retValue, startTheshold, touchPoint;
      if (!this._watchingTouchMove) {
        return;
      }
      touchPoint = this._getTouchPoint(evt);
      distanceX = touchPoint.pageX - this._touchStartX;
      distanceY = touchPoint.pageY - this._touchStartY;
      if (!this._panStarted) {
        if (Math.abs(distanceX) < 20 && (distanceY > 0 && this.pullState === "pre-down" || distanceY < 0 && this.pullState === "pre-up")) {
          startTheshold = this.options.startTheshold;
          if (distanceY > startTheshold && this.pullState === "pre-down") {
            this.pullState = "down";
          } else {
            distanceY < -startTheshold && (this.pullState === "pre-up" ? this.pullState = "up" : void 0);
          }
          if (this.pullState === "down" || this.pullState === "up") {
            this._panStarted = new Date();
            pullPane = this.pullState === "down" ? this.options.pullDownPane : this.options.pullUpPane;
            if ((typeof (base = this.options).pullStart === "function" ? base.pullStart(evt, pullPane, this.pullState) : void 0) === false) {
              this.pullState = null;
              this._watchingTouchMove = false;
              return;
            }
          }
          retValue = false;
        }
      }
      if (this._panStarted) {
        this._onPanMove(evt, Math.abs(distanceY));
      }
      if (retValue === false || this._panStarted) {
        evt.stopImmediatePropagation();
        return false;
      } else {

      }
    };

    PullAction.prototype._onPanMove = function(evt, distance) {
      var base, maxDistance, pullPane, pullTheshold, reached;
      distance = distance / this.options.resistance;
      this._distance = distance;
      if (this.pullState === "down") {
        maxDistance = this.pullDownDistance;
        pullTheshold = maxDistance * this.options.pullTheshold;
        reached = distance > pullTheshold;
        if (distance > maxDistance) {
          distance = maxDistance;
        }
        pullPane = this.options.pullDownPane;
        this.contentWrapper.scrollTop = maxDistance - distance;
      } else if (this.pullState === "up") {
        maxDistance = this.pullUpDistance;
        pullTheshold = maxDistance * this.options.pullTheshold;
        reached = distance > pullTheshold;
        if (distance > maxDistance) {
          distance = maxDistance;
        }
        pullPane = this.options.pullUpPane;
        this.contentWrapper.scrollTop = this.options.pullUpPane.offsetTop - this.contentWrapper.clientHeight + distance;
      }
      if (pullPane) {
        this.pullReached = reached;
        $fly(pullPane).toggleClass("reached", reached);
        if (typeof (base = this.options).pullStep === "function") {
          base.pullStep(evt, pullPane, this.pullState, distance, pullTheshold);
        }
      }
    };

    PullAction.prototype._onTouchEnd = function(evt) {
      var base, pullAction, pullPane, pullState, scrollTop;
      if (!this._panStarted) {
        return;
      }
      pullState = this.pullState;
      if (pullState === "down") {
        pullPane = this.options.pullDownPane;
      } else if (pullState === "up") {
        pullPane = this.options.pullUpPane;
      }
      if (!pullPane) {
        return;
      }
      this._disabled = true;
      $fly(pullPane).removeClass("reached");
      if (this.pullReached) {
        if (this.pullState === "down") {
          scrollTop = this.pullDownDistance * (1 - this.options.pullTheshold);
        } else {
          scrollTop = (this.options.pullUpPane.offsetTop - this.contentWrapper.clientHeight) + this.pullUpDistance * (1 - this.options.pullTheshold);
        }
        if (SAFE_PULL_EFFECT) {
          this.contentWrapper.scrollTop = scrollTop;
        } else {
          $fly(this.contentWrapper).animate({
            scrollTop: scrollTop
          }, {
            duration: 200
          });
        }
        $fly(pullPane).addClass("executing");
        pullAction = this;
        this._executePullAction(evt, pullState, function() {
          pullAction._hidePullPane(pullState);
        });
      } else {
        if (typeof (base = this.options).pullCancel === "function") {
          base.pullCancel(evt, pullPane, pullState);
        }
        this._hidePullPane(pullState);
      }
    };

    PullAction.prototype._executePullAction = function(evt, pullState, done) {
      var pullPane;
      if (this.options.pullComplete) {
        pullPane = this.pullState === "down" ? this.options.pullDownPane : this.options.pullUpPane;
        this.options.pullComplete(evt, pullPane, pullState, done);
      } else {
        done();
      }
    };

    PullAction.prototype._hidePullPane = function(pullState) {
      var contentWrapperStyle, pullAction, pullPane;
      if (pullState === "down") {
        pullPane = this.options.pullDownPane;
      } else if (pullState === "up") {
        pullPane = this.options.pullUpPane;
      }
      if (SAFE_PULL_EFFECT) {
        this.contentWrapper.scrollTop = this.pullDownDistance;
        this._disabled = false;
        $fly(pullPane).removeClass("executing");
      } else {
        pullAction = this;
        $(this.contentWrapper).animate({
          scrollTop: this.pullDownDistance
        }, {
          duration: 200,
          complete: function() {
            pullAction._disabled = false;
            $fly(pullPane).removeClass("executing");
          }
        });
      }
      if (cola.os.android && cola.browser.qqbrowser) {
        contentWrapperStyle = this.contentWrapper.style;
        if (contentWrapperStyle.marginTop) {
          contentWrapperStyle.marginTop = "";
        } else {
          contentWrapperStyle.marginTop = "0.001px";
        }
      }
    };

    return PullAction;

  })();

  SAFE_SLIDE_EFFECT = cola.os.android && !cola.browser.chrome;

  SLIDE_ANIMATION_SPEED = 200;

  LIST_SIZE_PREFIXS = ["small", "medium", "large", "xlarge", "xxlarge"];

  _createGroupArray = function() {
    var groups;
    groups = [];
    groups._grouped = true;
    return groups;
  };

  cola.ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.CLASS_NAME = "items-view list-view";

    ListView.prototype._columnsChanged = true;

    ListView.ATTRIBUTES = {
      items: {
        expressionType: "repeat",
        refreshItems: true,
        setter: function(items) {
          if (this._items === items) {
            return;
          }
          this._set("bind", void 0);
          this._items = items;
        }
      },
      bind: {
        refreshItems: true,
        setter: function(bindStr) {
          this._set("items", void 0);
          return this._bindSetter(bindStr);
        }
      },
      textProperty: {
        refreshItems: true
      },
      columns: {
        refreshItems: true,
        defaultValue: "row",
        setter: function(columns) {
          this._columns = columns;
          this._columnsChanged = true;
        }
      },
      itemWidth: null,
      itemHeight: null,
      group: {
        refreshItems: true
      },
      groupCollapsible: {
        type: "boolean",
        defaultValue: true
      },
      indexBar: {
        refreshItems: true
      },
      itemSlide: {
        "enum": ["none", "left", "right", "both"],
        defaultValue: "none",
        setter: function(value) {
          var left, right;
          this._itemSlide = value;
          if (value) {
            if (value === "left") {
              left = true;
            } else if (value === "right") {
              right = true;
            } else {
              left = true;
              right = true;
            }
            this._leftItemSlide = left;
            return this._rightItemSlide = right;
          }
        }
      }
    };

    ListView.EVENTS = {
      getGroupString: null,
      itemSlideStart: null,
      itemSlideStep: null,
      itemSlideComplete: null,
      itemSlideCancel: null,
      itemSlidePaneInit: null,
      itemSlidePaneShow: null,
      itemSlidePaneHide: null
    };

    ListView.TEMPLATES = {
      "default": {
        tagName: "li",
        "c-bind": "$default"
      },
      "group": {
        tagName: "ul",
        content: {
          tagName: "ul"
        }
      },
      "group-header": {
        tagName: "li",
        "c-bind": "group.name"
      }
    };

    ListView.prototype.destroy = function() {
      ListView.__super__.destroy.call(this);
      delete this._topGroupDom;
      if (this._indexBarRelocateTimer) {
        clearInterval(this._indexBarRelocateTimer);
      }
      delete this._itemSlidePane;
      delete this._slideItemDom;
    };

    ListView.prototype._initDom = function(dom) {
      ListView.__super__._initDom.call(this, dom);
      $fly(this._doms.itemsWrapper).delegate(".group-header", "click", (function(_this) {
        return function(evt) {
          return _this._onGroupHeaderClick(evt);
        };
      })(this));
      cola.util.delay(this, "initItemSlide", 200, this._initItemSlide);
    };

    ListView.prototype._getItems = function() {
      if (this._items) {
        return {
          items: this._items
        };
      } else {
        return ListView.__super__._getItems.call(this);
      }
    };

    ListView.prototype._groupItems = function(items) {
      var currentGroup, groups, hasGetGroupStringEvent, list;
      groups = _createGroupArray();
      currentGroup = null;
      hasGetGroupStringEvent = this.getListeners("getGroupString");
      list = this;
      cola.each(items, function(item) {
        var eventArg, groupProp, groupString;
        if (hasGetGroupStringEvent) {
          eventArg = {
            item: item,
            result: null
          };
          list.fire("getGroupString", list, eventArg);
          groupString = eventArg.result;
        } else {
          groupString = null;
          groupProp = list.group;
          if (groupProp && typeof groupProp === "string") {
            if (item instanceof cola.Entity) {
              groupString = item.get(groupProp);
            } else if (typeof item === "object") {
              groupString = item != null ? item[groupProp] : void 0;
            } else if (item) {
              groupString = item + "";
            }
          }
        }
        if (groupString === (currentGroup != null ? currentGroup.name : void 0)) {
          currentGroup.items.push(item);
        } else {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            _itemType: "group",
            _alias: "group",
            name: groupString || "#",
            items: [item]
          };
        }
      });
      if (currentGroup) {
        groups.push(currentGroup);
      }
      return groups;
    };

    ListView.prototype._convertItems = function(items) {
      items = ListView.__super__._convertItems.call(this, items);
      if (this._group && items) {
        items = this._groupItems(items);
      }
      return items;
    };

    ListView.prototype._doRefreshDom = function(dom) {
      var classNames, column, columns, i, itemsWrapper, l, len1;
      if (!this._dom) {
        return;
      }
      if (this._columnsChanged) {
        delete this._columnsChanged;
        classNames = ["items"];
        columns = this._columns || "row";
        columns = columns.split(" ");
        i = 0;
        for (l = 0, len1 = columns.length; l < len1; l++) {
          column = columns[l];
          if (column === "") {
            continue;
          }
          if (column === "row") {
            classNames.push(LIST_SIZE_PREFIXS[i] + "-row-list");
          } else {
            classNames.push(LIST_SIZE_PREFIXS[i] + "-block-grid-" + column);
          }
          i++;
          if (i >= LIST_SIZE_PREFIXS.length) {
            break;
          }
        }
        itemsWrapper = this._doms.itemsWrapper;
        if (this._group) {
          this._columnsClassNames = classNames;
          itemsWrapper.className = "items";
        } else {
          itemsWrapper.className = classNames.join(" ");
        }
      }
      ListView.__super__._doRefreshDom.call(this, dom);
      this._classNamePool.toggle("has-index-bar", !!this._indexBar);
    };

    ListView.prototype._refreshItems = function() {
      var dom, itemsWrapper, ref;
      ListView.__super__._refreshItems.call(this);
      if (this._dom) {
        if (!this._group) {
          if ((ref = this._doms.floatGroupHeaderWrapper) != null) {
            ref.style.display = "none";
          }
        }
        if (this._indexBar && this._group && this._realItems) {
          this._refreshIndexBar();
        } else if (this._doms.indexBar) {
          $fly(this._doms.indexBar).hide();
        }
        if (!cola.os.mobile && !this._indexBarRelocateTimer) {
          itemsWrapper = this._doms.itemsWrapper;
          dom = this._dom;
          this._indexBarRelocateTimer = setInterval(function() {
            $fly(dom).toggleClass("v-scroll", itemsWrapper.scrollHeight > itemsWrapper.clientHeight);
          }, 500);
        }
      }
    };

    ListView.prototype._getDefaultBindPath = function(item) {
      if (this._textProperty) {
        return (item._alias || this._alias) + "." + this._textProperty;
      }
    };

    ListView.prototype._createNewItem = function(itemType, item) {
      var $itemDom, itemDom, klass, template;
      template = this._getTemplate(itemType);
      if (template) {
        itemDom = this._cloneTemplate(template);
      } else {
        itemDom = document.createElement("li");
        itemDom.setAttribute("c-bind", "$default");
      }
      if (itemType === "group") {
        klass = "list group";
      } else if (itemType === "group-header") {
        klass = "list group-header";
        if (this._groupCollapsible) {
          klass += " collapsible";
        }
      } else {
        klass = "list item " + itemType;
      }
      itemDom._itemType = itemType;
      $itemDom = $fly(itemDom);
      $itemDom.addClass(klass);
      if (this._itemWidth) {
        $itemDom.width(this._itemWidth);
      }
      if (this._itemHeight) {
        $itemDom.height(this._itemHeight);
      }
      return itemDom;
    };

    ListView.prototype._refreshItemDom = function(itemDom, item, parentScope) {
      if (itemDom._itemType === "group") {
        return this._refreshGroupDom(itemDom, item, parentScope);
      } else {
        return ListView.__super__._refreshItemDom.call(this, itemDom, item, parentScope);
      }
    };

    ListView.prototype._refreshGroupDom = function(groupDom, group, parentScope) {
      var currentItemDom, documentFragment, groupHeaderDom, groupId, groupScope, item, itemDom, itemType, itemsWrapper, l, len1, nextItemDom, oldGroup, ref;
      if (parentScope == null) {
        parentScope = this._itemsScope;
      }
      groupId = cola.Entity._getEntityId(group);
      groupScope = cola.util.userData(groupDom, "scope");
      if (!groupScope) {
        groupDom._itemScope = groupScope = new cola.ItemScope(parentScope, group._alias);
        parentScope.regItemScope(groupId, groupScope);
        groupScope.data.setTargetData(group, true);
        cola.util.userData(groupDom, "scope", groupScope);
        cola.util.userData(groupDom, "item", group);
      } else {
        oldGroup = cola.util.userData(groupDom, "item");
        if (oldGroup !== groupScope.data.getTargetData()) {
          if (groupDom._itemId) {
            delete groupDom._itemId;
          }
          groupScope.data.setTargetData(group);
          cola.util.userData(groupDom, "item", group);
        }
      }
      if (groupId) {
        groupDom._itemId = groupId;
        this._itemDomMap[groupId] = groupDom;
      } else {
        delete groupDom._itemId;
      }
      if (!groupDom._headerCreated) {
        groupDom._headerCreated = true;
        itemsWrapper = groupDom.firstChild;
        groupHeaderDom = this._createNewItem("group-header", group);
        this._templateContext.defaultPath = group._alias;
        cola.xRender(groupHeaderDom, groupScope, this._templateContext);
        groupDom.insertBefore(groupHeaderDom, itemsWrapper);
        cola.util.userData(groupHeaderDom, "item", group);
      } else {
        itemsWrapper = groupDom.lastChild;
      }
      documentFragment = null;
      currentItemDom = itemsWrapper.firstChild;
      ref = group.items;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        item = ref[l];
        itemType = this._getItemType(item);
        itemDom = null;
        if (currentItemDom) {
          while (currentItemDom) {
            if (currentItemDom._itemType === itemType) {
              break;
            } else {
              nextItemDom = currentItemDom.nextSibling;
              groupDom.removeChild(currentItemDom);
              currentItemDom = nextItemDom;
            }
          }
          if (currentItemDom) {
            itemDom = currentItemDom;
            currentItemDom = currentItemDom.nextSibling;
          }
        }
        if (itemDom) {
          this._refreshItemDom(itemDom, item);
        } else {
          itemDom = this._createNewItem(itemType, item);
          this._refreshItemDom(itemDom, item);
          if (documentFragment == null) {
            documentFragment = document.createDocumentFragment();
          }
          documentFragment.appendChild(itemDom);
        }
      }
      if (currentItemDom) {
        itemDom = currentItemDom;
        while (itemDom) {
          nextItemDom = itemDom.nextSibling;
          itemsWrapper.removeChild(itemDom);
          if (itemDom._itemId) {
            delete this._itemDomMap[itemDom._itemId];
          }
          itemDom = nextItemDom;
        }
      }
      if (this._columnsClassNames) {
        itemsWrapper.className = this._columnsClassNames.join(" ");
      } else {
        itemsWrapper.className = "items";
      }
      if (documentFragment) {
        itemsWrapper.appendChild(documentFragment);
      }
    };

    ListView.prototype._onItemInsert = function(arg) {
      if (this._group) {
        this._refreshItems();
      } else {
        ListView.__super__._onItemInsert.call(this, arg);
      }
    };

    ListView.prototype._onItemRemove = function(arg) {
      if (this._group) {
        this._refreshItems();
      } else {
        ListView.__super__._onItemRemove.call(this, arg);
      }
    };

    ListView.prototype._onItemsWrapperScroll = function() {
      var floatGroupHeader, gap, group, nextOffsetTop, offset, ref, ref1, ref2, scrollTop, topGroupDom;
      ListView.__super__._onItemsWrapperScroll.call(this);
      if (!this._group) {
        return;
      }
      scrollTop = this._doms.itemsWrapper.scrollTop;
      if (scrollTop <= 0) {
        if ((ref = this._doms.floatGroupHeaderWrapper) != null) {
          ref.style.display = "none";
        }
        return;
      }
      topGroupDom = this._findTopGroupDom(scrollTop);
      if (topGroupDom) {
        if (topGroupDom.offsetTop === scrollTop) {
          if ((ref1 = this._doms.floatGroupHeaderWrapper) != null) {
            ref1.style.display = "none";
          }
          return;
        }
        group = cola.util.userData(topGroupDom, "item");
        floatGroupHeader = this._getFloatGroupHeader(group);
        gap = 1;
        nextOffsetTop = (ref2 = topGroupDom.nextSibling) != null ? ref2.offsetTop : void 0;
        if (nextOffsetTop > 0 && nextOffsetTop - scrollTop - gap < this._floatGroupHeaderHeight) {
          offset = this._floatGroupHeaderHeight - (nextOffsetTop - scrollTop - gap);
          floatGroupHeader.style.top = (this._floatGroupHeaderDefaultTop - offset) + "px";
          this._floatGroupHeaderMoved = true;
        } else if (this._floatGroupHeaderMoved) {
          floatGroupHeader.style.top = this._floatGroupHeaderDefaultTop + "px";
          delete this._floatGroupHeaderMoved;
        }
      }
    };

    ListView.prototype._getFloatGroupHeader = function(group) {
      var floatGroupHeader, floatGroupHeaderWrapper, groupScope, ref;
      floatGroupHeaderWrapper = this._doms.floatGroupHeaderWrapper;
      if (!floatGroupHeaderWrapper) {
        groupScope = new cola.ItemScope(this._itemsScope, group._alias);
        groupScope.data.setTargetData(group, true);
        floatGroupHeader = this._createNewItem("group-header", group);
        cola.util.userData(floatGroupHeader, "scope", groupScope);
        this._templateContext.defaultPath = group._alias;
        cola.xRender(floatGroupHeader, groupScope);
        floatGroupHeaderWrapper = $.xCreate({
          tagName: "ul",
          "class": "items float-group-header",
          content: floatGroupHeader
        });
        this._dom.appendChild(floatGroupHeaderWrapper);
        this._doms.floatGroupHeaderWrapper = floatGroupHeaderWrapper;
        this._floatGroupHeaderDefaultTop = ((ref = this._doms.pullDownPane) != null ? ref.offsetHeight : void 0) || 0;
        this._floatGroupHeaderHeight = floatGroupHeaderWrapper.offsetHeight;
        floatGroupHeaderWrapper.style.top = this._floatGroupHeaderDefaultTop + "px";
      } else {
        floatGroupHeader = floatGroupHeaderWrapper.firstChild;
        groupScope = cola.util.userData(floatGroupHeader, "scope");
        groupScope.data.setTargetData(group);
        if (floatGroupHeaderWrapper.style.display === "none") {
          floatGroupHeaderWrapper.style.display = "";
        }
      }
      return floatGroupHeaderWrapper;
    };

    ListView.prototype._findTopGroupDom = function(scrollTop) {
      var currentGroupDom, currentGroupDomTop, groupDom, groupDomOffsetTop, groups;
      groups = this._realItems;
      if (!(groups != null ? groups.length : void 0)) {
        return;
      }
      currentGroupDom = this._topGroupDom || this._doms.itemsWrapper.firstChild;
      currentGroupDomTop = currentGroupDom.offsetTop;
      if (currentGroupDomTop <= scrollTop) {
        groupDom = currentGroupDom.nextSibling;
        while (groupDom) {
          groupDomOffsetTop = groupDom.offsetTop;
          if (groupDomOffsetTop > scrollTop) {
            groupDom = groupDom.previousSibling;
            if (this._topGroupDom !== groupDom) {
              this._topGroupDom = groupDom;
            }
            break;
          }
          groupDom = groupDom.nextSibling;
        }
      } else {
        groupDom = currentGroupDom.previousSibling;
        while (groupDom) {
          groupDomOffsetTop = groupDom.offsetTop;
          if (groupDomOffsetTop <= scrollTop) {
            this._topGroupDom = groupDom;
            break;
          }
          groupDom = groupDom.previousSibling;
        }
      }
      return groupDom;
    };

    ListView.prototype._onGroupHeaderClick = function(evt) {
      var groupDom, item, itemDom;
      itemDom = evt.currentTarget;
      item = cola.util.userData(itemDom, "item");
      groupDom = itemDom.parentNode;
      if (!item._collapsed) {
        item._collapsed = true;
        $fly(itemDom).addClass("collapsed");
        $fly(groupDom).css("overflow", "hidden").animate({
          height: itemDom.offsetHeight
        }, {
          duration: 150,
          easing: "swing"
        });
      } else {
        item._collapsed = false;
        $fly(itemDom).removeClass("collapsed");
        $fly(groupDom).animate({
          height: groupDom.scrollHeight
        }, {
          duration: 150,
          easing: "swing",
          complete: function() {
            groupDom.style.height = "";
            groupDom.style.overflow = "";
          }
        });
      }
      return false;
    };

    ListView.prototype._createPullAction = function() {
      var indexBar;
      ListView.__super__._createPullAction.call(this);
      if (this._doms.indexBar) {
        indexBar = this._doms.indexBar;
        if (this._pullAction.pullDownDistance && $fly(indexBar).css("position") === "absolute") {
          indexBar.style.marginTop = this._pullAction.pullDownDistance + "px";
          indexBar.style.marginBottom = -this._pullAction.pullDownDistance + "px";
        }
      }
    };

    ListView.prototype._refreshIndexBar = function() {
      var clearCurrent, currentItemDom, documentFragment, goIndex, group, groups, i, indexBar, itemDom, l, len1, list, nextDom;
      list = this;
      indexBar = this._doms.indexBar;
      if (!indexBar) {
        goIndex = function(target, animate) {
          var currentIndexDom, group, groupDom, groupId, indexDom, itemsWrapper, timestamp;
          indexDom = target;
          while (indexDom && indexDom !== indexBar) {
            if (indexDom._groupIndex >= 0) {
              break;
            }
            indexDom = indexDom.parentNode;
          }
          if ((indexDom != null ? indexDom._groupIndex : void 0) >= 0) {
            timestamp = new Date();
            if (!list._currentIndex || list._currentIndex !== indexDom._groupIndex && timestamp - list._currentIndexTimestamp > 100) {
              list._currentIndex = indexDom._groupIndex;
              list._currentIndexTimestamp = timestamp;
              currentIndexDom = indexBar.querySelector(".current");
              if (currentIndexDom) {
                $fly(currentIndexDom).removeClass("current");
              }
              $fly(indexDom).addClass("current");
              group = list._realItems[indexDom._groupIndex];
              groupId = cola.Entity._getEntityId(group);
              if (groupId) {
                groupDom = list._itemDomMap[groupId];
                if (groupDom) {
                  itemsWrapper = list._doms.itemsWrapper;
                  if (animate) {
                    $(itemsWrapper).animate({
                      scrollTop: groupDom.offsetTop
                    }, {
                      duration: 150,
                      easing: "swing",
                      queue: true
                    });
                  } else {
                    itemsWrapper.scrollTop = groupDom.offsetTop;
                  }
                }
              }
            }
          }
        };
        clearCurrent = function() {
          setTimeout(function() {
            var currentIndexDom;
            currentIndexDom = indexBar.querySelector(".current");
            if (currentIndexDom) {
              $fly(currentIndexDom).removeClass("current");
            }
          }, 300);
        };
        this._doms.indexBar = indexBar = $.xCreate({
          tagName: "div",
          "class": "index-bar",
          mousedown: function(evt) {
            return goIndex(evt.target, true);
          },
          mouseup: clearCurrent,
          touchstart: function(evt) {
            return goIndex(evt.target, true);
          },
          touchmove: function(evt) {
            var target, touch;
            touch = evt.originalEvent.touches[0];
            target = document.elementFromPoint(touch.pageX, touch.pageY);
            goIndex(target, true);
            return false;
          },
          touchend: clearCurrent
        });
        this._dom.appendChild(indexBar);
      } else {
        $fly(indexBar).show();
      }
      documentFragment = null;
      currentItemDom = indexBar.firstChild;
      groups = this._realItems;
      for (i = l = 0, len1 = groups.length; l < len1; i = ++l) {
        group = groups[i];
        if (currentItemDom) {
          itemDom = currentItemDom;
          currentItemDom = currentItemDom.nextSibling;
        } else {
          itemDom = $.xCreate({
            tagName: "div",
            "class": "index",
            content: "^span"
          });
          if (documentFragment == null) {
            documentFragment = document.createDocumentFragment();
          }
          documentFragment.appendChild(itemDom);
        }
        $fly(itemDom.firstChild).text(group.name);
        itemDom._groupIndex = i;
      }
      if (documentFragment) {
        indexBar.appendChild(documentFragment);
      } else {
        while (currentItemDom) {
          nextDom = currentItemDom.nextSibling;
          indexBar.removeChild(currentItemDom);
          currentItemDom = nextDom;
        }
      }
    };

    ListView.prototype._initItemSlide = function() {
      var itemScope, itemsWrapper, leftSlidePaneTemplate, rightSlidePaneTemplate;
      leftSlidePaneTemplate = this._getTemplate("slide-left-pane");
      rightSlidePaneTemplate = this._getTemplate("slide-right-pane");
      if (!(leftSlidePaneTemplate || rightSlidePaneTemplate)) {
        return;
      }
      itemsWrapper = this._doms.itemsWrapper;
      if (this._itemSlide && this._itemSlide !== "none") {
        $fly(itemsWrapper).on("touchstart", (function(_this) {
          return function(evt) {
            return _this._onItemsWrapperTouchStart(evt);
          };
        })(this)).on("touchmove", (function(_this) {
          return function(evt) {
            return _this._onItemsWrapperTouchMove(evt);
          };
        })(this)).on("touchend", (function(_this) {
          return function(evt) {
            return _this._onItemsWrapperTouchEnd(evt);
          };
        })(this));
      }
      itemScope = new cola.ItemScope(this._itemsScope, this._alias);
      this._templateContext.defaultPath = this._alias;
      if (leftSlidePaneTemplate) {
        $fly(leftSlidePaneTemplate).addClass("item-slide-pane protected").css("right", "100%");
        cola.xRender(leftSlidePaneTemplate, itemScope, this._templateContext);
        cola.util.userData(leftSlidePaneTemplate, "scope", itemScope);
        cola._ignoreNodeRemoved = true;
        itemsWrapper.appendChild(leftSlidePaneTemplate);
        cola._ignoreNodeRemoved = false;
      }
      if (rightSlidePaneTemplate) {
        $fly(rightSlidePaneTemplate).addClass("item-slide-pane protected").css("left", "100%");
        cola.xRender(rightSlidePaneTemplate, itemScope, this._templateContext);
        cola.util.userData(rightSlidePaneTemplate, "scope", itemScope);
        cola._ignoreNodeRemoved = true;
        itemsWrapper.appendChild(rightSlidePaneTemplate);
        cola._ignoreNodeRemoved = false;
      }
    };

    ListView.prototype._getTouchPoint = function(evt) {
      var touches;
      touches = evt.originalEvent.touches;
      if (!touches.length) {
        touches = evt.originalEvent.changedTouches;
      }
      return touches[0];
    };

    ListView.prototype._onItemsWrapperTouchStart = function(evt) {
      var arg, item, itemDom, touch;
      this._start = new Date;
      if (!(this._itemSlide && (!this._itemSlideState || this._itemSlideState === "closed" || this._itemSlideState === "ignore"))) {
        return;
      }
      itemDom = this._findItemDom(evt.target);
      if (itemDom) {
        if (itemDom.offsetWidth < this._doms.itemsWrapper.clientWidth * 0.6) {
          return;
        }
        item = cola.util.userData(itemDom, "item");
      }
      if (!item) {
        return;
      }
      if (this.getListeners("itemSlideStart")) {
        arg = {
          event: evt,
          item: item
        };
        if (this.fire("itemSlideStart", this, arg) === false) {
          return;
        }
      } else {
        if (this._getItemType(item) === "group") {
          return;
        }
      }
      this._slideItemDom = itemDom;
      this._itemSlideState = null;
      touch = evt.originalEvent.touches[0];
      this._touchStartX = touch.pageX;
      this._touchStartY = touch.pageY;
      this._touchTimestamp = new Date();
    };

    ListView.prototype._initItemSlidePane = function(itemDom, direction) {
      var indexBar, item, itemScope, oldSlidePane, slidePane;
      item = cola.util.userData(itemDom, "item");
      if (direction !== this._itemSlideDirection) {
        oldSlidePane = this._itemSlidePane;
        if (oldSlidePane) {
          $fly(oldSlidePane).hide();
          if (!SAFE_SLIDE_EFFECT) {
            $fly(oldSlidePane).css("transform", "");
          }
        }
        this._itemSlideDirection = direction;
        this._itemSlidePane = slidePane = this._getTemplate("slide-" + direction + "-pane");
        if (slidePane) {
          itemScope = cola.util.userData(slidePane, "scope");
          itemScope.data.setTargetData(item);
          if (this.getListeners("itemSlidePaneInit")) {
            this.fire("itemSlidePaneInit", this, {
              item: item,
              direction: direction,
              slidePane: slidePane
            });
          }
          if (direction === "right" && this._maxDistanceAdjust === void 0 && this._indexBar) {
            indexBar = this._doms.indexBar;
            if (indexBar) {
              this._maxDistanceAdjust = indexBar.offsetWidth + parseInt($fly(indexBar).css("right"));
            } else {
              this._maxDistanceAdjust = 0;
            }
          }
          $fly(slidePane).css({
            top: itemDom.offsetTop,
            "pointer-events": "none"
          }).show();
          this._maxSlideDistance = slidePane.offsetWidth;
          if (direction === "right") {
            this._maxSlideDistance += this._maxDistanceAdjust || 0;
          }
        } else {
          this._maxSlideDistance = itemDom.offsetWidth;
        }
      } else {
        slidePane = this._itemSlidePane;
      }
      return slidePane;
    };

    ListView.prototype._onItemsWrapperTouchMove = function(evt) {
      var direction, distanceX, distanceY, factor, item, itemDom, slideDom, slidePane, timestamp, touchPoint, translate;
      if (!this._itemSlide) {
        return;
      }
      if (this._itemSlideState === "prevent") {
        evt.stopImmediatePropagation();
        return false;
      }
      if (!(!this._itemSlideState || this._itemSlideState === "slide")) {
        return;
      }
      touchPoint = this._getTouchPoint(evt);
      this._touchLastX = touchPoint.pageX;
      this._touchLastY = touchPoint.pageY;
      distanceX = this._touchLastX - this._touchStartX;
      distanceY = this._touchLastY - this._touchStartY;
      timestamp = new Date();
      itemDom = this._slideItemDom;
      if (!this._itemSlideState) {
        if (Math.abs(distanceX) > 5 && Math.abs(distanceX) > Math.abs(distanceY)) {
          this._itemSlideState = "slide";
          this._itemSlideDirection = null;
          if (cola.browser.chrome) {
            itemDom.style.opacity = 0.999;
          }
        } else {
          this._itemSlideState = "ignore";
          return;
        }
      }
      this._touchMoveSpeed = distanceX / (timestamp - this._touchLastTimstamp);
      this._touchLastTimstamp = timestamp;
      if (distanceX < 0) {
        direction = "right";
        factor = -1;
      } else {
        direction = "left";
        factor = 1;
      }
      if (itemDom.firstChild && itemDom.firstChild === itemDom.lastChild) {
        slideDom = itemDom.firstChild;
      } else {
        slideDom = itemDom;
      }
      slidePane = this._initItemSlidePane(itemDom, direction);
      if (slidePane) {
        if (Math.abs(distanceX) <= this._maxSlideDistance) {
          this._currentSlideDistance = distanceX;
        } else {
          this._currentSlideDistance = this._maxSlideDistance * factor;
        }
        if (!SAFE_SLIDE_EFFECT) {
          translate = "translate(" + this._currentSlideDistance + "px,0)";
          $fly(slideDom).css("transform", translate);
          $fly(slidePane).css("transform", translate);
        }
        if (this.getListeners("itemSlideStep")) {
          item = cola.util.userData(itemDom, "item");
          this.fire("itemSlideStep", this, {
            event: evt,
            item: item,
            distance: distanceX,
            speed: this._touchMoveSpeed
          });
        }
      }
      evt.stopImmediatePropagation();
      return false;
    };

    ListView.prototype._onItemsWrapperTouchEnd = function(evt) {
      var currentDistance, direction, itemDom, maxDistance, openAnimate, opened, slideDom, slidePane;
      if (this._itemSlideState !== "slide") {
        return;
      }
      currentDistance = this._currentSlideDistance;
      if (currentDistance === 0) {
        return;
      }
      itemDom = this._slideItemDom;
      maxDistance = this._maxSlideDistance;
      opened = false;
      if (Math.abs(currentDistance) === maxDistance) {
        opened = true;
      } else if (Math.abs(currentDistance) / maxDistance > 0.5) {
        opened = true;
        openAnimate = true;
      } else if (Math.abs(this._touchMoveSpeed) > 5) {
        opened = true;
        openAnimate = true;
      }
      if (cola.browser.chrome) {
        itemDom.style.opacity = "";
      }
      if (opened) {
        this.fire("itemSlideComplete", this, {
          event: evt,
          item: cola.util.userData(itemDom, "item"),
          distance: this._currentSlideDistance,
          speed: this._touchMoveSpeed
        });
      } else {
        this.fire("itemSlideCancel", this, {
          event: evt,
          item: cola.util.userData(itemDom, "item")
        });
      }
      direction = this._itemSlideDirection;
      if (itemDom.firstChild && itemDom.firstChild === itemDom.lastChild) {
        slideDom = itemDom.firstChild;
      } else {
        slideDom = itemDom;
      }
      if (direction === "right") {
        if (!SAFE_SLIDE_EFFECT) {
          $(slideDom).transit({
            x: 0,
            duration: SLIDE_ANIMATION_SPEED * 2
          });
        }
      } else {
        $(slideDom).transit({
          x: maxDistance,
          duration: SLIDE_ANIMATION_SPEED
        });
      }
      if (opened) {
        slidePane = this._itemSlidePane;
        if (slidePane) {
          this._showItemSlidePane(itemDom, direction, slidePane, openAnimate);
        } else {
          this._itemSlideState = "closed";
        }
      } else {
        this._hideItemSlidePane(false);
      }
    };

    ListView.prototype._showItemSlidePane = function(itemDom, direction, slidePane, openAnimate) {
      var $slidePane, factor;
      $fly(this._doms.itemsWrapper).dimmer({
        opacity: 0.0001,
        duration: 0,
        closable: false
      }).dimmer("show").find(">.ui.dimmer").on("touchstart", (function(_this) {
        return function() {
          if (_this._itemSlideState === "waiting") {
            _this.hideItemSlidePane();
          }
        };
      })(this));
      $slidePane = $(slidePane);
      if (openAnimate || SAFE_SLIDE_EFFECT) {
        factor = direction === "right" ? -1 : 1;
        $slidePane.show().transit({
          x: this._maxSlideDistance * factor,
          duration: SLIDE_ANIMATION_SPEED,
          complete: (function(_this) {
            return function() {
              $slidePane.css("pointer-events", "");
              _this._onItemSlidePaneShow(direction, slidePane, itemDom);
            };
          })(this)
        });
      } else {
        this._onItemSlidePaneShow(direction, slidePane, itemDom);
      }
    };

    ListView.prototype._hideItemSlidePane = function(opened, animation) {
      var direction, itemDom, slideDom, slidePane;
      this._itemSlideState = "closing";
      itemDom = this._slideItemDom;
      slidePane = this._itemSlidePane;
      direction = this._itemSlideDirection;
      if (direction === "left") {
        if (itemDom.firstChild && itemDom.firstChild === itemDom.lastChild) {
          slideDom = itemDom.firstChild;
        } else {
          slideDom = itemDom;
        }
        $(slideDom).transit({
          x: 0,
          duration: SLIDE_ANIMATION_SPEED
        });
      }
      $fly(this._doms.itemsWrapper).dimmer("hide");
      if (slidePane) {
        $(slidePane).transit({
          x: 0,
          duration: animation ? SLIDE_ANIMATION_SPEED : 0,
          complete: (function(_this) {
            return function() {
              $fly(slidePane).hide();
              delete _this._itemSlidePane;
              _this._onItemSlidePaneHide(opened, direction, slidePane, itemDom);
            };
          })(this)
        });
      } else {
        this._onItemSlidePaneHide(opened, direction, slidePane, itemDom);
      }
    };

    ListView.prototype._onItemSlidePaneShow = function(direction, slidePane, itemDom) {
      this._itemSlideState = "waiting";
      this.fire("itemSlidePaneShow", this, {
        item: cola.util.userData(itemDom, "item"),
        direction: direction,
        slidePane: slidePane
      });
    };

    ListView.prototype._onItemSlidePaneHide = function(opened, direction, slidePane, itemDom) {
      this._itemSlideDirection = null;
      this._itemSlideState = "closed";
      this._slideItemDom = null;
      if (opened) {
        this.fire("itemSlidePaneHide", this, {
          item: cola.util.userData(itemDom, "item"),
          direction: direction,
          slidePane: slidePane
        });
      }
    };

    ListView.prototype.showItemSlidePane = function(item, direction) {
      var entityId, itemDom, slidePane;
      entityId = cola.Entity._getEntityId(item);
      itemDom = this._itemDomMap[entityId];
      slidePane = this._initItemSlidePane(itemDom, direction);
      if (slidePane) {
        this._slideItemDom = itemDom;
        this._showItemSlidePane(itemDom, direction, slidePane, true);
      }
    };

    ListView.prototype.hideItemSlidePane = function(animation) {
      this._hideItemSlidePane(true, animation);
    };

    return ListView;

  })(cola.ItemsView);

  _getEntityId = cola.Entity._getEntityId;

  cola.CascadeBind = (function(superClass) {
    extend(CascadeBind, superClass);

    CascadeBind.ATTRIBUTES = {
      name: null,
      expression: {
        setter: function(expression) {
          expression = cola._compileExpression(expression, "repeat");
          if (expression) {
            if (!expression.repeat) {
              throw new cola.Exception("\"" + bindStr + "\" is not a repeat expression.");
            }
          } else {
            delete this._alias;
          }
          this._expression = expression;
        }
      },
      recursive: null,
      child: {
        setter: function(child) {
          if (child && !(child instanceof cola.CascadeBind)) {
            child = new this.constructor(this._widget, child);
          }
          this._child = child;
        }
      },
      hasChildProperty: null
    };

    function CascadeBind(widget, config) {
      this._widget = widget;
      CascadeBind.__super__.constructor.call(this, config);
    }

    CascadeBind.prototype._wrapChildItems = function(parentNode, recursiveItems, originRecursiveItems, childItems, originChildItems) {
      var args, id, itemsScope, node, nodeCache, nodeMap, nodeType, nodes;
      nodes = [];
      nodeType = this.constructor.NODE_TYPE;
      nodeCache = parentNode._nodeMap;
      nodeMap = {};
      if (recursiveItems) {
        cola.each(recursiveItems, (function(_this) {
          return function(item) {
            var id, node;
            if (nodeCache) {
              id = _getEntityId(item);
              if (id) {
                node = nodeCache[id];
                if ((node != null ? node._bind : void 0) === _this) {
                  delete nodeCache[id];
                } else {
                  node = null;
                }
              }
            }
            if (node == null) {
              node = new nodeType(_this, item);
            }
            node._parent = parentNode;
            nodeMap[node._id] = node;
            nodes.push(node);
          };
        })(this));
      }
      if (childItems) {
        cola.each(childItems, (function(_this) {
          return function(item) {
            var id, node;
            if (nodeCache) {
              id = _getEntityId(item);
              if (id) {
                node = nodeCache[id];
                if ((node != null ? node._bind : void 0) === _this) {
                  delete nodeCache[id];
                } else {
                  node = null;
                }
              }
            }
            if (node == null) {
              node = new nodeType(_this._child, item);
            }
            node._parent = parentNode;
            node._scope = parentNode._scope;
            nodes.push(node);
          };
        })(this));
      }
      for (id in nodeCache) {
        node = nodeCache[id];
        node.destroy();
      }
      parentNode._nodeMap = nodeMap;
      parentNode._children = nodes;
      delete parentNode._hasChild;
      itemsScope = parentNode._itemsScope;
      if (itemsScope) {
        args = [nodes];
        if (recursiveItems) {
          args.push(originRecursiveItems || recursiveItems);
        }
        if (childItems) {
          args.push(originChildItems || childItems);
        }
        itemsScope._setItems.apply(itemsScope, args);
      }
    };

    CascadeBind.prototype.retrieveChildNodes = function(parentNode, callback, dataCtx) {
      var base, childItems, childLoader, funcs, hasChild, isRoot, items, originChildItems, originRecursiveItems, recursiveItems, recursiveLoader, ref, ref1;
      isRoot = !parentNode._parent;
      hasChild = false;
      funcs = [];
      if (this._recursive || isRoot) {
        if (dataCtx == null) {
          dataCtx = {};
        }
        items = this._expression.evaluate(parentNode._scope, "async", dataCtx);
        if (items === void 0 && dataCtx.unloaded) {
          recursiveLoader = (ref = dataCtx.providerInvokers) != null ? ref[0] : void 0;
          if (recursiveLoader) {
            funcs.push(function(callback) {
              return recursiveLoader.invokeAsync(callback);
            });
          }
        } else {
          recursiveItems = items;
          originRecursiveItems = dataCtx.originData;
          if (recursiveItems) {
            if (recursiveItems instanceof cola.EntityList) {
              hasChild = recursiveItems.entityCount > 0;
            } else {
              hasChild = recursiveItems.length > 0;
            }
          }
        }
      }
      if (this._child && !isRoot) {
        if (dataCtx == null) {
          dataCtx = {};
        }
        items = this._child._expression.evaluate(parentNode._scope, "async", dataCtx);
        if (items === void 0 && dataCtx.unloaded) {
          childLoader = (ref1 = dataCtx.providerInvokers) != null ? ref1[0] : void 0;
          if (childLoader) {
            funcs.push(function(callback) {
              return childLoader.invokeAsync(callback);
            });
          }
        } else {
          childItems = items;
          originChildItems = dataCtx.originData;
          hasChild = true;
        }
      }
      if (funcs.length && callback) {
        cola.util.waitForAll(funcs, {
          scope: this,
          complete: function(success, result) {
            var base;
            if (success) {
              hasChild = false;
              if (this._recursive || isRoot) {
                dataCtx = {};
                recursiveItems = this._expression.evaluate(parentNode._scope, "never", dataCtx);
                originRecursiveItems = dataCtx.originData;
                if (recursiveItems) {
                  if (recursiveItems instanceof cola.EntityList) {
                    hasChild = recursiveItems.entityCount > 0;
                  } else {
                    hasChild = recursiveItems.length > 0;
                  }
                }
              }
              if (this._child && !isRoot) {
                hasChild = true;
                dataCtx = {};
                childItems = this._child._expression.evaluate(parentNode._scope, "never", dataCtx);
                originChildItems = dataCtx.originData;
              }
              if (hasChild) {
                this._wrapChildItems(parentNode, recursiveItems, originRecursiveItems, childItems, originChildItems);
              } else {
                parentNode._hasChild = false;
              }
              if (typeof (base = parentNode._itemsScope).onItemsRefresh === "function") {
                base.onItemsRefresh();
              }
              cola.callback(callback, true);
            } else {
              cola.callback(callback, false, result);
            }
          }
        });
      } else {
        if (hasChild) {
          this._wrapChildItems(parentNode, recursiveItems, originRecursiveItems, childItems, originChildItems);
        } else {
          parentNode._hasChild = false;
        }
        if (typeof (base = parentNode._itemsScope).onItemsRefresh === "function") {
          base.onItemsRefresh();
        }
        if (callback) {
          cola.callback(callback, true);
        }
      }
    };

    CascadeBind.prototype.hasChildItems = function(parentScope) {
      var dataCtx, hasChild, items;
      if (this._recursive) {
        dataCtx = {};
        items = this._expression.evaluate(parentScope, "never", dataCtx);
        if (!dataCtx.unloaded) {
          if (items) {
            if (items instanceof cola.EntityList) {
              hasChild = items.entityCount > 0;
            } else {
              hasChild = items.length > 0;
            }
            if (hasChild) {
              return true;
            }
          }
        } else {
          return true;
        }
      }
      if (this._child) {
        dataCtx = {};
        items = this._child._expression.evaluate(parentScope, "never", dataCtx);
        if (!dataCtx.unloaded) {
          if (items) {
            if (items instanceof cola.EntityList) {
              hasChild = items.entityCount > 0;
            } else {
              hasChild = items.length > 0;
            }
            if (hasChild) {
              return true;
            }
          }
        } else {
          return true;
        }
      }
      return false;
    };

    return CascadeBind;

  })(cola.Element);

  cola.Node = (function(superClass) {
    extend(Node, superClass);

    Node.prototype.isDataWrapper = true;

    Node.ATTRIBUTES = {
      bind: {
        readOnly: true
      },
      alias: null,
      data: null,
      hasChild: {
        getter: function() {
          var bind, dataCtx, items, prop, ref;
          if (((ref = this._children) != null ? ref.length : void 0) > 0) {
            return true;
          }
          if (this._hasChild != null) {
            return this._hasChild;
          }
          bind = this._bind;
          prop = bind._hasChildProperty;
          if (prop && this._data) {
            if (this._data instanceof cola.Entity) {
              return this._data.get(prop, "never");
            } else {
              return this._data[prop];
            }
          }
          if (this._scope) {
            if (bind._recursive) {
              dataCtx = {};
              items = bind._expression.evaluate(this._scope, "never", dataCtx);
              if (dataCtx.unloaded) {
                return;
              }
              if (!items) {
                return false;
              }
            }
            if (bind._child) {
              dataCtx = {};
              items = bind._child._expression.evaluate(this._scope, "never", dataCtx);
              if (dataCtx.unloaded) {
                return;
              }
              if (!items) {
                return false;
              }
            }
          }
        }
      },
      parent: {
        readOnly: true
      },
      children: {
        readOnly: true
      }
    };

    function Node(bind, data) {
      var ref, ref1;
      Node.__super__.constructor.call(this);
      this._bind = bind;
      this._alias = (ref = bind._expression) != null ? ref.alias : void 0;
      this._widget = bind._widget;
      this._data = data;
      if (typeof data === "object") {
        this._id = cola.Entity._getEntityId(data);
      } else {
        this._id = cola.uniqueId();
      }
      if ((ref1 = this._widget) != null) {
        if (typeof ref1._onNodeAttach === "function") {
          ref1._onNodeAttach(this);
        }
      }
    }

    Node.prototype.destroy = function() {
      var child, l, len1, ref, ref1;
      if (this._children) {
        ref = this._children;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          child = ref[l];
          child.destroy();
        }
      }
      if ((ref1 = this._widget) != null) {
        if (typeof ref1._onNodeDetach === "function") {
          ref1._onNodeDetach(this);
        }
      }
    };

    Node.prototype.remove = function() {
      var i, parent;
      if (this._parent) {
        parent = this._parent;
        i = parent._children.indexOf(this);
        if (i > -1) {
          parent._children.splice(i, 1);
        }
        delete parent._nodeMap[this._id];
      }
      this.destroy();
    };

    return Node;

  })(cola.Element);

  cola.TreeSupportMixin = {
    constructor: function() {
      return this._nodeMap = {};
    },
    _onNodeAttach: function(node) {
      this._nodeMap[node._id] = node;
    },
    _onNodeDetach: function(node) {
      delete this._nodeMap[node._id];
    }
  };

  NestedListNode = (function(superClass) {
    extend(NestedListNode, superClass);

    function NestedListNode() {
      return NestedListNode.__super__.constructor.apply(this, arguments);
    }

    NestedListNode.ATTRIBUTES = {
      title: {
        readOnly: true,
        getter: function() {
          var prop, title;
          prop = this._bind._titleProperty;
          if (prop) {
            if (this._data instanceof cola.Entity) {
              title = this._data.get(prop);
            } else {
              title = this._data[prop];
            }
          }
          return title || "#Unknown";
        }
      }
    };

    return NestedListNode;

  })(cola.Node);

  NestedListBind = (function(superClass) {
    extend(NestedListBind, superClass);

    function NestedListBind() {
      return NestedListBind.__super__.constructor.apply(this, arguments);
    }

    NestedListBind.NODE_TYPE = NestedListNode;

    NestedListBind.ATTRIBUTES = {
      titleProperty: null
    };

    return NestedListBind;

  })(cola.CascadeBind);

  cola.NestedList = (function(superClass) {
    extend(NestedList, superClass);

    function NestedList() {
      return NestedList.__super__.constructor.apply(this, arguments);
    }

    NestedList.CLASS_NAME = "nested-list";

    NestedList.ATTRIBUTES = {
      bind: {
        setter: function(bind) {
          if (bind && !(bind instanceof NestedListBind)) {
            bind = new NestedListBind(this, bind);
          }
          this._bind = bind;
          if (this._rootNode) {
            this._rootNode.set("bind", bind);
          }
        }
      },
      autoSplit: {
        type: "boolean",
        defaultValue: true
      },
      navBarWidth: {
        defaultValue: 280
      },
      showTitleBar: {
        type: "boolean",
        defaultValue: true
      },
      title: null,
      layerIndex: {
        readOnly: true,
        getter: function() {
          return this._layerIndex;
        }
      },
      splited: {
        readOnly: true,
        getter: function() {
          return this._autoSplit && this._largeScreen;
        }
      }
    };

    NestedList.EVENTS = {
      itemClick: null,
      renderItem: null,
      initLayer: null,
      topLayerChange: null
    };

    NestedList.prototype._initDom = function(dom) {
      var itemsScope, layer, nestedList;
      if (this._autoSplit) {
        if (cola.device.pad) {
          this._largeScreen = true;
        } else if (cola.device.desktop) {
          this._largeScreen = document.body.clientWidth > 480;
        }
      }
      if (this._doms == null) {
        this._doms = {};
      }
      layer = this._createLayer(0);
      this._layers = [layer];
      this._layerIndex = 0;
      this._initLayer(layer, null, 0);
      if (this._autoSplit && this._largeScreen) {
        $fly(dom).xAppend([
          {
            tagName: "div",
            "class": "nav",
            style: "width:" + this._navBarWidth + "px;float:left;height:100%;overflow:hidden",
            content: layer.container
          }, {
            tagName: "div",
            "class": "detail",
            style: "margin-left:" + this._navBarWidth + "px;height:100%;position:relative;overflow:hidden",
            contextKey: "detailContainer"
          }
        ], this._doms);
      } else {
        this._doms.detailContainer = dom;
        layer.container.appendTo(dom);
      }
      itemsScope = layer.list._itemsScope;
      this._rootNode = new NestedListNode(this._bind);
      this._rootNode._scope = this._scope;
      this._rootNode._itemsScope = itemsScope;
      if (this._bind) {
        this._itemsRetrieved = true;
        nestedList = this;
        this._bind.retrieveChildNodes(nestedList._rootNode, function() {
          var children, firstNode;
          if (nestedList._autoSplit && nestedList._largeScreen) {
            children = nestedList._rootNode._children;
            firstNode = children != null ? children[0] : void 0;
            if (firstNode != null ? firstNode._scope : void 0) {
              nestedList._showLayer(1, children != null ? children[0] : void 0);
            }
          }
        });
        itemsScope._retrieveItems = function(dataCtx) {
          return nestedList._bind.retrieveChildNodes(nestedList._rootNode, null, dataCtx);
        };
      }
      this.fire("topLayerChange", this, {
        index: 0,
        list: layer
      });
    };

    NestedList.prototype._parseDom = function(dom) {
      var child;
      if (!dom) {
        return;
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeName === "TEMPLATE") {
          this._regTemplate(child);
        }
        child = child.nextSibling;
      }
    };

    NestedList.prototype._createLayer = function(index) {
      var container, ctx, highlightCurrentItem, hjson, layer, list, listConfig, menuItemsConfig, name, oldRefreshItemDom, ref, template, useLayer;
      highlightCurrentItem = this._autoSplit && this._largeScreen && index === 0;
      useLayer = index > (this._autoSplit && this._largeScreen ? 1 : 0);
      hjson = {
        tagName: "div",
        style: {
          height: "100%"
        },
        contextKey: "container",
        "c-widget": useLayer ? "layer" : "widget",
        content: {
          tagName: "div",
          "class": "v-box",
          style: {
            height: "100%"
          }
        }
      };
      listConfig = {
        $type: "listView",
        "class": this._ui,
        highlightCurrentitem: true,
        allowNoCurrent: !highlightCurrentItem,
        highlightCurrentItem: highlightCurrentItem,
        height: "100%",
        userData: index,
        renderItem: (function(_this) {
          return function(self, arg) {
            return _this._onRenderItem(self, arg);
          };
        })(this),
        itemClick: (function(_this) {
          return function(self, arg) {
            return _this._onItemClick(self, arg);
          };
        })(this)
      };
      if (this._showTitleBar) {
        if (useLayer) {
          menuItemsConfig = [
            {
              icon: "chevron left",
              click: (function(_this) {
                return function() {
                  return _this.back();
                };
              })(this)
            }
          ];
        } else {
          menuItemsConfig = void 0;
        }
        hjson.content.content = [
          {
            tagName: "div",
            "class": "box",
            content: {
              tagName: "div",
              contextKey: "titleBar",
              "c-widget": {
                $type: "titleBar",
                "class": this._ui,
                items: menuItemsConfig
              }
            }
          }, {
            tagName: "div",
            "class": "flex-box",
            content: {
              tagName: "div",
              contextKey: "list",
              "c-widget": listConfig
            }
          }
        ];
      } else {
        hjson.content.content = {
          tagName: "div",
          contextKey: "list",
          "c-widget": listConfig
        };
      }
      ctx = {};
      new cola.xRender(hjson, this._scope, ctx);
      list = cola.widget(ctx.list);
      oldRefreshItemDom = list._refreshItemDom;
      list._refreshItemDom = function(itemDom, node, parentScope) {
        var itemScope;
        itemScope = oldRefreshItemDom.apply(this, arguments);
        node._scope = itemScope;
        return itemScope;
      };
      if (ctx.container) {
        container = cola.widget(ctx.container);
      } else {
        container = list;
      }
      if (this._templates) {
        ref = this._templates;
        for (name in ref) {
          template = ref[name];
          list._templates[name] = template;
        }
      }
      layer = {
        itemsScope: list._itemsScope,
        titleBar: cola.widget(ctx.titleBar),
        list: list,
        container: container
      };
      return layer;
    };

    NestedList.prototype._initLayer = function(layer, parentNode, index) {
      var ref;
      if ((ref = layer.titleBar) != null) {
        ref.set("title", parentNode ? parentNode.get("title") : this._title);
      }
      this.fire("initLayer", this, {
        parentNode: parentNode,
        parentItem: parentNode != null ? parentNode._data : void 0,
        index: index,
        list: layer.list,
        titleBar: layer.titleBar
      });
    };

    NestedList.prototype._showLayer = function(index, parentNode, callback) {
      var i, itemsScope, layer, list;
      if (index <= this._layerIndex) {
        i = index;
        while (i <= this._layerIndex) {
          this._hideLayer(i === this._layerIndex);
        }
        this._layerIndex = index - 1;
      }
      if (index >= this._layers.length) {
        layer = this._createLayer(index);
        this._layers.push(layer);
        layer.container.appendTo(this._doms.detailContainer);
      } else {
        layer = this._layers[index];
      }
      list = layer.list;
      itemsScope = list._itemsScope;
      itemsScope.setParent(parentNode._scope);
      parentNode._itemsScope = itemsScope;
      parentNode._bind.retrieveChildNodes(parentNode, (function(_this) {
        return function() {
          if (parentNode._children) {
            _this._initLayer(layer, parentNode, index);
            if (layer.container instanceof cola.Layer) {
              layer.container.show();
            }
            _this._layerIndex = index;
            layer.parentNode = parentNode;
            _this.fire("topLayerChange", _this, {
              parentNode: parentNode,
              parentItem: parentNode != null ? parentNode._data : void 0,
              index: index,
              list: layer.list
            });
          }
          if (typeof callback === "function") {
            callback(typeof wrapper !== "undefined" && wrapper !== null);
          }
        };
      })(this));
      itemsScope._retrieveItems = function(dataCtx) {
        return parentNode._bind.retrieveChildNodes(parentNode, null, dataCtx);
      };
    };

    NestedList.prototype._hideLayer = function(animation) {
      var layer, options, parentNode, previousLayer, ref;
      layer = this._layers[this._layerIndex];
      delete layer.list._itemsScope._retrieveItems;
      options = {};
      if (!animation) {
        options.animation = "none";
      }
      if (layer.container instanceof cola.Layer) {
        layer.container.hide(options, function() {
          var ref;
          if ((ref = layer.titleBar) != null) {
            ref.set("rightItems", null);
          }
        });
      } else {
        if ((ref = layer.titleBar) != null) {
          ref.set("rightItems", null);
        }
      }
      delete layer.parentNode;
      this._layerIndex--;
      previousLayer = this._layers[this._layerIndex];
      parentNode = previousLayer.parentNode;
      this.fire("topLayerChange", this, {
        parentNode: parentNode,
        parentItem: parentNode != null ? parentNode._data : void 0,
        index: previousLayer,
        list: previousLayer.list
      });
    };

    NestedList.prototype.back = function() {
      if (this._layerIndex > (this._autoSplit && this._largeScreen ? 1 : 0)) {
        this._hideLayer(true);
        return true;
      } else {
        return false;
      }
    };

    NestedList.prototype._onItemClick = function(self, arg) {
      var node, retValue;
      node = arg.item;
      retValue = this.fire("itemClick", this, {
        node: node,
        item: node._data,
        bind: node._bind
      });
      if (retValue !== false) {
        this._showLayer(self.get("userData") + 1, arg.item, (function(_this) {
          return function(hasChild) {
            if (!hasChild) {
              _this.fire("leafItemClick", _this, {
                node: node,
                item: node._data
              });
            }
          };
        })(this));
      }
    };

    NestedList.prototype._onRenderItem = function(self, arg) {
      var hasChild, node;
      node = arg.item;
      hasChild = node.get("hasChild");
      if ((hasChild == null) && node._scope) {
        hasChild = node._bind.hasChildItems(node._scope);
      }
      $fly(arg.dom).toggleClass("has-child", !!hasChild);
      if (this.getListeners("renderItem")) {
        this.fire("renderItem", this, {
          node: node,
          item: node._data,
          dom: arg.dom
        });
      }
    };

    return NestedList;

  })(cola.Widget);

  cola.Element.mixin(cola.NestedList, cola.TemplateSupport);

  TreeNode = (function(superClass) {
    extend(TreeNode, superClass);

    function TreeNode() {
      return TreeNode.__super__.constructor.apply(this, arguments);
    }

    TreeNode.ATTRIBUTES = {
      expanded: {
        getter: function() {
          var prop;
          if (this._expanded != null) {
            return this._expanded;
          }
          prop = this._bind._expandedProperty;
          if (prop && this._data) {
            if (this._data instanceof cola.Entity) {
              return this._data.get(prop, "never");
            } else {
              return this._data[prop];
            }
          }
        },
        setter: function(expanded) {
          this._expanded = expanded;
          if (expanded) {
            this._widget.expand(this);
          } else {
            this._widget.collapse(this);
          }
        }
      },
      hasExpanded: null,
      checked: {
        getter: function() {
          var prop;
          prop = this._bind._checkedProperty;
          if (prop && this._data) {
            if (this._data instanceof cola.Entity) {
              return this._data.get(prop, "never");
            } else {
              return this._data[prop];
            }
          }
        },
        setter: function(checked) {
          var prop;
          prop = this._bind._checkedProperty;
          if (prop && this._data) {
            if (this._data instanceof cola.Entity) {
              this._data.set(prop, checked);
            } else {
              this._data[prop] = checked;
            }
          }
        }
      }
    };

    return TreeNode;

  })(cola.Node);

  TreeNodeBind = (function(superClass) {
    extend(TreeNodeBind, superClass);

    function TreeNodeBind() {
      return TreeNodeBind.__super__.constructor.apply(this, arguments);
    }

    TreeNodeBind.NODE_TYPE = TreeNode;

    TreeNodeBind.ATTRIBUTES = {
      textProperty: null,
      expandedProperty: null,
      checkedProperty: null,
      autoCheckChildren: {
        defaultValue: true
      }
    };

    return TreeNodeBind;

  })(cola.CascadeBind);

  cola.Tree = (function(superClass) {
    extend(Tree, superClass);

    function Tree() {
      return Tree.__super__.constructor.apply(this, arguments);
    }

    Tree.CLASS_NAME = "items-view tree";

    Tree.ATTRIBUTES = {
      bind: {
        refreshItems: true,
        setter: function(bind) {
          if (bind && !(bind instanceof TreeNodeBind)) {
            bind = new TreeNodeBind(this, bind);
          }
          this._bind = bind;
          if (bind) {
            this._itemsScope.setExpression(bind._expression);
          }
        }
      },
      currentNode: {
        readOnly: true
      },
      currentItemAlias: {
        setter: function(alias) {
          var ref;
          if (this._currentItemAlias) {
            this._scope.set(this._currentItemAlias, null);
          }
          this._currentItemAlias = alias;
          if (alias) {
            this._scope.set(alias, (ref = this._currentNode) != null ? ref._data : void 0);
          }
        }
      }
    };

    Tree.EVENTS = {
      beforeCurrentNodeChange: null,
      currentNodeChange: null
    };

    Tree.TEMPLATES = {
      "default": {
        tagName: "ul",
        content: {
          tagName: "div",
          "class": "tree node",
          content: [
            {
              tagName: "div",
              "class": "expand-button"
            }
          ]
        }
      },
      "checkable": {
        tagName: "ul",
        content: {
          tagName: "div",
          "class": "tree node",
          content: [
            {
              tagName: "div",
              "class": "expand-button"
            }, {
              tagName: "div",
              "c-widget": {
                $type: "checkbox",
                "class": "node-checkbox",
                triState: true
              }
            }
          ]
        }
      },
      "node-normal": {
        tagName: "span",
        "c-bind": "$default"
      }
    };

    Tree.prototype._initDom = function(dom) {
      var itemsScope;
      Tree.__super__._initDom.call(this, dom);
      $fly(this._doms.itemsWrapper).delegate(".expand-button", "click", (function(_this) {
        return function(evt) {
          return _this._expandButtonClick(evt);
        };
      })(this));
      itemsScope = this._itemsScope;
      this._rootNode = new TreeNode(this._bind);
      this._rootNode._scope = this._scope;
      this._rootNode._itemsScope = itemsScope;
      if (this._bind) {
        this._itemsRetrieved = true;
        this._bind.retrieveChildNodes(this._rootNode);
        itemsScope._retrieveItems = (function(_this) {
          return function(dataCtx) {
            return _this._bind.retrieveChildNodes(_this._rootNode, null, dataCtx);
          };
        })(this);
      }
    };

    Tree.prototype._setCurrentNode = function(node) {
      var eventArg, itemDom;
      if (this._currentNode === node) {
        return;
      }
      eventArg = {
        oldCurrent: this._currentNode,
        newCurrent: node
      };
      if (this.fire("beforeCurrentNodeChange", this, eventArg) === false) {
        return;
      }
      if (this._currentNode) {
        itemDom = this._itemDomMap[this._currentNode._id];
        if (itemDom) {
          $fly(itemDom).removeClass("current");
        }
      }
      this._currentNode = node;
      if (node) {
        itemDom = this._itemDomMap[node._id];
        if (itemDom) {
          $fly(itemDom).addClass("current");
        }
      }
      this.fire("currentNodeChange", this, eventArg);
    };

    Tree.prototype._getItemType = function(node) {
      var itemType, ref;
      if (node != null ? node.isDataWrapper : void 0) {
        itemType = (ref = node._data) != null ? ref._itemType : void 0;
      } else {
        itemType = node._itemType;
      }
      if (!itemType && node._bind._checkedProperty) {
        itemType = "checkable";
      }
      return itemType || "default";
    };

    Tree.prototype._createNewItem = function(itemType, node) {
      var contentDom, itemDom, l, len1, nodeDom, span, templ, template;
      template = this._getTemplate(itemType);
      itemDom = this._cloneTemplate(template);
      $fly(itemDom).addClass("tree item " + itemType);
      itemDom._itemType = itemType;
      nodeDom = itemDom.firstChild;
      if (nodeDom && cola.util.hasClass(nodeDom, "node")) {
        template = this._getTemplate("node-" + itemType, "node-normal");
        if (template) {
          if (template instanceof Array) {
            span = document.createElement("span");
            for (l = 0, len1 = template.length; l < len1; l++) {
              templ = template[l];
              span.appendChild(templ);
            }
            template = span;
            this._regTemplate("node-" + itemType, template);
          }
          contentDom = this._cloneTemplate(template);
          $fly(contentDom).addClass("node-content");
          nodeDom.appendChild(contentDom);
        }
      }
      if (!this._currentNode) {
        this._setCurrentNode(node);
      }
      return itemDom;
    };

    Tree.prototype._getDefaultBindPath = function(node) {
      var textProperty;
      textProperty = node._bind._textProperty;
      if (textProperty) {
        return node._alias + "." + textProperty;
      }
    };

    Tree.prototype._refreshItemDom = function(itemDom, node, parentScope) {
      var checkbox, checkboxDom, nodeDom, nodeScope, tree;
      nodeScope = Tree.__super__._refreshItemDom.call(this, itemDom, node, parentScope);
      node._scope = nodeScope;
      if (!itemDom._binded) {
        itemDom._binded = true;
        if (itemDom._itemType === "checkable") {
          checkboxDom = itemDom.querySelector(".node-checkbox");
          if (checkboxDom) {
            tree = this;
            checkbox = cola.widget(checkboxDom);
            checkbox.set({
              bind: nodeScope.data.alias + "." + node._bind._checkedProperty,
              click: function() {
                return tree._onCheckboxClick(node);
              }
            });
          }
        }
      }
      if (node.get("expanded")) {
        if (node._hasExpanded) {
          this._refreshChildNodes(itemDom, node);
        } else {
          this.expand(node);
        }
      } else {
        nodeDom = itemDom.firstChild;
        $fly(nodeDom).toggleClass("leaf", node.get("hasChild") === false);
      }
      if (node === this._currentNode) {
        $fly(itemDom).addClass("current");
      }
      return nodeScope;
    };

    Tree.prototype._refreshChildNodes = function(parentItemDom, parentNode, hidden) {
      var currentItemDom, documentFragment, itemDom, itemType, itemsScope, l, len1, nextItemDom, node, nodesWrapper, ref;
      nodesWrapper = parentItemDom.lastChild;
      if (!$fly(nodesWrapper).hasClass("child-nodes")) {
        nodesWrapper = $.xCreate({
          tagName: "ul",
          "class": "child-nodes",
          style: {
            display: hidden ? "hidden" : "",
            padding: 0,
            margin: 0,
            overflow: "hidden"
          }
        });
        parentItemDom.appendChild(nodesWrapper);
      }
      itemsScope = parentNode._itemsScope;
      itemsScope.resetItemScopeMap();
      documentFragment = null;
      currentItemDom = nodesWrapper.firstChild;
      if (parentNode._children) {
        ref = parentNode._children;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          node = ref[l];
          itemType = this._getItemType(node);
          if (currentItemDom) {
            while (currentItemDom) {
              if (currentItemDom._itemType === itemType) {
                break;
              } else {
                nextItemDom = currentItemDom.nextSibling;
                nodesWrapper.removeChild(currentItemDom);
                currentItemDom = nextItemDom;
              }
            }
            itemDom = currentItemDom;
            if (currentItemDom) {
              currentItemDom = currentItemDom.nextSibling;
            }
          } else {
            itemDom = null;
          }
          if (itemDom) {
            this._refreshItemDom(itemDom, node, itemsScope);
          } else {
            itemDom = this._createNewItem(itemType, node);
            this._refreshItemDom(itemDom, node, itemsScope);
            if (documentFragment == null) {
              documentFragment = document.createDocumentFragment();
            }
            documentFragment.appendChild(itemDom);
          }
        }
      }
      if (currentItemDom) {
        itemDom = currentItemDom;
        while (itemDom) {
          nextItemDom = itemDom.nextSibling;
          if ($fly(itemDom).hasClass("item")) {
            nodesWrapper.removeChild(itemDom);
          }
          itemDom = nextItemDom;
        }
      }
      if (documentFragment) {
        nodesWrapper.appendChild(documentFragment);
      }
    };

    Tree.prototype._onItemClick = function(evt) {
      var itemDom, node;
      itemDom = evt.currentTarget;
      if (!itemDom) {
        return;
      }
      node = cola.util.userData(itemDom, "item");
      this._setCurrentNode(node);
      return Tree.__super__._onItemClick.call(this, evt);
    };

    Tree.prototype._expandButtonClick = function(evt) {
      var buttonDom, itemDom, node;
      buttonDom = evt.currentTarget;
      if (!buttonDom) {
        return;
      }
      itemDom = this._findItemDom(buttonDom);
      if (!itemDom) {
        return;
      }
      node = cola.util.userData(itemDom, "item");
      if (!node) {
        return;
      }
      node.set("expanded", !node.get("expanded"));
      evt.stopPropagation();
      return false;
    };

    Tree.prototype.expand = function(node) {
      var itemDom, itemsScope, nodeDom, tree;
      itemDom = this._itemDomMap[node._id];
      if (!itemDom) {
        return;
      }
      tree = this;
      itemsScope = node._itemsScope;
      if (!itemsScope) {
        node._itemsScope = itemsScope = new cola.ItemsScope(node._scope);
        itemsScope.alias = node._alias;
        itemsScope._retrieveItems = function(dataCtx) {
          return node._bind.retrieveChildNodes(node, null, dataCtx);
        };
        itemsScope.onItemsRefresh = function() {
          itemDom = tree._itemDomMap[node._id];
          if (itemDom) {
            tree._refreshChildNodes(itemDom, node);
          }
        };
        itemsScope.onItemInsert = function() {
          return this.onItemsRefresh();
        };
        itemsScope.onItemRemove = function(arg) {
          return tree._onItemRemove(arg);
        };
      }
      nodeDom = itemDom.firstChild;
      $fly(nodeDom).addClass("expanding");
      node._bind.retrieveChildNodes(node, function() {
        var $nodesWrapper;
        $fly(nodeDom).removeClass("expanding");
        if (node._children) {
          tree._refreshChildNodes(itemDom, node, true);
          $fly(nodeDom).addClass("expanded");
          $nodesWrapper = $fly(itemDom.lastChild);
          if ($nodesWrapper.hasClass("child-nodes")) {
            $nodesWrapper.slideDown(150);
          }
        } else {
          $fly(nodeDom).addClass("leaf");
        }
        node._hasExpanded = true;
      });
    };

    Tree.prototype.collapse = function(node) {
      var $nodesWrapper, itemDom, parent;
      itemDom = this._itemDomMap[node._id];
      if (!itemDom) {
        return;
      }
      if (this._currentNode) {
        parent = this._currentNode._parent;
        while (parent) {
          if (parent === node) {
            this._setCurrentNode(node);
            break;
          }
          parent = parent._parent;
        }
      }
      $fly(itemDom.firstChild).removeClass("expanded");
      $nodesWrapper = $fly(itemDom.lastChild);
      if ($nodesWrapper.hasClass("child-nodes")) {
        $nodesWrapper.slideUp(150);
      }
    };

    Tree.prototype._onItemRemove = function(arg) {
      var children, i, newCurrentNode, node, nodeId;
      nodeId = _getEntityId(arg.entity);
      node = this._nodeMap[nodeId];
      if (node) {
        if (this._currentNode === node) {
          children = node._parent._children;
          i = children.indexOf(node);
          if (i < children.length - 1) {
            newCurrentNode = children[i + 1];
          } else if (i > 0) {
            newCurrentNode = children[i - 1];
          } else if (node._parent !== this._rootNode) {
            newCurrentNode = node._parent;
          }
          if (newCurrentNode) {
            this._setCurrentNode(newCurrentNode);
          }
        }
        node.remove();
      }
      Tree.__super__._onItemRemove.call(this, arg);
    };

    Tree.prototype._onItemInsert = function() {
      this._refreshItems();
    };

    Tree.prototype._onCurrentItemChange = null;

    Tree.prototype._resetNodeAutoCheckedState = function(node) {
      var c, checkableCount, checkedCount, child, halfCheck, l, len1, ref;
      if (node._bind._checkedProperty && node._bind._autoCheckChildren) {
        if (!this._autoChecking) {
          this._autoCheckingParent = true;
        }
        if (this._autoCheckingParent) {
          this._autoCheckingChildren = false;
          checkedCount = 0;
          checkableCount = 0;
          halfCheck = false;
          ref = node._children;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            child = ref[l];
            if (child._bind._checkedProperty) {
              checkableCount++;
              c = child.get("checked");
              if (c === true) {
                checkedCount++;
              } else if (c === null) {
                halfCheck = true;
              }
            }
          }
          if (checkableCount) {
            this._autoChecking = true;
            c = void 0;
            if (!halfCheck) {
              if (checkedCount === 0) {
                c = false;
              } else if (checkedCount === checkableCount) {
                c = true;
              }
            }
            node.set("checked", c);
            this._nodeCheckedChanged(node, false, true);
            this._autoChecking = false;
          }
        }
      }
    };

    Tree.prototype._nodeCheckedChanged = function(node, processChildren, processParent) {
      var checked, child, l, len1, oldChecked, ref;
      if (processChildren && node._children && node._bind._autoCheckChildren) {
        if (!this._autoChecking) {
          this._autoCheckingChildren = true;
        }
        if (this._autoCheckingChildren) {
          this._autoCheckingParent = false;
          this._autoChecking = true;
          checked = node.get("checked");
          ref = node._children;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            child = ref[l];
            if (child._bind._checkedProperty) {
              oldChecked = child.get("checked");
              if (oldChecked !== checked) {
                child.set("checked", checked);
                this._nodeCheckedChanged(child, true, false);
              }
            }
          }
          this._autoChecking = false;
        }
      }
      if (processParent && node._parent) {
        this._resetNodeAutoCheckedState(node._parent);
      }
    };

    Tree.prototype._onCheckboxClick = function(node) {
      this._nodeCheckedChanged(node, true, true);
    };

    Tree.prototype.getCheckedNodes = function() {
      var child, l, len1, nodes, ref;
      nodes = [];
      ({
        collectCheckNodes: function(node) {
          var child, l, len1, ref;
          if (node._bind._checkedProperty && node.get("checked")) {
            nodes.push(node);
          }
          if (node._children) {
            ref = node._children;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              child = ref[l];
              collectCheckNodes(child);
            }
          }
        }
      });
      if (this._rootNode) {
        ref = this._rootNode._children;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          child = ref[l];
          collectCheckNodes(child);
        }
      }
      return nodes;
    };

    return Tree;

  })(cola.ItemsView);

  cola.Element.mixin(cola.Tree, cola.TreeSupportMixin);

  cola.registerTypeResolver("table.column", function(config) {
    var type;
    if (!(config && config.$type)) {
      return;
    }
    type = config.$type.toLowerCase();
    if (type === "select") {
      return SelectColumn;
    }
  });

  cola.registerTypeResolver("table.column", function(config) {
    var ref;
    if ((ref = config.columns) != null ? ref.length : void 0) {
      return GroupColumn;
    }
    return DataColumn;
  });

  Column = (function(superClass) {
    extend(Column, superClass);

    Column.ATTRIBUTES = {
      name: {
        reaonlyAfterCreate: true
      },
      caption: null,
      visible: {
        type: "boolean",
        defaultValue: true
      },
      headerTemplate: null
    };

    Column.EVENTS = {
      renderHeader: null
    };

    function Column(config) {
      Column.__super__.constructor.call(this, config);
      if (!this._name) {
        this._name = cola.uniqueId();
      }
    }

    Column.prototype._setTable = function(table) {
      if (this._table) {
        this._table._unregColumn(this);
      }
      this._table = table;
      if (table) {
        table._regColumn(this);
      }
    };

    return Column;

  })(cola.Element);

  GroupColumn = (function(superClass) {
    extend(GroupColumn, superClass);

    function GroupColumn() {
      return GroupColumn.__super__.constructor.apply(this, arguments);
    }

    GroupColumn.ATTRIBUTES = {
      columns: {
        setter: function(columnConfigs) {
          _columnsSetter.call(this, this._table, columnConfigs);
        }
      }
    };

    GroupColumn.prototype._setTable = function(table) {
      var column, l, len1, ref;
      GroupColumn.__super__._setTable.call(this, table);
      if (this._columns) {
        ref = this._columns;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          column = ref[l];
          column._setTable(table);
        }
      }
    };

    return GroupColumn;

  })(Column);

  ContentColumn = (function(superClass) {
    extend(ContentColumn, superClass);

    function ContentColumn() {
      return ContentColumn.__super__.constructor.apply(this, arguments);
    }

    ContentColumn.ATTRIBUTES = {
      width: {
        defaultValue: 80
      },
      align: {
        "enum": ["left", "center", "right"]
      },
      valign: {
        "enum": ["top", "center", "bottom"]
      },
      footerTemplate: null
    };

    ContentColumn.EVENTS = {
      renderCell: null,
      renderFooter: null
    };

    return ContentColumn;

  })(Column);

  DataColumn = (function(superClass) {
    extend(DataColumn, superClass);

    function DataColumn() {
      return DataColumn.__super__.constructor.apply(this, arguments);
    }

    DataColumn.ATTRIBUTES = {
      dataType: {
        readOnlyAfterCreate: true,
        setter: cola.DataType.dataTypeSetter
      },
      bind: null,
      template: null
    };

    return DataColumn;

  })(ContentColumn);

  SelectColumn = (function(superClass) {
    extend(SelectColumn, superClass);

    function SelectColumn() {
      return SelectColumn.__super__.constructor.apply(this, arguments);
    }

    SelectColumn.ATTRIBUTES = {
      width: {
        defaultValue: "34px"
      },
      align: {
        defaultValue: "center"
      }
    };

    SelectColumn.prototype.renderHeader = function(dom, item) {
      var checkbox;
      if (!dom.firstChild) {
        this._headerCheckbox = checkbox = new cola.Checkbox({
          "class": "in-cell",
          triState: true,
          click: (function(_this) {
            return function(self) {
              _this.selectAll(self.get("checked"));
            };
          })(this)
        });
        checkbox.appendTo(dom);
      }
    };

    SelectColumn.prototype.renderCell = function(dom, item) {
      var checkbox;
      if (!dom.firstChild) {
        checkbox = new cola.Checkbox({
          "class": "in-cell",
          bind: this._table._alias + "." + this._table._selectedProperty,
          change: (function(_this) {
            return function() {
              if (!_this._ignoreCheckedChange) {
                _this.refreshHeaderCheckbox();
              }
            };
          })(this)
        });
        checkbox.appendTo(dom);
      }
    };

    SelectColumn.prototype.refreshHeaderCheckbox = function() {
      if (!this._headerCheckbox) {
        return;
      }
      cola.util.delay(this, "refreshHeaderCheckbox", 50, function() {
        var i, selected, selectedProperty, table;
        table = this._table;
        selectedProperty = table._selectedProperty;
        if (table._realItems) {
          i = 0;
          selected = void 0;
          cola.each(this._table._realItems, function(item) {
            var itemType, s;
            itemType = table._getItemType(item);
            if (itemType === "default") {
              i++;
              if (item instanceof cola.Entity) {
                s = item.get(selectedProperty);
              } else {
                s = item[selectedProperty];
              }
              if (i === 1) {
                selected = s;
              } else if (selected !== s) {
                selected = void 0;
                return false;
              }
            }
          });
          this._headerCheckbox.set("value", selected);
        }
      });
    };

    SelectColumn.prototype.selectAll = function(selected) {
      var selectedProperty, table;
      table = this._table;
      selectedProperty = table._selectedProperty;
      if (table._realItems) {
        this._ignoreCheckedChange = true;
        cola.each(this._table._realItems, function(item) {
          var itemType;
          itemType = table._getItemType(item);
          if (itemType === "default") {
            if (item instanceof cola.Entity) {
              item.set(selectedProperty, selected);
            } else {
              item[selectedProperty];
              table.refreshItem(item);
            }
          }
        });
        setTimeout((function(_this) {
          return function() {
            _this._ignoreCheckedChange = false;
          };
        })(this), 100);
      }
    };

    return SelectColumn;

  })(ContentColumn);

  _columnsSetter = function(table, columnConfigs) {
    var column, columnConfig, columns, l, len1, len2, m, ref;
    if (table != null ? table._columns : void 0) {
      ref = table._columns;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        column = ref[l];
        column._setTable(null);
      }
    }
    columns = [];
    if (columnConfigs) {
      for (m = 0, len2 = columnConfigs.length; m < len2; m++) {
        columnConfig = columnConfigs[m];
        if (!columnConfig) {
          continue;
        }
        if (columnConfig instanceof Column) {
          column = columnConfig;
        } else {
          column = cola.create("table.column", columnConfig, Column);
        }
        column._setTable(table);
        columns.push(column);
      }
    }
    this._columns = columns;
  };

  cola.AbstractTable = (function(superClass) {
    extend(AbstractTable, superClass);

    AbstractTable.ATTRIBUTES = {
      items: {
        refreshItems: true,
        setter: function(items) {
          if (this._items === items) {
            return;
          }
          this._set("bind", void 0);
          this._items = items;
        }
      },
      bind: {
        setter: function(bindStr) {
          this._set("items", void 0);
          this._bindSetter(bindStr);
        }
      },
      columns: {
        setter: function(columnConfigs) {
          _columnsSetter.call(this, this, columnConfigs);
          this._collectionColumnsInfo();
        }
      },
      dataType: {
        setter: cola.DataType.dataTypeSetter
      },
      showHeader: {
        type: "boolean",
        defaultValue: true
      },
      showFooter: {
        type: "boolean"
      },
      columnStrecthable: {
        type: "boolean",
        defaultValue: true
      },
      selectedProperty: {
        defaultValue: "selected"
      }
    };

    AbstractTable.EVENTS = {
      renderRow: null,
      renderCell: null,
      renderHeader: null,
      renderFooter: null
    };

    AbstractTable.TEMPLATES = {
      "default": {
        tagName: "tr"
      },
      "checkbox-column": {
        tagName: "div",
        "c-widget": "checkbox;class:in-cell;bind:$default"
      },
      "input-column": {
        tagName: "div",
        "c-widget": "input;class:in-cell;bind:$default",
        style: {
          width: "100%"
        }
      },
      "group-header": {
        tagName: "tr",
        content: {
          tagName: "td",
          colSpan: 100
        }
      }
    };

    function AbstractTable(config) {
      this._columnMap = {};
      AbstractTable.__super__.constructor.call(this, config);
    }

    AbstractTable.prototype._getItems = function() {
      if (this._items) {
        return {
          items: this._items
        };
      } else {
        return AbstractTable.__super__._getItems.call(this);
      }
    };

    AbstractTable.prototype._regColumn = function(column) {
      if (column._name) {
        this._columnMap[column._name] = column;
      }
    };

    AbstractTable.prototype._unregColumn = function(column) {
      if (column._name) {
        delete this._columnMap[column._name];
      }
    };

    AbstractTable.prototype.getColumn = function(name) {
      return this._columnMap[name];
    };

    AbstractTable.prototype._collectionColumnsInfo = function() {
      var col, collectColumnInfo, columnsInfo, expression, l, len1, ref;
      collectColumnInfo = function(column, context, deepth) {
        var bind, col, cols, convertorIndex, info, l, len1, path, ref, ref1, width, widthType;
        info = {
          level: deepth,
          column: column
        };
        if (column instanceof GroupColumn) {
          if (column._columns) {
            info.columns = cols = [];
            ref = column._columns;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              col = ref[l];
              if (!col._visible) {
                continue;
              }
              if (context.rows.length === deepth) {
                context.rows[deepth] = [];
              }
              cols.push(collectColumnInfo(col, context, deepth + 1));
            }
            if (cols.length) {
              if (context.rows.length === deepth) {
                context.rows[deepth] = [];
              }
              context.rows[deepth].push(info);
            }
          }
        } else {
          if (column._bind) {
            bind = column._bind;
            if (bind.charCodeAt(0) === 46) {
              convertorIndex = bind.indexOf("|");
              if (convertorIndex < 0) {
                info.property = bind.substring(1);
              } else {
                info.property = bind.substring(1, convertorIndex);
                info.expression = cola._compileExpression(context.alias + bind);
              }
            } else {
              info.expression = cola._compileExpression(bind);
              path = (ref1 = info.expression) != null ? ref1.path : void 0;
              if (path instanceof Array) {
                path = path[0];
              }
              if (path && path.indexOf("*") < 0) {
                info.property = path;
              }
            }
          }
          if (column._width) {
            width = column._width;
            if (typeof width === "string") {
              if (width.indexOf("px") > 0) {
                widthType = "px";
              } else if (width.indexOf("%") > 0) {
                widthType = "percent";
              }
            }
            info.widthType = widthType;
            info.width = parseInt(width, 10);
            if (!widthType && info.width) {
              context.totalWidth += info.width;
            }
          }
          info.index = context.dataColumns.length;
          context.dataColumns.push(info);
          if (column instanceof SelectColumn) {
            if (context.selectColumns == null) {
              context.selectColumns = [];
            }
            context.selectColumns.push(info);
          }
          if (context.rows.length === deepth) {
            context.rows[deepth] = [];
          }
          context.rows[deepth].push(info);
        }
        return info;
      };
      this._columnsInfo = columnsInfo = {
        totalWidth: 0,
        rows: [[]],
        dataColumns: [],
        alias: "item"
      };
      if (this._columns) {
        expression = this._itemsScope.expression;
        if (expression) {
          columnsInfo.alias = expression.alias;
        }
        ref = this._columns;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          col = ref[l];
          if (!col._visible) {
            continue;
          }
          collectColumnInfo(col, columnsInfo, 0);
        }
      }
    };

    AbstractTable.prototype._getBindDataType = function() {
      var dataType, item, items;
      if (this._dataType) {
        return this._dataType;
      }
      items = this._getItems().originItems;
      if (items) {
        if (items instanceof cola.EntityList) {
          dataType = items.dataType;
        } else if (items instanceof Array && items.length) {
          item = items[0];
          if (item && item instanceof cola.Entity) {
            dataType = item.dataType;
          }
        }
      }
      return this._dataType = dataType;
    };

    AbstractTable.prototype._createDom = function() {
      var dom;
      dom = document.createElement("div");
      if (this._doms == null) {
        this._doms = {};
      }
      this._createInnerDom(dom);
      return dom;
    };

    AbstractTable.prototype._createInnerDom = function(dom) {
      $fly(dom).xAppend({
        tagName: "div",
        "class": "table-wrapper",
        contextKey: "itemsWrapper",
        content: {
          tagName: "table",
          contextKey: "table",
          content: [
            {
              tagName: "colgroup",
              contextKey: "colgroup",
              span: 100
            }, {
              tagName: "tbody",
              "class": "items",
              contextKey: "tbody"
            }
          ]
        }
      }, this._doms);
    };

    AbstractTable.prototype._parseDom = function(dom) {
      var child, next, nodeName;
      if (!dom) {
        return;
      }
      if (this._doms == null) {
        this._doms = {};
      }
      child = dom.firstChild;
      while (child) {
        next = child.nextSibling;
        nodeName = child.nodeName.toLowerCase();
        if (nodeName === "template") {
          this._regTemplate(child);
        } else {
          dom.removeChild(child);
        }
        child = next;
      }
      this._createInnerDom(dom);
    };

    AbstractTable.prototype._createNewItem = function(itemType, item) {
      var itemDom, template;
      template = this._getTemplate(itemType);
      itemDom = this._cloneTemplate(template);
      $fly(itemDom).addClass("table item " + itemType);
      itemDom._itemType = itemType;
      return itemDom;
    };

    return AbstractTable;

  })(cola.ItemsView);

  cola.Table = (function(superClass) {
    extend(Table, superClass);

    function Table() {
      return Table.__super__.constructor.apply(this, arguments);
    }

    Table.CLASS_NAME = "items-view widget-table";

    Table.prototype._initDom = function(dom) {
      Table.__super__._initDom.call(this, dom);
      $fly(window).resize((function(_this) {
        return function() {
          var fixedFooter, fixedHeader;
          if (_this._fixedHeaderVisible) {
            fixedHeader = _this._getFixedHeader();
            $fly(fixedHeader).width(_this._doms.itemsWrapper.clientWidth);
          }
          if (_this._fixedFooterVisible) {
            fixedFooter = _this._getFixedFooter();
            $fly(fixedFooter).width(_this._doms.itemsWrapper.clientWidth);
          }
        };
      })(this));
    };

    Table.prototype._doRefreshItems = function() {
      var col, colInfo, colgroup, column, i, l, len1, nextCol, ref, tbody, tfoot, thead;
      colgroup = this._doms.colgroup;
      nextCol = colgroup.firstChild;
      ref = this._columnsInfo.dataColumns;
      for (i = l = 0, len1 = ref.length; l < len1; i = ++l) {
        colInfo = ref[i];
        col = nextCol;
        if (!col) {
          col = document.createElement("col");
          colgroup.appendChild(col);
        } else {
          nextCol = col.nextSibling;
        }
        if (colInfo.widthType === "precent") {
          col.width = colInfo.width + "%";
        } else if (colInfo.widthType) {
          col.width = colInfo.width + colInfo.widthType;
        } else if (colInfo.width) {
          col.width = (colInfo.width * 100 / this._columnsInfo.totalWidth) + "%";
        } else {
          col.width = "";
        }
        column = colInfo.column;
        col.valign = column._valign || "";
      }
      col = nextCol;
      while (col) {
        nextCol = col.nextSibling;
        colgroup.removeChild(col);
        col = nextCol;
      }
      tbody = this._doms.tbody;
      if (this._showHeader) {
        thead = this._doms.thead;
        if (!thead) {
          $fly(tbody).xInsertBefore({
            tagName: "thead",
            contextKey: "thead"
          }, this._doms);
          thead = this._doms.thead;
        }
        this._refreshHeader(thead);
      }
      Table.__super__._doRefreshItems.call(this, tbody);
      if (this._showFooter) {
        tfoot = this._doms.tfoot;
        if (!tfoot) {
          $fly(tbody).xInsertAfter({
            tagName: "tfoot",
            contextKey: "tfoot"
          }, this._doms);
          tfoot = this._doms.tfoot;
        }
        this._refreshFooter(tfoot);
        if (!this._fixedFooterVisible) {
          this._showFooterTimer = setInterval((function(_this) {
            return function() {
              var itemsWrapper;
              itemsWrapper = _this._doms.itemsWrapper;
              if (itemsWrapper.scrollHeight) {
                _this._refreshFixedFooter(300);
              }
            };
          })(this), 300);
        }
      }
    };

    Table.prototype._onItemInsert = function(arg) {
      Table.__super__._onItemInsert.call(this, arg);
      if (this._columnsInfo.selectColumns) {
        cola.util.delay(this, "refreshHeaderCheckbox", 100, (function(_this) {
          return function() {
            var colInfo, l, len1, ref;
            ref = _this._columnsInfo.selectColumns;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              colInfo = ref[l];
              colInfo.column.refreshHeaderCheckbox();
            }
          };
        })(this));
      }
    };

    Table.prototype._onItemRemove = function(arg) {
      Table.__super__._onItemRemove.call(this, arg);
      if (this._showFooter) {
        this._refreshFixedFooter();
      }
      if (this._columnsInfo.selectColumns) {
        cola.util.delay(this, "refreshHeaderCheckbox", 100, (function(_this) {
          return function() {
            var colInfo, l, len1, ref;
            ref = _this._columnsInfo.selectColumns;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              colInfo = ref[l];
              colInfo.column.refreshHeaderCheckbox();
            }
          };
        })(this));
      }
    };

    Table.prototype._refreshHeader = function(thead) {
      var cell, colInfo, column, contentWrapper, fragment, i, isNew, j, l, len, len1, row, rowInfo, rowInfos;
      fragment = null;
      rowInfos = this._columnsInfo.rows;
      i = 0;
      len = rowInfos.length;
      while (i < len) {
        row = thead.rows[i];
        if (!row) {
          row = $.xCreate({
            tagName: "tr"
          });
          if (fragment == null) {
            fragment = document.createDocumentFragment();
          }
          fragment.appendChild(row);
        }
        rowInfo = rowInfos[i];
        for (j = l = 0, len1 = rowInfo.length; l < len1; j = ++l) {
          colInfo = rowInfo[j];
          column = colInfo.column;
          cell = row.cells[j];
          while (cell && cell._name !== column._name) {
            row.removeChild(cell);
            cell = row.cells[j];
          }
          if (!cell) {
            isNew = true;
            cell = $.xCreate({
              tagName: "th",
              content: {
                tagName: "div"
              }
            });
            cell._name = column._name;
            row.appendChild(cell);
          }
          cell._index = colInfo.index;
          if (colInfo.columns) {
            cell.rowSpan = 1;
            cell.colSpan = colInfo.columns.length;
          } else {
            cell.rowSpan = len - i;
            cell.colSpan = 1;
          }
          contentWrapper = cell.firstChild;
          this._refreshHeaderCell(contentWrapper, colInfo, isNew);
        }
        while (row.lastChild !== cell) {
          row.removeChild(row.lastChild);
        }
        i++;
      }
      while (row.lastChild !== cell) {
        row.removeChild(row.lastChild);
      }
      cola.xRender(row, this._scope);
      if (fragment) {
        thead.appendChild(fragment);
      }
      while (thead.lastChild !== row) {
        thead.removeChild(thead.lastChild);
      }
    };

    Table.prototype._refreshHeaderCell = function(dom, columnInfo, isNew) {
      var caption, column, dataType, propertyDef, template, templateName;
      column = columnInfo.column;
      if (column.renderHeader) {
        if (column.renderHeader(dom) !== true) {
          return;
        }
      }
      if (column.getListeners("renderHeader")) {
        if (column.fire("renderHeader", column, {
          dom: dom
        }) === false) {
          return;
        }
      }
      if (this.getListeners("renderHeader")) {
        if (this.fire("renderHeader", this, {
          column: column,
          dom: dom
        }) === false) {
          return;
        }
      }
      if (isNew) {
        template = column._realHeaderTemplate;
        if (template === void 0) {
          templateName = column._headerTemplate;
          if (templateName) {
            template = this._getTemplate(templateName);
          }
          column._realHeaderTemplate = template || null;
        }
        if (template) {
          template = this._cloneTemplate(template);
          dom.appendChild(template);
        }
      }
      if (column._realHeaderTemplate) {
        return;
      }
      dataType = this._getBindDataType();
      if (dataType && columnInfo.property) {
        propertyDef = dataType.getProperty(columnInfo.property);
      }
      caption = column._caption || (propertyDef != null ? propertyDef._caption : void 0);
      if (!caption) {
        caption = column._name;
        if ((caption != null ? caption.charCodeAt(0) : void 0) === 95) {
          caption = column._bind;
        }
      }
      dom.innerText = caption || "";
    };

    Table.prototype._refreshFooter = function(tfoot) {
      var cell, colInfo, colInfos, column, contentWrapper, i, isNew, l, len1, row;
      colInfos = this._columnsInfo.dataColumns;
      row = tfoot.rows[0];
      if (!row) {
        row = document.createElement("tr");
      }
      for (i = l = 0, len1 = colInfos.length; l < len1; i = ++l) {
        colInfo = colInfos[i];
        column = colInfo.column;
        cell = row.cells[i];
        while (cell && cell._name !== column._name) {
          row.removeChild(cell);
          cell = row.cells[i];
        }
        if (!cell) {
          isNew = true;
          cell = $.xCreate({
            tagName: "td",
            content: {
              tagName: "div"
            }
          });
          cell._name = column._name;
          row.appendChild(cell);
        }
        contentWrapper = cell.firstChild;
        this._refreshFooterCell(contentWrapper, colInfo, isNew);
      }
      while (row.lastChild !== cell) {
        row.removeChild(row.lastChild);
      }
      cola.xRender(row, this._scope);
      if (tfoot.rows.length < 1) {
        tfoot.appendChild(row);
      }
    };

    Table.prototype._refreshFooterCell = function(dom, columnInfo, isNew) {
      var column, template, templateName;
      column = columnInfo.column;
      if (column.renderFooter) {
        if (column.renderFooter(dom) !== true) {
          return;
        }
      }
      if (column.getListeners("renderFooter")) {
        if (column.fire("renderFooter", column, {
          dom: dom
        }) === false) {
          return;
        }
      }
      if (this.getListeners("renderFooter")) {
        if (this.fire("renderFooter", this, {
          column: column,
          dom: dom
        }) === false) {
          return;
        }
      }
      if (isNew) {
        template = column._realFooterTemplate;
        if (template === void 0) {
          templateName = column._footerTemplate;
          if (templateName) {
            template = this._getTemplate(templateName);
          }
          column._realFooterTemplate = template || null;
        }
        if (template) {
          template = this._cloneTemplate(template);
          dom.appendChild(template);
        }
      }
      if (column._realFooterTemplate) {
        return;
      }
      dom.innerHTML = "&nbsp;";
    };

    Table.prototype._doRefreshItemDom = function(itemDom, item, itemScope) {
      var cell, colInfo, colInfos, column, contentWrapper, i, isNew, itemType, l, len1;
      itemType = itemDom._itemType;
      if (this.getListeners("renderRow")) {
        if (this.fire("renderRow", this, {
          item: item,
          dom: itemDom
        }) === false) {
          return;
        }
      }
      if (itemType === "default") {
        colInfos = this._columnsInfo.dataColumns;
        for (i = l = 0, len1 = colInfos.length; l < len1; i = ++l) {
          colInfo = colInfos[i];
          column = colInfo.column;
          cell = itemDom.cells[i];
          while (cell && cell._name !== column._name) {
            itemDom.removeChild(cell);
            cell = itemDom.cells[i];
          }
          if (!cell) {
            isNew = true;
            cell = $.xCreate({
              tagName: "td",
              content: {
                tagName: "div"
              }
            });
            cell._name = column._name;
            itemDom.appendChild(cell);
          }
          contentWrapper = cell.firstChild;
          this._refreshCell(contentWrapper, item, colInfo, itemScope, isNew);
        }
        while (itemDom.lastChild !== cell) {
          itemDom.removeChild(itemDom.lastChild);
        }
      }
    };

    Table.prototype._refreshCell = function(dom, item, columnInfo, itemScope, isNew) {
      var $dom, column, context, template, templateName;
      column = columnInfo.column;
      dom.style.textAlign = column._align || "";
      if (column.renderCell) {
        if (column.renderCell(dom, item, itemScope) !== true) {
          return;
        }
      }
      if (column.getListeners("renderCell")) {
        if (column.fire("renderCell", column, {
          item: item,
          dom: dom,
          scope: itemScope
        }) === false) {
          return;
        }
      }
      if (this.getListeners("renderCell")) {
        if (this.fire("renderCell", this, {
          item: item,
          column: colInfo.column,
          dom: dom,
          scope: itemScope
        }) === false) {
          return;
        }
      }
      if (isNew) {
        template = column._realTemplate;
        if (template === void 0) {
          templateName = column._template;
          if (templateName) {
            template = this._getTemplate(templateName);
          }
          column._realTemplate = template || null;
        }
        if (template) {
          template = this._cloneTemplate(template);
          dom.appendChild(template);
          if (columnInfo.property) {
            context = {
              defaultPath: this._alias + "." + columnInfo.property
            };
          }
          cola.xRender(dom, itemScope, context);
        }
      }
      if (column._realTemplate) {
        return;
      }
      $dom = $fly(dom);
      if (columnInfo.expression) {
        $dom.attr("c-bind", columnInfo.expression.raw);
      } else {
        $dom.text(columnInfo.property ? item.get(columnInfo.property) : "");
      }
    };

    Table.prototype._refreshFakeRow = function(row) {
      var cell, colInfo, i, l, len1, nextCell, ref;
      nextCell = row.firstChild;
      ref = this._columnsInfo.dataColumns;
      for (i = l = 0, len1 = ref.length; l < len1; i = ++l) {
        colInfo = ref[i];
        cell = nextCell;
        if (!cell) {
          cell = $.xCreate({
            tagName: "td"
          });
          row.appendChild(cell);
        } else {
          nextCell = nextCell.nextSibling;
        }
      }
      while (nextCell) {
        cell = nextCell;
        nextCell = nextCell.nextSibling;
        row.removeChild(cell);
      }
    };

    Table.prototype._getFixedHeader = function(create) {
      var fakeThead, fixedHeaderWrapper;
      fixedHeaderWrapper = this._doms.fixedHeaderWrapper;
      if (!fixedHeaderWrapper && create) {
        fixedHeaderWrapper = $.xCreate({
          tagName: "div",
          contextKey: "fixedHeaderWrapper",
          "class": "fixed-header table-wrapper",
          content: {
            tagName: "table",
            contextKey: "fixedHeaderTable"
          }
        }, this._doms);
        this._dom.appendChild(fixedHeaderWrapper);
        this._doms.fakeThead = fakeThead = $.xCreate({
          tagName: "thead",
          content: {
            tagName: "tr"
          }
        });
        this._refreshFakeRow(fakeThead.firstChild);
        $fly(this._doms.tbody).before(fakeThead);
      }
      return fixedHeaderWrapper;
    };

    Table.prototype._getFixedFooter = function(create) {
      var fakeTfoot, fixedFooterWrapper;
      fixedFooterWrapper = this._doms.fixedFooterWrapper;
      if (!fixedFooterWrapper && create) {
        fixedFooterWrapper = $.xCreate({
          tagName: "div",
          contextKey: "fixedFooterWrapper",
          "class": "fixed-footer table-wrapper",
          content: {
            tagName: "table",
            contextKey: "fixedFooterTable"
          }
        }, this._doms);
        this._dom.appendChild(fixedFooterWrapper, this._doms);
        this._doms.fakeTfoot = fakeTfoot = $.xCreate({
          tagName: "tfoot",
          content: {
            tagName: "tr"
          }
        });
        this._refreshFakeRow(fakeTfoot.firstChild);
        $fly(this._doms.tbody).after(fakeTfoot);
      }
      return fixedFooterWrapper;
    };

    Table.prototype._refreshFixedColgroup = function(colgroup, fixedColgroup) {
      var col, fixedCol, nextCol, nextFixedCol;
      nextCol = colgroup.firstChild;
      nextFixedCol = fixedColgroup.firstChild;
      while (nextCol) {
        col = nextCol;
        nextCol = nextCol.nextSibling;
        fixedCol = nextFixedCol;
        if (!fixedCol) {
          fixedCol = document.createElement("col");
        } else {
          nextFixedCol = nextFixedCol.nextSibling;
        }
        fixedCol.width = col.width;
        fixedCol.valign = col.valign;
      }
      while (nextFixedCol) {
        fixedCol = nextFixedCol;
        nextFixedCol = nextFixedCol.nextSibling;
        fixedColgroup.removeChild(fixedCol);
      }
    };

    Table.prototype._setFixedHeaderSize = function() {
      var colgroup, fixedHeaderColgroup;
      colgroup = this._doms.colgroup;
      fixedHeaderColgroup = this._doms.fixedHeaderColgroup;
      if (!fixedHeaderColgroup) {
        this._doms.fixedHeaderColgroup = fixedHeaderColgroup = colgroup.cloneNode(true);
        this._doms.fixedHeaderTable.appendChild(fixedHeaderColgroup);
      } else {
        this._refreshFixedColgroup(colgroup, fixedHeaderColgroup);
      }
      $fly(this._doms.fakeThead.firstChild).height(this._doms.thead.offsetHeight);
    };

    Table.prototype._setFixedFooterSize = function() {
      var colgroup, fixedFooterColgroup;
      colgroup = this._doms.colgroup;
      fixedFooterColgroup = this._doms.fixedFooterColgroup;
      if (!fixedFooterColgroup) {
        this._doms.fixedFooterColgroup = fixedFooterColgroup = colgroup.cloneNode(true);
        this._doms.fixedFooterTable.appendChild(fixedFooterColgroup);
      } else {
        this._refreshFixedColgroup(colgroup, fixedFooterColgroup);
      }
      $fly(this._doms.fakeTfoot.firstChild).height(this._doms.tfoot.offsetHeight);
    };

    Table.prototype._refreshFixedHeader = function() {
      var fixedHeader, itemsWrapper, scrollTop, showFixedHeader;
      itemsWrapper = this._doms.itemsWrapper;
      scrollTop = itemsWrapper.scrollTop;
      showFixedHeader = scrollTop > 0;
      if (showFixedHeader === this._fixedHeaderVisible) {
        return;
      }
      this._fixedHeaderVisible = showFixedHeader;
      if (showFixedHeader) {
        fixedHeader = this._getFixedHeader(true);
        this._setFixedHeaderSize();
        $fly(this._doms.tbody).before(this._doms.fakeThead);
        this._doms.fixedHeaderTable.appendChild(this._doms.thead);
        $fly(fixedHeader).width(itemsWrapper.clientWidth).show();
      } else {
        fixedHeader = this._getFixedHeader();
        if (fixedHeader) {
          $fly(fixedHeader).hide();
          this._doms.fixedHeaderTable.appendChild(this._doms.fakeThead);
          $fly(this._doms.tbody).before(this._doms.thead);
        }
      }
    };

    Table.prototype._refreshFixedFooter = function(duration) {
      var $fixedFooter, fixedFooter, itemsWrapper, maxScrollTop, scrollTop, showFixedFooter;
      if (this._showFooterTimer) {
        clearInterval(this._showFooterTimer);
        delete this._showFooterTimer;
      }
      itemsWrapper = this._doms.itemsWrapper;
      scrollTop = itemsWrapper.scrollTop;
      maxScrollTop = itemsWrapper.scrollHeight - itemsWrapper.clientHeight;
      showFixedFooter = scrollTop < maxScrollTop;
      if (showFixedFooter === this._fixedFooterVisible) {
        return;
      }
      this._fixedFooterVisible = showFixedFooter;
      if (showFixedFooter) {
        fixedFooter = this._getFixedFooter(true);
        this._setFixedFooterSize();
        $fly(this._doms.tbody).after(this._doms.fakeTfoot);
        this._doms.fixedFooterTable.appendChild(this._doms.tfoot);
        $fixedFooter = $fly(fixedFooter).width(itemsWrapper.clientWidth);
        if (duration) {
          $fixedFooter.fadeIn(duration);
        } else {
          $fixedFooter.show();
        }
      } else {
        fixedFooter = this._getFixedFooter();
        if (fixedFooter) {
          $fly(fixedFooter).hide();
          this._doms.fixedFooterTable.appendChild(this._doms.fakeTfoot);
          $fly(this._doms.tbody).after(this._doms.tfoot);
        }
      }
    };

    Table.prototype._onItemsWrapperScroll = function() {
      if (this._showHeader) {
        this._refreshFixedHeader();
      }
      if (this._showFooter) {
        this._refreshFixedFooter();
      }
    };

    return Table;

  })(cola.AbstractTable);

}).call(this);
