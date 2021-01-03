const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

const makeSystemUnderTest = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('Should return true if validator returns true', () => {
    const systemUnderTest = makeSystemUnderTest()

    const isEmailValid = systemUnderTest.isValid('valid_email@email.com')

    expect(isEmailValid).toBe(true)
  })

  test('Should return false if validator returns false', () => {
    validator.isEmailValid = false
    const systemUnderTest = makeSystemUnderTest()

    const isEmailValid = systemUnderTest.isValid('invalid_email.com')

    expect(isEmailValid).toBe(false)
  })
})
