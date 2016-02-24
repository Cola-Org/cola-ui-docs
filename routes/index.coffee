express = require 'express'
router = express.Router()
items = require './data/items.coffee'
# GET home page.
router.get '/', (req, res, next) ->
	res.render 'index',
		title: 'Cola-UI'


router.get '/data/items', (req, res, next) ->
	query = req.query
	pageSize = parseInt(query.pageSize or 5)
	pageNo = parseInt(query.pageNo or 1)
	from = (pageNo - 1) * pageSize
	limit = from + pageSize
	res.send({
		$entityCount: items.length,
		$data: items.slice(from, limit)
	})


module.exports = router