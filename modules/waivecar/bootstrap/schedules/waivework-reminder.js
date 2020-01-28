let scheduler = Bento.provider('queue').scheduler;
let User = Bento.model('User');
let Waitlist = Bento.model('Waitlist');
let Email = Bento.provider('email');
let config = Bento.config;
let notify = Bento.module('waivecar/lib/notification-service');

// Maps current number of attempts at outreach to the number of days before the next one
let nextTimeMapper = {
  accepted: {
    '0': {
      daysRemaining: 27,
      nextTry: 7,
    },
    '1': {
      daysRemaining: 20,
      nextTry: 7,
    },
    '2': {
      daysRemaining: 13,
      nextTry: 7,
    },
    '3': {
      daysRemaining: 6,
      nextTry: 5,
    },
    '4': {
      daysRemaining: 1,
      nextTry: null,
    },
  },
  missingInfo: {
    '0': {
      nextTry: 3,
    },
    '1': {
      nextTry: 6,
    },
    '2': {
      nextTry: 12,
    },
    '3': {
      nextTry: null,
    },
  },
};

scheduler.process('waivework-reminder', function*(job) {
  console.log('job data', job.data);
  let userId = job.data.userId;
  let user;
  let waitlist;
  if (userId) {
    user = yield User.findById(userId);
  } else {
    waitlist = yield Waitlist.findById(job.data.waitlistId);
  }
  let name = '';
  let text = '';
  if (
    job.data.type === 'accepted' &&
    !user.bookingId /*or other reason to know they have signed up */
  ) {
    name = `${user.firstName} ${user.lastName}`;
    text = '<p>Thanks for signing up for WaiveWork! ';
    if (!user.verifiedPhone || !user.stripeId || !user.password) {
      text += ' To coninue with th signup process you will need to: <ul>';
      if (!user.password) {
        text += '<li>Set up your password for your online account</li>';
      }
      if (!user.verifiedPhone) {
        text += '<li>Add a phone number</li>';
      }
      if (!user.stripeId) {
        text += '<li>Add a valid payment method to your account</li>';
      }
      text += '</ul>';
    } else {
      text +=
        'Thanks for already having set up your account. The only remaining step to complete if you have already set up a pickup appointment is to make sure you have received and esigned the WaiveWork agreement.';
    }
    text += '</p>';
  }
  try {
    /* Don't put this text back in until a new message has been created
    yield notify.sendTextMessage(
      user,
      `Just as a reminder: you have been accepted to WaiveWork! Please check your e-mail for further details.`,
    );*/
    let email = new Email();
    yield email.send({
      to: user.email,
      cc: 'work@waive.car',
      from: config.email.sender,
      subject: `${user.firstName} ${user.lastName} - WaiveWork`,
      template: 'waivework-appointment-reminder',
      context: {
        name,
        text,
      },
    });
    if (
      nextTimeMapper[job.data.type][job.data.reminderCount] &&
      nextTimeMapper[job.data.type][job.data.reminderCount].nextTry
    ) {
      scheduler.add('waivework-reminder', {
        uid: `waivework-reminder-${user.id}`,
        unique: true,
        timer: {
          value: nextTimeMapper[job.data.type][job.data.reminderCount].nextTry,
          type: 'seconds',
        },
        data: {
          userId: job.data.userId,
          reminderCount: job.data.reminderCount + 1,
          type: job.data.type,
        },
      });
    }
  } catch (e) {
    console.log('Error sending follow-up email: ', e);
  }
});
