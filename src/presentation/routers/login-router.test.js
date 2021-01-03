const LoginRouter = require('./login-router')

const MissingParamError = require('../helpers/missing-param-error')
const InvalidParamError = require('../helpers/invalid-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const ServerError = require('../helpers/server-error')

const makeSystemUnderTest = () => {
  const authUseCaseSpy = makeAuthUseCase()

  const emailValidatorSpy = makeEmailValidator()

  const SYSTEM_UNDER_TEST = new LoginRouter(authUseCaseSpy, emailValidatorSpy)

  return { SYSTEM_UNDER_TEST, authUseCaseSpy, emailValidatorSpy }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'
  return authUseCaseSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidator {
    isValid () {
      throw new Error()
    }
  }

  return new EmailValidator()
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', async () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpResponse = await SYSTEM_UNDER_TEST.route()

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { SYSTEM_UNDER_TEST } = makeSystemUnderTest()

    const httpRequest = {}

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AuthUseCase with correct params', async () => {
    const { SYSTEM_UNDER_TEST, authUseCaseSpy } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('Should return 500 if no AuthUseCase is provided', async () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if no AuthUseCase has no auth method', async () => {
    class AuthUseCaseSpy { }

    const authUseCaseSpy = new AuthUseCaseSpy()

    const SYSTEM_UNDER_TEST = new LoginRouter(authUseCaseSpy)

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { SYSTEM_UNDER_TEST, authUseCaseSpy } = makeSystemUnderTest()
    authUseCaseSpy.accessToken = null

    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { SYSTEM_UNDER_TEST, authUseCaseSpy } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  test('Should return 400 if an invalid e-mail is provided', async () => {
    const { SYSTEM_UNDER_TEST, emailValidatorSpy } = makeSystemUnderTest()

    emailValidatorSpy.isEmailValid = false

    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 500 if no EmailValidator is provided', async () => {
    const authUseCaseSpy = makeAuthUseCase()

    const SYSTEM_UNDER_TEST = new LoginRouter(authUseCaseSpy)

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 EmailValidator has no isValid method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const SYSTEM_UNDER_TEST = new LoginRouter(authUseCaseSpy, {})

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 EmailValidator throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidatorWithError()
    const SYSTEM_UNDER_TEST = new LoginRouter(authUseCaseSpy, emailValidatorSpy)

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call EmailValidator with correct e-mail', async () => {
    const { SYSTEM_UNDER_TEST, emailValidatorSpy } = makeSystemUnderTest()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    await SYSTEM_UNDER_TEST.route(httpRequest)

    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })
})
