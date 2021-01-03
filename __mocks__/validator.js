module.exports = {
  isEmailValid: true,
  email: false,
  isEmail (email) {
    this.email = email
    return this.isEmailValid
  }
}
