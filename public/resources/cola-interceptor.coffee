oldColaRootFn = cola._rootFunc
cola._rootFunc = ()->
	if arguments.length is 2 and typeof arguments[0] == "string" and typeof arguments[1] == "function"
		name = arguments[0]
		fn = arguments[1]
		targetDoms = $(".example[name='#{name}']")
		targetDoms.find(".prettyprint").attr("c-ignore", "")

		if targetDoms.length
			oldColaRootFn(name, targetDoms[0], fn)
			return
		else
			throw new cola.Exception("\".example[name='#{name}']\" not exists.")

	oldColaRootFn.apply(@, arguments)