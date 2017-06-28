import React, { Component, PropTypes } from 'react';
import { auth, relay, api, dom, helpers } from 'bento';
import { Map } from 'bento-web';
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
          <td>
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
          </td>
        </tr>
      </tbody>
    );

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
      </div>
    );
  }
}

module.exports = ChargeList;
