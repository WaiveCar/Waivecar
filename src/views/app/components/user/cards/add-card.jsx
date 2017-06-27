import React         from 'react';
import { auth, dom } from 'bento';
import { Form }      from 'bento-web';
import Shop          from '../../../lib/shop-service';


// ### Form Fields
let formFields = {
  card : require('./form-fields/card')
};

class AddCard extends React.Component {
  constructor(...options) {
    super(...options);

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

  render() {
    return (
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
    );
  }
}

module.exports = AddCard;
