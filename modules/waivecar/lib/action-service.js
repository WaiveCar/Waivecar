'use strict';

let User        = Bento.model('User');
let error       = Bento.Error;
let relay       = Bento.Relay;
let Redis   = require('./redis-service');
let BookingService   = require('./booking-service');

let Step    = Bento.model('ActionEngine');
let Booking = Bento.model('Booking');
let Car     = Bento.model('Car');

// these are constants for the event system
let USER = 0;
let CAR = 1;
let BOOKING = 2;

function doError(what, type) {
  throw error.parse({
    code    : type || 'ENGINE_FAIL',
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

function getStep(state) {
  return parseInt(state.step ? state.step.state : 0, 10);
}

function increment(state) {
  let current = getStep(state);
  current ++;
  state.nextStep = makeState(state, current);

  return {action: false, state: state};
}

function *getBooking(id) {
  return yield Booking.findOne({
    where : {
      status : {
        $notIn : [ 'closed', 'cancelled' ]
      },
      userId : id
    },
    order: [ ['created_at', 'desc'] ] 
  });
}


var eventMap = {
  tagWarnLockCar: {
    type: USER,
    forward: function *(state) {
      return increment(state);
    },
    cb: function *(state) {
      return {action: getStep(state) < 5, state: state};
    }
  },

  tagWarnStartRide: {
    type: USER,
    forward: function *(state) {
      return increment(state);
    },
    cb: function *(state) {
      return {action: getStep(state) < 5, state: state};
    }
  },

  endBooking: {
    type: USER,
    requireList: [BOOKING, CAR],
    forward: function *(state) {
      return increment(state);
    },

    cb: function *(state) {
      let action = false;
      
      let stateList = [ 
        ['rlM4Iz', 'brand'],
        ['v91rhf', 'car'],
        ['sbRn1X', 'ads']
      ];

      if(state.car.model !== "Spark EV") { //'IONIQ') {
        let current = getStep(state);
        if(current < stateList.length) {
          let url = `https://waivecar.typeform.com/to/${ stateList[current][0] }?user=${ state.user.id }&booking=${ state.booking.id }`;
          action = [['loadUrl', url]];
        }
      } 

      return {action: action, state: state};
    }
  }
};

function *delayFn() {
  return yield new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, 20 * 1000);
  });
}

module.exports = {
  *getHash(ignore, hash) {
    return yield Redis.tempGet(hash);
  },

  *goForward(eventName, objectId, _user) {
    let ev = eventMap[eventName];
    let state = {objectId: objectId, eventName: eventName};
    if(!ev) {
      return doError('Invalid event ' + state.eventName);
    }
    state.step = yield Step.findOne({
      where: {
        objectId: objectId,
        eventName: eventName
      }
    });

    let res = yield ev.forward(state);
    console.log(res, state);

    // set the new state.
    if(res.state.nextStep) {

      if(state.step) {
        yield state.step.update(res.state.nextStep);
      } else {
        let row = new Step(res.state.nextStep);
        yield row.save();
      }
    }

    relay.emit('actions', {
      type : 'update',
      data : { name : eventName }
    });

    //yield delayFn();

    return 'One moment please...';
    //return res;
  },

    /*
  *goForwardHash(ignore, hash) {
    let resRaw = yield Redis.tempGet(hash);
    if(!resRaw) {
      return doError('Expired token');
    }

    let res = JSON.parse(resRaw);
    let state = res.state;
    let ev = eventMap[state.eventName];

    return res;
  },
  */

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
      state.booking = yield getBooking(state.user.id);
    }

    if(required(ev, CAR)) {
      state.car = yield Car.findOne({
        where : {
          userId : state.user.id
        }
      });
      if(!state.car) {
        let booking = yield getBooking(state.user.id);
        if(booking) {
          state.car = yield Car.findById(booking.carId);
        } else {
          console.log(state);
          doError("Can't find an active car for the user");
        }
      }
    }

    // see if the user (object_id) has a state for the event
    state.step = yield Step.findOne({
      where :{
        objectId: objectId,
        eventName: eventName
      }
    });

    // find the next action and state
    let res = yield ev.cb(state);

    // if there's a response in the action, then send that
    // over.
    let hash = yield Redis.tempSet(res, 25 * 60 * 1000);
    res.hash = hash;
    return res;
  }

};
