const logger = require('./logger')
const User = require('../models/User')
const jwt = require('jsonwebtoken');

const requestLogger = (request, response, next) => {
	logger.info('Method:', request.method)
	logger.info('Path:  ', request.path)
	logger.info('Body:  ', request.body)
	logger.info('---')
	next()
}

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	logger.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}  else if (error.name === 'JsonWebTokenError') {
		return response.status(401).json({
		  error: 'invalid token'
		})
	}
	else if (error.name === 'TokenExpiredError') {
		return response.status(401).json({
		  error: 'token expired'
		})
	}

	next(error)
}
const getTokenFrom = (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
	  request.token = authorization.substring(7)
	}
	 next();
  }
  const userExtractor = async (request, response, next) => {

	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		
		const token = request.token
		const decoded = jwt.verify(token, process.env.SECRET)

		if (!decoded.id) {
			return response.status(401).json({ error: 'token missing or invalid' })
		  }

		const user = await User.findById(decoded.id).select("username _id blogs") 
		request.user = user
	}
	 	next();

  }

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler, 
	getTokenFrom,
	userExtractor
}