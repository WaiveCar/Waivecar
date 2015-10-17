'use strict';

module.exports = {

  id : {
    name      : 'id',
    label     : 'ID',
    component : 'input',
    type      : 'text',
    required  : true,
    tabIndex  : 1
  },

  html : {
    name      : 'html',
    label     : 'HTML',
    component : 'input',
    type      : 'text',
    helpText  : 'The text formatted as HTML',
    required  : true,
    tabIndex  : 2
  },

  userId : {
    name      : 'userId',
    label     : 'Created By',
    component : 'input',
    type      : 'text',
    required  : true,
    tabIndex  : 3
  },

  createdAt : {
    name      : 'createdAt',
    label     : 'Created At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 4,
    required  : false
  },

  updatedAt : {
    name      : 'updatedAt',
    label     : 'Updated At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 5,
    required  : false
  }

  deletedAt : {
    name      : 'deletedAt',
    label     : 'Deleted At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 6,
    required  : false
  }

};