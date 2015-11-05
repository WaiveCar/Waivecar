'use strict';

import React                     from 'react';
import { auth, relay, api, dom } from 'bento';
import { Form, snackbar }        from 'bento-web';
import { resources, fields }     from 'bento-ui';
import md5                       from 'md5';
import stripe                    from './classes/stripe';

// ### Form Fields

let formFields = {
  personal : require('./fields-personal'),
  card     : require('./fields-card'),
  password : require('./fields-password')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      cards : []
    };
    relay.subscribe(this, 'app');

    // ### Binders

    this.submitCard = this.submitCard.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {

    // ### Ensure Customer
    // Ensures the existence of a stripe id.

    stripe.ensureCustomer(auth.user, function (user) {
      auth.put({
        stripeId : user.stripeId
      });
    });

    // ### Prepare Cards
    // Loads a list of payment cards registered under the user.

    stripe.getCards(function (cards) {
      this.setState({
        cards : cards
      });
    }.bind(this));

    // ### Hide Header

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
   * Send password update request to the api.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  updatePassword(data, reset) {
    if (data.password !== data.passwordVerify) {
      return snackbar.notify({
        type    : `danger`,
        message : `Passwords does not match`
      });
    }
    api.put(`/users/${ auth.user.id }`, {
      password : data.password
    }, function (err) {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      return snackbar.notify({
        type    : `success`,
        message : `Your password was successfully updated`
      });
    });
  }

  /**
   * Attempts to delete a payment card.
   * @param  {String} cardId
   */
  deleteCard(cardId) {
    let btn = this.refs[`delete-card-${ cardId }`];
    btn.className = dom.setClass({
      hide : true
    });
    stripe.deleteCard(cardId, function (err) {
      if (err) {
        btn.className = dom.setClass({
          hide : false
        });
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }

      // ### Remove Card
      // Remove the payment card form the card list.

      this.setState({
        cards : function () {
          let result = [];
          this.state.cards.forEach((card) => {
            if (card.id !== cardId) {
              result.push(card);
            }
          });
          return result;
        }.call(this)
      });

      return snackbar.notify({
        type    : `success`,
        message : `Your payment card was successfully removed from your account`
      });
    }.bind(this));
  }

  /**
   * Submits the card form.
   * @param {Object}   data
   * @param {Function} reset
   */
  submitCard(data, reset) {
    stripe.addCard(auth.user, data, function (card) {
      this.setState({
        cards : [
          ...this.state.cards,
          card
        ]
      });

      snackbar.notify({
        type    : `success`,
        message : `Your new payment card was added successfully`
      });

      reset();
    }.bind(this));
  }

  /**
   * Renders the list of registered payment cards
   * @return {Object}
   */
  renderCards() {
    let cards = this.state.cards;
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
          this.state.cards.map(function (card) {
            return (
              <tr key={ card.id }>
                <td>**** - **** - **** - { card.last4 }</td>
                <td className="text-center">{ card.brand }</td>
                <td className="text-center">{ card.expMonth } / { card.expYear }</td>
                <td className="text-center">
                  <button className="test" onClick={ this.deleteCard.bind(this, card.id) } ref={ `delete-card-${ card.id }` }>
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
              submit = { this.updatePassword }
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
              submit = { this.submitCard }
            />
          </div>
        </div>

      </div>
    );
  }

}