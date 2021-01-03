const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no e-mail is provided', async () => {
    const systemUnderTest = new AuthUseCase()

    const accessTokenPromise = systemUnderTest.auth()

    expect(accessTokenPromise).rejects.toThrow(new MissingParamError('email'))
  })
})
