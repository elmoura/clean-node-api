class LoginRouter {
  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpResponse.serverError()
    }

    const { email, password } = httpRequest.body

    if (!email) {
      return HttpResponse.badRequest('email')
    }

    if (!password) {
      return HttpResponse.badRequest('password')
    }
  }
}

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

class MissingParamError extends Error {
  constructor (paramName) {
    super(`Missing param ${paramName}`)
    this.name = 'MissingParamError'
  }
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpRequest = {
      body: {
        email: 'elmoura@mail.com'
      }
    }

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if no httpRequest is provided', () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpResponse = SYSTEM_UNDER_TEST.route()

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if httpRequest has no body', () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpRequest = {}

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })
})
