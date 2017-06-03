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

  creditMod(who, amount, cards, description) {
    if(!description) {
      description = (amount > 0) ? 'Payment for fees incurred during a waivecar ride.' : 'Miscellaneous Credit';
    }
    let mthis = this;

    api.post('/shop/quickcharge', {
      userId      : who.id,
      source      : cards[0].id,
      amount      : amount * 100,
      description : description
    }, (err, res) => {
      if (err) {
        mthis.setState({user: err.data});
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
    let amount = prompt("YOU ARE ABOUT TO CHARGE " + name + ".\nHow much would you like to charge " + name + "?\n(Tap Cancel to abort).");

    if (amount) {
      let reason = prompt('Optionally, give a reason for this charge.\nYou can leave this blank. But you must tap "OK" for the charge to go through.');

      if (reason !== null) {
        return this.creditMod(who, amount, cards, reason);
      }
    }
    snackbar.notify({
      type    : `success`,
      message : 'No fee was charged'
    });
  }

  addCredit(who, cards) {
    let name = [who.firstName, who.lastName].join(' ');
    let amount = prompt(name + " currently has $" + (who.credit / 100).toFixed(2) + " in credit.\nHow much *additional* credit do you want to add?");
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
      return <div className='notice'>You cannot book WaiveCars until this balance is cleared.</div>
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
        <div style={{ textAlign: 'right' }}>
          { 
            auth.user().hasAccess('admin') ? 
              <button onClick={ this.chargeUser.bind(this, this.props.user, cards) } className='btn btn-link btn-sm'>Charge User</button> 
              : '' 
          }
          <button onClick={ this.creditMod.bind(this, this.props.user, 0, cards) } className={'btn btn-sm ' + (this.props.user.credit >= 0 ? 'btn-link disabled' : '' ) }>Attempt to Clear Balance</button> 
        </div>
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
