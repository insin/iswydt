var forms = require('newforms')

var settings = require('./settings')

var AddErrors = {
  addError: function(field, message) {
    this._errors.set(field,
                     new this.errorConstructor([message]))
  }
, addFormError: function(message) {
    this._errors.set(forms.NON_FIELD_ERRORS,
                     new this.errorConstructor([message]))
  }
}

exports.RegisterForm = forms.Form.extend({
  username : forms.CharField()
, email    : forms.EmailField()
, password : forms.CharField({ minLength: settings.MIN_PASSWORD_LENGTH
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

, __mixin__: AddErrors
})

exports.LoginForm = forms.Form.extend({
  username : forms.CharField()
, password : forms.CharField({widget: forms.PasswordInput})
, next     : forms.CharField({required: false, widget: forms.HiddenInput})

, __mixin__: AddErrors
})
