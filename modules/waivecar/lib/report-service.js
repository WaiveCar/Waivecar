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
let sequelize = Bento.provider('sequelize');
let geocode      = require('./geocoding-service');
let fs        = require('fs');


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
      let where = atShop(car) ? 'shop' : 'wild';
      let location = '';
      if(where === 'wild') {
        location = yield geocode.getAddress(car.latitude, car.longitude);
      }


      if(!car.isAvailable) {
        if(car.userId) {
          let user = yield User.findById(car.userId);
          let booking = yield car.getCurrentBooking();
          if(booking) {
            let status = (booking.status !== 'started') ? booking.status : moment.utc(
                moment().utc().diff(booking.createdAt, 'milliseconds')
              ).format("H:mm");

            report.booked.push([
              license, user.link(), status, `<${ Bento.config.web.uri }/bookings/${booking.id}|#${booking.id}>`, car.chargeReport(), location
            ].join(' '));
          } else {
            console.log("no booking found for " + car.license);
          }

        } else {
          report.unavailable[where].push([license, car.chargeReport(), location].join('   '));
        }
      } else {
        report.available[where].push([license, car.chargeReport(), location].join('   '));
      }
    }

    let slackReport = [
      'Unavailable:', 
      '*Shop*', 
      (report.unavailable.shop.sort().join('\n') || '_(none)_'),
      '\n*Wild*',
      (report.unavailable.wild.sort().join('\n') || '_(none)_'),
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
  
  *create(payload, _user) {
    let booking = yield Booking.findById(payload.bookingId);
    let car = yield Car.findById(booking.carId);

    if (!booking || (booking.userId !== _user.id && !_user.hasAccess('admin'))) {
      throw error.parse({
        code    : 'REPORT_INVALID_BOOKING',
        message : 'Booking does not exist, or you do not have access to it.'
      }, 400);
    }

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

        if(file) {
          let report = new Report({
            bookingId   : booking.id,
            description : payload.description,
            createdBy   : _user.id,
            fileId      : file.id, 
            type        : file.type,
          });
          yield report.save();
          if (file.type === 'other' || !file.type) {
            slackPayload.attachments.push({
              fallback  : `Image ${ i }`,
              color     : '#D00000',
              image_url : `https://s3.amazonaws.com/waivecar-prod/${ file.path }`
            });
          }
        }
      }
    }

    slackPayload.t = 'slack';
    slackPayload.at = new Date();
    try {
      fs.appendFile('/var/log/outgoing/log.txt', JSON.stringify(slackPayload) + "\n");
    } catch (err) {
      log.warn(`Failed to write to the log file: ${ err.message }`);
    }
    console.log('payload: ', slackPayload);
    if (process.env.NODE_ENV === 'production' && slackPayload.attachments.length > 1) {
      yield slack.message(slackPayload);
    }
    return;
  },

  *delete(id, _user) {
    // This route is no longer used by the front-end, but should still work to delete files that are in the report_files table
    let file = yield ReportFile.findById(id);

    if(file) {
      yield notify.notifyAdmins(`:lower_left_paintbrush: ${ _user.name() } removed a photo from the damage gallery.`, [ 'slack' ], { channel : '#rental-alerts' });
      yield file.delete();
    } else {
      throw error.parse({
        code    : 'CAN_NOT_FIND_FILE',
        message : 'Cannot file file ' + id
      }, 400);
    }
  },

  *showMileage(date) {
    // we have two methods. The first parses the inverse log, using UTC as the reference point. The second
    // looks at the historical bookings. The second method chronically underreports and probably won't be
    // needed unless really historical records are requested.
    
    // find what yesterday was and try to be smart about UTC.
    if(!date) {
      let yesterday = new Date(new Date() - 86400000);

      // create a YYYY-MM-DD formatted date.
      date = [1900 + yesterday.getYear(), (101 + yesterday.getMonth()).toString().slice(1), (100 + yesterday.getDate()).toString().slice(1)].join('-'); 
    }

    // Get all the cars, this is required in both methods.
    let allCars = yield Car.find();
    let res = [];

    //
    // First method, reading the log files from disk. This method is the most accurate we have.
    //
    let agg = (function() {
      let map = {};
      ['log.txt.1', 'log.txt'].forEach(function(file) {
        var data = fs.readFileSync('/var/log/invers/' + file, 'utf8');
        var startPoint = data.indexOf(date);
        if(startPoint >= 0) { 
          var recordListRaw = data.substr(startPoint).split('\n');
          recordListRaw.forEach(function(row) {
            if(row.indexOf(date) !== -1) {
              try {
                var data = JSON.parse(row);
                if( !(data.id in map) ) {
                  map[data.id] = [ data.mileage, 0 ];
                } else {
                  map[data.id][1] = data.mileage;
                }
              } catch(ex) { }
            } 
          });
        } 
      });
      for(var car in map) {
        map[car] = map[car][1] - map[car][0];
      }
      return map;
    })();
    
    // 
    // Second method, reading the historical database
    //
    // if we found nothing then we attempt the second method.
    if(Object.keys(agg).length === 0) {
      agg = yield (function*(){

        // find the odometer readings at 3 points.
        let map = {};

        // the earliest one from yesterday
        let startMileage = yield sequelize.query(`select bk.car_id as car_id, min(mileage) as mileage, min(bd.created_at) as created_at from booking_details bd join bookings bk on bd.booking_id = bk.id where bd.created_at >= '${date} 00:00:00' and bd.created_at < '${date} 23:59:59' group by bk.car_id order by bk.car_id`);

        // the latest one from yesterday
        let endMileage = yield sequelize.query(`select bk.car_id as car_id, max(mileage) as mileage, max(bd.created_at) as created_at from booking_details bd join bookings bk on bd.booking_id = bk.id where bd.created_at >= '${date} 00:00:00' and bd.created_at < '${date} 23:59:59' group by bk.car_id order by bk.car_id`);

        // since the allCars list will be comprehensive we use that to key our map
        allCars.forEach((row) => {
          map[row.id] = { now: [ row.totalMileage, row.updatedAt ] };
        });
        startMileage[0].forEach((row) => {
          if(!(row.car_id in map)) {
            map[row.car_id] = {};
          }
          map[row.car_id].start = [ row.mileage, row.created_at ];
        });
        endMileage[0].forEach((row) => {
          map[row.car_id].end = [ row.mileage, row.created_at ];
        });

        for(var car in map) {
          let record = map[car];
          let distance = 0;

          if(record && record.start) {
            if(record.end) {
              distance = record.end[0] - record.start[0];
            }
            if(!distance && record.now) {
              distance = record.now - record.start[0];
            }
          }

          map[car] = distance;
        }
        return map;
     
      })();
    }

    allCars.forEach((row) => {
      if(row.vin) {
        let distance = agg[row.id] || 0;

        res.push({
          Mileage: distance * 0.621371,
          VIN: row.vin,
          'Date': date,
          license: row.license,
          id: row.id,
          // km: distance,
          // record: row*
        });
      }
    });
    return res;
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
          model : File._schema,
          as    : 'file'
        }]
      }]
    };

    let result = yield Booking._schema.findAll(dbQuery).filter(each => each.reports.length);

    // This section (until 342) is for backwards compatibility to potentially be removed at a later time
    // Schemas have since been changed to no longer depend on the ReportFiles table
    result = yield result.map(item => {
      item = item.toJSON()
      let newProps = {
        bookingId: item.id,
        createdBy: item.userId,
        description: null,
        files: item.reports.map(each => Object.assign(each, {details: each.file}))
      };
      return Object.assign(item, newProps);
    });

    return result;
  }
};
