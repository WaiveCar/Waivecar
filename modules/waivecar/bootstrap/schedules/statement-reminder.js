let scheduler = Bento.provider('queue').scheduler;
let Email = Bento.provider('email');
let Organization = Bento.model('Organization');
let OrganizationStatement = Bento.model('OrganizationStatement');
let config = Bento.config;

scheduler.process('waivework-reminder', function* (job) {
  let updatedStatement = yield OrganizationStatement.findById(job.data.id);
  let text = '';
  if (!updatedStatement.paidDate) {
    let org = yield updatedStatement.findById(updatedStatement.organizationId);
    let users = yield org.getAdmins();
    try {
      let dueDate = moment(updatedStatement.dueDate);
      let printedDate = dueDate.isSame(moment(), 'days')
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
          text: `You have a new WaiveWork statement due ${printedDate}. Please click <a href="https://lb.waivecar.com/organizations/${
            updatedStatements.organizationId
          }/statements">here</a> to see or pay your outstanding statements. ${
            printedDate === 'today'
              ? 'Your fleet may be immobilized if it is not paid in a timely manner'
              : ''
          }`,
          forOrganization: true,
          isAdmin: true,
        },
      };
      yield email.send(emailOpts);
    } catch (e) {
      log.warn('error sending email', e.message);
    }
  }
});
