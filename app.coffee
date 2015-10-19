express = require 'express'
path = require 'path'
favicon = require 'serve-favicon'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'

routes = require './routes/index'
docs = require './routes/docs'

app = express()

# view engine setup
app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'

# uncomment after placing your favicon in /public
# app.use favicon "#{__dirname}/public/favicon.ico"
app.use logger 'dev'
app.use bodyParser.json()
app.use bodyParser.urlencoded
	extended: false
app.use cookieParser()
app.use express.static path.join __dirname, 'public'
app.use '/', routes
app.use '/docs', docs
# catch 404 and forward to error handler
app.use (req, res, next) ->
	err = new Error 'Not Found'
	err.status = 404
	next err

# error handlers

#开发模式下的Error处理器
# 打印错误堆栈信息
if app.get('env') is 'development'
	app.use (err, req, res, next) ->
		if err.message.indexOf("Failed to lookup view") > -1
			err = new Error 'Not Found'
			err.status = 404
			next err
		else
			res.status err.status or 500
			res.render 'error',
				message: err.message,
				error: err

# 生产环境下的Error处理器
# 异常堆栈泄露给用户
app.use (err, req, res, next) ->
	if err.message.indexOf("Failed to lookup view") > -1
		err = new Error 'Not Found'
		err.status = 404
		next err
	else
		res.status err.status or 500
		res.render 'error',
			message: err.message,
			error: {}

module.exports = app
