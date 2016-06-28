import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';


var preSignup = function(error, state){
};

var acctSubmit = function(error, state){
  if (!error) {
    if ( state === "changePwd" ) {
        window.history.back();
    }
  }
}

AccountsTemplates.configure({
    lowercaseUsername: false,
    showPlaceholders: false,
    enablePasswordChange: true,
    showAddRemoveServices: false,
    hideSignUpLink: true,
    hideSignInLink: true,
    showForgotPasswordLink: false,
    showLabels: true,
    preSignUpHook: preSignup,
    onSubmitHook: acctSubmit,
    texts: {
      signInLink_pre: "Already have an account?",
      signInLink_link: "Sign In",
      pwdLink_link: "Forgot Password",
      button: {
        forgotPwd: "Reset Password",
        resetPwd: "Change Password",
        changePwd: "Change Password"
      },
      errors: {
        loginForbidden: "Invalid Email or Password.",
        pwdMismatch: "Passwords do not match."
      }
    }
});
AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
    {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "Email",
      negativeValidation: true,
      negativeFeedback: false,
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid Email',
    },

    {
      _id: 'username',
      type: 'text',
      placeholder: {
        signUp: "Username"
      },
      required: true,
      func: function(username) {
        let self = this;
        Meteor.call('checkName', username, function(err, result) {
          if ( !err && result === true ) {
            self.setSuccess();
          } else {
            self.setError('Username exists');
          }
          self.setValidating(false);
        });
        return;
      },
      negativeValidation: true,
      negativeFeedback: false,
      errStr: 'Username exists'
    },

    {
      _id: 'password',
      type: 'password',
      displayName: "Password",
      negativeValidation: true,
      negativeFeedback: false,
      placeholder: {
        signUp: "At least six characters"
      },
      required: true,
      minLength: 6,
    },

    {
      _id: 'password_again',
      type: 'password',
      displayName: "Confirm Password",
      negativeValidation: true,
      negativeFeedback: false,
      placeholder: {
        signUp: "At least six characters"
      },
      required: true,
      minLength: 6,
    },

    {
      _id: 'username_and_email',
      type: 'text',
      required: true,
      negativeValidation: true,
      negativeFeedback: false,
      displayName: "Username or Email",
    },
]);
