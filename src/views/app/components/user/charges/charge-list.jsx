import React, { Component, PropTypes } from 'react';
import { auth, relay, api, dom, helpers } from 'bento';
import { snackbar } from 'bento-web';
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
      status  : 'failed,paid,refunded',
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
      status  : 'failed,paid,refunded',
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
    let possibleDollars = (amount / 100).toFixed(2);
    let refundAmount = prompt('Refunding up to $' + possibleDollars + ' for:\n  ' + description + '\nTo issue a partial refund, enter the amount below. For a full refund, leave the field blank');
    if (refundAmount === null) {
      // This is for presses of the cancel button
      return;
    } else if ((Number(refundAmount) > 0 && Number(refundAmount) <= possibleDollars) || (Number(refundAmount) === 0 && refundAmount.length === 0)) {
      refundAmount = Number(refundAmount) === 0 ? amount : Number(refundAmount) * 100;
      let dollars = (refundAmount / 100).toFixed(2);
      api.post(`/shop/refund/${id}`, {
        'amount': refundAmount,
      }, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: `Internal error processing refund: ${err.message}. Please Try Again!`
          });
        }
        let temp = this.state.charges.slice();
        temp[chargeIdx].status = 'refunded';
        this.setState({ charges: temp });
        return snackbar.notify({
          type: 'success',
          message: `$${dollars} successfully refunded!`
        });
      });
    } else {
      return snackbar.notify({
        type: 'danger',
        message: 'Invalid input. Please Try Again!'
      });
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
            { auth.user().hasAccess('admin') && data.status === 'paid' && data.status.chargeId != "0"
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
