const UnauthorizedError = require('./unauthorized-error')
const ServerError = require('../helpers/server-error')

class HttpResponse {
  static badRequest (error) {
    return {
      body: error,
      statusCode: 400
    }
  }

  static serverError () {
    return {
      body: new ServerError(),
      statusCode: 500
    }
  }

  static unauthorizedError () {
    return {
      body: new UnauthorizedError(),
      statusCode: 401
    }
  }

  static ok (data) {
    return {
      body: data,
      statusCode: 200
    }
  }
}

module.exports = HttpResponse
