express = require 'express'
router = express.Router()

router.get '/tree-nodes', (req, res, next) ->
	root = req.query.root
	if root and root.indexOf('..') >= 0
		res.send(null)
		return

	nodes = []
	path = if root then ('node_modules/' + root) else 'node_modules'

	fs = require 'fs'
	files = fs.readdirSync(path);
	files.forEach (item) ->
		if item.charAt(0) is '.' then return
		itemFile = fs.statSync(path + '/' + item)
		nodes.push(
			name: item
			isDir: itemFile.isDirectory()
			path: if root then (root + '/' + item) else item
		)
	res.send(nodes)

module.exports = router
