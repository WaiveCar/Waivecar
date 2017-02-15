import React from 'react';
import Shop from '../../../lib/shop-service';
import { auth, api } from 'bento';
import { snackbar } from 'bento-web';

class CardList extends React.Component {

  static propTypes = {
    user: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.bool
  }

  static defaultProps = {
    ...React.Component.defaultProps,
    currentUser: true
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
    this.setState({user: this.props.user});
  }

  creditMod(who, amount, cards) {
    let description = (amount > 0) ? 'Payment for fees incurred during a waivecar ride.' : 'Miscellaneous Credit';
    let mthis = this;

    api.post('/shop/quickcharge', {
      userId      : who.id,
      source      : cards[0].id,
      amount      : amount * 100,
      description : description
    }, (err, res) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      snackbar.notify({
        type    : `success`,
        message : 'Fees was successfully submitted, to manage payment check the stripe dashboard.'
      });
      mthis.setState({user: res.user});
    });
  }

  chargeUser(who, cards) {
    let name = [who.firstName, who.lastName].join(' ');
    let amount = prompt("YOU ARE ABOUT TO CHARGE " + name + ".\nTHIS WILL APPEAR ON THEIR CREDIT CARD WHEN YOU CLICK OK. (Press cancel to abort).\nHow much would you like to charge " + name + "?");
    if (amount) {
      this.creditMod(who, amount, cards);
    }
  }

  addCredit(who, cards) {
    let name = [who.firstName, who.lastName].join(' ');
    let amount = prompt(name + " currently has $" + who.credit.toFixed(2) + " in credit.\nHow much *additional* credit do you want to add?");
    if (amount) {
      this.creditMod(who, -amount, cards);
    }
  }

  amount(num) {
    let n = Math.abs(num/100).toFixed(2);
    if(num === 0) {
      return '$' + n;
    }
    if(num > 0) {
      return <span className='positive'>${ n }</span>
    } 
    return <span className='negative'>-${ n }</span>
  }

  renderNotice(credit) {
    if (credit < 0) {
      return <div className='notice'><b>You cannot rent WaiveCars until this balance is cleared.</b></div>
    }
    if (credit > 0) {
      return <div className='notice'>This credit will be automatically applied against any future fees.</div>
    }
    return <div className='notice'>Everything's good! Thanks.</div>
  }

  renderCardTable() {
    let cards = this.shop.getState('cards');
    if (!cards.length) {
      return <div className="no-records">{ this.props.currentUser ? 'You have ' : 'User has'} not registered any cards.</div>;
    }

    return (
      <div>
        <div className='credit'>Current Credit: { this.amount(this.state.user.credit) }{
          auth.user().hasAccess('admin') ? 
            <button onClick={ this.addCredit.bind(this, this.props.user, cards) } className='pull-right btn btn-link btn-sm'>Add Credit</button> : 
            this.renderNotice(this.state.user.credit)
        }</div>
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
        { 
          auth.user().hasAccess('admin') ? 
            <p><button onClick={ this.chargeUser.bind(this, this.props.user, cards) } className='pull-right btn btn-link btn-sm'>Charge User</button></p> 
            : '' 
        }
      </div>
    );
  }

  render() {
    return (
      <div className="box">
        <h3>
          { this.props.currentUser ? 'Your Cards' : 'User Cards' }
          <small>
            List of payment cards registered with { this.props.currentUser ? 'your' : 'user\'s' } waivecar account.
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
