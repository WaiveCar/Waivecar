'use strict';

import React                from 'react';
import mixin                from 'react-mixin';
import { auth, api }        from 'reach-react';
import { History, Link } from 'react-router';
import config               from 'config';
import { Form, snackbar }   from 'reach-components';

@mixin.decorate(History)

export default class SubscribeView extends React.Component {

  /**
   * @class LoginView
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.fields = [
      {
        label     : 'Email Address',
        component : 'input',
        type      : 'text',
        name      : 'email',
        className : 'col-xs-12 r-input r-input-center',
        tabIndex  : 1
      }
    ];
    this.submit = this.submit.bind(this);
  }

  /**
   * @method submit
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submit(data, reset) {
    if (data.target) {
      data  = this.refs.form.data();
      reset = this.refs.form.reset;
    }
    api.post('/subscriptions', data, (error, res) => {
      if (error) {
        reset();
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      reset();
      return snackbar.notify({
        type    : 'success',
        message : 'Thanks. We\'ll keep you posted.'
      });
    }.bind(this));
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="login subscribe">
        <div className="title">
          { config.app.name }&nbsp;
          <span className="title-site">News</span>
          <p className="title-detail">Sign up now to our newsletter and you'll be one of the first to know when we're ready.</p>
        </div>
        <Form
          ref       = "form"
          className = "r-form"
          fields    = { this.fields }
          submit    = { this.submit }
        />
        <div className="actions">
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>Subscribe</button>
        </div>
      </div>
    );
  }

}