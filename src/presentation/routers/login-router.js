const HttpResponse = require('../helpers/http-response')

const { MissingParamError, InvalidParamError } = require('../../utils/errors')

class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        const missingEmailError = new MissingParamError('email')
        return HttpResponse.badRequest(missingEmailError)
      }

      if (!this.emailValidator.isValid(email)) {
        const invalidEmailError = new InvalidParamError('email')
        return HttpResponse.badRequest(invalidEmailError)
      }

      if (!password) {
        const missingPasswordError = new MissingParamError('password')
        return HttpResponse.badRequest(missingPasswordError)
      }

      const accessToken = this.authUseCase.auth(email, password)

      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }

      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.serverError()
    }
  }
}

module.exports = LoginRouter
