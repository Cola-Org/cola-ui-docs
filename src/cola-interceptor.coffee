oldColaRootFn = cola._rootFunc
cola._rootFunc = ()->
	if arguments.length is 2 and typeof arguments[0] == "string" and typeof arguments[1] == "function"
		name = arguments[0]
		fn = arguments[1]
		targetDoms = $(".example[name='#{name}']")
		if targetDoms.length
			targetDoms.each(()-> oldColaRootFn(name, @, fn))
			return
	oldColaRootFn.apply(@, arguments)