import React from 'react';
import Shop from '../../../lib/shop-service';

class CardList extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired
  }

  constructor(...options) {
    super(...options);

    this.state = {};
    this.shop = new Shop(this);
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {
    this.shop.ensureCustomer(this.props.user);
    this.shop.setCards(this.props.user.id);
  }

  renderCardTable() {
    let cards = this.shop.getState('cards');
    if (!cards.length) {
      return <div className="no-records">You have not registered any cards.</div>;
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
                  <button className="test" onClick={ this.shop.deleteCard.bind(this, card.id) } ref={ `delete-card-${ card.id }` }>
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

  render() {
    return (
      <div className="box">
        <h3>
          Your Cards
          <small>
            List of payment cards registered with your waivecar account.
          </small>
        </h3>
        <div className="box-content">
          {
            this.renderCardTable()
          }
        </div>
      </div>
    );
  }
}

module.exports = CardList;
