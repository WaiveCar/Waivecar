let scheduler = Bento.provider('queue').scheduler;
let Email = Bento.provider('email');
let Organization = Bento.model('Organization');
let OrganizationStatement = Bento.model('OrganizationStatement');
let config = Bento.config;
let log = Bento.Log;
let moment = require('moment');

scheduler.process('statement-reminder', function* (job) {
  let updatedStatement = yield OrganizationStatement.findById(job.data.id);
  if (updatedStatement && !updatedStatement.paidDate) {
    let org = yield Organization.findById(updatedStatement.organizationId);
    let users = yield org.getAdmins();
    try {
      let dueDate = moment(updatedStatement.dueDate);
      let isPastDue = moment(updatedStatement.dueDate).isBefore(moment());
      let printedDate = !dueDate.isSame(moment(), 'days')
        ? dueDate.format('MM/DD/YYYY')
        : 'today';
      let email = new Email();
      let emailOpts = {
        to: users.map(u => u.email).join(','),
        from: config.email.sender,
        subject: 'Statement Reminder',
        template: 'waivework-general',
        context: {
          name: '',
          text: `${
            !isPastDue
              ? `You have a WaiveWork statement due ${printedDate}`
              : `Your statement was due ${printedDate}`
          }. Please click <a href="https://lb.waivecar.com/organizations/${
            updatedStatement.organizationId
          }/statements">here</a> to see or pay your outstanding statements. ${
            isPastDue
              ? 'Your fleet may be immobilized if it is not paid in a timely manner'
              : ''
          }`,
          forOrganization: true,
          isAdmin: true,
        },
      };
      yield email.send(emailOpts);
      scheduler.add('statement-reminder', {
        unique: true,
        uid: `statement-reminder-${updatedStatement.id}`,
        timer: {value: 10, type: 'seconds'},
        data: {
          id: updatedStatement.id,
        },
      });
    } catch (e) {
      log.warn('error sending email', e.message);
    }
  }
});
