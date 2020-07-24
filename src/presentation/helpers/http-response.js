const MissingParamError = require('./missing-param-error')
const UnauthorizedError = require('./unauthorized-error')

class HttpResponse {
  static badRequest (paramName) {
    return {
      body: new MissingParamError(paramName),
      statusCode: 400
    }
  }

  static serverError () {
    return { statusCode: 500 }
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
