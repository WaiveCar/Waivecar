let scheduler = Bento.provider('queue').scheduler;
let User = Bento.model('User');
let UserService = require('../../lib/user-service');
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
      subject: 'Just one more step to finish your WaiveWork application',
      text: (amount, passwordlink) => `
        <p>We’ve prepared your documents and <a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">you can finish your account here</a>. Just one more step and you’ll be ready to go with WaiveWork. Your WaiveWork rental includes a vehicle with maintenance and insurance included for one weekly price of $${amount}.</p>
        <p>Any questions? Just reply to this email and our support staff will be happy to assist you. This quote is only available for a limited time, and it expires in 27 days.</p>
        <p><a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Click here to finish your account</a></p>
        <p>If you’ve already created your account and filled in your account information, call us at 855-924-8355.</p> 
      `,
    },
    '1': {
      daysRemaining: 20,
      nextTry: 7,
      subject: 'Just one more step to finish your WaiveWork application',
      text: (amount, passwordlink) => `
        <p>Your online quote for WaiveWork car rental is ready to go. This includes a car rental for $${amount} with insurance and maintenance included.
        <a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Just head to the website to finish your account</a>. Due to high demand, this is a limited time offer, and it expires in 20 days.</p> 
        <p><a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Click here to finish your account</a></p>
        <p>If you’ve already created your account and filled in your account information, call us at 855-924-8355.<p>
      `,
    },
    '2': {
      daysRemaining: 13,
      nextTry: 7,
      subject: 'Only a few more days before your WaiveWork offer expires',
      text: (amount, passwordlink) => `
        <p>Your WaiveWork offer is expiring soon. <a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">You can set up your account here</a>.</p>
        <p>Any questions? Just respond to this email and our friendly support staff will be happy to assist you.</p>
        <p><a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Click here to finish your account</a></p>
      `,
    },
    '3': {
      daysRemaining: 6,
      nextTry: 5,
      subject: 'Your offer for WaiveWork expires in less than a week',
      text: (amount, passwordlink) => `
        <p>Your WaiveWork offer is expiring in less than a week.</p> 

        <p>This includes a car rental for one weekly price of $${amount} with insurance and maintenance included. <a href="${
        passwordlink ? passwordlink : 'https://waivework.com/login'
      }">You can finish setting up your account here</a></p>If you have questions, respond to this email and our friendly support staff will be happy to assist you.</p>
        <p><a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Click here to finish your account</a></p>
      `,
    },
    '4': {
      daysRemaining: 1,
      nextTry: null,
      subject: 'Your WaiveWork offer expires tomorrow',
      text: (amount, passwordlink) => `
        <p>Tomorrow is the last day to continue with WaiveWork. Your WaiveWork offer includes a car rental for $${amount} per week with insurance and maintenance included. Due to high demand, we can only extend this offer until tomorrow. After tomorrow, your WaiveWork offer will no longer be valid.</p> 
        <p>Any questions? Just respond to this email and our friendly support staff will be happy to assist you.</p>
        <p><a href="${
          passwordlink ? passwordlink : 'https://waivework.com/login'
        }">Click here to finish your account</a>. This offer expires tomorrow.</p>
      `,
    },
  },
  incomplete: {
    '0': {
      nextTry: 3,
      subject: 'Your WaiveWork Application',
      text: moreInfoEmail,
    },
    '1': {
      nextTry: 6,
      subject: 'Your WaiveWork Application',
      text: moreInfoEmail,
    },
    '2': {
      nextTry: 12,
      subject: 'Your WaiveWork Application',
      text: moreInfoEmail,
    },
    '3': {
      nextTry: null,
      subject: 'Your WaiveWork Application',
      text: moreInfoEmail,
    },
  },
};

