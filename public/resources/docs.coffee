jsBeautifyOptions =
	space_before_conditional: true
	keep_array_indentation: false
	preserve_newlines: true
	unescape_strings: true
	jslint_happy: false
	brace_style: "end-expand"
	indent_char: " "
	indent_size: 4

$examples = $(".example")
$(".example:not(.ignore)").each((index, el)->
	name = $fly(el).attr("name")
	modelName = $fly(el).attr("model") or name

	reg = new RegExp("(cola\\(#{'"' + modelName + '"'},|cola\\('#{modelName}',)", "g");
	script = $("script[name='#{name}']").text() or ""
	if script then script = "<script type=\"text/javascript\">#{script.replace(reg, "cola(")}</script>"

	style = $("style[name='#{name}']").text() or ""
	if style then style = "<style>#{style}</style>"
	$code = $(el).find(".code")
	html = $code.html()
	if html
		code = html + script + style
		code = html_beautify(code, jsBeautifyOptions)

		codeEl = $.xCreate({
			tagName: "pre"
			class: "prettyprint lang-html c-ignore"
			content: code
		})
		if $code[0]
			parentNode = $code[0].parentNode
			if parentNode isnt el
				while parentNode isnt el
					parentNode = parentNode.parentNode
				$(parentNode).after(codeEl)
			else
				$code.after(codeEl)
)

$(".markdown-content pre>code").each((index, el)->
	code = $(el).text();
	$(el).parent().addClass("prettyprint lang-html c-ignore").text(code)
)
$(".markdown-content>pre.code").each((index, el)->
	code = html_beautify($(el).html(), jsBeautifyOptions);
	$(el).addClass("prettyprint").text(code)
)
prettyPrint()

$('#catalog').sticky({
	offset: 30
})


$(".example").visibility({
	once: false
	onBottomPassedReverse: ()->
		currentId = $(this).attr("id")
		$("#catalog a.item.active").removeClass("active")
		$("#catalog a.item[href='##{currentId}']").addClass("active")
	onTopPassedReverse: ()->
		currentId = $(this).attr("id")
		$("#catalog a.item.active").removeClass("active")
		$("#catalog a.item[href='##{currentId}']").addClass("active")
	onBottomPassed: ()->
		index = $examples.index(this)
		while !targetId and index < $examples.length
			targetId = $examples.eq(++index).attr("id")
		$("#catalog a.item.active").removeClass("active")
		$("#catalog a.item[href='##{targetId}']").addClass("active")
})

$("#catalog").delegate("a.item", "click", (event)->
	targetItem = $(this)
	setTimeout(()->
		$("#catalog a.item.active").removeClass("active")
		targetItem.addClass("active")
	, 200)
	event.stopImmediatePropagation()
)


$("#catalog > .ui.vertical.following.fluid.accordion.text.menu").accordion({
	exclusive: false,
	animateChildren: false
})
resizeContent = ()->
	height = $(window).height()
	footerHeight = $("#footer").height()
	$("#article>div>.content").css("minHeight", height - footerHeight)
$(window).ready(resizeContent).resize(resizeContent)

contentContainer = $("#article")
$("#back-to-top").click(()->
	contentContainer.animate({scrollTop: 0}, 1000)
)

contentContainer.scroll(()->
	wTop = $(this).scrollTop()
	$("#back-to-top").toggleClass("show", wTop > 0)
);

$("#homeDemoBtn").click(()->
	alert("敬请等待！")
);