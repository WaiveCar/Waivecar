import React                   from 'react';
import { api, relay, helpers } from 'bento';
import { Link }                from 'react-router';
import BookingFees             from './fees';
import BookingPayment          from './payment';
import BookingDetails          from './details';
import { snackbar }         from 'bento-web';
import NotesList from '../components/notes/list';
import UserLicense from '../users/user-license';
import moment from 'moment';

module.exports = class BookingsView extends React.Component {

  /**
   * Subscribe to the bookings relays.
   * @param  {...[type]} args [description]
   * @return {[type]}         [description]
   */
  constructor(...args) {
    super(...args);
    this.state = {
      isActing : false,
      force    : false,
      error    : null,
      items    : [],
      details  : [],
      carPath  : [],
      user     : false,
      payments : false,
      car      : false,
      reservationTime: 10
    };

    this.handleInputChange = this.handleInputChange.bind(this);

    relay.subscribe(this, 'bookings');
  }

  /**
   * Unsubscribe from the bookings relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'bookings');
  }

  componentDidMount() {
    this.loadBooking(this.props.params.id);
    api.get(`/bookings/${ this.props.params.id }/parkingDetails`, (err, response) => {
      this.setState({ parkingDetails: response.details });
    });
    //this.loadCarPath(this.props.params.id)
  }

  loadBooking(id) {
    api.get(`/bookings/${ id }`, (err, booking) => {
      if (err) {
        this.setState({
          error : err
        });
        return;
      }
      // When the relay updates the booking it doesn't pass over a user
      // object or the car or payments, this means that it gets blown away 
      // and the page stops functioning.  To work around this, since 
      // the user doesn't change we store it OOB of the booking variable
      this.setState({
        booking: booking,
        details: booking.details,
        payments: booking.payments,
        user: booking.user,
        car: booking.car
      }, () => this.loadCarPath(id));
      this.bookings.store(booking);
    });
  }

  loadCarPath(id) {
    api.get(`/history/booking/${ id }`, (err, model) => {
      var locationHistory = model.data.data;
      if (!Object.keys(model.data).length) {
        // This is done so that the bookings that are missing carpaths show the beginning and end of ride
        let { details } = this.state; 
        let start = [details[0].latitude, details[0].longitude, details[0].createdAt];
        let end;
        if (details[1]) {
          end = [details[1].latitude, details[1].longitude, details[1].createdAt];
        } else {
          end = start;
        }
        this.setState({
          carPath : [start, end]
        });
      } else {
        this.setState({
          carPath : locationHistory
        });
      }
    });
  }

  cite(list) {
    let [word, type] = list;
    if(this.state.booking.flags[type]) {
      return;
    }
    if(confirm("Are you sure you want to cite the user for a " + word + " sign?")) {
      api.post(`/parking/cite/${ type }`, { 
        carId: this.state.car.id,
        userId: this.state.user.id,
        bookingId: this.state.booking.id }, (err, model) => {
        console.log(err, model);
      });
    }
  }

  update(action, force) {
    this.setState({
      isActing : true
    });
    api.put(`/bookings/${ this.props.params.id }/${ action }${ force ? '?force=true' : '' }`, {}, (err) => {
      this.setState({
        isActing : false
      });
      if (err) {
        // display the force button next to the action button (#964)
        this.setState({
          force: action
        });
        if (action === 'end' || action === 'complete') {
          snackbar.notify({
            type    : 'danger',
            message : err.message,
            action : {
              title : 'FORCE',
              click : () => {
                snackbar.dismiss();
                this.update(action, true);
              }
            }
          });
        }
      }
    });
  }

  extendForFree(reservationTime, force) {
    this.setState({
      isActing : true
    });
    api.put(`/bookings/${ this.props.params.id }/${reservationTime ? reservationTime : 10}/extendForFree${ force ? '?force=true' : '' }`, {}, (err) => {
      this.setState({
        isActing : false
      });
      if (err) {
        // display the force button next to the action button (#964)
        this.setState({
          force: 'extendForFree'
        });
      }
    });
  }



  /**
   * Sends a booking cancel request to the api.
   * @param  {String} action cancel|end|complete|close
   * @return {Void}
   */
  cancel(action) {
    this.setState({
      isActing : true
    });
    api.delete(`/bookings/${ this.props.params.id }`, (err) => {
      this.setState({
        isActing : false
      });
    });
  }

  /**
   * Show popup window with user info.
   * @param  {Event}
   * @return {Void}
   */
  showUserInfo(event) {
    event.preventDefault();
    document.getElementById('userInfoWindow').style.display = 'block';
  }

  /**
   * Close popup window with user info.
   * @param  {Event}
   * @return {Void}
   */
  closeUserInfo(event) {
    event.preventDefault();
    document.getElementById('userInfoWindow').style.display = 'none';
  }

  /**
   * Renders all payments associated with booking
   * @param {Array} payments
   * @param {Object}
   */
  renderPayments(payments) {
    console.log('payments: ', payments)
    return (
      <BookingPayment payments={ payments }/>
    );
  }

  handleInputChange(event) {

    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  /**
   * Renders the available actions that can be performed on the booking.
   * @param  {Object} booking
   * @return {Object}
   */
  renderActions(booking) {
    if (this.state.isActing) {
      return <div className="text-center">Performing action...</div>;
    }

    let action = false;
    switch (booking.status) {
      case 'reserved' : {
        action = ( 
          <div>
            <div>
              <button type="button" onClick={ () => { this.cancel() } } className="btn btn-primary">Cancel</button>
              <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-link">Start Ride</button>
              { booking.flags.extended ? '' : <button type="button" onClick={ () => { this.extendForFree(10) } } className="btn btn-link">Extend</button> }
            </div>
         </div>

        );
        break;
      }
      case 'ready'   : {
        action = <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-primary">Start Ride</button>
        break;
      }
      case 'started' : {
        let drove = booking.flags.drove;
        let cancelforfeit = booking.flags.cancelforfeit;
        action = (
          <span>
            <button type="button" onClick={ () => { this.update('end') } } className="btn btn-primary">End Ride</button>
            { drove ? '' : (
                cancelforfeit ? <span><br/>Forfeiture Cancelled</span> :
                  <button type="button" onClick={ () => { this.update('cancelforfeit') } } className="btn btn-link">Cancel Forfeiture</button>
              )
            }
          </span>
        )
        break;
      }
      case 'ended' : {
        action = <button type="button" onClick={ () => { this.update('complete') } } className="btn btn-primary">Complete Ride & Lock Car</button>;
        break;
      }
    }

    var force = ""; 
    if (this.state.force) {
      force = <button type="button" onClick={ () => { this.update(this.state.force, true) } } className="btn btn-link">force</button>
    }
    if (action) {
      return (
        <div className="row">
          <div className="col-xs-12 booking-actions text-center">
            { action }
            { force }
          </div>
        </div>
      );
    }
  }

  renderNotes(booking) {
    return (
      <NotesList type='booking' identifier={ booking.id }></NotesList>
    );
  }

  renderCiteUser() {
    return <div className="row">
      {
        [
          [ 'Blurry','blurry' ],
          [ 'Wrong','wrong' ],
          [ 'Not a Sign', 'notsign' ]
        ].map(row => 
          <div className="col-xs-4">
            <button 
              onClick={ this.cite.bind(this, row) } 
              className={ "btn " + (this.state.booking.flags[row[1]] ? "disabled btn-link" : "primary")}>{ row[0] }</button>
          </div>
        )
      }
      </div>
  }

  render() {
    if (this.state.error) {
      return (
        <div id="booking-view">
          <div className="booking-message">
            { this.state.error.message }
          </div>
        </div>
      );
    }

    let booking = this.state.bookings.find(val => val.id === parseInt(this.props.params.id));
    let user = this.state.user;
    let payments = this.state.payments;
    let car = this.state.car;
    let {parkingDetails} = this.state;

    if (!booking || !user ) {
      return (
        <div id="booking-view">
          <div className="booking-message">
            Loading ...
          </div>
        </div>
      );
    }
    if(_.isString(booking.flags)) {
      let flags = {};
      try {
        JSON.parse(booking.flags).forEach(which => { flags[which] = 1 });
      } catch(ex) {
        booking.flags = JSON.parse(booking.flags);
      }
      booking.flags = flags;
    } else if(_.isNull(booking.flags)){
      booking.flags = {};
    }

    let extended = booking.flags.extended ? 'Extended' : 'Not Extended';
    return (
      <div id="booking-view">
        <div className="box">
          <h3>Booking</h3>
          <div className="box-content">
            <div className="row">
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Status</strong>
                <div>
                  { helpers.changeCase.toCapital(booking.status) } <br/>
                  <small>{ moment(booking.createdAt).format('MM/DD HH:mm') }</small>
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Customer</strong>
                <div>
                  <Link to={ `/users/${ user.id }` }>
                    { user.firstName } { user.lastName }
                  </Link>
                  <small><button className='btn-link' onClick={this.showUserInfo}>Show License</button></small>
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Car</strong>
                <div>
                  { car ? 
                    <Link to={ `/cars/${ car.id }` }>
                      { car.license || car.id }
                    </Link>
                    :
                    "(unknown car)"
                  }
                <small>{ extended }</small>
                </div>
              </div>
            </div>
            { this.renderActions(booking) }
          </div>
        </div>
        <div className="box" id="userInfoWindow">
          <div className="box-content">
             <UserLicense id={ user.id } readOnly="1" />
          </div>
        </div>
        { parkingDetails && (
          <div className="box">
            <h3>Parking Info</h3>
            <div className="box-content">
              <div>
                <div className="row">
                <h4 className="text-center">
                  {moment(parkingDetails.createdAt).format('HH:mm MMMM Do')} (Claimed: {parkingDetails.streetHours} hours) <a href={`/bookings/${this.props.params.id}`}>Booking Details</a>
                </h4>
                  <div className="image-center-container">
                    <div className="col-md-6 gallery-image">
                      <img src={`https://s3.amazonaws.com/waivecar-prod/${parkingDetails.path}`} />
                    </div>
                  </div>
                </div>
                { this.renderCiteUser() }
              </div>
            </div>
          </div>
        )}
        {
          this.state.carPath ? <BookingDetails booking={ booking } carPath = { this.state.carPath }/>
            : <div className="box-empty">
                <h3>Details</h3>
                A ride must be ended before details are shown.
              </div>
        }
        {
          payments.length
            ? this.renderPayments(payments)
            : ''
        }
        {
          booking.status === 'completed'
            ? <BookingFees bookingId={ booking.id } userId={ user.id } cartId={ booking.cartId } />
            : ''
        }
        { this.renderNotes(booking) }
      </div>
    );
  }

};