function moreInfoEmail(record) {
  return `
    <p>Your WaiveWork application has been submitted and it seems we don’t have all the information we need to give you an accurate quote. This can happen for a number of reasons, including:</p
    <ul>
      <li>An incorrectly entered driver’s license number on your application.</li>
      <li>A driver’s license with too short of driving history (include your driver’s license with a longer history if you have one).</li>
      <li>An incorrectly entered date of birth on your application (make sure to use your birth year).</li>
      <li>A P.O. Box or business address on your application. All applications must use a residential address in their application.</li>
    </ul>
    <p>
    The information that you signed up with was: 
      <ul>
      ${
        record.notes
          ? `
        <li>Name: ${record.firstName} ${record.lastName}</li>
        <li>License Number: ${record.number}</li>
        <li>License State: ${record.licenseState}</li>
        <li>Birthday: ${record.birthDate}</li>
        <li>Expiration: ${record.expirationDate}</li>
        <li>Address: </li>
        <ul>
          <li>${record.street1}</li>
          ${record.street2 ? `<li>${record.street2}</li>` : ''}
          <li>${record.city}, ${record.state} ${record.zip}</li>
        </ul>
        <li>Email: ${record.email}</li>
        <li>Phone: ${record.phone}</li>
      `
          : `<li>Information not available</li>`
      }
      </ul>
    </p>
  <p>If you have questions or need more information, respond to this email and we will be happy to assist you. Additionally, you can call us at 855-924-8355. You can try signing up again <a href="https://waivework.com/signup">here</a>.
  `;
}

scheduler.process('waivework-reminder', function*(job) {
  let userId = job.data.userId;
  let name = '';
  let emailText = '';
  let user;
  let waitlist;
  let textMsg;
  let subject = nextTimeMapper[job.data.type][job.data.reminderCount].subject;
  let passwordlink;
  // We will follow up with accepted users until they are actually in a booking
  if (job.data.type === 'accepted') {
    user = yield User.findById(job.data.userId);
    if (!user.bookingId) {
      if (!user.password) {
        let res = yield UserService.generatePasswordToken(
          user,
          nextTimeMapper[job.data.type][job.data.reminderCount].nextTry *
            24 *
            60,
        );
        passwordlink = `${config.api.uri}/reset-password?hash=${res.token.hash}&isnew=yes&iswork=yes`;
      }
      name = user.firstName;
      emailText = 'regular follow up email';
      textMsg = '';
    }
  } else if (
    // When a person has given inaccurate info, we check if they have either signed up again (if on the waitlist)
    job.data.type === 'incomplete'
  ) {
    waitlist = yield Waitlist.findById(job.data.waitlistId);
    if (waitlist.signupCount === job.data.initialSignupCount) {
      emailText = 'incomplete email text';
      name = waitlist.firstName;
    }
  }
  try {
    /* Once a new message is created, this text should be put back in. It should be different for accepted and incomplete
    yield notify.sendTextMessage(
      user,
      `Just as a reminder: you have been accepted to WaiveWork! Please check your e-mail for further details.`,
    );*/
    let email = new Email();
    yield email.send({
      to: user ? user.email : waitlist.email,
      cc: 'work@waive.car',
      from: config.email.sender,
      subject: subject,
      template: 'waivework-follow-up',
      context: {
        name,
        text: nextTimeMapper[job.data.type][job.data.reminderCount].text(
          job.data.price,
          passwordlink,
        ),
      },
    });
    if (
      nextTimeMapper[job.data.type][job.data.reminderCount] &&
      nextTimeMapper[job.data.type][job.data.reminderCount].nextTry
    ) {
      scheduler.add('waivework-reminder', {
        uid: `waivework-reminder-${job.data.type}-${
          user ? user.id : waitlist.id
        }`,
        unique: true,
        timer: {
          value: nextTimeMapper[job.data.type][job.data.reminderCount].nextTry,
          type: 'seconds',
        },
        data: {
          userId: job.data.userId,
          waitlistId: job.data.waitlistId,
          reminderCount: job.data.reminderCount + 1,
          type: job.data.type,
          price: job.data.price,
        },
      });
    }
  } catch (e) {
    console.log('Error sending follow-up email: ', e);
  }
});
