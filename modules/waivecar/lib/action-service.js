'use strict';

let User        = Bento.model('User');
let error       = Bento.Error;

let Step    = Bento.model('ActionEngine');
let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');

// these are constants for the event system
let USER = 0;
let CAR = 1;
let BOOKING = 2;

function doError(what, type) {
  throw error.parse({
    code    : TYPE || 'ENGINE_FAIL',
    message : what
  }, 400);
}

function required(obj, what) {
  return obj.requireList && obj.requireList.indexOf(what) !== -1;
}

function makeState(state, value) {
  return {
    eventName: state.eventName,
    objectId: state.objectId,
    state: value
  };
}

var eventMap = {
  endBooking: {
    type: USER,
    requireList: [BOOKING, CAR],
    cb: function *(state) {
      let action = {};

      if(state.car.model === "Spark EV") { //'IONIQ') {
        let current = parseInt(state.step ? state.step.state : false, 10);
        current++;
        state.nextStep = makeState(state, current);
        console.log(state.nextStep);
      } else {
        action = false;
      }

      return {action: action, state: state};
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

    if(ev.type === USER) {
      if(_user && objectId === _user.id) {
        state.user = _user;
      } else {
        state.user = yield User.findById(objectId);
      }
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
    let res = yield ev.cb(state);

    // set the new state.
    if(res.state.nextStep) {
      if(res.state.step) {
        yield res.state.step.update(res.state.nextStep);
      } else {
        res.state.step = new Step(res.state.nextStep);
        yield res.state.step.save();
      }
    }

    // if there's a response in the action, then send that
    // over.
    return res;
  }

};
