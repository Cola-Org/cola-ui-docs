(function() {
  var $examples, jsBeautifyOptions;

  jsBeautifyOptions = {
    space_before_conditional: true,
    keep_array_indentation: false,
    preserve_newlines: true,
    unescape_strings: true,
    jslint_happy: false,
    brace_style: "end-expand",
    indent_char: " ",
    indent_size: 4
  };

  $examples = $(".example");

  $examples.each(function(index, el) {
    var code, codeEl, html, modelName, name, reg, script, style;
    name = $fly(el).attr("name");
    modelName = $fly(el).attr("model") || name;
    reg = new RegExp("(cola\\(" + ('"' + modelName + '"') + ",|cola\\('" + modelName + "',)", "g");
    script = $("script[name='" + name + "']").text() || "";
    if (script) {
      script = "<script type=\"text/javascript\">" + (script.replace(reg, "cola(")) + "</script>";
    }
    style = $("style[name='" + name + "']").text() || "";
    if (style) {
      style = "<style>" + style + "</style>";
    }
    html = $(el).find(".code").html();
    code = html + script + style;
    code = html_beautify(code, jsBeautifyOptions);
    codeEl = $.xCreate({
      tagName: "pre",
      "class": "prettyprint lang-html",
      content: code
    });
    return el.appendChild(codeEl);
  });

  $(".markdown-content>pre>code").addClass("prettyprint linenums");

  prettyPrint();

  $('#catalog').sticky({
    context: ".main.ui.container > .ui.right.rail",
    offset: 30
  });

  $(".example").visibility({
    once: false,
    onBottomPassedReverse: function() {
      var currentId;
      currentId = $(this).attr("id");
      $("#catalog a.item.active").removeClass("active");
      return $("#catalog a.item[href='#" + currentId + "']").addClass("active");
    },
    onTopPassedReverse: function() {
      var currentId;
      currentId = $(this).attr("id");
      $("#catalog a.item.active").removeClass("active");
      return $("#catalog a.item[href='#" + currentId + "']").addClass("active");
    },
    onBottomPassed: function() {
      var index, targetId;
      index = $examples.index(this);
      while (!targetId && index < $examples.length) {
        targetId = $examples.eq(++index).attr("id");
      }
      $("#catalog a.item.active").removeClass("active");
      return $("#catalog a.item[href='#" + targetId + "']").addClass("active");
    }
  });

  $("#catalog").delegate("a.item", "click", function(event) {
    var targetItem;
    targetItem = $(this);
    setTimeout(function() {
      $("#catalog a.item.active").removeClass("active");
      return targetItem.addClass("active");
    }, 200);
    return event.stopImmediatePropagation();
  });

  $("#catalog > .ui.vertical.following.fluid.accordion.text.menu").accordion({
    exclusive: false,
    animateChildren: false,
    onChange: function() {
      return $('.ui.sticky').sticky('refresh');
    }
  });

}).call(this);
