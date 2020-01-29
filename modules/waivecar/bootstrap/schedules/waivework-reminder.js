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
  incomplete: {
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
  let userId = job.data.userId;
  let name = '';
  let text = '';
  let user;
  let waitlist;
  // We will follow up with accepted users until they are actually in a booking
  if (job.data.type === 'accepted') {
    user = yield User.findById(job.data.userId);
    if (!user.bookingId) {
      // An accepted user should always have a user record by this point
      name = `${user.firstName} ${user.lastName}`;
      text = 'regular follow up email';
    }
  } else if (
    // When a person has given inaccurate info, we check if they have either signed up again (if on the waitlist)
    job.data.type === 'incomplete'
  ) {
    waitlist = yield Waitlist.findById(job.data.waitlistId);
    if (waitlist.signupCount === job.data.initialSignupCount) {
      text = 'incomplete email text';
      name = `${waitlist.firstName} ${waitlist.lastName}`;
    }
  }
  try {
    /* Once a new message is created, this text should be put back in
    yield notify.sendTextMessage(
      user,
      `Just as a reminder: you have been accepted to WaiveWork! Please check your e-mail for further details.`,
    );*/
    let email = new Email();
    yield email.send({
      to: user ? user.email : waitlist.email,
      cc: 'work@waive.car',
      from: config.email.sender,
      subject: `${name} - WaiveWork Follow Up`,
      template: 'waivework-follow-up',
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
        uid: `waivework-reminder-${user ? user.id : waitlist.id}`,
        unique: true,
        timer: {
          value: nextTimeMapper[job.data.type][job.data.reminderCount].nextTry,
          type: 'days',
        },
        data: {
          userId: job.data.userId,
          waitlistId: job.data.waitlistId,
          reminderCount: job.data.reminderCount + 1,
          type: job.data.type,
        },
      });
    }
  } catch (e) {
    console.log('Error sending follow-up email: ', e);
  }
});
