import React                from 'react';
import { auth, relay, dom } from 'bento';
import { Form }             from 'bento-web';
import Shop                 from '../../lib/shop-service';
import CardList             from '../../components/user/cards/card-list';

// ### Form Fields

let formFields = {
  card : require('./form-fields/card')
};

module.exports = class ProfileCardsView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('Cards');
    this.state = {};
    this.shop  = new Shop(this);
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {
    let user = auth.user();
    this.shop.ensureCustomer(user);
    this.shop.setCards(user.id);
  }

  /**
   * @return {Object}
   */
  render() {
    let user = auth.user();
    return (
      <div className="profile">
        <CardList user={ user }></CardList>

        <div className="box">
          <h3>
            Add Card
            <small>
              Add a new payment card to your waivecar account.
            </small>
          </h3>
          <div className="box-content">
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
              submit = { this.shop.submitCard }
            />
          </div>
        </div>
      </div>
    );
  }

}
