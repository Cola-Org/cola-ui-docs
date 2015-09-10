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

  $(".example:not(.ignore)").each(function(index, el) {
    var $code, code, codeEl, html, modelName, name, parentNode, reg, script, style;
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
    $code = $(el).find(".code");
    html = $code.html();
    if (html) {
      code = html + script + style;
      code = html_beautify(code, jsBeautifyOptions);
      codeEl = $.xCreate({
        tagName: "pre",
        "class": "prettyprint lang-html c-ignore",
        content: code
      });
      if ($code[0]) {
        parentNode = $code[0].parentNode;
        if (parentNode !== el) {
          while (parentNode !== el) {
            parentNode = parentNode.parentNode;
          }
          return $(parentNode).after(codeEl);
        } else {
          return $code.after(codeEl);
        }
      }
    }
  });

  $(".markdown-content pre>code").each(function(index, el) {
    var code;
    code = $(el).text();
    return $(el).parent().addClass("prettyprint lang-html c-ignore").text(code);
  });

  $(".markdown-content>pre.code").each(function(index, el) {
    var code;
    code = html_beautify($(el).html(), jsBeautifyOptions);
    return $(el).addClass("prettyprint").text(code);
  });

  prettyPrint();

  $('#catalog').sticky({
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
    animateChildren: false
  });

}).call(this);
