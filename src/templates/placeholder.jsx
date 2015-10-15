'use strict';

import React              from 'react';
import { auth, api }      from 'reach-react';
import { templates }      from 'reach-ui';
import { Form, snackbar } from 'reach-components';
import policies           from 'policies';
import 'styles/placeholder/style.scss';

class PlaceholderTemplate extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading    : false,
      subscribed : false
    }
    this.submit = this.submit.bind(this);
  }

  /**
   * Submits the subscription request to the server.
   * @param  {Object}   data  The form data to be submitted
   * @param  {Function} reset Resets the form state
   * @return {Void}
   */
  submit(data, reset) {
    if (data.target) {
      data  = this.refs.form.data();
      reset = this.refs.form.reset;
    }

    if (!data.email) {
      return snackbar.notify({
        type    : 'danger',
        message : 'You must provide an email to subscribe'
      });
    }

    this.setState({ loading : true });
    api.post('/subscriptions', data, (error, res) => {
      if (error) {
        reset();
        this.setState({ loading : false });
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      this.setState({
        loading    : false,
        subscribed : true
      });
    }.bind(this));
  }

  /**
   * Fetches various views based on current state.
   * @return {Object}
   */
  get() {
    if (this.state.loading) {
      return (
        <div className="sk-cube-grid">
          <div className="sk-cube sk-cube1"></div>
          <div className="sk-cube sk-cube2"></div>
          <div className="sk-cube sk-cube3"></div>
          <div className="sk-cube sk-cube4"></div>
          <div className="sk-cube sk-cube5"></div>
          <div className="sk-cube sk-cube6"></div>
          <div className="sk-cube sk-cube7"></div>
          <div className="sk-cube sk-cube8"></div>
          <div className="sk-cube sk-cube9"></div>
        </div>
      );
    }

    if (this.state.subscribed) {
      return (
        <div className="notification-container animated zoomIn">
          <img src="/images/logo.svg" height="50" width="50" />
          <h5>Thanks</h5>
          <div className="thanks">
            We'll keep you posted
          </div>
        </div>
      );
    }

    return (
      <div className="notification-container animated zoomIn">
        <img src="/images/logo.svg" height="50" width="50" />
        <h5>WaiveCar is launching soon</h5>
        <Form
          ref       = "form"
          className = "r-form"
          fields    = {[
            {
              label     : 'Email Address',
              component : 'input',
              type      : 'text',
              name      : 'email',
              className : 'col-xs-12 r-input r-input-center',
              tabIndex  : 1
            }
          ]}
          submit = { this.submit }
        />
        <div className="footer">
          Subscribe to our newsletter to stay in the loop
        </div>
        <button type="button" className="s-btn" onClick={ this.submit }>Subscribe</button>
      </div>
    );
  }

  /**
   * Renders the component.
   * @return {Object}
   */
  render() {
    return (
      <div id="placeholder">
        <div className="video-container">
          <video autoPlay className="bg-vid hidden-md-down" loop poster="/images/auth/login.jpg">
            <source src="/images/auth/login.webm" type="video/webm" />
            <source src="/images/auth/login.mp4" type="video/mp4" />
          </video>
          <div className="vid-overlay hidden-md-down"></div>
          <div className="vid-fallback hidden-lg-up"></div>
        </div>
        { this.get() }
      </div>
    );
  }

}

templates.register('placeholder', {
  component : PlaceholderTemplate,
  path      : '/',
  onEnter   : (nextState, transition) => {
    policies.isAnonymous(nextState, transition);
  }
});