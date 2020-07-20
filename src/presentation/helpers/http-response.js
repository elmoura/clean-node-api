const MissingParamError = require('./missing-param-error')

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
}

module.exports = HttpResponse
