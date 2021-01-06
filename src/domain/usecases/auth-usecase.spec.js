const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()

  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepositorySpy
}

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword

      return this.isValid
    }
  }

  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true

  return encrypterSpy
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'

  return tokenGeneratorSpy
}

const makeSystemUnderTest = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()
  const encrypterSpy = makeEncrypter()

  const systemUnderTest = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy, tokenGeneratorSpy)

  return {
    systemUnderTest,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
  }
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
    const { systemUnderTest, encrypterSpy } = makeSystemUnderTest()
    encrypterSpy.isValid = false

    const accessToken = await systemUnderTest.auth('invalid_email@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter with correct values', async () => {
    const { systemUnderTest, loadUserByEmailRepositorySpy, encrypterSpy } = makeSystemUnderTest()

    await systemUnderTest.auth('valid_email@mail.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { systemUnderTest, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSystemUnderTest()

    await systemUnderTest.auth('valid_email@mail.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { systemUnderTest, tokenGeneratorSpy } = makeSystemUnderTest()

    const accessToken = await systemUnderTest.auth('valid_email@mail.com', 'valid_password')

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })
})
