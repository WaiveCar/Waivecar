'use strict';

let changeCase = require('change-case');
var connection = require('../connection');
let helpers    = require('./helpers');
let ReachQL    = require('./reachQL');

/**
 * Provides a list of relational static methods.
 * @class Relations
 * @static
 */
let Relations = module.exports = {};

/**
 * Performs a has many relational query.
 * @method hasMany
 * @param  {Array} items The parent items being populated
 */
Relations.hasMany = function *(items, parent, child, options) {
  var table     = options.ref || parent.toLowerCase() + '_' + child.toLowerCase();
  var model     = helpers.getModel(child);
  var childName = child.toLowerCase() + 's';

  if (!model) {
    return false;
  }

  // ### Parent IDS

  var parentRef = {};
  items.forEach(function (item, index) {
    parentRef[item.id] = {
      index : index
    };
    item[childName] = [];
  });

  // ### Records
  // Query relational connections table used when assigning children to parents

  var data    = [];
  var records = yield connection.query('SELECT * FROM ' + table + ' WHERE ' + parent.toLowerCase() + '_id IN ('+ helpers.joinArray(Object.keys(parentRef), data) +')', data);

  // ### Child IDS

  var childIds = [];
  records.forEach(function (ref) {
    var id = ref[child.toLowerCase() + '_id'];
    if (-1 === childIds.indexOf(id)) {
      childIds.push(id);
    }
  });

  // ### Query Options

  var queryOptions = {};
  options.where = {
    id : { $in : childIds }
  };
  queryOptions[child] = options;

  // ### Query Relations

  var relations = yield ReachQL.query(queryOptions);
  var childRef  = {};
  relations.forEach(function (item, index) {
    childRef[item.id] = {
      index : index
    };
  });

  // ### Assign Relations

  records.forEach(function (ref) {
    items[parentRef[ref[parent.toLowerCase() + '_id']].index][childName].push(relations[childRef[ref[child.toLowerCase() + '_id']].index]);
  });

};

/**
 * Performs a hasOne relational query.
 * @method hasOne
 */
Relations.hasOne = function *(items, parent, child, options) {
  var model     = helpers.getModel(child);
  var childName = changeCase.camelCase(child);

  if (!model) {
    return false;
  }

  // ### Parent IDS

  var parentRef = {};
  var childIds  = [];
  items.forEach(function (item, index) {
    var childId = item[options.ref];

    if (!parentRef[childId] || !parentRef[childId].index) {
      parentRef[childId] = {
        index : [index]
      };
    } else {
      parentRef[childId].index.push(index);
    }

    if (-1 === childIds.indexOf(childId)) {
      childIds.push(childId);
    }
    item[childName] = [];
  });

  // ### Query Options

  var queryOptions = {};
  options.where = {
    id : { $in : childIds }
  };
  queryOptions[child] = options;

  // ### Query Relations

  var relations = yield ReachQL.query(queryOptions);
  relations.forEach(function (item) {
    parentRef[item.id].index.forEach(function (parentIndex) {
      items[parentIndex][childName] = item;
    });
  });

};