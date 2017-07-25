import type from './helpers/type';

// ### Containers
// State, reducer, actions, and listener containers.

/**
 * A list of stored relay resources shared by all instances of the relay class.
 * @type {Object}
 */
let stored = {
  states    : {},
  reducers  : {},
  actions   : {},
  listeners : {}
};

class Relay {

  // ### Registration Methods
  // A list of methods used when registering reducers and actions.

  /**
   * Registers a new resource with the relay store.
   * @param  {String}   id
   * @param  {Function} reducer
   */
  resource(id, reducer) {
    // if we don't pass a reducer, then we use a generic one. Which
    // at this point in time, is easiest to grab from somewhere else.
    // I believe, for some absurd unknown reason these things are
    // grabbed from mongo. I have no idea.  It's stupid.
    // 
    // This allows us to create these things on the fly without
    // having to be super fancy.
    reducer = reducer || stored.reducers.bookings;
    if (!stored.reducers[id]) {
      stored.states[id]    = reducer(undefined, {});
      stored.reducers[id]  = reducer;
      stored.listeners[id] = {};
    }
  }

  /**
   * Stores a new set of actions under the provided key.
   * @param  {String} key
   * @param  {Object} actions
   */
  actions(key, actions) {
    stored.actions[key] = actions;
  }

  // ### Component Methods
  // A list of methods used for utilizing the relay with react components.

  /**
   * Adds the requested reducer state to the provided context state.
   * @param  {Object} context The component context to assign the reducer state to.
   * @param  {Mixed}  id      A single string or an array of strings representing the
   *                          stores to attach to the provided context state.
   */
  subscribe(context, id) {
    if (!context.state) {
      context.state = {};
    }
    if (type.isArray(id)) {
      id.forEach(function(id) {
        addListener(context, id);
        addActions(context, id);
      });
    } else {
      addListener(context, id);
      addActions(context, id);
    }
  }

  /**
   * Removes any event listeners based on the current context.
   * @param  {Object} context The component context to remove listeners from.
   * @param  {Mixed}  id      A single string or array of states to remove.
   */
  unsubscribe(context, id) {
    let name = context.constructor.name;
    if (type.isArray(id)) {
      id.forEach(function(id) {
        removeListener(id, name);
      });
    } else {
      removeListener(id, name);
    }
  }

  /**
   * Injects a resource with the provided payload.
   * @param  {String} resource
   * @param  {Object} payload
   */
  dispatch(resource, payload) {
    if (!stored.reducers[resource]) {
      // if we haven't seen this then we don't care ... we just create it.
      this.resource(resource);
      //return console.warn(`Relay > Ignoring dispatch request, '${ resource }' reducer has not been defined.`);
    }

    let reducer   = stored.reducers[resource];
    let listeners = stored.listeners[resource];

    // ### Update State

    //console.log(' {{{ ', listeners, stored.states[resource], payload);
    stored.states[resource] = reducer(stored.states[resource], payload);
    //console.log('!!!', resource, payload.type, stored.states[resource]);

    // ### Inform Listeners

    for (let key in listeners) {
      //console.log(key);
      listeners[key].forEach(listener => { listener() });
    }
    //console.log(' }}} ');
  }

  /**
   * Returns the current state of the provided resource.
   * @param  {String} [resource] If no resource is provided we return all states.
   * @return {Any}
   */
  getState(resource) {
    if (resource) {
      return stored.states[resource];
    }
    return stored.states;
  }

  /**
   * Returns a list of actions registered for the provided resource.
   * @param  {String} [resource] If no resource is provided we return all actions.
   * @return {Object}
   */
  getActions(resource) {
    if (resource) {
      return stored.actions[resource];
    }
    return stored.actions;
  }

  // for inspecting everything.
  all() {
    return stored;
  }

}

module.exports = new Relay();

/**
 * @private
 * @param {Component} component
 * @param {String}    id
 */
function addListener(component, id) {
  if (!stored.states[id]) {
    return console.warn(`Relay > Ignoring subscription request, '${ id }' has not been defined.`);
  }
  let name = component.constructor.name;
  if (!stored.listeners[id][name]) {
    stored.listeners[id][name] = [];
  }
  // this is a race condition because this needs registration before
  // the component comes in (cjm 20161205)
  stored.listeners[id][name].push(() => {
    component.setState(prepareState(id, stored.states[id]));
  });
  component.state[id] = stored.states[id];
}

/**
 * Adds reducer actions to the provided context.
 * @param {Object} context
 * @param {String} id
 */
function addActions(context, id) {
  let actions = stored.actions[id];
  if (actions) {
    context[id] = actions;
  }
}

/**
 * @private
 * @param {String} id   The identifier of the reducer
 * @param {String} name The constructor name of the component
 */
function removeListener(id, name) {
  if (!stored.listeners[id] || !stored.listeners[id][name]) {
    return console.warn(`Relay > Ignoring unsubscribe request, '${ id }.${ name }' listener has not been defined.`);
  }
  if (stored.listeners[id][name]) {
    delete stored.listeners[id][name];
  }
}

/**
 * @private
 * @param  {String} id
 * @param  {Any}    state
 * @return {Object}
 */
function prepareState(id, state) {
  let result = {};
  result[id] = state;
  return result;
}
