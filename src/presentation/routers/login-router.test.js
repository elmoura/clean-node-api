const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')

const makeSystemUnderTest = () => {
  return new LoginRouter()
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', () => {
    const SYSTEM_UNDER_TEST = makeSystemUnderTest()

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
    const SYSTEM_UNDER_TEST = makeSystemUnderTest()

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
    const SYSTEM_UNDER_TEST = makeSystemUnderTest()

    const httpResponse = SYSTEM_UNDER_TEST.route()

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if httpRequest has no body', () => {
    const SYSTEM_UNDER_TEST = makeSystemUnderTest()

    const httpRequest = {}

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  // test('Should call AuthUseCase with correct params', () => {
  // const SYSTEM_UNDER_TEST = makeSystemUnderTest()

  //   const httpRequest = {}

  //   const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

  //   expect(httpResponse.statusCode).toBe(500)
  // })
})
