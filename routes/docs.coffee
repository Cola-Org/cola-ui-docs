express = require 'express'
router = express.Router()
mdConfig = require './md-config'
markdownJs = require 'markdown-js'
jstransformer = require 'jstransformer'
path = require 'path'
fs = require 'fs'
mit = require('jstransformer-markdown-it')
markdown = jstransformer(mit)
marked = require('marked')
router.get '/*', (req, res, next) ->
	pathName = req.params[0]
	if pathName
		mdOptions = mdConfig.router[pathName]
		if mdOptions
			res.render "markdown",
				title: mdOptions.title
				markdown: markdown,
				(err, html)->
					fs.readFile(path.join(__dirname, mdConfig.options.cwd, mdOptions.file), (err, data)->
						if err then throw err
						res.send(html.replace("#MARKDOWN-CONTENT", marked(data.toString())))
					)
					return
			return
		paths = pathName.split("/")
		title = if paths.length > 1 then paths[1] else pathName
	else
		pathName = "preview"
		title = "Dorado UI"
	res.render pathName,
		title: title
		markdown: markdown

module.exports = router
