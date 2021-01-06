const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSystemUnderTest = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
    }
  }

  const encrypterSpy = new EncrypterSpy()

  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()

  loadUserByEmailRepositorySpy.user = {
    password: 'hashed_password'
  }

  const systemUnderTest = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)

  return { systemUnderTest, loadUserByEmailRepositorySpy, encrypterSpy }
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

    expect(accessTokenPromise).rejects.toThrow()
  })

  test('Should throw if no LoadUserByEmailRepository has no load method', async () => {
    const systemUnderTest = new AuthUseCase({})

    const accessTokenPromise = systemUnderTest.auth('any_email@mail.com', 'any_password')

    expect(accessTokenPromise).rejects.toThrow()
  })

  test('Should return null if an invalid e-mail is provided', async () => {
    const { systemUnderTest, loadUserByEmailRepositorySpy } = makeSystemUnderTest()
    loadUserByEmailRepositorySpy.user = null

    const accessToken = await systemUnderTest.auth('invalid_email@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should return null an invalid password is provided', async () => {
    const { systemUnderTest } = makeSystemUnderTest()

    const accessToken = await systemUnderTest.auth('invalid_email@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter with correct values', async () => {
    const { systemUnderTest, loadUserByEmailRepositorySpy, encrypterSpy } = makeSystemUnderTest()

    await systemUnderTest.auth('valid_email@mail.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })
})
