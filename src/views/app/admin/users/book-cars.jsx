import React, {Component} from 'react';
import {Link} from 'react-router';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class BookCars extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      carSearchWord: '',
      currentBookin: null,
    };
    this._user = this.props._user;
  }

  componentDidMount() {
    this.getBooking();
  }

  getBooking(userId) {
    api.get(
      '/bookings',
      {
        userId: userId || this.props.user.id,
        order: 'id,DESC',
        details: true,
        status: 'started,reserved,ended',
        limit: 1,
        includeWaiveworkPayment: true,
      },
      (err, bookings) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({
          currentBooking: (bookings && bookings[0]) || null,
        });
      },
    );
  }

  componentDidUpdate(prevProps) {
    let {user} = this.props;
    if (prevProps.user.id !== user.id) {
      this.getBooking(user.id);
    }
  }

  carSearch() {
    api.get(
      `/cars/search/?search=${this.state.carSearchWord}${
        this._user.organizations.length
          ? `&organizationIds=[${this._user.organizations.map(
              org => org.organizationId,
            )}]`
          : ''
      }`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: response});
      },
    );
  }

  book(carId) {
    let data = {
      source: 'web',
      userId: this.props.user.id,
      carId,
      isWaivework: true,
      skipChecklist: true,
      skipPayment: true,
    };
    api.post('/bookings', data, (err, booking) => {
      if (err) {
        if (err.code === 'CAR_NOT_READY') {
          return alert(err.message);
        } else {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
      }
      this.setState({currentBooking: booking}, () => {
        api.put(`/bookings/${booking.id}/ready`, {}, (err, response) => {
          if (err) {
            return snackbar.notify({
              type: 'danger',
              message: `Error completing action: ${err.message}`,
            });
          }
        });
      });
    });
  }

  instaEnd(carId) {
    if (confirm('End the ride immediately?')) {
      api.put(`/cars/${carId}/instaend`, {}, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err,
          });
        }
        this.setState({currentBooking: null}, () => {
          return snackbar.notify({
            type: 'success',
            message: 'InstaEnd successful!',
          });
        });
      });
    }
  }

  render() {
    let {searchResults, carSearchWord, currentBooking} = this.state;
    let {user, full} = this.props;
    return (
      <div className={`box ${full ? 'full' : ''}`}>
        <h3>
          Book Cars
          <small>
            {this._user.hasAccess('waiveAdmin')
              ? '(not for normal WaiveWork)'
              : ''}
          </small>
        </h3>
        <div className="box-content">
          {!currentBooking ? (
            <div>
              Selected User: {user.firstName} {user.lastName}
              <div className="row" style={{marginTop: '10px'}}>
                <input
                  onChange={e => this.setState({carSearchWord: e.target.value})}
                  value={carSearchWord}
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  className="col-xs-6"
                  placeholder="Car Number"
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  onClick={() => this.carSearch()}>
                  Find Car
                </button>
              </div>
              {searchResults &&
                searchResults.map((item, i) => (
                  <div key={i} className="row">
                    <div style={{padding: '10px 0'}} className="col-xs-6">
                      <Link to={`/cars/${item.id}`} target="_blank">
                        {item.license}
                      </Link>
                    </div>
                    <button
                      className="btn btn-link col-xs-6"
                      onClick={() => this.book(item.id)}>
                      {' '}
                      book now
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div>
              <div>
                {user.firstName} {user.lastName} currently in booking{' '}
                <Link to={`/bookings/${currentBooking.id}`}>
                  #{currentBooking.id}
                </Link>{' '}
                in{' '}
              </div>
              <div style={{marginTop: '1rem'}}>
                <button
                  className="btn btn-primary"
                  onClick={() => this.instaEnd(currentBooking.carId)}>
                  End And Complete Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default BookCars;
