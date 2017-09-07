'use strict';

let error = Bento.Error;

let Ticket  = Bento.model('Ticket');
let Car     = Bento.model('Car');
let User    = Bento.model('User');
let notify  = require('./notification-service');
let config  = Bento.config;

let queryParser  = Bento.provider('sequelize/helpers').query;
let _  = require('lodash');
let fs = require('fs');

class TicketService {

  static makeSureValid(ticket) {
    if (!ticket) {
      throw error.parse({
        code    : `TICKET_NOT_FOUND`,
        message : `The requested ticket does not exist.`,
        data    : {
          ticketId : parseInt(id)
        }
      }, 400);
    }
    return ticket;
  }

  static *create(payload, _assignee) {
    var user;
    if (payload.car) {
      var car = yield Car.findOne({ where: { license: { $like : `${ payload.car }` } } });
      if(car) { 
        payload.carId = car.id;
        delete(payload.car);
      }
    }
    if(!car) {
      throw error.parse({
        code    : `CAR_NOT_FOUND`,
        message : `The requested car does not exist.`,
      }, 400);
    }
    let ticket = new Ticket(payload);

    if (_assignee) {
      ticket.creatorId = _assignee.id;
      user = yield User.findById(_assignee.id);
    } else {
      ticket.creatorId = 0;
    }
    yield ticket.save();

    ticket.relay({
      type: 'store',
      extra: {'car': car}
    });

    yield notify.notifyAdmins(`:horse_racing: ${ user.name() } created a ticket to ${ payload.action } <${ config.api.uri }/cars/${ car.id }|${ car.info() }>`, [ 'slack' ], { channel : '#rental-alerts' });
  }

  static *update(id, payload, _assignee) {
    let ticket = this.makeSureValid(yield Ticket.findById(id));
    let words = 'is done';

    if(payload.status === 'inprogress') {
      payload.assigneeId = _assignee.id;
      words = 'is off to';
    }

    yield ticket.update(payload);
    var car = yield Car.findById(ticket.carId);
    ticket.relay({
      type: 'update',
      extra: {'car': car}
    });

    let user = yield User.findById(_assignee.id);
    yield notify.notifyAdmins(`:horse: ${ user.name() } ${ words } ${ payload.action } <${ config.api.uri }/cars/${ car.id }|${ car.info() }> `, [ 'slack' ], { channel : '#rental-alerts' });
  }

  // TODO
  static *delete(id) {
    let ticket = this.makeSureValid(yield Ticket.findById(id));
  }

  static *getTicket(id) {
    return this.makeSureValid( yield Ticket.findById(id, this.getRelations()));
  }

  static *index(query, _assignee) {
    query = _.extend(queryParser(query, {
      where : {
        assigneeId  : queryParser.NUMBER,
        carId       : queryParser.STRING,
        action      : queryParser.STRING,
        creatorId   : queryParser.NUMBER
      }
    }), this.getRelations());

    query.order = [
      ['status'],
      ['created_at', 'DESC'] 
    ];
    return yield Ticket.find(query);
  }

  static getRelations() {
    return {
      include : [
        {
          model : 'User',
          as    : 'creator'
        },
        {
          model : 'User',
          as    : 'assignee'
        },
        {
          model : 'Car',
          as    : 'car'
        }
      ]
    };
  }
};

module.exports = TicketService;
