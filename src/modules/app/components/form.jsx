'use strict';

import React              from 'react';
import Reach              from 'reach-react';
import mixin              from 'react-mixin';
import { Navigation }     from 'react-router';
import { Form, Snackbar } from 'reach-components';
import UI                 from '../ui';

@mixin.decorate(Navigation)

export default function (view, fields, resource) {

  /**
   * @class FormView
   */
  class FormComponent extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.componentLoad = this.componentLoad.bind(this);
      this.handleSuccess = this.handleSuccess.bind(this);
      this.handleError   = this.handleError.bind(this);
      this.state         = {
        ready : false
      };
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      this.componentLoad(this.props.params.id);
    }

    /**
     * @method componentWillReceiveProps
     */
    componentWillReceiveProps(next, state) {
      let prevId = this.props.params.id;
      let nextId = next.params.id;
      if (this.state.key === undefined) {
        this.componentLoad(nextId);
      }
      if (prevId !== nextId) {
        this.componentLoad(nextId);
      }
    }

    /**
     * @method componentLoad
     * @param  {Mixed} id
     */
    componentLoad(id) {
      this.state.key = id;
      if (view.actions.create) {
        this.setState({
          ready  : true,
          id     : null,
          method : resource.store.method,
          action : resource.store.uri
        });
      } else {
        let recordUri = resource.show.uri.replace(':id', id);
        Reach.API.get(recordUri, function (err, record) {
          if (err) {
            return console.log(err);
          }
          this.setState({
            ready  : true,
            id     : id,
            method : resource.update.method,
            action : resource.update.uri.replace(':id', id),
            record : record
          });
        }.bind(this));
      }
    }

    /**
     * @method getFields
     * @return {Array}
     */
    getFields() {
      let result = [];
      view.fields.forEach(function (value) {
        if (fields[value]) {
          let field = fields[value];
          field.name = value;
          result.push(field);
        }
      });
      return result;
    }

    /**
     * Executed when the form is successfully submitted.
     * @method handleSuccess
     * @param  {Object}   data
     * @param  {Function} reset
     */
    handleSuccess(data, reset) {
      if (view.actions.create) {
        this.goBack();
      } else {
        Snackbar.notify({
          type    : 'success',
          message : 'Record was successfully updated.'
        });
      }
    }

    /**
     * Executed when the form encounters an error.
     */
    handleError(data) {
      Snackbar.notify({
        type    : 'danger',
        message : data.message
      });
    }

    /**
     * Retuns a list of available buttons for this form.
     * @method buttons
     * @return {Array}
     */
    buttons() {
      let buttons = [];
      if (view.actions.cancel) {
        buttons.push({
          value : 'cancel',
          class : 'btn',
          click : () => {
            this.goBack();
          }.bind(this)
        });
      }
      if (view.actions.delete) {
        buttons.push({
          value : 'delete',
          class : 'btn btn-danger',
          click : () => {
            console.log('Delete: %s!', this.state.id);
          }.bind(this)
        });
      }
      if (view.actions.update) {
        buttons.push({
          value : 'update',
          type  : 'submit',
          class : 'btn btn-primary'
        });
      }
      if (view.actions.create) {
        buttons.push({
          value : 'submit',
          type  : 'submit',
          class : 'btn btn-primary'
        });
      }
      return buttons;
    }

    /**
     * Render the record form.
     * @method render
     */
    render() {
      if (!this.state.ready) {
        return <div className="container">Loading...</div>
      }
      return (
        <div id="form">
          <div className="content-header">
            <h1><span>{ view.name }</span></h1>
          </div>
          <div className="container-form">
            <Form
              key       = { this.state.id }
              method    = { this.state.method }
              action    = { this.state.action }
              fields    = { this.getFields() }
              record    = { this.state.record }
              onSuccess = { this.handleSuccess }
              onError   = { this.handleError }
              buttons   = { this.buttons() }
            />
          </div>
        </div>
      );
    }
  }

  return FormComponent;

}