'use strict';

import React                             from 'react';
import { api }                           from 'reach-react';
import mixin                             from 'react-mixin';
import { Navigation }                    from 'react-router';
import { Form, snackbar }                from 'reach-components';
import { components, fields, resources } from 'reach-ui';

@mixin.decorate(Navigation)

class UIForm extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      data : {}
    }
    this.success = this.success.bind(this);
  }

  /**
   * Returns the id defined in the route.
   * @method id
   * @return {Mixed}
   */
  id() {
    return this.props.params.id;
  }

  /**
   * Checks if the form is of type update and requests data if it is.
   * @method componentDidMount
   */
  componentDidMount() {
    if (!this.isCreate()) {
      this.setData(this.id());
    }
  }

  /**
   * Executes when component is receiving new properties allowing
   * us to load in new data.
   * @method componentWillReceiveProps
   */
  componentWillReceiveProps(nextProps, nextState) {
    let prevId = this.id();
    let nextId = nextProps.params.id;
    if (prevId !== nextId) {
      this.setData(nextId);
    }
  }

  /**
   * @method isCreate
   * @return {Boolean}
   */
  isCreate() {
    return this.id() === 'create';
  }

  /**
   * Returns the resource resource for the current instance.
   * @method resource
   * @return {Object}
   */
  resource() {
    let resource = resources.get(this.props.resource);
    if (this.id() === 'create') {
      return resource.store;
    }
    return resource.update;
  }

  /**
   * Updates the data state based on the provided id.
   * @method setData
   * @param  {Mixed} id
   */
  setData(id) {
    let resource = this.resource();
    api.get(resource.uri.replace(':id', id), (error, data) => {
      if (error) {
        throw new Error(error);
      }
      this.setState({
        data : data
      });
    }.bind(this));
  }

  /**
   * @method fields
   * @return {Array}
   */
  fields() {
    let list   = fields.get(this.props.fields.id);
    let action = this.isCreate() ? 'create' : 'update';
    return this.props.fields[action].map((value) => {
      if (list.hasOwnProperty(value)) {
        list[value].name = value;
        return list[value];
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

    if (actions.cancel) {
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
      if (actions.delete) {
        buttons.push({
          value : 'delete',
          class : 'btn btn-danger',
          click : () => {
            console.log('Delete: %s!', this.id());
          }.bind(this)
        });
      }
      if (actions.update) {
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
   * Returns the form method.
   * @method method
   * @return {String}
   */
  method() {
    let resource = this.resource();
    if (this.isCreate()) {
      return resource.method;
    }
    return resource.method;
  }

  /**
   * Returns the uri action to perform on this form.
   * @method action
   * @return {String}
   */
  action() {
    let resource = this.resource();
    if (this.isCreate()) {
      return resource.uri;
    }
    return resource.uri.replace(':id', this.id());
  }

  /**
   * Executed when the form is successfully submitted.
   * @method success
   * @param  {Object}   data
   * @param  {Function} reset
   */
  success(data, reset) {
    if (this.isCreate()) {
      this.goBack();
    } else {
      snackbar.notify({
        type    : 'success',
        message : 'Record was successfully updated.'
      });
    }
  }

  /**
   * @method render
   */
  render() {
    return (
      <Form
        key       = { this.id() }
        method    = { this.method() }
        action    = { this.action() }
        fields    = { this.fields() }
        data      = { this.state.data }
        buttons   = { this.buttons() }
        onSuccess = { this.success }
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
  options : {}
});