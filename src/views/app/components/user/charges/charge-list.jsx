import React, { Component, PropTypes } from 'react';
import { auth, relay, api, dom, helpers } from 'bento';
import moment from 'moment';
import classNames from 'classnames';

class ChargeList extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    currentUser: PropTypes.bool,
    full: PropTypes.bool
  }

  static defaultProps = {
    currentUser: true,
    full: true
  }

  constructor(...options) {
    super(...options);
    this.state = {
      charges : [],
      offset  : 0,
      limit   : 15,
      btnPrev : false,
      btnNext : true
    };
    this.totalHours = 0;
    this.avg = 0;
    this.totalFees = 0;

    this.charge = this.charge.bind(this);
  }

  componentDidMount() {
    api.get('/shop/orders', {
      userId  : this.props.user.id,
      order   : 'id,DESC',
      status  : 'failed,paid',
      offset  : this.state.offset,
      limit   : this.state.limit
    }, (err, charges) => {
      if (err) {
        return console.log(err);
      }
      this.setState({
        charges : charges
      });
    });
    this.totalHours = 77;
    this.avg = 55;
    this.totalFees = 88;
  }

  getCharges(step, cb) {
    api.get('/shop/orders', {
      userId  : this.props.user.id,
      order   : 'id,DESC',
      status  : 'failed,paid',
      offset  : this.state.offset + (this.state.limit * step),
      limit   : this.state.limit
    }, (err, charges) => {
      if (err) {
        return console.log(err);
      }
      cb(charges);
    });
  }

  refund(id, amount, description) {
    let chargeIdx = this.state.charges.map(payment => payment.id).indexOf(id);
    console.log('id: ', id, 'total amount: ', amount, 'description : ', description);
    let dollars = (amount / 100).toFixed(2);
    let refundAmount = prompt('Refunding up to $' + dollars + ' for:\n  ' + description + '\nTo issue a partial refund, enter the amount below. For a full refund, leave the field blank');
    if (refundAmount === null) {
      // This occurs when the cancel button is pressed
      return;
    } else if ((Number(refundAmount) > 0 && Number(refundAmount) <= dollars) || (Number(refundAmount) === 0 && refundAmount.length === 0)) {
      // Issues a refund if field has a valid value or is blank 
      refundAmount = Number(refundAmount) === 0 ? amount : Number(refundAmount) * 100;
      api.post(`/shop/refund/${id}`, {
        'amount': refundAmount,
      }, (err, response) => {
        if (err) {
          return console.log(err);
        }
        let temp = this.state.charges.slice();
        temp[chargeIdx].status = 'refunded';
        this.setState({ charges: temp });
        return console.log(response);
      });
      // Refund the full amount when no amount is entered
      console.log(`refund of ${Number(refundAmount) === 0 ? `$${dollars}` : `$${Number(refundAmount) / 100} amount refunded`}`);
    } else {
      // For invalid inputs
      console.log('invalid input');
      this.refund(id, amount, description);
    }
  }

  prevPage() {
    if (this.state.btnPrev) {
      var self = this;
      this.getCharges(-1, function(charges){
        if (charges.length > 0){
          self.setState({
            charges : charges,
            offset : self.state.offset - self.state.limit,
            btnNext : true
          }, function(){
            if (self.state.offset == 0){
              self.setState({btnPrev : false});
            }
          });
        }
      });
    }
  }

  nextPage() {
    if (this.state.btnNext) {
      var self = this;
      this.getCharges(1, function (charges) {
        if (charges.length > 0) {
          self.setState({
            charges: charges,
            offset: self.state.offset + self.state.limit,
            btnPrev: true
          });
        }
        if (charges.length < 15) {
          self.setState({btnNext: false});
        }
      });
    }
  }

  charge(data) {
    let isOpen = this.state.details === data.id;
    let isFailed = data.status === 'failed';
    let className = ['ride-row'];

    if(data.amount < 0) {
      data.status = 'credit';
      data.amount *= -1;
    }

    // ### Ride

    if(isFailed) {
      className.push('failed-row');
    }

    return (
      <tbody key={ data.id }>
        <tr className={ className.join(' ') }>
          <td title={ moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') }>
            <a name={ 'charge-' + data.id }></a>
            { moment(data.createdAt).format('MMM D YYYY') }
          </td>
          <td>
            { data.description }
          </td>
          <td>
           ${ (data.amount / 100).toFixed(2) }
          </td>
          <td className={ 'status ' + data.status }>
            { helpers.changeCase.toCapital(data.status) }
            { auth.user().hasAccess('admin') && data.status === 'paid' &&
              <button onClick = { this.refund.bind(this, data.id, data.amount, data.description) } className='btn btn-xs btn-link undo'><span className="fa fa-undo"></span></button>
            }
          </td>
        </tr>
      </tbody>
    );

  }

  renderTotals() {
    return <div />
        /*
      { this.props.currentUser ?
          <div className="totalChargesSum">Total rented hours: {this.totalHours}, avg: {this.avg}</div>
        :
          <div className="totalChargesSum">Total fees: {this.totalFees}</div>
      }
      */
  }

  render() {
    var boxClass = classNames({
      box: true,
      full: this.props.full
    });
    return (
      <div className={ boxClass }>
        <h3>
          { this.props.currentUser ? 'My' : 'User\'s' } Charges
          <small>
            { this.props.currentUser ? 'Your' : 'User\'s' } Charge History.
          </small>
        </h3>
        <div className="box-content no-padding">
          {
            !this.state.charges.length ?
              <div className="text-center" style={{ padding : '20px 0px' }}>
                { this.props.currentUser ? 'You currently have' : 'User currently has' }  no charges.
              </div>
              :
              <div>
                <table className="table-rides">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  { this.state.charges.map(this.charge) }
                 </table>
                 <div className='pull-right'>
                   <button className={'btn btn-sm ' + (this.state.btnPrev ? 'btn-primary' : 'disabled')} onClick = { this.prevPage.bind(this) }>Previous</button>&nbsp; &nbsp;
                   <button className={'btn btn-sm ' + (this.state.btnNext ? 'btn-primary' : 'disabled')} onClick = { this.nextPage.bind(this) }>Next</button>
                 </div>
               </div>

          }
        </div>
        { this.renderTotals() }
      </div>
    );
  }
}

module.exports = ChargeList;
