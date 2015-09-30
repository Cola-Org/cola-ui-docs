express = require 'express'
router = express.Router()
mdConfig = require './md-config'
articals = require './articals'
jstransformer = require 'jstransformer'
path = require 'path'
fs = require 'fs'
mit = require('jstransformer-markdown-it')
less = jstransformer(require('jstransformer-less'))
markdown = jstransformer(mit)
marked = require('marked')

docTitleMapping = {}

for category in articals
	for doc in category.docs
		docTitleMapping[doc.url] = doc.name

router.get '/*', (req, res, next) ->
	pathName = req.params[0] or "quick-start"
	mdOptions = mdConfig.router[pathName]

	if mdOptions
		res.render "markdown",
			title: mdOptions.title
			articals: articals
			pathName: "/docs/#{pathName}"
			markdown: markdown,
			(err, html)->
				fs.readFile(path.join(__dirname, mdConfig.options.cwd, mdOptions.file), (err, data)->
					if err then throw err
					res.send(html.replace("#MARKDOWN-CONTENT", marked(data.toString())))
				)
				return
		return
	paths = pathName.split("/")
	title = docTitleMapping[pathName] or (if paths.length > 1 then paths[1] else pathName)


	res.render pathName,
		title: title
		markdown: markdown
		less: less
		articals: articals
		pathName: "/docs/#{pathName}"

module.exports = router
