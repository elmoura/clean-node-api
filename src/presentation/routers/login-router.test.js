const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')

const makeSystemUnderTest = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  const loginRouter = new LoginRouter(authUseCaseSpy)

  return { SYSTEM_UNDER_TEST: loginRouter, authUseCaseSpy }
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

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
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

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
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpResponse = SYSTEM_UNDER_TEST.route()

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if httpRequest has no body', () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpRequest = {}

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call AuthUseCase with correct params', () => {
    const { SYSTEM_UNDER_TEST, authUseCaseSpy } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    SYSTEM_UNDER_TEST.route(httpRequest)

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })
})
