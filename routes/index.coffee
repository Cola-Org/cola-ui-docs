express = require 'express'
router = express.Router()

# GET home page.
router.get '/', (req, res, next) ->
	res.render 'index',
		title: 'Cola-UI'

router.get '/numbers', (req, res, next) ->
	query = req.query
	from = parseInt(query.from or 0)
	limit = parseInt(query.limit or 5)

	length = limit
	i = 0
	data = []

	while i < length
		i++
		id = from + i
		data.push({
			id: "000#{id}"
		})

	res.send({
		$entityCount: 1000,
		$data: data
	})


module.exports = router