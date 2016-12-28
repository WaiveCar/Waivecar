import { relay, helpers } from 'bento';

let { changeCase } = helpers;

/**
 * @class Resources
 */
let Resources = module.exports = {};

/**
 * A store of resources, this is populated when the UI is loaded from the API.
 * @property store
 * @type     Object
 */
Resources.store = {};

/**
 * Set is currently responsible for creating a relays resource and default
 * actions based on the provided resource.
 * @method add
 * @param  {Array} list
 */
Resources.add = function (list) {
  for (let key in list) {
    let resource = list[key];
    this.prepare(key);
    this.store[key] = resource;
  }
};

/**
 * Returns a resource from the store based on the provided key.
 * @method get
 * @param  {String} key
 */
Resources.get = function (key) {
  return Resources.store[key];
};

/**
 * @method getKeys
 * @return {Array}
 */
Resources.getKeys = function () {
  return Object.keys(Resources.store);
};

/**
 * @method getSelectList
 * @param  {Array} [targets]
 * @return {Array}
 */
Resources.getSelectList = function (targets) {
  return (targets ? targets : this.getKeys()).map((value) => {
    return {
      name  : changeCase.toCapital(value),
      value : value
    };
  });
};

/**
 * Prepares all the resources by creating relay reducers.
 * @method prepare
 * @param  {String} id
 */
Resources.prepare = function (id) {

  // ### Resource Reducer

  relay.resource(id, (state = [], action) => {
    switch (action.type) {
      case 'store'  : return reducerStore(state, action.data);
      case 'index'  : return reducerIndex(state, action.data);
      case 'update' : return reducerUpdate(state, action.data);
      case 'delete' : return reducerDelete(state, action.data);
      default       : return state;
    }
  });

  // ### Resource Actions

  relay.actions(id, {

    /**
     * Adds the provided data to the state.
     * @param {Object} data
     */
    store: (data) => {
      relay.dispatch(id, {
        type : 'store',
        data : data
      });
    },

    /**
     * Adds the entire index to the reducer.
     * @param {Object} data
     */
    index: (data) => {
      relay.dispatch(id, {
        type : 'index',
        data : data
      });
    },

    /**
     * Updates a record in the current state.
     * @param {Object} data
     */
    update: (data) => {
      relay.dispatch(id, {
        type : 'update',
        data : data
      });
    },

    /**
     * Removes a record from the current state.
     * @param {Object} data
     */
    delete: (data) => {
      relay.dispatch(id, {
        type : 'delete',
        data : data
      });
    }

  });

};

// ### Relay Reducer Actions

/**
 * Returns state with provided data.
 * @param  {Array}  state
 * @param  {Object} data
 * @return {Array}
 */
function reducerStore(state, data) {
  let index = state.findIndex(val => val.id === data.id);
  if (index !== -1) {
    return reducerUpdate(state, data);
  }
  return [
    data,
    ...state
  ];
}

// Returns new indexed resource array.
// @param  {Array} state The current reducer state.
// @param  {Array} data  List of resource data.
// @return {Array}
//
// This is optimistically an O(N*M) "caching" system. This guy has no idea how to program. I've replaced
// this honking pile of crap but I've left it here just to come back and laugh.
function _reducerIndex(state, data) {
  // This is an absurd way to pluck a key from an object. Did they do state.map(row => row.id)? no, of course not.
  // Look at this, it uses an accumulator. Unbelievable.
  let ids = state.reduce((list, next) => {
    list.push(next.id);
    return list;
  }, []);
  // Then there's a linear search over all of that looking for duplicates. Oh my f'ing god. You're all fancy
  // ES6'ing around, you could use Set, or you know, create an object and do a looku... oh nevermind...
  data.forEach(obj => {
    if (ids.indexOf(obj.id) === -1) {
      state.push(obj);
    }
  });
  return state;
}

function reducerIndex(state, data) {
  // Essentially what we are doing above is
  //
  // grouped = unique( concat(state, data) );
  //
  // It's arguable whether this is *ever* a thing that wants to be done.  
  // A cache may at first sound admirable, but since they go out and fetch e-v-e-r-y time and the 
  // caching doesn't work, the real thing to do is...
  return data;
}


/**
 * Returns a new array with updated data in update position.
 * @param  {Array}  state
 * @param  {Object} data
 * @return {Array}
 */
function reducerUpdate(state, data) {
  return state.map(function (val) {
    if (val.id === data.id) {
      return data;
    }
    return val;
  });
}

/**
 * Returns a new result array with the provided data removed.
 * @param  {Array}  state
 * @param  {Object} data
 * @return {Array}
 */
function reducerDelete(state, data) {
  return state.filter(m => m.id !== data.id);
}
