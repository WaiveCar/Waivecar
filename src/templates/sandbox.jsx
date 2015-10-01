'use strict';

import React     from 'react';
import UI        from 'reach-ui';
import { relay } from 'reach-react';
import { type }  from 'reach-react/lib/helpers';
import { Form }  from 'reach-components';

let index      = 0;
let formFields = {

  firstName : {
    label        : 'First name',
    component    : 'input',
    type         : 'text',
    name         : 'firstName',
    className    : 'col-md-6 r-input',
    helpText     : 'Enter your first name'
  },

  lastName : {
    label        : 'Last name',
    component    : 'input',
    type         : 'text',
    name         : 'lastName',
    className    : 'col-md-6 r-input',
    helpText     : 'Enter your last name'
  },

  role : {
    label        : 'User Role (Select)',
    component    : 'select',
    name         : 'role',
    className    : 'col-xs-12 r-select',
    options      : [
      {
        name : 'User',
        value : 'user'
      },
      {
        name : 'Administrator',
        value : 'admin'
      }
    ],
    helpText : 'Select the users system role.'
  },

  gender : {
    label        : 'Gender (Select)',
    component    : 'select',
    name         : 'gender',
    className    : 'col-xs-12 r-select',
    options      : [
      {
        name  : 'Male',
        value : 'male'
      },
      {
        name  : 'Female',
        value : 'female'
      }
    ],
    helpText : 'Selecting gender should change the interests choices.'
  },

  colors : {
    label        : 'Colors (Multi Select)',
    component    : 'multi-select',
    name         : 'colors',
    className    : 'col-xs-12 r-select',
    options   : [
      {
        name  : 'Red',
        value : 'red'
      },
      {
        name  : 'Green',
        value : 'green'
      },
      {
        name  : 'Yellow',
        value : 'yellow'
      }
    ],
    helpText : 'Select fav. colors.'
  },

  interests : {
    label     : 'Interests (Checkboxes)',
    component : 'checkbox',
    name      : 'interests',
    className : 'col-md-2',
    helpText  : 'Check of each of your interests',
    options   : {
      connector : 'gender',
      values    : {
        male : [
          {
            name  : 'Games',
            value : 'games'
          },
          {
            name  : 'Hiking',
            value : 'hiking'
          },
          {
            name  : 'Programming',
            value : 'programming'
          }
        ],
        female : [
          {
            name  : 'Fashion',
            value : 'fashion'
          },
          {
            name  : 'Hiking',
            value : 'hiking'
          },
          {
            name  : 'Shopping',
            value : 'shopping'
          }
        ]
      }
    }
  },

  subscription : {
    label     : 'Subscription Period (Radio)',
    component : 'radio',
    name      : 'subscription',
    options   : [
      {
        name  : '30 Days',
        value : 30
      },
      {
        name  : '60 Days',
        value : 60
      },
      {
        name  : '90 Days',
        value : 90
      }
    ],
    helpText : 'Select a subscription period.'
  },

  bio : {
    label        : 'Bio (Textarea)',
    component    : 'textarea',
    name         : 'bio',
    placeholder  : 'Enter some text about the user',
    helpText     : 'Enter some text about the user.'
  }

}

/**
 * Renders the authentication layout for the application.
 * @class SandboxTemplate
 */
class SandboxTemplate extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      fields : arrayToFields([ [ 'firstName', 'lastName' ], 'role', 'gender', 'colors', 'interests', 'subscription', 'bio' ])
    };
    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);
  }

  fields() {
    return [
      {
        label     : 'Resource',
        component : 'select',
        name      : 'resource',
        className : 'col-xs-12 r-select',
        options   : UI.resources.getSelectList(),
        helpText : 'Select resource for this form'
      },
      {
        label     : 'Fields',
        component : 'multi-select',
        name      : 'fields',
        helpText  : 'Select resource fields to appear in table',
        options   : {
          connector : 'resource',
          values    : UI.fields.getSelectList()
        }
      }
    ];
  }

  /**
   * Event handler for input updates on the form.
   * @method change
   * @param  {Object} target
   */
  change(target) {
    // ... 
  }

  /**
   * Form submission test.
   * @method submit
   */
  submit(data) {
    console.log(data);
  }

  /**
   * @method render
   * @return {Form}
   */
  render() {
    return (
      <div className="container">
        <h3 style={{ margin : '30px 0' }}>Forms</h3>
        <Form
          className = "r-form"
          fields    = { this.fields() }
          default   = { this.state.default }
          change    = { this.change }
          submit    = { this.submit }
          buttons   = {[
            {
              type  : 'button',
              value : 'Reset',
              class : 'btn btn-info',
              click : 'reset'
            },
            {
              type  : 'button',
              value : 'Custom',
              class : 'btn btn-default',
              click : () => {
                console.log('test');
              }
            },
            {
              type  : 'submit',
              value : 'Submit',
              class : 'btn btn-success',
              click : 'submit'
            }
          ]}
        />
      </div>
    );
  }

}

/**
 * @method arrayToFields
 * @param  {Array} list
 * @return {Array}
 */
function arrayToFields(list) {
  return list.map((value, index) => {
    if (type.isArray(value)) {
      return arrayToFields(value);
    }
    return formFields[value];
  });
}

// ### Register Template

UI.templates.register('sandbox', {
  component : SandboxTemplate,
  path      : '/sandbox'
});