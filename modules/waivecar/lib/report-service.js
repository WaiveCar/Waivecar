'use strict';

let Slack       = Bento.provider('slack');
let queryParser = Bento.provider('sequelize/helpers').query;
let Report      = Bento.model('Report');
let Booking     = Bento.model('Booking');
let Car         = Bento.model('Car');
let User        = Bento.model('User');
let error       = Bento.Error;
let log         = Bento.Log;


// ### Instances

const slack = new Slack('notifications');

module.exports = {

  *status() {
    let allCars = yield Car.find();

    let report = {
      'unavailable': [],
      'available': [],
      'booked': []
    };

    allCars.forEach(function(car) {
      if(!car.isAvailable) {
        report.unavailable.push(car.license);
      } else {
        if(car.user) {
          user = yield User.findById(car.user);
        }
        report.booked.push([
          car.license, car.bookingId, car.user, user.name()
        ]);
      }
    })


    log.info(allCars[0]);
    log.info(JSON.stringify(report));

    // is_available
  },
  
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

    let slackPayload = {
      text        : `${ _user.name() } has reported a problem with booking: ${ booking.id }`,
      channel     : '#rental-alerts',
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
    };

    if (payload.files && payload.files.length) {
      payload.files.forEach((file, i) => {
        slackPayload.attachments.push({
          fallback  : `Image ${ i }`,
          color     : '#D00000',
          image_url : `https://s3.amazonaws.com/waivecar-prod/${ file.path }` // eslint-disable-line
        });
      });
    }

    yield slack.message(slackPayload);

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
