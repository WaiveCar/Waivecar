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

  template : {
    name      : 'template',
    label     : 'Template',
    component : 'input',
    type      : 'text',
    required  : true,
    tabIndex  : 2
  },

  path : {
    name      : 'path',
    label     : 'Path',
    component : 'input',
    type      : 'text',
    helpText  : 'Enter the path to the views eg. /hello-world/:id',
    required  : true,
    tabIndex  : 3
  },

  title : {
    name      : 'title',
    label     : 'Title',
    component : 'input',
    type      : 'text',
    required  : true,
    tabIndex  : 4
  },

  className : {
    name      : 'class',
    label     : 'Class',
    component : 'input',
    type      : 'text',
    helpText  : 'Styling classes you wish to wrap around the view',
    required  : true,
    tabIndex  : 5
  },

  policy : {
    name      : 'policy',
    label     : 'Policy',
    component : 'input',
    type      : 'text',
    helpText  : 'The policies required before allowing access to this view',
    required  : true,
    tabIndex  : 6
  },

  layout : {
    name      : 'layout',
    label     : 'Layout',
    component : 'input',
    type      : 'text',
    tabIndex  : 7,
    required  : true
  },

  userId : {
    name      : 'userId',
    label     : 'User',
    component : 'input',
    type      : 'text',
    required  : false,
    tabIndex  : 8
  },

  createdAt : {
    name      : 'createdAt',
    label     : 'Created At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 9,
    required  : false
  },

  updatedAt : {
    name      : 'updatedAt',
    label     : 'Updated At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 10,
    required  : false
  },

  deletedAt : {
    name      : 'deletedAt',
    label     : 'Deleted At',
    component : 'input',
    type      : 'text',
    helpText  : null,
    tabIndex  : 11,
    required  : false
  }

};