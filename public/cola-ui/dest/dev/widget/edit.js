(function() {
  var DEFAULT_DATE_DISPLAY_FORMAT, DEFAULT_DATE_INPUT_FORMAT, DEFAULT_TIME_DISPLAY_FORMAT, DEFAULT_TIME_INPUT_FORMAT, DropBox, dropdownDialogMargin, emptyRadioGroupItems,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  cola.AbstractEditor = (function(superClass) {
    extend(AbstractEditor, superClass);

    function AbstractEditor() {
      return AbstractEditor.__super__.constructor.apply(this, arguments);
    }

    AbstractEditor.ATTRIBUTES = {
      value: {
        refreshDom: true,
        setter: function(value) {
          return this._setValue(value);
        }
      },
      bind: {
        refreshDom: true,
        setter: function(bindStr) {
          return this._bindSetter(bindStr);
        }
      },
      readOnly: {
        refreshDom: true,
        type: "boolean",
        defaultValue: false
      },
      state: {
        setter: function(state) {
          var dom, oldState;
          oldState = this._state;
          if (oldState !== state) {
            dom = this._dom;
            if (dom && oldState) {
              cola.util.removeClass(dom, oldState);
              if (this._fieldDom) {
                cola.util.removeClass(this._fieldDom, oldState);
              }
            }
            this._state = state;
            if (dom && state) {
              cola.util.addClass(dom, state);
              if (this._fieldDom) {
                cola.util.addClass(this._fieldDom, state);
              }
            }
          }
        }
      }
    };

    AbstractEditor.EVENTS = {
      beforePost: null,
      post: null,
      beforeChange: null,
      change: null
    };

    AbstractEditor.prototype._initDom = function(dom) {
      var fieldDom;
      if (this._state) {
        cola.util.addClass(dom, this._state);
      }
      fieldDom = dom.parentNode;
      if (fieldDom && !jQuery.find.matchesSelector(fieldDom, ".field")) {
        fieldDom = null;
      }
      this._fieldDom = fieldDom;
    };

    AbstractEditor.prototype._setValue = function(value) {
      var arg;
      if (this._value === value) {
        return false;
      }
      arg = {
        oldValue: this._value,
        value: value
      };
      if (this.fire("beforeChange", this, arg) === false) {
        return;
      }
      this._value = value;
      this.fire("change", this, arg);
      if (value !== this._modelValue) {
        this.post();
      }
      return true;
    };

    AbstractEditor.prototype.post = function() {
      if (this.fire("beforePost", this) === false) {
        return this;
      }
      this._post();
      this.fire("post", this);
      return this;
    };

    AbstractEditor.prototype._post = function() {
      this._writeBindingValue(this._value);
    };

    AbstractEditor.prototype._filterDataMessage = function(path, type, arg) {
      return (cola.constants.MESSAGE_REFRESH <= type && type <= cola.constants.MESSAGE_CURRENT_CHANGE) || type === cola.constants.MESSAGE_VALIDATION_STATE_CHANGE || this._watchingMoreMessage;
    };

    AbstractEditor.prototype._processDataMessage = function(path, type, arg) {
      var $formDom, form, keyMessage, value;
      if (type === cola.constants.MESSAGE_VALIDATION_STATE_CHANGE) {
        keyMessage = arg.entity.getKeyMessage(arg.property);
        this.set("state", keyMessage != null ? keyMessage.type : void 0);
        if (this._formDom === void 0) {
          if (this._fieldDom) {
            $formDom = $fly(this._fieldDom).closest(".ui.form");
          }
          this._formDom = ($formDom != null ? $formDom[0] : void 0) || null;
        }
        if (this._formDom) {
          form = cola.widget(this._formDom);
          if (form && form instanceof cola.Form) {
            return form.setFieldMessages(this, keyMessage);
          }
        }
      } else {
        value = this._readBindingValue();
        if (this._dataType) {
          value = this._dataType.parse(value);
        }
        this._modelValue = value;
        if (this._setValue(value)) {
          cola.util.delay(this, "refreshDom", 50, this._refreshDom);
        }
      }
    };

    return AbstractEditor;

  })(cola.Widget);

  cola.Element.mixin(cola.AbstractEditor, cola.DataWidgetMixin);

  cola.AbstractCheckbox = (function(superClass) {
    extend(AbstractCheckbox, superClass);

    function AbstractCheckbox() {
      return AbstractCheckbox.__super__.constructor.apply(this, arguments);
    }

    AbstractCheckbox.CLASS_NAME = "checkbox";

    AbstractCheckbox.INPUT_TYPE = "checkbox";

    AbstractCheckbox.ATTRIBUTES = {
      label: {
        refreshDom: true
      },
      name: {
        refreshDom: true
      },
      onValue: {
        defaultValue: true
      },
      offValue: {
        defaultValue: false
      },
      disabled: {
        refreshDom: true,
        type: "boolean",
        defaultValue: false
      },
      checked: {
        refreshDom: true,
        type: "boolean",
        defaultValue: false,
        getter: function() {
          return this._value === this._onValue;
        },
        setter: function(state) {
          var checked, value;
          checked = !!state;
          value = checked ? this.get("onValue") : this.get("offValue");
          this._setValue(value);
          return this;
        }
      },
      value: {
        defaultValue: false,
        refreshDom: true,
        setter: function(value) {
          return this._setValue(value);
        }
      }
    };

    AbstractCheckbox._modelValue = false;

    AbstractCheckbox.prototype._parseDom = function(dom) {
      var child, nameAttr;
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._$dom == null) {
        this._$dom = $(dom);
      }
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (child.nodeName === "LABEL") {
            this._doms.label = child;
            if (this._label == null) {
              this._label = cola.util.getTextChildData(child);
            }
          } else if (child.nodeName === "INPUT") {
            nameAttr = child.getAttribute("name");
            if (nameAttr) {
              if (this._name == null) {
                this._name = nameAttr;
              }
            }
            this._doms.input = child;
          }
        }
        child = child.nextSibling;
      }
      if (!this._doms.label && !this._doms.input) {
        this._$dom.append($.xCreate([
          {
            tagName: "input",
            type: this.constructor.INPUT_TYPE,
            contextKey: "input",
            name: this._name || ""
          }, {
            tagName: "label",
            content: this._label || "",
            contextKey: "label"
          }
        ], this._doms));
      }
      if (!this._doms.label) {
        this._doms.label = $.xCreate({
          tagName: "label",
          content: this._label || ""
        });
        this._$dom.append(this._doms.label);
      }
      if (!this._doms.input) {
        this._doms.input = $.xCreate({
          tagName: "input",
          type: this.constructor.INPUT_TYPE,
          name: this._name || ""
        });
        $(this._doms.label).before(this._doms.input);
      }
      this._bindToSemantic();
    };

    AbstractCheckbox.prototype._createDom = function() {
      return $.xCreate({
        tagName: "DIV",
        "class": "ui " + this.constructor.CLASS_NAME,
        content: [
          {
            tagName: "input",
            type: this.constructor.INPUT_TYPE,
            contextKey: "input",
            name: this.get("name") || ""
          }, {
            tagName: "label",
            content: this._label || "",
            contextKey: "label"
          }
        ]
      }, this._doms);
    };

    AbstractCheckbox.prototype._bindToSemantic = function() {
      return this.get$Dom().checkbox({
        onChange: (function(_this) {
          return function() {
            return _this._setValue(_this._getValue());
          };
        })(this)
      });
    };

    AbstractCheckbox.prototype._setDom = function(dom, parseChild) {
      this._dom = dom;
      if (!parseChild) {
        this._bindToSemantic();
      }
      AbstractCheckbox.__super__._setDom.call(this, dom, parseChild);
    };

    AbstractCheckbox.prototype._refreshEditorDom = function() {
      return this.get$Dom().checkbox(this._value === this._onValue ? "check" : "uncheck");
    };

    AbstractCheckbox.prototype._doRefreshDom = function() {
      var $dom, label, readOnly;
      if (!this._dom) {
        return;
      }
      AbstractCheckbox.__super__._doRefreshDom.call(this);
      if (this._doms == null) {
        this._doms = {};
      }
      label = this.get("label") || "";
      $(this._doms.label).text(label);
      readOnly = this.get("readOnly");
      this._classNamePool.toggle("read-only", readOnly);
      $dom = this.get$Dom();
      $dom.checkbox(!!this._disabled ? "disable" : "enable");
      return this._refreshEditorDom();
    };

    AbstractCheckbox.prototype._getValue = function() {
      if (this.get$Dom().checkbox("is checked")) {
        return this.get("onValue");
      } else {
        return this.get("offValue");
      }
    };

    AbstractCheckbox.prototype.toggle = function() {
      var state;
      state = !!this.get("checked");
      this.set("checked", !state);
      return this;
    };

    return AbstractCheckbox;

  })(cola.AbstractEditor);

  cola.Checkbox = (function(superClass) {
    extend(Checkbox, superClass);

    function Checkbox() {
      return Checkbox.__super__.constructor.apply(this, arguments);
    }

    Checkbox.ATTRIBUTES = {
      indeterminateValue: null,
      triState: {
        type: "boolean",
        defaultValue: false
      }
    };

    Checkbox.prototype._getValue = function() {
      if (this._triState && !this.get$Dom().checkbox("is determinate")) {
        return this.get("indeterminateValue");
      }
      return Checkbox.__super__._getValue.call(this);
    };

    Checkbox.prototype._refreshEditorDom = function() {
      if (this._triState && this._value !== this._onValue && this._value !== this._offValue) {
        this.get$Dom().checkbox('set indeterminate');
        return;
      }
      return Checkbox.__super__._refreshEditorDom.call(this);
    };

    return Checkbox;

  })(cola.AbstractCheckbox);

  cola.Toggle = (function(superClass) {
    extend(Toggle, superClass);

    function Toggle() {
      return Toggle.__super__.constructor.apply(this, arguments);
    }

    Toggle.CLASS_NAME = "toggle checkbox";

    return Toggle;

  })(cola.AbstractCheckbox);

  cola.Slider = (function(superClass) {
    extend(Slider, superClass);

    function Slider() {
      return Slider.__super__.constructor.apply(this, arguments);
    }

    Slider.CLASS_NAME = "slider checkbox";

    return Slider;

  })(cola.AbstractCheckbox);

  DEFAULT_DATE_DISPLAY_FORMAT = "yyyy-MM-dd";

  DEFAULT_DATE_INPUT_FORMAT = "yyyyMMdd";

  DEFAULT_TIME_DISPLAY_FORMAT = "HH:mm:ss";

  DEFAULT_TIME_INPUT_FORMAT = "HHmmss";

  cola.AbstractInput = (function(superClass) {
    extend(AbstractInput, superClass);

    function AbstractInput() {
      return AbstractInput.__super__.constructor.apply(this, arguments);
    }

    AbstractInput.CLASS_NAME = "input";

    AbstractInput.SEMANTIC_CLASS = ["left floated", "right floated", "corner labeled", "right labeled", "left icon", "left action"];

    AbstractInput.ATTRIBUTES = {
      name: null,
      value: {
        setter: function(value) {
          if (this._dataType) {
            value = this._dataType.parse(value);
          }
          return this._setValue(value);
        }
      },
      dataType: {
        setter: function(dataType) {
          this._dataTypeDefined = !!dataType;
          return cola.DataType.dataTypeSetter.call(this, dataType);
        }
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
      placeholder: {
        refreshDom: true
      },
      icon: {
        refreshDom: true,
        setter: function(value) {
          var $iconDom, oldValue, ref;
          oldValue = this["_icon"];
          this["_icon"] = value;
          if (oldValue && oldValue !== value && this._dom && ((ref = this._doms) != null ? ref.iconDom : void 0)) {
            $iconDom = $(this._doms.iconDom);
            $iconDom.removeClass(oldValue);
          }
        }
      },
      iconPosition: {
        refreshDom: true,
        defaultValue: "right",
        "enum": ["left", "right"],
        setter: function(value) {
          var oldValue;
          oldValue = this["_iconPosition"];
          this["_iconPosition"] = value;
          if (oldValue && oldValue !== value && oldValue === "left" && this._dom) {
            $removeClass(this._dom, "left icon", true);
          }
        }
      },
      corner: {
        setter: function(value) {
          var oldValue;
          oldValue = this["_corner"];
          if (oldValue != null) {
            oldValue.destroy();
          }
          delete this["_corner"];
          if (value) {
            if (value instanceof cola.Corner) {
              this["_corner"] = value;
            } else if (value.$type === "Corner") {
              this["_corner"] = cola.widget(value);
            }
          }
        }
      },
      label: {
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this["_label"];
          if (oldValue != null) {
            oldValue.destroy();
          }
          delete this["_label"];
          if (value) {
            if (value instanceof cola.Label) {
              this["_label"] = value;
            } else if (value.$type) {
              this["_label"] = cola.widget(value);
            } else {
              delete this["_label"];
            }
          }
        }
      },
      labelPosition: {
        refreshDom: true,
        defaultValue: "left",
        "enum": ["left", "right"]
      },
      actionButton: {
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this["_actionButton"];
          if (oldValue != null) {
            oldValue.destroy();
          }
          delete this["_actionButton"];
          if (value) {
            if (value instanceof cola.Button) {
              this["_actionButton"] = value;
            } else if (value.$type === "Button") {
              this["_actionButton"] = cola.widget(value);
            }
          }
        }
      },
      buttonPosition: {
        refreshDom: true,
        defaultValue: "right",
        "enum": ["left", "right"]
      }
    };

    AbstractInput.prototype.destroy = function() {
      if (!this._destroyed) {
        AbstractInput.__super__.destroy.call(this);
        delete this._doms;
        delete this["_corner"];
        delete this["_actionButton"];
        delete this["_label"];
      }
    };

    AbstractInput.prototype._bindSetter = function(bindStr) {
      AbstractInput.__super__._bindSetter.call(this, bindStr);
      cola.DataType.dataTypeSetter.call(this, this._getBindingDataType());
    };

    AbstractInput.prototype._parseDom = function(dom) {
      var $actionButtonDom, $labelDom, buttonIndex, child, childConfig, index, inputDom, inputIndex, j, labelIndex, len, ref, widget;
      if (!dom) {
        return;
      }
      if (this._doms == null) {
        this._doms = {};
      }
      inputIndex = -1;
      buttonIndex = 0;
      labelIndex = 0;
      childConfig = {};
      ref = dom.childNodes;
      for (index = j = 0, len = ref.length; j < len; index = ++j) {
        child = ref[index];
        if (child.nodeType !== 1) {
          continue;
        }
        widget = cola.widget(child);
        if (widget) {
          if (widget instanceof cola.Corner) {
            childConfig.corner = this._corner = widget;
          } else if (widget instanceof cola.Label) {
            labelIndex = index;
            childConfig.label = this._label = widget;
          } else if (widget instanceof cola.Button) {
            buttonIndex = index;
            childConfig.actionButton = this._actionButton = widget;
          }
        } else {
          if (child.nodeName === "I") {
            this._doms.iconDom = child;
            this._icon = child.className;
          } else if (this._isEditorDom(child)) {
            inputIndex = index;
            this._doms.input = child;
          }
        }
      }
      if (childConfig.label && inputIndex > -1 && labelIndex > inputIndex && !config.labelPosition) {
        this._labelPosition = "right";
      }
      if (childConfig.actionButton && inputIndex > -1 && buttonIndex < inputIndex && !config.buttonPosition) {
        this._buttonPosition = "left";
      }
      if (inputIndex === -1) {
        inputDom = this._doms.input = this._createEditorDom();
        if (childConfig.label) {
          $labelDom = childConfig.label.get$Dom();
          if (this._labelPosition === "right") {
            $labelDom.before(inputDom);
          } else {
            $labelDom.after(inputDom);
          }
        } else if (childConfig.actionButton) {
          $actionButtonDom = childConfig.actionButton.get$Dom();
          if (this._buttonPosition === "left") {
            $actionButtonDom.after(inputDom);
          } else {
            $actionButtonDom.before(inputDom);
          }
        } else if (childConfig.corner) {
          childConfig.corner.get$Dom().before(inputDom);
        } else {
          this.get$Dom().append(inputDom);
        }
      }
      return this;
    };

    AbstractInput.prototype._createEditorDom = function() {
      return $.xCreate({
        tagName: "input",
        type: "text"
      });
    };

    AbstractInput.prototype._isEditorDom = function(node) {
      return node.nodeName === "INPUT";
    };

    AbstractInput.prototype._createDom = function() {
      var className, dom, inputDom;
      className = this.constructor.CLASS_NAME;
      if (this._doms == null) {
        this._doms = {};
      }
      inputDom = this._doms.input = this._createEditorDom();
      dom = $.xCreate({
        tagName: "DIV",
        "class": "ui " + className
      }, this._doms);
      dom.appendChild(inputDom);
      return dom;
    };

    AbstractInput.prototype._refreshCorner = function() {
      var corner, cornerDom;
      corner = this.get("corner");
      if (!corner) {
        return;
      }
      cornerDom = corner.getDom();
      if (cornerDom.parentNode !== this._dom) {
        this._dom.appendChild(cornerDom);
      }
      this._classNamePool.remove("labeled");
      this._classNamePool.add("corner labeled");
    };

    AbstractInput.prototype._refreshLabel = function() {
      var label, labelDom, labelPosition, rightLabeled;
      if (!this._dom) {
        return;
      }
      label = this.get("label");
      labelPosition = this.get("labelPosition");
      this._classNamePool.remove("right labeled");
      this._classNamePool.remove("labeled");
      if (!label) {
        return;
      }
      labelDom = label.getDom();
      rightLabeled = labelPosition === "right";
      this._classNamePool.add(rightLabeled ? "right labeled" : "labeled");
      if (rightLabeled) {
        this._dom.appendChild(labelDom);
      } else {
        $(this._doms.input).before(labelDom);
      }
    };

    AbstractInput.prototype._refreshButton = function() {
      var actionButton, btnDom, buttonPosition, leftAction;
      actionButton = this.get("actionButton");
      buttonPosition = this.get("buttonPosition");
      this._classNamePool.remove("left action");
      this._classNamePool.remove("action");
      if (!actionButton) {
        return;
      }
      btnDom = actionButton.getDom();
      leftAction = buttonPosition === "left";
      this._classNamePool.add(leftAction ? "left action" : "action");
      cola._ignoreNodeRemoved = true;
      if (leftAction) {
        $(this._doms.input).before(btnDom);
      } else {
        this._dom.appendChild(btnDom);
      }
      cola._ignoreNodeRemoved = false;
    };

    AbstractInput.prototype._refreshIcon = function() {
      var base, classNamePool, icon, iconDom, iconPosition, leftIcon;
      icon = this.get("icon");
      iconPosition = this.get("iconPosition");
      classNamePool = this._classNamePool;
      classNamePool.remove("left icon");
      classNamePool.remove("icon");
      if (icon) {
        if ((base = this._doms).iconDom == null) {
          base.iconDom = document.createElement("i");
        }
        iconDom = this._doms.iconDom;
        $(iconDom).addClass(icon + " icon");
        leftIcon = iconPosition === "left";
        classNamePool.add(leftIcon ? "left icon" : "icon");
        cola._ignoreNodeRemoved = true;
        if (leftIcon) {
          $(this._doms.input).before(iconDom);
        } else {
          this._dom.appendChild(iconDom);
        }
        cola._ignoreNodeRemoved = false;
      } else {
        if (this._doms.iconDom) {
          $(this._doms.iconDom).remove();
        }
      }
    };

    AbstractInput.prototype._refreshInput = function() {
      var $inputDom, align, dataType, inputType, ref;
      $inputDom = $fly(this._doms.input);
      if (this._name) {
        $inputDom.attr("name", this._name);
      }
      $inputDom.attr("placeholder", this.get("placeholder"));
      $inputDom.prop("readOnly", this._finalReadOnly);
      if ((ref = this.get("actionButton")) != null) {
        ref.set("disabled", this._finalReadOnly);
      }
      dataType = this._dataType;
      if (dataType && !this._inputType) {
        inputType = "text";
        align = "left";
        if (dataType instanceof cola.NumberDataType) {
          inputType = "number";
          align = "right";
        }
        $inputDom.prop("type", inputType).css("text-align", align);
      }
      this._refreshInputValue(this._value);
    };

    AbstractInput.prototype._refreshInputValue = function(value) {
      $fly(this._doms.input).val(value != null ? value + "" || "" : void 0);
    };

    AbstractInput.prototype._doRefreshDom = function() {
      if (!this._dom) {
        return;
      }
      AbstractInput.__super__._doRefreshDom.call(this);
      this._finalReadOnly = !!this.get("readOnly");
      this._refreshIcon();
      this._refreshButton();
      this._refreshCorner();
      this._refreshLabel();
      this._refreshInput();
    };

    AbstractInput.prototype.focus = function() {
      var ref;
      if ((ref = this._doms.input) != null) {
        ref.focus();
      }
    };

    return AbstractInput;

  })(cola.AbstractEditor);

  cola.Input = (function(superClass) {
    extend(Input, superClass);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    Input.CLASS_NAME = "input";

    Input.ATTRIBUTES = {
      displayFormat: null,
      inputFormat: null,
      inputType: {
        defaultValue: "text"
      }
    };

    Input.EVENTS = {
      focus: null,
      blur: null
    };

    Input.prototype._createEditorDom = function() {
      var config;
      config = {
        tagName: "input",
        type: this._inputType || "text"
      };
      if (this._inputType === "number") {
        config.style = {
          "text-align": "right"
        };
      }
      return $.xCreate(config);
    };

    Input.prototype._isEditorDom = function(node) {
      return node.nodeName === "INPUT";
    };

    Input.prototype._initDom = function(dom) {
      Input.__super__._initDom.call(this, dom);
      $(this._doms.input).on("change", (function(_this) {
        return function() {
          var dataType, inputFormat, readOnly, value;
          readOnly = !!_this.get("readOnly");
          if (!readOnly) {
            value = $(_this._doms.input).val();
            dataType = _this._dataType;
            if (dataType) {
              if (_this._inputType === "text") {
                inputFormat = _this._inputFormat;
                if (dataType instanceof cola.DateDataType) {
                  if (inputFormat == null) {
                    inputFormat = DEFAULT_DATE_INPUT_FORMAT;
                  }
                  value = inputFormat + "||" + value;
                }
              }
              value = dataType.parse(value);
            }
            _this.set("value", value);
          }
        };
      })(this)).on("focus", (function(_this) {
        return function() {
          _this._inputFocused = true;
          _this._refreshInputValue(_this._value);
          _this.fire("focus", _this);
        };
      })(this)).on("blur", (function(_this) {
        return function() {
          var entity, propertyDef;
          _this._inputFocused = false;
          _this._refreshInputValue(_this._value);
          _this.fire("blur", _this);
          if ((_this._value == null) || _this._value === "" && _this._bindInfo.isWriteable) {
            propertyDef = _this._getBindingProperty();
            if ((propertyDef != null ? propertyDef._required : void 0) && propertyDef._validators) {
              entity = _this._scope.get(_this._bindInfo.entityPath);
              if (entity) {
                entity.validate(_this._bindInfo.property);
              }
            }
          }
        };
      })(this));
    };

    Input.prototype._refreshInputValue = function(value) {
      var format, inputType;
      inputType = this._inputType;
      if (inputType === "text") {
        format = this._inputFocused ? this._inputFormat : this._displayFormat;
        if (typeof value === "number") {
          if (format) {
            value = formatNumber(format, value);
          }
        } else if (value instanceof Date) {
          if (!format) {
            format = this._inputFocused ? DEFAULT_DATE_INPUT_FORMAT : DEFAULT_DATE_DISPLAY_FORMAT;
          }
          value = (new XDate(value)).toString(format);
        }
      } else {
        if (value instanceof Date) {
          if (inputType === "date") {
            format = DEFAULT_DATE_DISPLAY_FORMAT;
          } else if (inputType === "time") {
            format = DEFAULT_TIME_DISPLAY_FORMAT;
          } else {
            format = ISO_FORMAT_STRING;
          }
          value = (new XDate(value)).toString(format);
        }
      }
      return Input.__super__._refreshInputValue.call(this, value);
    };

    return Input;

  })(cola.AbstractInput);

  cola.Progress = (function(superClass) {
    extend(Progress, superClass);

    function Progress() {
      return Progress.__super__.constructor.apply(this, arguments);
    }

    Progress.CLASS_NAME = "progress";

    Progress.SEMANTIC_CLASS = ["left floated", "right floated"];

    Progress.ATTRIBUTES = {
      total: {
        type: "number",
        defaultValue: 0,
        setter: function(value) {
          this._total = value;
          this._setting("total", value);
        }
      },
      value: {
        type: "number",
        defaultValue: 0,
        setter: function(value) {
          this._value = value;
          this.progress(value);
        }
      },
      showProgress: {
        defaultValue: true,
        type: "boolean",
        refreshDom: true
      },
      progressFormat: {
        "enum": ["percent", "ratio"],
        defaultValue: "percent",
        setter: function(value) {
          this._progressFormat = value;
          if (this._dom) {
            this._setting("label", value);
          }
        }
      },
      ratioText: {
        defaultValue: "{percent}%",
        setter: function(value) {
          this._ratioText = value;
          if (this._dom) {
            this._settingText();
          }
        }
      },
      activeMessage: {
        refreshDom: true,
        setter: function(value) {
          this._activeMessage = value;
          if (this._dom) {
            this._settingText();
          }
        }
      },
      successMessage: {
        refreshDom: true,
        setter: function(value) {
          this._successMessage = value;
          if (this._dom) {
            this._settingText();
          }
        }
      },
      autoSuccess: {
        defaultValue: true,
        type: "boolean",
        setter: function(value) {
          this._autoSuccess = !!value;
          if (this._dom) {
            this._setting("autoSuccess", this._autoSuccess);
          }
        }
      },
      showActivity: {
        type: "boolean",
        defaultValue: true,
        setter: function(value) {
          this._showActivity = !!value;
          if (this._dom) {
            this._setting("showActivity", this._showActivity);
          }
        }
      },
      limitValues: {
        type: "boolean",
        defaultValue: true,
        setter: function(value) {
          this._limitValues = value;
          if (this._dom) {
            this._setting("limitValues", this._limitValues);
          }
        }
      },
      precision: {
        type: "number",
        refreshDom: true,
        defaultValue: 1
      }
    };

    Progress.EVENTS = {
      change: null,
      success: null,
      active: null,
      error: null,
      warning: null
    };

    Progress.prototype._initDom = function(dom) {
      if (this._doms == null) {
        this._doms = {};
      }
      return $(dom).empty().append($.xCreate([
        {
          tagName: "div",
          "class": "bar",
          content: {
            tagName: "div",
            "class": "progress",
            contextKey: "progress"
          },
          contextKey: "bar"
        }, {
          tagName: "div",
          "class": "label",
          contextKey: "label"
        }
      ], this._doms));
    };

    Progress.prototype._setting = function(name, value) {
      if (!this._dom) {
        return;
      }
      if (this._dom) {
        this.get$Dom().progress("setting", name, value);
      }
    };

    Progress.prototype._settingText = function() {
      this._setting("text", {
        active: this._activeMessage || "",
        success: this._successMessage || "",
        ratio: this._ratioText || "{percent}%"
      });
    };

    Progress.prototype._doRefreshDom = function() {
      var $dom;
      if (!this._dom) {
        return;
      }
      Progress.__super__._doRefreshDom.call(this);
      $dom = this.get$Dom();
      if (this._doms == null) {
        this._doms = {};
      }
      if (this._activeMessage || this._successMessage) {
        if (!this._doms.label.parentNode) {
          $dom.append(this._doms.label);
        }
      } else {
        if (this._doms.label.parentNode) {
          $(this._doms.label).remove();
        }
      }
      if (this._showProgress) {
        if (this._doms.progress.parentNode !== this._doms.bar) {
          this._doms.bar.appendChild(this._doms.progress);
        }
      } else {
        if (this._doms.progress.parentNode) {
          $(this._doms.progress).remove();
        }
      }
    };

    Progress.prototype._setDom = function(dom, parseChild) {
      var listenState;
      Progress.__super__._setDom.call(this, dom, parseChild);
      listenState = (function(_this) {
        return function(eventName, arg) {
          return _this.fire(eventName, _this, arg);
        };
      })(this);
      this.get$Dom().progress({
        total: this.get("total"),
        label: this._labelFormat,
        autoSuccess: this._autoSuccess,
        showActivity: this._showActivity,
        limitValues: this._limitValues,
        precision: this._precision,
        text: {
          active: this._activeMessage || "",
          success: this._successMessage || "",
          ratio: this._ratioText
        },
        onChange: function(percent, value, total) {
          var arg;
          arg = {
            percent: percent,
            value: value,
            total: total
          };
          return listenState("change", arg);
        },
        onSuccess: function(total) {
          var arg;
          arg = {
            total: total
          };
          return listenState("success", arg);
        },
        onActive: function(value, total) {
          var arg;
          arg = {
            value: value,
            total: total
          };
          return listenState("active", arg);
        },
        onWarning: function(value, total) {
          var arg;
          arg = {
            value: value,
            total: total
          };
          return listenState("warning", arg);
        },
        onError: function(value, total) {
          var arg;
          arg = {
            value: value,
            total: total
          };
          return listenState("error", arg);
        }
      });
      this.progress(this._value);
    };

    Progress.prototype.reset = function() {
      if (this._dom) {
        this.get$Dom().progress("reset");
      }
      return this;
    };

    Progress.prototype.success = function(message) {
      if (message == null) {
        message = "";
      }
      if (this._dom) {
        this.get$Dom().progress("set success", message);
      }
      return this;
    };

    Progress.prototype.warning = function(message) {
      if (this._dom) {
        this.get$Dom().progress("set warning", message);
      }
      return this;
    };

    Progress.prototype.error = function(message) {
      if (this._dom) {
        this.get$Dom().progress("set error", message);
      }
      return this;
    };

    Progress.prototype.progress = function(progress) {
      this._value = progress;
      if (this._dom) {
        this.get$Dom().progress("set progress", progress);
      }
      return this;
    };

    Progress.prototype.complete = function() {
      this._value = this._total;
      if (this._dom) {
        this.get$Dom().progress("complete");
      }
      return this;
    };

    Progress.prototype.destroy = function() {
      var ref;
      if (this._destroyed) {
        return;
      }
      if ((ref = this._$dom) != null) {
        ref.progress("destroy");
      }
      Progress.__super__.destroy.call(this);
      delete this._doms;
    };

    return Progress;

  })(cola.Widget);

  cola.RadioButton = (function(superClass) {
    extend(RadioButton, superClass);

    function RadioButton() {
      return RadioButton.__super__.constructor.apply(this, arguments);
    }

    RadioButton.CLASS_NAME = "checkbox";

    RadioButton.INPUT_TYPE = "radio";

    RadioButton.ATTRIBUTES = {
      type: {
        "enum": ["radio", "toggle", "slider"],
        defaultValue: "radio",
        refreshDom: true,
        setter: function(value) {
          var oldValue;
          oldValue = this._type;
          this._type = value;
          if (oldValue && this._dom && oldValue !== value) {
            $fly(this._dom).removeClass(oldValue);
          }
          return this;
        }
      },
      label: {
        refreshDom: true
      },
      name: {
        refreshDom: true
      },
      disabled: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      checked: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      },
      value: {
        defaultValue: true,
        refreshDom: true
      },
      readOnly: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      }
    };

    RadioButton._modelValue = false;

    RadioButton.prototype._parseDom = function(dom) {
      var child, nameAttr;
      if (this._doms == null) {
        this._doms = {};
      }
      this._$dom = $(dom);
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          if (child.nodeName === "LABEL") {
            this._doms.label = child;
            if (this._label == null) {
              this._label = cola.util.getTextChildData(child);
            }
          } else if (child.nodeName === "INPUT") {
            nameAttr = child.getAttribute("name");
            if (nameAttr) {
              if (this._name == null) {
                this._name = nameAttr;
              }
            }
            this._doms.input = child;
          }
        }
        child = child.nextSibling;
      }
      if (!this._doms.label && !this._doms.input) {
        this._$dom.append($.xCreate([
          {
            tagName: "input",
            type: this.constructor.INPUT_TYPE,
            contextKey: "input",
            name: this._name || ""
          }, {
            tagName: "label",
            content: this._label || "",
            contextKey: "label"
          }
        ], this._doms));
      }
      if (!this._doms.label) {
        this._doms.label = $.xCreate({
          tagName: "label",
          content: this._label || this._value || ""
        });
        this._$dom.append(this._doms.label);
      }
      if (!this._doms.input) {
        this._doms.input = $.xCreate({
          tagName: "input",
          type: this.constructor.INPUT_TYPE,
          name: this._name || ""
        });
        $(this._doms.label).before(this._doms.input);
      }
      this._bindToSemantic();
    };

    RadioButton.prototype._createDom = function() {
      return $.xCreate({
        tagName: "DIV",
        "class": "ui " + this.constructor.CLASS_NAME,
        content: [
          {
            tagName: "input",
            type: this.constructor.INPUT_TYPE,
            contextKey: "input",
            name: this._name || ""
          }, {
            tagName: "label",
            content: this._label || this._value || "",
            contextKey: "label"
          }
        ]
      }, this._doms);
    };

    RadioButton.prototype._bindToSemantic = function() {
      return this.get$Dom().checkbox({
        onChange: (function(_this) {
          return function() {
            return _this._changeState();
          };
        })(this)
      });
    };

    RadioButton.prototype._changeState = function() {
      var ref;
      this._checked = this.get$Dom().checkbox("is checked");
      if (this._checked) {
        return (ref = this._parent) != null ? ref.set("value", this._value) : void 0;
      }
    };

    RadioButton.prototype._setDom = function(dom, parseChild) {
      this._dom = dom;
      if (!parseChild) {
        this._bindToSemantic();
      }
      RadioButton.__super__._setDom.call(this, dom, parseChild);
    };

    RadioButton.prototype._refreshEditorDom = function() {
      var $dom;
      $dom = this.get$Dom();
      if (this._checked === $dom.checkbox("is checked")) {
        return;
      }
      return $dom.checkbox(this._checked ? "check" : "uncheck");
    };

    RadioButton.prototype._doRefreshDom = function() {
      var $dom, label, readOnly;
      if (!this._dom) {
        return;
      }
      RadioButton.__super__._doRefreshDom.call(this);
      if (this._doms == null) {
        this._doms = {};
      }
      label = this._label || this._value || "";
      $(this._doms.label).text(label);
      readOnly = this.get("readOnly");
      this._classNamePool.toggle("read-only", readOnly);
      this._classNamePool.add(this._type);
      $dom = this.get$Dom();
      $dom.checkbox(!!this._disabled ? "disable" : "enable");
      $(this._doms.input).attr("name", this._name);
      return this._refreshEditorDom();
    };

    RadioButton.prototype.toggle = function() {
      var state;
      state = !!this.get("checked");
      this.set("checked", !state);
      return this;
    };

    RadioButton.prototype.remove = function() {
      RadioButton.__super__.remove.call(this);
      return delete this._parent;
    };

    RadioButton.prototype.destroy = function() {
      if (this._destroyed) {
        return this;
      }
      delete this._parent;
      RadioButton.__super__.destroy.call(this);
      return delete this._doms;
    };

    return RadioButton;

  })(cola.Widget);

  emptyRadioGroupItems = [];

  cola.RadioGroup = (function(superClass) {
    extend(RadioGroup, superClass);

    function RadioGroup() {
      return RadioGroup.__super__.constructor.apply(this, arguments);
    }

    RadioGroup.CLASS_NAME = "grouped";

    RadioGroup.ATTRIBUTES = {
      name: null,
      items: {
        setter: function(items) {
          var item, j, len;
          this.clear();
          for (j = 0, len = items.length; j < len; j++) {
            item = items[j];
            this._addItem(item);
          }
          return this;
        }
      },
      type: {
        "enum": ["radio", "toggle", "slider"],
        defaultValue: "radio",
        refreshDom: true,
        setter: function(value) {
          var item, j, len, ref;
          this._type = value;
          if (this._items) {
            ref = this._items;
            for (j = 0, len = ref.length; j < len; j++) {
              item = ref[j];
              item.set("type", value);
            }
          }
          return this;
        }
      }
    };

    RadioGroup.prototype._doRefreshDom = function() {
      var item, j, len, ref, value;
      if (!this._dom) {
        return;
      }
      RadioGroup.__super__._doRefreshDom.call(this);
      value = this._value;
      if (!this._items) {
        return;
      }
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.get("value") === value) {
          item.set("checked", true);
          break;
        }
      }
    };

    RadioGroup.prototype._initDom = function(dom) {
      var item, itemDom, j, len, ref;
      RadioGroup.__super__._initDom.call(this, dom);
      if (!this._items) {
        return;
      }
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        itemDom = item.getDom();
        if (itemDom.parentNode === this._dom) {
          continue;
        }
        this._dom.appendChild(itemDom);
      }
    };

    RadioGroup.prototype._parseDom = function(dom) {
      var child, widget;
      child = dom.firstChild;
      while (child) {
        if (child.nodeType === 1) {
          widget = cola.widget(child);
          if (widget && widget instanceof cola.RadioButton) {
            this._addItem(widget);
          }
        }
        child = child.nextSibling;
      }
    };

    RadioGroup.prototype._addItem = function(item) {
      var classType, radioBtn, radioDom;
      if (this._destroyed) {
        return this;
      }
      if (this._items == null) {
        this._items = [];
      }
      if (item instanceof cola.RadioButton) {
        radioBtn = item;
      } else if (item.constructor === Object.prototype.constructor) {
        radioBtn = new cola.RadioButton(item);
      } else {
        classType = cola.util.getType(item);
        if (classType === "number" || classType === "string") {
          radioBtn = new cola.RadioButton({
            value: item
          });
        }
      }
      if (!radioBtn) {
        return;
      }
      radioBtn.set({
        name: this._name,
        type: this._type
      });
      radioBtn._parent = this;
      this._items.push(radioBtn);
      if (this._dom) {
        radioDom = radioBtn.getDom();
        radioDom.parentNode !== this._dom;
        this._dom.appendChild(radioDom);
      }
      return this;
    };

    RadioGroup.prototype.addRadioButton = function(config) {
      this._addItem(config);
      return this;
    };

    RadioGroup.prototype.getRadioButton = function(index) {
      var item, j, len, ref;
      if (!this._items) {
        return;
      }
      if (typeof index === "string") {
        ref = this._items;
        for (j = 0, len = ref.length; j < len; j++) {
          item = ref[j];
          if (item.get("value") === index) {
            return;
          }
        }
      } else {
        return this._items[index];
      }
      return null;
    };

    RadioGroup.prototype.removeRadioButton = function(index) {
      var radio;
      if (index instanceof cola.RadioButton) {
        radio = index;
      } else {
        radio = getRadioButton(index);
      }
      if (!radio) {
        return this;
      }
      index = this._items.indexOf(radio);
      this._items.splice(index, 1);
      radio.remove();
      return this;
    };

    RadioGroup.prototype.clear = function() {
      var item, j, len, ref;
      if (!this._items) {
        return;
      }
      ref = this._items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        item.destroy();
      }
      return this._items = [];
    };

    RadioGroup.prototype.destroy = function() {
      var item, j, len, ref;
      if (this._destroyed) {
        return this;
      }
      if (this._items) {
        ref = this._items;
        for (j = 0, len = ref.length; j < len; j++) {
          item = ref[j];
          item.destroy();
        }
        delete this._items;
      }
      RadioGroup.__super__.destroy.call(this);
      return this;
    };

    return RadioGroup;

  })(cola.AbstractEditor);

  cola.Rating = (function(superClass) {
    extend(Rating, superClass);

    function Rating() {
      return Rating.__super__.constructor.apply(this, arguments);
    }

    Rating.CLASS_NAME = "rating";

    Rating.ATTRIBUTES = {
      rating: {
        type: "number",
        defaultValue: 0,
        refreshDom: true
      },
      maxRating: {
        type: "number",
        refreshDom: true,
        defaultValue: 1,
        setter: function(value) {
          this._maxRating = value;
          return this._refreshRating = true;
        }
      },
      disabled: {
        type: "boolean",
        refreshDom: true,
        defaultValue: false
      }
    };

    Rating.EVENTS = {
      rate: null
    };

    Rating.prototype._fireRate = function() {
      cola.util.cancelDelay(this, "_fireRate");
      return this.fire("rate", this, {
        rating: this._rating
      });
    };

    Rating.prototype._doRefreshRating = function() {
      var maxRating, rating;
      this._refreshRating = false;
      rating = this.get("rating");
      maxRating = this.get("maxRating");
      if (rating > maxRating) {
        this._rating = rating = maxRating;
      }
      this.get$Dom().empty().rating({
        initialRating: rating,
        maxRating: maxRating,
        onRate: (function(_this) {
          return function(value) {
            if (value !== _this._rating) {
              _this.set("rating", value);
              return cola.util.delay(_this, "_fireRate", 50, _this._fireRate);
            }
          };
        })(this)
      }).rating(this._disabled ? "disable" : "enable");
    };

    Rating.prototype._initDom = function(dom) {
      return this._doRefreshRating();
    };

    Rating.prototype._doRefreshDom = function() {
      var $dom;
      if (!this._dom) {
        return;
      }
      Rating.__super__._doRefreshDom.call(this);
      if (this._refreshRating) {
        this._doRefreshRating();
      } else {
        $dom = this.get$Dom();
        $dom.rating(this._disabled ? "disable" : "enable");
        if ($dom.rating("get rating") !== this._rating) {
          $dom.rating("set rating", this._rating);
        }
      }
    };

    Rating.prototype.clear = function() {
      this.set("rating", 0);
      return this;
    };

    return Rating;

  })(cola.Widget);

  cola.Element.mixin(cola.Rating, cola.DataWidgetMixin);

  cola.Select = (function(superClass) {
    extend(Select, superClass);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.CLASS_NAME = "input";

    Select.ATTRIBUTES = {
      options: {
        setter: function(options) {
          var ref, select;
          if (!(options instanceof Array || options instanceof cola.EntityList)) {
            return;
          }
          this._options = options;
          select = (ref = this._doms) != null ? ref.input : void 0;
          if (select) {
            this._refreshSelectOptions(select);
          }
        }
      }
    };

    Select.prototype._createEditorDom = function() {
      return $.xCreate({
        tagName: "select",
        "class": "editor"
      });
    };

    Select.prototype._isEditorDom = function(node) {
      return node.nodeName === "SELECT";
    };

    Select.prototype._parseDom = function(dom) {
      var child, skipSetIcon;
      Select.__super__._parseDom.call(this, dom);
      if (!this._icon) {
        child = this._doms.input.nextSibling;
        while (child) {
          if (child.nodeType === 1 && child.nodeName !== "TEMPLATE") {
            skipSetIcon = true;
            break;
          }
          child = child.nextSibling;
        }
        if (!skipSetIcon) {
          this.set("icon", "dropdown");
        }
      }
    };

    Select.prototype._initDom = function(dom) {
      if (this._options) {
        this._refreshSelectOptions(this._doms.input);
      }
    };

    Select.prototype._refreshSelectOptions = function(select) {
      var options;
      options = select.options;
      if (this._options instanceof cola.EntityList) {
        options.length = this._options.entityCount;
      } else {
        options.length = this._options.length;
      }
      cola.each(this._options, function(optionValue, i) {
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

    return Select;

  })(cola.AbstractInput);

  dropdownDialogMargin = 0;

  cola.findDropDown = function(target) {
    var dropContainer;
    if (target instanceof cola.Widget) {
      target = target.getDom();
    }
    while (target) {
      if ($fly(target).hasClass("drop-container")) {
        dropContainer = cola.widget(target);
        return dropContainer != null ? dropContainer._dropdown : void 0;
      }
      target = target.parentNode;
    }
  };

  cola.AbstractDropdown = (function(superClass) {
    extend(AbstractDropdown, superClass);

    function AbstractDropdown() {
      return AbstractDropdown.__super__.constructor.apply(this, arguments);
    }

    AbstractDropdown.CLASS_NAME = "input drop";

    AbstractDropdown.ATTRIBUTES = {
      items: {
        expressionType: "repeat",
        setter: function(items) {
          this._items = items;
          if (this._itemsTimestamp !== (items != null ? items.timestamp : void 0)) {
            if (items) {
              this._itemsTimestamp = items.timestamp;
            }
            delete this._itemsIndex;
          }
        }
      },
      currentItem: {
        readOnly: true
      },
      value: {
        refreshDom: true,
        setter: function(value) {
          var currentItem, index, valueProperty;
          cola.AbstractInput.ATTRIBUTES.value.setter.apply(this, arguments);
          if (this._skipFindCurrentItem) {
            return;
          }
          if (!this._itemsIndex) {
            if (this._items && value && this._valueProperty) {
              this._itemsIndex = index = {};
              valueProperty = this._valueProperty;
              cola.each(this._items, function(item) {
                var key;
                if (item instanceof cola.Entity) {
                  key = item.get(valueProperty);
                } else {
                  key = item[valueProperty];
                }
                index[key + ""] = item;
              });
              currentItem = index[value + ""];
            }
          } else {
            currentItem = this._itemsIndex[value + ""];
          }
          this._currentItem = currentItem;
        }
      },
      valueProperty: null,
      textProperty: null,
      openOnActive: {
        type: "boolean",
        defaultValue: true
      },
      openMode: {
        "enum": ["auto", "drop", "dialog", "layer", "half-layer"],
        defaultValue: "auto"
      },
      opened: {
        readOnly: true
      },
      dropdownWidth: null,
      dropdownHeight: null
    };

    AbstractDropdown.EVENTS = {
      beforeOpen: null,
      open: null,
      close: null
    };

    AbstractDropdown.prototype._initDom = function(dom) {
      var valueContent;
      $fly(this._doms.input).xInsertAfter({
        tagName: "div",
        "class": "value-content",
        contextKey: "valueContent"
      }, this._doms);
      $fly(dom).delegate(">.icon", "click", (function(_this) {
        return function() {
          if (_this._opened) {
            _this.close();
          } else {
            _this.open();
          }
        };
      })(this));
      valueContent = this._doms.valueContent;
      $(this._doms.input).on("focus", function() {
        $fly(valueContent).addClass("placeholder");
      }).on("blur", function() {
        $fly(valueContent).removeClass("placeholder");
      });
    };

    AbstractDropdown.prototype._parseDom = function(dom) {
      var child, skipSetIcon;
      if (!dom) {
        return;
      }
      AbstractDropdown.__super__._parseDom.call(this, dom);
      this._parseTemplates();
      if (!this._icon) {
        child = this._doms.input.nextSibling;
        while (child) {
          if (child.nodeType === 1 && child.nodeName !== "TEMPLATE") {
            skipSetIcon = true;
            break;
          }
          child = child.nextSibling;
        }
        if (!skipSetIcon) {
          this.set("icon", "dropdown");
        }
      }
    };

    AbstractDropdown.prototype._createEditorDom = function() {
      return $.xCreate({
        tagName: "input",
        type: "text",
        click: (function(_this) {
          return function(evt) {
            var input;
            if (_this._openOnActive) {
              if (_this._opened) {
                input = evt.target;
                if (input.readOnly) {
                  _this.close();
                }
              } else {
                _this.open();
              }
            }
          };
        })(this),
        input: (function(_this) {
          return function(evt) {
            var $valueContent;
            $valueContent = $fly(_this._doms.valueContent);
            if (evt.target.value) {
              $valueContent.hide();
            } else {
              $valueContent.show();
            }
          };
        })(this)
      });
    };

    AbstractDropdown.prototype._isEditorDom = function(node) {
      return node.nodeName === "INPUT";
    };

    AbstractDropdown.prototype._isEditorReadOnly = function() {
      return cola.device.mobile;
    };

    AbstractDropdown.prototype._refreshInput = function() {
      var $inputDom, ref;
      $inputDom = $fly(this._doms.input);
      $inputDom.attr("placeholder", this.get("placeholder"));
      $inputDom.prop("readOnly", this._finalReadOnly || this._isEditorReadOnly());
      if ((ref = this.get("actionButton")) != null) {
        ref.set("disabled", this._finalReadOnly);
      }
      this._setValueContent(this._currentItem);
    };

    AbstractDropdown.prototype._setValueContent = function(item) {
      var alias, ctx, currentItemScope, elementAttrBinding, input, ref, valueContent;
      input = this._doms.input;
      input.value = "";
      if (item) {
        input.placeholder = "";
        elementAttrBinding = (ref = this._elementAttrBindings) != null ? ref["items"] : void 0;
        alias = (elementAttrBinding != null ? elementAttrBinding.expression.alias : void 0) || "item";
        currentItemScope = this._currentItemScope;
        if (currentItemScope && currentItemScope.data.alias !== alias) {
          currentItemScope = null;
        }
        if (!currentItemScope) {
          this._currentItemScope = currentItemScope = new cola.ItemScope(this._scope, alias);
        }
        currentItemScope.data.setTargetData(item);
        valueContent = this._doms.valueContent;
        if (!valueContent._inited) {
          valueContent._inited = true;
          ctx = {
            defaultPath: alias
          };
          this._initValueContent(valueContent, ctx);
          cola.xRender(valueContent, currentItemScope, ctx);
        }
        $fly(valueContent).show();
      } else {
        input.placeholder = this._placeholder || "";
      }
    };

    AbstractDropdown.prototype._initValueContent = function(valueContent, context) {
      var j, len, property, t, template;
      property = this._textProperty || this._valueProperty;
      if (property) {
        context.defaultPath += "." + property;
      }
      template = this._getTemplate("value-content");
      if (template) {
        if (template instanceof Array) {
          for (j = 0, len = template.length; j < len; j++) {
            t = template[j];
            valueContent.appendChild(t);
          }
        } else {
          valueContent.appendChild(template);
        }
      }
    };

    AbstractDropdown.prototype._getFinalOpenMode = function() {
      var openMode;
      openMode = this._openMode;
      if (!openMode || openMode === "auto") {
        if (cola.device.desktop) {
          openMode = "drop";
        } else if (cola.device.phone) {
          openMode = "layer";
        } else {
          openMode = "dialog";
        }
      }
      return openMode;
    };

    AbstractDropdown.prototype._getContainer = function() {
      var config, container, ctx, openMode, titleContent;
      if (this._container) {
        return this._container;
      }
      this._finalOpenMode = openMode = this._getFinalOpenMode();
      config = {
        "class": "drop-container",
        dom: $.xCreate({
          tagName: "div",
          content: this._getDropdownContent()
        }),
        beforeHide: (function(_this) {
          return function() {
            $fly(_this._dom).removeClass("opened");
          };
        })(this),
        hide: (function(_this) {
          return function() {
            _this._opened = false;
          };
        })(this)
      };
      if (this._dropdownWidth) {
        config.width = this._dropdownWidth;
      }
      if (this._dropdownHeight) {
        config.height = this._dropdownHeight;
      }
      if (openMode === "drop") {
        config.duration = 200;
        config.dropdown = this;
        config.ui = config.ui + " " + this._ui;
        container = new DropBox(config);
      } else if (openMode === "layer") {
        ctx = {};
        titleContent = cola.xRender({
          tagName: "div",
          "class": "box",
          content: {
            tagName: "div",
            "c-widget": {
              $type: "titleBar",
              items: [
                {
                  icon: "chevron left",
                  click: (function(_this) {
                    return function() {
                      return _this.close();
                    };
                  })(this)
                }
              ]
            }
          }
        }, this._scope, ctx);
        $fly(config.dom.firstChild.firstChild).before(titleContent);
        container = new cola.Layer(config);
      } else if (openMode === "dialog") {
        config.modalOpacity = 0.05;
        config.closeable = false;
        config.dimmerClose = true;
        container = new cola.Dialog(config);
      }
      this._container = container;
      container.appendTo(document.body);
      return container;
    };

    AbstractDropdown.prototype.open = function(callback) {
      var $containerDom, $flexContent, clientHeight, container, containerHeight, doCallback, height;
      if (this.fire("beforeOpen", this) === false) {
        return;
      }
      doCallback = (function(_this) {
        return function() {
          _this.fire("open", _this);
          if (typeof callback === "function") {
            callback();
          }
        };
      })(this);
      container = this._getContainer();
      if (container) {
        container._dropdown = this;
        container.on("hide", function(self) {
          delete self._dropdown;
        });
        if (container instanceof DropBox) {
          container.show(this, doCallback);
        } else if (container instanceof cola.Layer) {
          container.show(doCallback);
        } else if (container instanceof cola.Dialog) {
          $flexContent = $(this._doms.flexContent);
          $flexContent.height("");
          $containerDom = container.get$Dom();
          $containerDom.show();
          containerHeight = $containerDom.height();
          clientHeight = document.body.clientHeight;
          if (containerHeight > (clientHeight - dropdownDialogMargin * 2)) {
            height = $flexContent.height() - (containerHeight - (clientHeight - dropdownDialogMargin * 2));
            $containerDom.hide();
            $flexContent.height(height);
          } else {
            $containerDom.hide();
          }
          container.show(doCallback);
        }
        this._opened = true;
        $fly(this._dom).addClass("opened");
      }
    };

    AbstractDropdown.prototype.close = function(selectedData, callback) {
      var container;
      if (selectedData !== void 0) {
        this._selectData(selectedData);
      }
      container = this._getContainer();
      if (container) {
        container.hide(callback);
      }
    };

    AbstractDropdown.prototype._selectData = function(item) {
      var value;
      if (this._valueProperty && item) {
        if (item instanceof cola.Entity) {
          value = item.get(this._valueProperty);
        } else {
          value = item[this._valueProperty];
        }
      } else {
        value = item;
      }
      this._currentItem = item;
      this._skipFindCurrentItem = true;
      this.set("value", value);
      this._skipFindCurrentItem = false;
      this.refresh();
    };

    return AbstractDropdown;

  })(cola.AbstractInput);

  cola.Element.mixin(cola.AbstractDropdown, cola.TemplateSupport);

  DropBox = (function(superClass) {
    extend(DropBox, superClass);

    function DropBox() {
      return DropBox.__super__.constructor.apply(this, arguments);
    }

    DropBox.CLASS_NAME = "drop-box";

    DropBox.ATTRIBUTES = {
      dropdown: null
    };

    DropBox.prototype.show = function(options, callback) {
      var $dom, bottomSpace, boxHeight, boxWidth, clientHeight, clientWidth, direction, dropdownDom, height, left, rect, top, topSpace;
      $dom = this.get$Dom();
      dropdownDom = this._dropdown._doms.input;
      $dom.css("height", "").show();
      boxWidth = $dom.width();
      boxHeight = $dom.height();
      $dom.hide();
      rect = dropdownDom.getBoundingClientRect();
      clientWidth = document.body.clientWidth;
      clientHeight = document.body.clientHeight;
      bottomSpace = clientHeight - rect.top - dropdownDom.clientHeight;
      if (bottomSpace >= boxHeight) {
        direction = "down";
      } else {
        topSpace = rect.top;
        if (topSpace > bottomSpace) {
          direction = "up";
          height = topSpace;
        } else {
          direction = "down";
          height = bottomSpace;
        }
      }
      if (direction === "down") {
        top = rect.top + dropdownDom.clientHeight;
      } else {
        top = rect.top - (height || boxHeight);
      }
      left = rect.left;
      if (boxWidth > dropdownDom.offsetWidth) {
        if (boxWidth + rect.left > clientWidth) {
          left = clientWidth - boxWidth;
          if (left < 0) {
            left = 0;
          }
        }
      }
      if (height) {
        $dom.css("height", height);
      }
      $dom.removeClass(direction === "down" ? "direction-up" : "direction-down").addClass("direction-" + direction).toggleClass("x-over", boxWidth > dropdownDom.offsetWidth).css("left", left).css("top", top).css("min-width", dropdownDom.offsetWidth);
      this._animation = "slide " + direction;
      DropBox.__super__.show.call(this, options, callback);
    };

    DropBox.prototype._onShow = function() {
      DropBox.__super__._onShow.call(this);
      this._bodyListener = (function(_this) {
        return function(evt) {
          var dropContainerDom, dropdownDom, inDropdown, target;
          target = evt.target;
          dropdownDom = _this._dropdown._dom;
          dropContainerDom = _this._dom;
          while (target) {
            if (target === dropdownDom || target === dropContainerDom) {
              inDropdown = true;
              break;
            }
            target = target.parentNode;
          }
          if (!inDropdown) {
            _this._dropdown.close();
          }
        };
      })(this);
      $fly(document.body).on("click", this._bodyListener);
    };

    DropBox.prototype.hide = function(options, callback) {
      $fly(document.body).off("click", this._bodyListener);
      DropBox.__super__.hide.call(this, options, callback);
    };

    return DropBox;

  })(cola.Layer);

  cola.Dropdown = (function(superClass) {
    extend(Dropdown, superClass);

    function Dropdown() {
      return Dropdown.__super__.constructor.apply(this, arguments);
    }

    Dropdown.ATTRIBUTES = {
      filterable: {
        readOnlyAfterCreate: true,
        defaultValue: true
      },
      filterValue: {
        readOnly: true
      },
      filterProperty: null,
      filterInterval: {
        defaultValue: 300
      }
    };

    Dropdown.EVENTS = {
      filterItem: null
    };

    Dropdown.TEMPLATES = {
      "default": {
        tagName: "li",
        "c-bind": "$default"
      },
      "list": {
        tagName: "div",
        contextKey: "flexContent",
        content: {
          tagName: "div",
          contextKey: "list",
          "c-widget": "listView",
          style: "height:100%"
        }
      },
      "filterable-list": {
        tagName: "div",
        style: "height:100%",
        content: [
          {
            tagName: "div",
            "class": "filter-container",
            content: {
              tagName: "div",
              contextKey: "filterInput",
              "c-widget": "input;icon:search;width:100%"
            }
          }, {
            tagName: "div",
            contextKey: "flexContent",
            "class": "list-container",
            content: {
              tagName: "div",
              contextKey: "list",
              "c-widget": "listView",
              style: "height:100%"
            }
          }
        ]
      }
    };

    Dropdown.prototype._initValueContent = function(valueContent, context) {
      var template;
      Dropdown.__super__._initValueContent.call(this, valueContent, context);
      if (!valueContent.firstChild) {
        template = this._getTemplate("default");
        if (template) {
          valueContent.appendChild(this._cloneTemplate(template));
        }
      }
    };

    Dropdown.prototype.open = function() {
      var inputDom, list;
      Dropdown.__super__.open.call(this);
      list = this._list;
      if (this._currentItem !== list.get("currentItem")) {
        list.set("currentItem", this._currentItem);
      }
      if (this._opened && this._filterable) {
        inputDom = this._doms.input;
        $fly(inputDom).on("input.filter", (function(_this) {
          return function() {
            return _this._onInput(inputDom.value);
          };
        })(this));
      }
    };

    Dropdown.prototype.close = function(selectedValue) {
      if (this._filterable) {
        $fly(this._doms.input).off("input.filter");
      }
      return Dropdown.__super__.close.call(this, selectedValue);
    };

    Dropdown.prototype._onInput = function(value) {
      cola.util.delay(this, "filterItems", 300, function() {
        this._list.set("filterCriteria", value);
      });
    };

    Dropdown.prototype._getDropdownContent = function() {
      var attrBinding, hasDefaultTemplate, inputDom, list, name, ref, templ, template, templateName;
      if (!this._dropdownContent) {
        if (this._filterable && this._finalOpenMode !== "drop") {
          templateName = "filterable-list";
        } else {
          templateName = "list";
        }
        template = this._getTemplate(templateName);
        this._dropdownContent = template = cola.xRender(template, this._scope);
        this._list = list = cola.widget(this._doms.list);
        if (this._templates) {
          ref = this._templates;
          for (name in ref) {
            templ = ref[name];
            if (["list", "filterable-list", "value-content"].indexOf(name) < 0) {
              if (name === "default") {
                hasDefaultTemplate = true;
              }
              list._regTemplate(name, templ);
            }
          }
        }
        if (!hasDefaultTemplate) {
          list._regTemplate("default", {
            tagName: "li",
            "c-bind": "$default"
          });
        }
        list.on("itemClick", (function(_this) {
          return function() {
            return _this.close(list.get("currentItem"));
          };
        })(this));
        if (this._doms.filterInput) {
          this._filterInput = cola.widget(this._doms.filterInput);
          inputDom = this._filterInput._doms.input;
          $fly(inputDom).on("input", (function(_this) {
            return function() {
              return _this._onInput(inputDom.value);
            };
          })(this));
        }
      }
      attrBinding = this._elementAttrBindings["items"];
      list = this._list;
      list._textProperty = this._textProperty || this._valueProperty;
      if (attrBinding) {
        list.set("bind", attrBinding.expression.raw);
      } else {
        list.set("items", this._items);
      }
      list.refresh();
      return template;
    };

    return Dropdown;

  })(cola.AbstractDropdown);

  cola.CustomDropdown = (function(superClass) {
    extend(CustomDropdown, superClass);

    function CustomDropdown() {
      return CustomDropdown.__super__.constructor.apply(this, arguments);
    }

    CustomDropdown.ATTRIBUTES = {
      content: null
    };

    CustomDropdown.TEMPLATES = {
      "default": {
        tagName: "div",
        content: "<Undefined>"
      },
      "value-content": {
        tagName: "div",
        "c-bind": "$default"
      }
    };

    CustomDropdown.prototype._isEditorReadOnly = function() {
      return true;
    };

    CustomDropdown.prototype._getDropdownContent = function() {
      var dropdownContent;
      if (!this._dropdownContent) {
        if (this._content) {
          dropdownContent = this._content;
        } else {
          dropdownContent = this._getTemplate();
        }
        this._dropdownContent = cola.xRender(dropdownContent, this._scope);
      }
      return this._dropdownContent;
    };

    return CustomDropdown;

  })(cola.AbstractDropdown);

  cola.Form = (function(superClass) {
    extend(Form, superClass);

    Form.CLASS_NAME = "form";

    Form.ATTRIBUTES = {
      bind: {
        setter: function(bindStr) {
          return this._bindSetter(bindStr);
        }
      },
      state: {
        setter: function(state) {
          var STATES, classPool, cls, p;
          if (this._state === state) {
            return;
          }
          this._state = state;
          if (this._dom) {
            STATES = this.constructor.STATES;
            classPool = new cola.ClassNamePool(this._dom.className);
            for (p in STATES) {
              cls = STATES[p];
              classPool.remove(cls);
            }
            if (state) {
              classPool.add(STATES[state]);
            }
            this._dom.className = classPool.join();
          }
        }
      }
    };

    Form.STATES = {
      "error": "error",
      "warning": "warning",
      "info": "success"
    };

    function Form(config) {
      this._messageHolder = new cola.Entity.MessageHolder();
      Form.__super__.constructor.call(this, config);
    }

    Form.prototype._initDom = function(dom) {
      var $dom;
      $dom = $(dom);
      if (this._state) {
        $dom.addClass(this._state);
      }
      this._inline = $dom.find(".ui.message").length === 0;
      cola.ready((function(_this) {
        return function() {
          $dom.form({
            on: "_disabled",
            inline: _this._inline
          });
        };
      })(this));
    };

    Form.prototype._filterDataMessage = function(path, type, arg) {
      return type === cola.constants.MESSAGE_REFRESH || type === cola.constants.MESSAGE_CURRENT_CHANGE || type === cola.constants.MESSAGE_VALIDATION_STATE_CHANGE;
    };

    Form.prototype._processDataMessage = function(path, type, arg) {
      var entity;
      entity = this._bindInfo.expression.evaluate(this._scope, "never");
      if (entity && entity instanceof dorado.Entity) {
        this._resetEntityMessages();
      } else {
        entity = null;
      }
      this._entity = entity;
      this._refreshState();
    };

    Form.prototype._getEntity = function() {
      if (this._entity) {
        return this._entity;
      }
      return this._scope.get();
    };

    Form.prototype._refreshState = function() {
      var errors, j, keyMessage, len, m, messages, state, type;
      state = null;
      keyMessage = this._messageHolder.getKeyMessage();
      type = keyMessage != null ? keyMessage.type : void 0;
      if (type === "error" && !this._inline) {
        errors = [];
        messages = this._messageHolder.findMessages(null, type);
        if (messages) {
          for (j = 0, len = messages.length; j < len; j++) {
            m = messages[j];
            if (m.text) {
              errors.push(m.text);
            }
          }
        }
        this._$dom.form("add errors", errors);
        if (errors.length > 0) {
          state = type;
        }
      }
      this.set("state", state);
    };

    Form.prototype._resetEntityMessages = function() {
      var entity, j, len, message, messageHolder, messages;
      messageHolder = this._messageHolder;
      messageHolder.clear("fields");
      entity = this._getEntity();
      if (entity) {
        messages = entity.findMessages();
        if (messages) {
          for (j = 0, len = messages.length; j < len; j++) {
            message = messages[j];
            messageHolder.add("fields", message);
          }
        }
      }
    };

    Form.prototype.setMessages = function(messages) {
      var j, len, message, messageHolder;
      messageHolder = this._messageHolder;
      messageHolder.clear("$");
      if (messages) {
        for (j = 0, len = messages.length; j < len; j++) {
          message = messages[j];
          messageHolder.add("$", message);
        }
      }
      this._refreshState();
    };

    Form.prototype.setFieldMessages = function(editor, message) {
      var editorDom;
      if (this._inline) {
        editorDom = editor._$dom.find("input, textarea, select")[0];
        if (editorDom) {
          editorDom.id || (editorDom.id = cola.uniqueId());
          if ((message != null ? message.type : void 0) === "error" && message.text) {
            this._$dom.form("add prompt", editorDom.id, message.text);
          } else {
            this._$dom.form("remove prompt", {
              identifier: editorDom.id
            });
          }
        }
      } else {
        this._resetEntityMessages();
        this._refreshState();
      }
    };

    return Form;

  })(cola.Widget);

  cola.Element.mixin(cola.Form, cola.DataWidgetMixin);

}).call(this);
