import React                from 'react';
import { auth, api, relay } from 'bento';
import asynclib             from 'async';

module.exports = class BookingFeesView extends React.Component {

  constructor(...args) {
    super(...args);
  }

  render() {
    if (!this.props.payments) {
      return <div></div>;
    }
    let {payments} = this.props;
    console.log('payments: ', payments);
    return (
      <div className="box">
        <h3>Payment <small>The payment invoice for this booking.</small></h3>
        <div className="box-content">
          {payments.map(payment => (
            <div className="row payment-item">
              <div className="col-xs-8">
                { payment.description.replace(/Booking\s\d*/i, '') }
              </div>
              <div className="col-xs-2 text-right">
                { payment.quantity } x
              </div>
              <div className="col-xs-2 text-right">
                ${ (payment.amount / 100).toFixed(2) }
              </div>
            </div>
          ))}
          <div className="row payment-total">
            <div className="col-xs-6">
              <strong>Total</strong>
            </div>
            <div className="col-xs-6 text-right">
              ${(payments.reduce((acc, item) => !item.description.includes('authorization') ? acc + item.amount : acc, 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

};
