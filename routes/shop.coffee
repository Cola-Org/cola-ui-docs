express = require 'express'
router = express.Router()

# GET home page.
router.get '/search', (req, res, next) ->
	#GET /shop/search?name=AAA
	name=req.query.name
	res.send([{name:name}])

router.post '/send', (req, res, next) ->
	#POST /shop/send name=Tom
	name=req.param("name")
	res.send([{name:name}])

router.get '/products/search', (req, res, next) ->
	#GET /shop/products/search?name=AAA
	name=req.query.name
	res.send([{
		id:"p01"
		name:name
	}])

module.exports = router
