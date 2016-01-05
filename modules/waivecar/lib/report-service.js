'use strict';

let Slack       = Bento.provider('slack');
let queryParser = Bento.provider('sequelize/helpers').query;
let Report      = Bento.model('Report');
let Booking     = Bento.model('Booking');
let error       = Bento.Error;

// ### Instances

const slack = new Slack('notifications');

module.exports = {

  /**
   * Creates a new report.
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  *create(payload, _user) {
    let booking = yield Booking.findById(payload.bookingId);

    if (!booking || (booking.userId !== _user.id && !_user.hasAccess('admin'))) {
      throw error.parse({
        code    : 'REPORT_INVALID_BOOKING',
        message : 'Booking does not exist, or you do not have access to it.'
      }, 400);
    }

    let report = new Report({
      bookingId   : booking.id,
      description : payload.description,
      createdBy   : _user.id
    });
    yield report.save();

    yield slack.message({
      text        : `${ _user.name() } has reported a problem with booking: ${ booking.id }`,
      attachments : [
        {
          fallback : `${ _user.name() } has reported a problem with booking: ${ booking.id }`,
          color    : '#D00000',
          fields   : [
            {
              title : 'Report',
              value : report.description,
              short : false
            }
          ]
        }
      ]
    });

    return report;
  },

  /**
   * Returns an indexed array of reports.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  *index(query, _user) {
    return yield Report.find(queryParser(query, {
      where : {
        bookingId : queryParser.NUMBER,
        createdBy : queryParser.NUMBER
      }
    }));
  }

};
