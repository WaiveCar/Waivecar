'use strict';

import React                 from 'react';
import { auth, relay, api }  from 'bento';
import { Form }              from 'bento-web';
import { resources, fields } from 'bento-ui';
import md5                   from 'md5';

// ### Form Fields

let formFields = {
  personal : require('./fields-personal'),
  card     : require('./fields-card')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      cards : []
    };
    relay.subscribe(this, 'app');
  }

  /**
   * Set header display to false.
   */
  componentDidMount() {
    api.get('/payments/cards', function (err, cards) {
      if (err) {
        return alert(error.message);
      }
      this.setState({
        cards : cards
      });
    }.bind(this));
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
   * Returns a list of cards registered under the user.
   * @return {Object}
   */
  getCards() {
    let cards = this.state.cards;
    if (!cards.length) {
      return <div className="no-records">You have not registered any cards.</div>
    }
    return (
      <pre>
      {
        JSON.stringify(this.state.cards, null, 2)
      }
      </pre>
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
              className = "bento-form"
              fields    = { formFields.personal }
              default   = { auth.user }
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
            <h4>Your Cards</h4>
            {
              this.getCards()
            }
            <div className="profile-box-spacer" />
            <h4>Add Card</h4>
            <Form
              ref       = "personal"
              className = "bento-form"
              fields    = { formFields.card }
              default   = { {} }
              buttons   = {[
                {
                  value : 'Add Card',
                  type  : 'submit',
                  class : 'btn btn-primary'
                }
              ]}
            />
          </div>
        </div>

      </div>
    );
  }

}