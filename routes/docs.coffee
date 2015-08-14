express = require 'express'
router = express.Router()
jstransformer = require 'jstransformer'
mit = require('jstransformer-markdown-it')
markdown = jstransformer(mit)
router.get '/*', (req, res, next) ->
	pathName = req.params[0]
	if pathName
		paths = pathName.split("/")
		title = if paths.length > 1 then paths[1] else pathName
	else
		pathName = "preview"
		title = "Dorado UI"
	res.render pathName,
		title: title
		markdown: markdown

module.exports = router
