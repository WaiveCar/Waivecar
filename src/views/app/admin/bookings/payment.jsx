import React                from 'react';
import { auth, api, relay } from 'bento';

module.exports = class BookingFeesView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      payment : null
    };
  }

  componentDidMount() {
    api.get(`/shop/orders/${ this.props.payment.id }`, (err, order) => {
      if (err) {
        return console.log(err);
      }
      this.setState({
        payment : order
      });
    });
  }

  getItem(item) {
    return (
      <div key={ item.id } className="row payment-item">
        <div className="col-xs-8">
          { item.name }
        </div>
        <div className="col-xs-2 text-right">
          { item.quantity } x
        </div>
        <div className="col-xs-2 text-right">
          ${ item.price / 100 }
        </div>
      </div>
    );
  }

  /**
   * Renders the fees/cart view.
   * @return {Object}
   */
  render() {
    if (!this.state.payment) {
      return <div></div>;
    }
    let payment = this.state.payment;
    return (
      <div className="box">
        <h3>Payment <small>The payment invoice for this booking.</small></h3>
        <div className="box-content">
          {
            payment.items.map(item => {
              return this.getItem(item)
            })
          }
          <div className="row payment-total">
            <div className="col-xs-6">
              <strong>Total</strong>
            </div>
            <div className="col-xs-6 text-right">
              ${ payment.amount / 100 }
            </div>
          </div>
        </div>
      </div>
    );
  }

};
