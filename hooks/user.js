'use strict';

let queue  = Reach.provider('queue');
let hooks  = Reach.Hooks;
let config = Reach.config; 

// ### Get Hook

hooks.set('user:get', function *(identifier) {
  return yield User.findOne({
    where : {
      email : identifier
    }
  });
});

// ### Reigstration Hook

hooks.set('user:registered', function *(user) {
  let job = queue
    .create('email:user:registration', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Registration complete',
      template : 'user-welcome-email',
      context  : {
        name    : user.name(),
        company : config.api.name,
        confirm : 'http://local.io:8081/users/email-confirm/sample'
      }
    })
    .save()
  ;
  job.on('complete', () => {
    job.remove();
  });
});

// ### Password Reset Hook

hooks.set('user:send-password-token', function *(user, token) {
  let job = queue
    .create('email:user:password-reset', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Password Reset',
      template : 'user-password-reset',
      context  : {
        name    : user.name(),
        service : config.api.name,
        token   : token
      }
    })
    .save()
  ;
  job.on('complete', () => {
    job.remove();
  });
});