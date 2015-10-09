'use strict';

import React                             from 'react';
import { api }                           from 'reach-react';
import mixin                             from 'react-mixin';
import { History }                       from 'react-router';
import { Form, snackbar }                from 'reach-components';
import { components, fields, resources } from 'reach-ui';

@mixin.decorate(History)

/**
 * @class UIForm
 */
class UIForm extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      default : {}
    }
    this.submit = this.submit.bind(this);
  }

  /**
   * Checks if the form is of type update and requests data if it is.
   * @method componentDidMount
   */
  componentDidMount() {
    if (!this.isCreate()) {
      this.setDefault(this.id());
    }
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    let prev = this.id();
    let next = nextProps.params.id;
    if (next !== prev) {
      this.setDefault(nextProps.params.id);
    }
  }

  /**
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    let prev = this.state.default.id;
    let next = nextState.default.id;
    if (next !== prev) {
      return true;
    }
    return false;
  }

  /**
   * @method id
   * @return {String}
   */
  id() {
    return this.props.params.id || 'create';
  }

  /**
   * @method isCreate
   * @return {Boolean}
   */
  isCreate() {
    return this.id() === 'create';
  }

  /**
   * Updates the data state based on the provided id.
   * @method setDefault
   * @param  {Mixed} id
   */
  setDefault(id) {
    let resource = this.resource();
    api.get(resource.uri.replace(':id', id), (error, data) => {
      if (error) {
        throw new Error(error);
      }
      this.setState({
        default : data
      });
    }.bind(this));
  }

  /**
   * Returns the resource resource for the current instance.
   * @method resource
   * @return {Object}
   */
  resource() {
    let resource = resources.get(this.props.resource);
    if (this.isCreate()) {
      return resource.store;
    }
    return resource.update;
  }

  /**
   * @method fields
   * @return {Array}
   */
  fields() {
    let list  = fields.get(this.props.fields.id);
    let action = this.isCreate() ? 'create' : 'update';
    return this.props.fields[action].map((value, index) => {
      if (list.hasOwnProperty(value)) {
        let field       = list[value];
        field.className = 'col-xs-12 r-input';
        return field;
      }
    });
  }

  /**
   * @method buttons
   * @return {Array}
   */
  buttons() {
    let buttons = [];
    let actions = this.props.actions;

    if (actions.indexOf('cancel') > -1) {
      buttons.push({
        value : 'cancel',
        class : 'btn',
        click : () => {
          this.goBack();
        }.bind(this)
      });
    }

    if (this.isCreate()) {
      buttons.push({
        value : 'submit',
        type  : 'submit',
        class : 'btn btn-primary'
      });
    } else {
      if (actions.indexOf('delete') > -1) {
        buttons.push({
          value : 'delete',
          class : 'btn btn-danger',
          click : () => {
            console.log('Delete: %s!', this.id());
          }.bind(this)
        });
      }
      if (actions.indexOf('update') > -1) {
        buttons.push({
          value : 'update',
          type  : 'submit',
          class : 'btn btn-primary'
        });
      }
    }

    return buttons;
  }

  /**
   * @method submit
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submit(data, reset) {
    let resource = this.resource();

    // ### Submit Data
    // Submits the data to api either via post or put depending on the
    // form type being create or update.

    if (this.isCreate()) {
      api.post(resource.uri, data, (error, data) => {
        if (error) {
          return handleError(error.message);
        }
        this.goBack();
      }.bind(this));
    } else {
      api.put(resource.uri.replace(':id', this.id()), data, (error) => {
        if (error) {
          return handleError(error.message);
        }
        snackbar.notify({
          type    : 'success',
          message : 'Record was successfully updated.'
        });
      });
    }

    // ### Error
    // Handle incoming errors.

    function handleError(message) {
      snackbar.notify({
        type    : 'danger',
        message : message
      });
    }
  }

  /**
   * @method render
   */
  render() {
    return (
      <Form
        className = "r-form"
        default   = { this.state.default }
        fields    = { this.fields() }
        buttons   = { this.buttons() }
        submit    = { this.submit }
      />
    );
  }

}

// ### Register Component

components.register({
  name    : 'Form',
  type    : 'form',
  icon    : 'apps',
  class   : UIForm,
  options : [
    {
      name      : 'resource',
      label     : 'Resource',
      component : 'select',
      options   : [
        {
          name : 'Cars',
          value : 'cars'
        },
        {
          name : 'Views',
          value : 'views'
        }
      ],
      helpText  : 'Select a Resource'
    },
    {
      name      : 'actions',
      label     : 'Actions',
      component : 'multiselect',
      options   : [
        {
          name : 'Create',
          value : 'create'
        },
        {
          name : 'Update',
          value : 'update'
        },
        {
          name : 'Delete',
          value : 'delete'
        }
      ],
      helpText  : 'Select Actions'
    },
    {
      name      : 'fields',
      label     : 'Fields',
      component : 'select',
      options   : [
        {
          name : 'Id',
          value : 'id'
        },
        {
          name : 'Created At',
          value : 'createdAt'
        },
        {
          name : 'Updated At',
          value : 'updatedAt'
        }
      ],
      helpText  : 'Select Fields to display'
    }
  ]
});