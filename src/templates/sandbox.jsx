'use strict';

import React         from 'react';
import { relay }     from 'reach-react';
import { templates } from 'reach-ui';
import { Form }      from 'reach-components';

let index = 0;

/**
 * Renders the authentication layout for the application.
 * @class SandboxTemplate
 */
class SandboxTemplate extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {

      // ### Default Data
      /*
      default : {
        firstName    : 'Christoffer',
        lastName     : 'Rødvik',
        role         : 'admin',
        subscription : 30,
        hiking       : true,
        bio          : 'Full Stack Developer @ CleverTech'
      },
      */

      // ### Form Fields

      fields : [

        // ### Inputs

        [
          {
            label        : 'First name',
            component    : 'input',
            type         : 'text',
            name         : 'firstName',
            className    : 'col-md-6 r-input',
            helpText     : 'Enter your first name'
          },
          {
            label        : 'Last name',
            component    : 'input',
            type         : 'text',
            name         : 'lastName',
            className    : 'col-md-6 r-input',
            helpText     : 'Enter your last name'
          }
        ],

        // ### Select Sample

        {
          label        : 'User Role (Select)',
          component    : 'select',
          name         : 'role',
          className    : 'col-xs-12 r-select',
          options      : [
            {
              label : 'User',
              value : 'user'
            },
            {
              label : 'Administrator',
              value : 'admin'
            }
          ],
          helpText : 'Select the users system role.'
        },

        // ### Checkbox

        {
          label     : 'Interests (Checkboxes)',
          component : 'checkbox',
          name      : 'interests',
          className : 'col-md-2',
          options   : [
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
          helpText : 'Check of each of your interests.'
        },

        // ### Radio

        {
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

        // ### Textarea

        {
          label        : 'Bio (Textarea)',
          component    : 'textarea',
          name         : 'bio',
          placeholder  : 'Enter some text about the user',
          helpText     : 'Enter some text about the user.'
        }

      ]
    }
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
          fields    = { this.state.fields } 
          default   = { this.state.default } 
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

// ### Register Template

templates.register('sandbox', {
  component : SandboxTemplate,
  path      : '/sandbox'
});