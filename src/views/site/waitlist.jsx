import React, { Component } from 'react';
import { api } from 'bento';
import { snackbar }  from 'bento-web';

module.exports = class WaitList extends Component {
  constructor(...args) {
    super(...args);

    this.state = {};
    if (this.props.location.query) {
      let lat = this.props.location.query.lat;
      let lng = this.props.location.query.lng;

      if(lat) {
        lat = parseFloat(lat);
      }
      if(lng) {
        lng = parseFloat(lng);
      }
      if (lat && lng) {
        // see https://github.com/WaiveCar/Waivecar/issues/943
        let distance = Math.sqrt( Math.pow(34.310074 - lat, 2) + Math.pow(-118.455963 - lat, 2) );

        let isInLaCutoff = 151.47066894015737;

        this.state.location =  (distance > isInLaCutoff) ? 'notla' : 'la'
      }
      this.state.id = this.props.location.query.id;
    }
  }

  addToWaitlist() {
    api.post('/waitlist/addById', {id: this.state.id}, (error, user) => {
      snackbar.notify({
        type: 'success',
        message: `Thanks for signing up! We'll be in touch!`
      });
    })
  }

  render() {
    return (
      <div id='home'>
        <footer id='wait-header' className='section section-footer bg-inverse'>
          <div className='container'>
            <div className='row'>
              <div className='navbar-app col-lg-12 col-xs-12'>
                <a href='/'>
                  <img src='/images/site/logo.svg' />
                </a>
              </div>
            </div>
          </div>
        </footer>

        <div className='container'>

          <div className='row'>
            <div className="col-xs-12 col-md-6 col-md-push-3 waitlist">
              <h2>Thanks for Coming!</h2>
              { this.state.location == 'notla' &&
                <div>
                  <p>Our lovely WaiveCars currently live in sunny <b>Santa Monica, California</b>.</p>
                  <p>If you're going to be visiting the Los Angeles area soon, feel free to add yourself to the waitlist.</p> 
                  <button className='btn btn-primary' onClick={ this.addToWaitlist.bind(this) }>I'll be in LA soon. Add me!</button>
                </div>
              }
              { this.state.location == 'la' &&
                <div>
                  <p>Due to overwhelming popularity there is a waitlist for new registrations.</p>
                  <p>Our staff has been informed of your arrival and we'll contact you
                  over email as soon as a slot opens up.</p>
                </div>
              }
              <div className="advertise">
                <p>If you're interested in partnership or advertising opportunities with WaiveCar <a href="mailto:advertise@waivecar.com">drop us an email</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
