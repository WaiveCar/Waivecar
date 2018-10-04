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

    if(this.props.user.credit >= 0 && amount === 0) {
      snackbar.notify({
        type    : `success`,
        message : 'Nothing needs to be done. Thanks'
      });
      return true;
    }

    if(!_.isString(description)) {
      description = (amount > 0) ? 'Payment for fees incurred during a waivecar ride.' : 'Miscellaneous Credit';
    }

    // preventing the user from trying to do this twice.
    if(this.state.processing) {
      return;
    }

    this.setState({processing: true});
    snackbar.notify({
      type    : 'success',
      message : 'processing...'
    });

    let opts = {
      userId      : who.id,
      amount      : amount * 100,
      description : description
    };
    if(cards.length) {
      opts.source = cards[0].id;
    }
    api.post('/shop/quickcharge', opts, (err, res) => {
      this.setState({
        user: err ? err.data : res.user,
        processing: false
      });
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }

      let message = '';
      if (amount === 0) {
        message = 'Cleared outstanding balance.';
      } else if (amount < 0) {
        message = 'Credited $' + -amount;
      } else {
        message = 'Charged $' + amount;
      }

      snackbar.notify({
        type    : `success`,
        message : message
      });
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
    if( num === false) {
      return <span>&hellip;</span>
    }

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
    if (credit === '...') {
      return <div />
    }
       
    if (credit < 0) {
      return <div className='notice'>You cannot book WaiveCars until this balance is cleared.</div>
    }
    if (credit > 0) {
      return <div className='notice'>This credit will be automatically applied against any future fees.</div>
    }
    return <div className='notice'>Everything's good! Thanks.</div>
  }

  topUp(user, amount, cards) {
    if (confirm('Are you sure you want to top up $20?')) {
      let opts = {
        userId      : user.id,
        amount      : amount * 100,
        description : 'Top up $20',
      };
      if(cards.length) {
        opts.source = cards[0].id;
      }
      api.post('/shop/topUp', opts, (err, result) => {
        if (err) {
          return err;
        }
        this.setState({ user: { ...this.state.user, credit: this.state.user.credit + 2000 } });
      });
    }
  }

  renderCardTable() {
    let cards = this.shop.getState('cards');
    let credit = false;
    if(this.state.user) {
      credit = this.state.user.credit;
    } else if (this.props.user) {
      credit = this.props.user.credit;
    }

    let header = (
      <div className='credit'>Current Credit: { this.amount(credit) }
        {
          auth.user().hasAccess('admin') ? 
            <div className="pull-right">
              <button onClick={ this.props.addCard } className='btn btn-link btn-sm'>Add Card</button>
              <button onClick={ this.addCredit.bind(this, this.props.user, cards) } className='btn btn-link btn-sm'>Add Credit</button>
            </div>
            : this.renderNotice(credit)
        }
      </div>
    );

    let footer = (
      <div style={{ textAlign: 'right' }}>
        { 
          auth.user().hasAccess('admin') ? 
            <button onClick={ this.chargeUser.bind(this, this.props.user, cards) } className='btn btn-link btn-sm'>Charge User</button> 
            : '' 
        }
        <button onClick={ this.creditMod.bind(this, this.props.user, 0, cards) } className={'btn btn-sm ' + (this.props.user.credit >= 0 ? 'btn-link disabled' : '' ) }>Attempt to Clear Balance</button> 
      </div>
    );

    return (
      <div>
        { header } 
        { !cards.length ?
            <div className="no-records">{ this.props.currentUser ? 'You have ' : 'User has'} not registered any cards.</div>
         : <table className="table-striped profile-table">
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
        }
        { footer }
        <div>
          <button onClick={() => this.topUp(this.props.user, 20, cards)} className="btn btn-sm">
            Add a $20 Credit.
          </button>
          <div className="credit-tip">
            Why would I do this? The $20 hold that is placed on your account when you use WaiveCar will be reduced to $1.
          </div>
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