'use strict';

import React           from 'react';
import { auth, relay } from 'bento';
import { Form }        from 'bento-web';
import Payment         from '../lib/payment-service';

// ### Form Fields

let formFields = {
  card : require('./form-fields/card')
};

module.exports = class ProfilePaymentView extends React.Component {

  constructor(...args) {
    super(...args);

    this.state   = {};
    this.payment = new Payment(this);

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
        <div className="profile-box">
          <h3>
            Your Cards
            <small>
              List of payment cards registered with your waivecar account.
            </small>
          </h3>
          <div className="profile-box-content">
            {
              this.renderCards()
            }
          </div>
        </div>

        <div className="profile-box">
          <h3>
            Add Card
            <small>
              Add a new payment card to your waivecar account.
            </small>
          </h3>
          <div className="profile-box-content">
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