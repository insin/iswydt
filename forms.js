var forms = require('newforms')

var settings = require('./settings')

function addError(field, message) {
  this._errors.set(field,
                   new this.errorConstructor([message]))
}

function addFormError(message) {
  this._errors.set(forms.NON_FIELD_ERRORS,
                   new this.errorConstructor([message]))
}

var RegisterForm = exports.RegisterForm = forms.Form({
  username : forms.CharField()
, email    : forms.EmailField()
, password : forms.CharField({
    minLength: settings.MIN_PASSWORD_LENGTH
  , widget: forms.PasswordInput
  })
, confirm  : forms.CharField({widget: forms.PasswordInput})

, clean: function() {
    if (this.cleanedData.password && this.cleanedData.confirm &&
        this.cleanedData.password != this.cleanedData.confirm) {
      throw forms.ValidationError('Passwords did not match.')
    }
    return this.cleanedData
  }

, addError: addError
, addFormError: addFormError
})

var LoginForm = exports.LoginForm = forms.Form({
  username : forms.CharField()
, password : forms.CharField({widget: forms.PasswordInput})
, next     : forms.CharField({required: false, widget: forms.HiddenInput})

, addError: addError
, addFormError: addFormError
})
