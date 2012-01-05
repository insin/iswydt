var forms = require('newforms')

with (forms) {

exports.RegisterForm = Form({
  username : CharField()
, email    : EmailField()
, password : CharField({widget: PasswordInput})
, confirm  : CharField({widget: PasswordInput})

, clean: function() {
    if (this.cleanedData.password && this.cleanedData.confirm &&
        this.cleanedData.password != this.cleanedData.confirm) {
      throw ValidationError('Passwords did not match.')
    }
    return this.cleanedData
  }
})

exports.LoginForm = Form({
  username : CharField()
, password : CharField({widget: PasswordInput})
, next     : CharField({required: false, widget: HiddenInput})
})

}