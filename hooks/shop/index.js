'use strict';

let customer = require('./lib/customer');
let items    = require('./lib/items');
let hooks    = Bento.Hooks;

/**
 * Bootstrap hook for when you wish to pre-load shop data, or ensure certain
 * parameters exists. Throwing an error during this process will cancel the
 * API startup process.
 * @return {Void}
 */
hooks.set('shop:bootstrap', function *() {
  yield items.default();
});

// ### Customer Hooks

/**
 * Prepares customer data by acting as a filter to make sure that the data
 * provided is valid for the service being used.
 * @param  {Object} payload The customer data being provided
 * @return {Object}
 */
hooks.set('shop:store:customer:before', function *(payload) {
  return customer.filter(payload);
});

/**
 * Prepares customer data by acting as a filter to make sure that the data
 * provided is valid for the service being used.
 * @param  {Object} payload The customer data being updated.
 * @return {Object}
 */
hooks.set('shop:update:customer:before', function *(payload) {
  return customer.filter(payload);
});

// ### Order Hooks

/**
 * Executed before a order gets processed.
 * @param  {Object} payload
 * @return {Void}
 */
hooks.set('shop:store:order:before', function *(payload) {
  return payload;
});

/**
 * Executed after a order has been processed.
 * @param  {Object} order
 * @param  {Object} payload
 * @return {Void}
 */
hooks.set('shop:store:order:after', function *(order, payload) {
  // ...
});

// ### Authorize Hooks

/**
 * Executed before a order authorization request is processed.
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('shop:store:authorize:before', function *(payload) {
  return payload;
});

/**
 * Executed before a order authorization request is processed.
 * @param  {Object} order
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('shop:store:authorize:after', function *(order, payload) {
  // ...
});

// ### Capture Hooks

/**
 * Executed before a capture request is processed.
 * @param  {Object} order
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('shop:store:capture:before', function *(order, payload) {
  return payload;
});

/**
 * Executed after a capture request has been processed.
 * @param  {Object} order
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('shop:store:capture:after', function *(order, payload) {
  // ...
});
