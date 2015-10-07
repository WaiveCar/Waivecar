'use strict';

module.exports = {

  id : {
    label     : 'ID',
    component : 'input',
    type      : 'text',
    name      : 'id',
    required  : true,
    tabIndex  : 1
  },

  template : {
    label     : 'Template',
    component : 'input',
    type      : 'text',
    name      : 'template',
    required  : true,
    tabIndex  : 2
  },

  path : {
    label     : 'Path',
    component : 'input',
    type      : 'text',
    name      : 'path',
    helpText  : 'Enter the path to the views eg. /hello-world/:id',
    required  : true,
    tabIndex  : 3
  },

  title : {
    label     : 'Title',
    component : 'input',
    type      : 'text',
    name      : 'title',
    required  : true,
    tabIndex  : 4
  },

  class : {
    label     : 'Class',
    component : 'input',
    type      : 'text',
    name      : 'class',
    helpText  : 'Styling classes you wish to wrap around the view',
    required  : true,
    tabIndex  : 5
  },

  policy : {
    label     : 'Policy',
    component : 'input',
    type      : 'text',
    name      : 'policy',
    helpText  : 'The policies required before allowing access to this view',
    required  : true,
    tabIndex  : 6
  },

  layout : {
    label     : 'Layout',
    component : 'input',
    type      : 'text',
    name      : 'layout',
    required  : true,
    tabIndex  : 7
  }

};