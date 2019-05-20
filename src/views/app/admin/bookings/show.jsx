import React                   from 'react';
import { dom, api, relay, helpers } from 'bento';
import { Link }                from 'react-router';
import BookingFees             from './fees';
import BookingPayment          from './payment';
import BookingDetails          from './details';
import BookingFlags            from './flags';
import { snackbar }         from 'bento-web';
import NotesList from '../components/notes/list';
import UserLicense from '../users/user-license';
import moment from 'moment';
import config from 'config';

const API_URI = config.api.uri + (config.api.port ? ':' + config.api.port : '');

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

  componentWillUnmount() {
    relay.unsubscribe(this, 'bookings');
  }

  componentDidMount() {
    this.loadBooking(this.props.params.id);
    api.get(`/bookings/${ this.props.params.id }/parkingDetails`, (err, response) => {
      this.setState({ parkingDetails: response && response.details });
    });
    //this.loadCarPath(this.props.params.id)
  }

  loadBooking(id) {
    api.get(`/bookings/${ id }?reports=true`, (err, booking) => {
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

      dom.setTitle(booking.user.lastName + " " + booking.car.license.replace(/[^\d]/g, ''));

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
        //console.log(err, model);
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
    //console.log('payments: ', payments)
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

  renderCiteUser(details) {
    return <div className="row">
      {
        [
          [ 'Blurry','blurry', details.path ],
          [ 'Wrong','wrong', details.path ],
          [ 'Not Sign', 'notsign', details.path ],
          [ 'Broke Rules', 'lawless', true ]
        ].map(row =>
          <div className="col-xs-3" key={ row[0] }>
            <button
              onClick={ this.cite.bind(this, row) }
              className={ "btn " + ((!row[2] || this.state.booking.flags[row[1]]) ? "disabled btn-link" : "primary")}>{ row[0] }</button>
          </div>
        )
      }
      </div>
  }

  renderBookingDamage(booking) {
    let bookingList = booking.reports;
    let { details } = booking;
    let rowsToRender = [];
    if (bookingList.length >=8) {
      let other = bookingList.filter(item => item.type === 'other');
      let angles = bookingList.filter(item => item.type !== 'other');
      rowsToRender = [angles.slice(0, 4), angles.slice(4), other];
    } else {
      rowsToRender = [bookingList];
    }
    rowsToRender = rowsToRender.filter(row => row.length);
    let bookingStart = details[0] && moment(details[0].createdAt);
    let bookingMiddle = details[0] && details[1] && moment(details[1].createdAt).diff(moment(details[0].createdAt)) / 2;
    let rowList = rowsToRender.reverse();
    return (
        <div className="box">
          <h3>Damage</h3>
          <div className="box-content">
          <div className="dmg-group">
            {
              details[1] ?
                <div className="after-middle">
                  <span className='offset'>{moment.utc(moment(details[1].createdAt).diff(bookingStart)).format('H:mm')}</span> {moment(details[1].createdAt).format('HH:mm YYYY/MM/DD')}
                </div>
              : <div></div>

            }
            {(rowsToRender[0] && rowsToRender[0].length) &&
              <div>
                {rowList.map((row, i) => {
                  return (
                    <div key={i}>
                      {row.length && 
                          <div className={bookingMiddle && (moment(row[0].createdAt).diff(bookingStart) < bookingMiddle ? 'ts before-middle' : 'ts after-middle')}>
                          <span className='offset'>{`${moment.utc(moment(row[0].createdAt).diff(bookingStart)).format('H:mm')}`}</span>
                        </div>
                      }
                      <div className="dmg-row">
                        {row.map((image, j) =>  { 
                          return image && image.file && ( 
                            <div key={j} className="damage-image-holder">
                              <a href={`${API_URI}/file/${image.file.id}` } target="_blank" key={j}>
                                <img className="damage-image" src={`${API_URI}/file/${image.file.id}`} />
                              </a>
                            </div>);
                          }
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            }
            {bookingStart &&
              <div className='damage-booking-link before-middle'>
                <span className='offset'>0:00</span> {bookingStart.format('HH:mm YYYY/MM/DD')}
              </div>
            }
          </div>
        </div>
      </div>
    );
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
                <h4 className='parking-details'>
                  <em>Parked:</em> {moment(parkingDetails.createdAt).format('HH:mm dddd')}<br/>
                  <em>Move by:</em> { parkingDetails.userInput ? parkingDetails.userInput :
                    <span>
                      {(parkingDetails.expireHour + 100).toString().slice(1)}:00 {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][parkingDetails.expireDay]}
                    </span>
                  }
                </h4>
                  <div className="image-center-container">
                    <div className="col-md-6 gallery-image">
                    {parkingDetails.path && <img src={`https://s3.amazonaws.com/waivecar-prod/${parkingDetails.path}`} /> }
                    </div>
                  </div>
                </div>
                { this.renderCiteUser(parkingDetails) }
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
        { this.renderBookingDamage(booking) }
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
        {
          <BookingFlags booking={ booking } userId={ user.id }/>
        }
        { this.renderNotes(booking) }
      </div>
    );
  }

};
