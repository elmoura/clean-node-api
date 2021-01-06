const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSystemUnderTest = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const systemUnderTest = new AuthUseCase(loadUserByEmailRepositorySpy)

  return { systemUnderTest, loadUserByEmailRepositorySpy }
}

describe('Auth UseCase', () => {
  test('Should throw if no e-mail is provided', async () => {
    const { systemUnderTest } = makeSystemUnderTest()

    const accessTokenPromise = systemUnderTest.auth()

    expect(accessTokenPromise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { systemUnderTest } = makeSystemUnderTest()

    const accessTokenPromise = systemUnderTest.auth('any_email@mail.com')

    expect(accessTokenPromise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { systemUnderTest, loadUserByEmailRepositorySpy } = makeSystemUnderTest()

    const testEmail = 'any_email@mail.com'
    await systemUnderTest.auth(testEmail, 'any_password')

    expect(loadUserByEmailRepositorySpy.email).toBe(testEmail)
  })

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const systemUnderTest = new AuthUseCase()

    const accessTokenPromise = systemUnderTest.auth('any_email@mail.com', 'any_password')

    expect(accessTokenPromise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('Should throw if no LoadUserByEmailRepository has no load method', async () => {
    const systemUnderTest = new AuthUseCase({})

    const accessTokenPromise = systemUnderTest.auth('any_email@mail.com', 'any_password')

    expect(accessTokenPromise).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('Should return null if no user is found', async () => {
    const { systemUnderTest } = makeSystemUnderTest()

    const accessTokenPromise = await systemUnderTest.auth('invalid_email@mail.com', 'any_password')

    expect(accessTokenPromise).toBeNull()
  })
})
