'use strict';

import React                 from 'react';
import { auth, relay, api }  from 'bento';
import { Form, snackbar }    from 'bento-web';
import { resources, fields } from 'bento-ui';
import md5                   from 'md5';
import Payment               from '../lib/payment-service';
import Account               from '../lib/account-service';

// ### Form Fields

let formFields = {
  personal : require('./form-fields/personal'),
  card     : require('./form-fields/card'),
  password : require('./form-fields/password')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);

    this.state   = {};
    this.payment = new Payment(this);
    this.account = new Account(this);

    relay.subscribe(this, 'app');
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {
    this.payment.ensureCustomer(auth.user);
    this.payment.setCards();
    this.app.update({
      display : false
    });
  }

  /**
   * Unsubscribes from the app reducer.
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  /**
   * Renders the list of registered payment cards
   * @return {Object}
   */
  renderCards() {
    let cards = this.payment.getState('cards');
    if (!cards.length) {
      return <div className="no-records">You have not registered any cards.</div>
    }
    return (
      <table className="table-striped profile-table">
        <thead>
          <tr>
            <th>Card number</th>
            <th className="text-center">Brand</th>
            <th className="text-center">Expiration Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          cards.map(function (card) {
            return (
              <tr key={ card.id }>
                <td>**** - **** - **** - { card.last4 }</td>
                <td className="text-center">{ card.brand }</td>
                <td className="text-center">{ card.expMonth } / { card.expYear }</td>
                <td className="text-center">
                  <button className="test" onClick={ this.payment.deleteCard.bind(this, card.id) } ref={ `delete-card-${ card.id }` }>
                    <i className="material-icons">delete</i>
                  </button>
                </td>
              </tr>
            )
          }.bind(this))
        }
        </tbody>
      </table>
    );
  }

  /**
   * @return {Object}
   */
  render() {
    return (
      <div className="profile">

        <div className="profile-header">
          <div className="profile-image">
            <div style={{ background : auth.user.email ? `url(//www.gravatar.com/avatar/${ md5(auth.user.email) }?s=150) center center / cover` : '#fff' }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { auth.user.firstName } { auth.user.lastName }
            </div>
          </div>
        </div>

        <div className="profile-box">
          <h3>
            Personal Details
            <small>
              Review, and edit your personal details.
            </small>
          </h3>
          <div className="profile-box-content">
            <Form
              ref       = "personal"
              className = "bento-form-static"
              fields    = { formFields.personal }
              default   = { auth.user }
              buttons   = {[
                {
                  value : 'Update Details',
                  type  : 'submit',
                  class : 'btn btn-primary btn-profile-submit'
                }
              ]}
              submit = { () => {} }
            />
          </div>
        </div>

        <div className="profile-box">
          <h3>
            Change Password <small>Update your account password.</small>
          </h3>
          <div className="profile-box-content">
            <Form
              ref       = "personal"
              className = "bento-form-static"
              fields    = { formFields.password }
              default   = { auth.user }
              buttons   = {[
                {
                  value : 'Update Password',
                  type  : 'submit',
                  class : 'btn btn-primary btn-profile-submit'
                }
              ]}
              submit = { this.account.submitPassword }
            />
          </div>
        </div>

        <div className="profile-box">
          <h3>
            Payment Details
            <small>
              Review, and edit your payment details.
            </small>
          </h3>
          <div className="profile-box-content">
            <h4>Your Cards <small>List of payment cards registered with your waivecar account.</small></h4>
            {
              this.renderCards()
            }
            <div className="profile-box-spacer" />
            <h4>Add Card <small>Fill out the card details.</small></h4>
            <Form
              ref       = "personal"
              className = "bento-form-static"
              fields    = { formFields.card }
              default   = { {} }
              buttons   = {[
                {
                  value : 'Add Card',
                  type  : 'submit',
                  class : 'btn btn-primary btn-profile-submit'
                }
              ]}
              submit = { this.payment.submitCard }
            />
          </div>
        </div>

      </div>
    );
  }

}