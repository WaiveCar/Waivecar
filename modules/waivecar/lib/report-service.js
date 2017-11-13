'use strict';

let Slack       = Bento.provider('slack');
let queryParser = Bento.provider('sequelize/helpers').query;
let Report      = Bento.model('Report');
let ReportFile  = Bento.model('ReportFile');
let File        = Bento.model('File');
let Booking     = Bento.model('Booking');
let Car         = Bento.model('Car');
let User        = Bento.model('User');
let error       = Bento.Error;
let log         = Bento.Log;
let notify      = Bento.module('waivecar/lib/notification-service');
let moment      = require('moment');


// ### Instances

const slack = new Slack('notifications');

module.exports = {

  *status() {
    function atShop(car) {
      //console.log(car.longitude, car.latitude);
      // This is a hacky little box, see here: https://github.com/clevertech/Waivecar/issues/595
      return (car.longitude < -118.489070 && car.longitude > -118.489544) && (car.latitude > 34.016418 && car.latitude < 34.016800);
    }

    let allCars = yield Car.find();

    let report = {
      'unavailable': {shop: [], wild: []},
      'available': {shop: [], wild: []},
      'booked': []
    };

    for(let i = 0; i < allCars.length; i++) {
      let car = allCars[i];
      if(car.license.search(/waive/i) === -1 || car.license.search(/ret/i) !== -1) {
        continue;
      }
      var license = '*' + car.license.replace(/waive/i,'') + '*';

      if(!car.isAvailable) {
        if(car.userId) {
          let user = yield User.findById(car.userId);
          let booking = yield car.getCurrentBooking();
          let status = (booking.status !== 'started') ? booking.status : moment.utc(
              moment().utc().diff(booking.createdAt, 'milliseconds')
            ).format("H:mm");

          report.booked.push([
            license, user.name(), status, `(${ Bento.config.web.uri }/bookings/${booking.id})`, car.chargeReport()
          ].join(' '));

        } else {
          report.unavailable[ atShop(car) ? 'shop' : 'wild' ].push(license);
        }
      } else {
        report.available[ atShop(car) ? 'shop' : 'wild' ].push([license, car.chargeReport()].join('   '));
      }
    }

    let slackReport = [
      'Unavailable:', 
      ' Shop: ' + report.unavailable.shop.sort().join(', '),
      ' Wild: ' + report.unavailable.wild.sort().join(', '),
      '\nAvailable:',
      '*Shop*',
      (report.available.shop.sort().join('\n') || '_(none)_'),
      '\n*Wild*',
      (report.available.wild.sort().join('\n') || '_(none)_'),
      '\nIn Use:',
      report.booked.sort().join('\n')
    ].join('\n');

    yield notify.slack({ text : slackReport }, { channel : '#reservations' });
  },
  
  /**
   * Creates a new report.
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  *create(payload, _user) {
    let booking = yield Booking.findById(payload.bookingId);
    let car = yield Car.findById(booking.carId);

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

    let txt = `${ _user.name() } has reported a problem with ${ car.license } on booking ${ booking.id }`;
    let slackPayload = {
      text        : txt,
      channel     : '#rental-alerts',
      attachments : [
        {
          fallback : txt,
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
      let files = payload.files;

      for (let i = 0; i < files.length; ++i) {
        let file = files[i];

        let report_file = new ReportFile({
          reportId : report.id,
          fileId : file.id
        });

        yield report_file.save();

        slackPayload.attachments.push({
          fallback  : `Image ${ i }`,
          color     : '#D00000',
          image_url : `https://s3.amazonaws.com/waivecar-prod/${ file.path }` // eslint-disable-line
        });
      }
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

    let parsedQuery = queryParser(query, {
      where : {
        bookingId : queryParser.NUMBER,
        createdBy : queryParser.NUMBER
      }
    });

    parsedQuery.include = [{
      model : ReportFile._schema,
      as    : 'files',
      include : [{
        model : File._schema,
        as    : 'details'
      }]
    }];


    return yield Report._schema.findAll(parsedQuery);
  },

  *delete(id, _user) {
    let file = yield ReportFile.findById(id);
    let user = yield User.findById(_user);

    if(file) {
      yield notify.notifyAdmins(`:lower_left_paintbrush: ${ user.name() } removed a photo from the damage gallery.`, [ 'slack' ], { channel : '#rental-alerts' });
      yield file.delete();
    }
  },

  *showForCar(carId) {
    let dbQuery = {
      where : {
        carId  : carId
      },
      include : [{
        model : Report._schema,
        as    : 'reports',
        include : [{
          model : ReportFile._schema,
          as    : 'files',
          include : [{
            model : File._schema,
            as    : 'details'
          }]
        }]
      }]
    };

    var result = yield Booking._schema.findAll(dbQuery);

    return result.filter(function(booking) {
      return booking.reports.filter(function(report) {
          return report.files.length > 0;
        }).length > 0;
    }).reduce (function(result, booking) {
      return result.concat(booking.reports);
    }, []);
  }

};
