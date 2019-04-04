let scheduler = Bento.provider('queue').scheduler;
let User = Bento.model('User');
let Email = Bento.provider('email');
let config = Bento.config;

scheduler.process('waivework-reminder', function*(job) {
  let userId = job.data.userId;
  let user = yield User.findById(userId);
  let name = `${user.firstName} ${user.lastName}`;
  let text = '<p>Thanks for signing up for WaiveWork! ';
  if (!user.verifiedPhone || !user.stripeId || !user.password) {
    text += ' Before your pickup appointment please make sure to: <ul>';
    if (!user.password) {
      text += '<li>Set up your password for your online account</li>';
    }
    if (!user.verifiedPhone) {
      text += '<li>Verify your phone number</li>';
    }
    if (!user.stripeId) {
      text += '<li>Add a valid payment method to your account</li>';
    }
    text +=
      '<li>Make sure you have received and esigned the WaiveWork agreement';
    text += '</ul>';
  } else {
    text +=
      'Thanks for already having set up your account. The only remaining step to complete if you have already set up a pickup appointment is to make sure you have received and esigned the WaiveWork agreement.';
  }
  text += '</p>';
  try {
    let email = new Email();
    yield email.send({
      to: user.email,
      cc: 'frank@waive.car',
      from: config.email.sender,
      subject: `${user.firstName} ${
        user.lastName
      } - Upcoming WaiveWork Pickup Appointment`,
      template: 'waivework-reminder',
      context: {
        name,
        text,
      },
    });
  } catch (e) {
    console.log('Error sending email: ', e);
  }
});
