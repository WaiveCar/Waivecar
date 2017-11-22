'use strict';

let Sms         = Bento.provider('sms');
let Slack       = Bento.provider('slack');
let Email       = Bento.provider('email');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let GroupUser   = Bento.model('GroupUser');
let error       = Bento.Error;
let config      = Bento.config;
let log         = Bento.Log;
let slack       = new Slack();

let Step    = Bento.model('ActionEngine');
let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');

let fs          = require('fs');

// these are constants for the event system
let USER = 0, 
    CAR = 1,
    BOOKING = 2;

function doError(what, type) {
  throw error.parse({
    code    : TYPE || 'ENGINE_FAIL',
    message : what
  }, 400);
}

function required(obj, what) {
  return obj.requireList && obj.requireList.indexOf(what) !== -1;
}

function navigate(url) {
  return "" + function() {
    window.location = url;
  };
}

function makeState(state, value) {
  return {
    eventName: state.eventName,
    objectId: state.objectId,
    state: value
  }
}

var eventMap = {
  endBooking: {
    type: USER,
    requireList: [BOOKING, CAR],
    cb: function *(state) {
      let action = {};

      if(state.car.model === 'IONIQ') {
        let current = state.step ? state.step.state;
        action.response = navigate(url);
        state.nextStep = makeState(state, current + 1);
      }

      return [action, state];
    }
  }
};

module.exports = {
  *getAction(eventName, objectId, _user) {
    let ev = eventMap[eventName];
    let state = {objectId: objectId, eventName: eventName};

    if(!ev) {
      return doError('Invalid event');
    }

    if(ev.type === USER && objectId === _user.id) {
      state.user = _user;
    }

    if(required(ev, BOOKING)) {
      state.booking = yield Booking.findOne({
        where : {
          status : {
            $notIn : [ 'completed', 'closed', 'ended', 'cancelled' ]
          },
          userId : state.user.id
        }
      });
    }

    if(required(ev, CAR)) {
      state.car = yield Car.findOne({
        where : {
          userId : state.user.id
        }
      });
    }

    // see if the user (object_id) has a state for the event
    state.step = yield Step.findOne({
      objectId: objectId,
      eventName: eventName
    });


    // find the next action and state
    let [action, state] = yield ev.cb(state);

    // set the new state.
    if(state.step) {
      state.step.update(state.nextStep);
    } else {
      state.step = new State(state.nextStep);
    }
    state.step.save();

    // if there's a response in the action, then send that
    // over.
    if (action.response) {
      return action.response;
    }
  }

};
