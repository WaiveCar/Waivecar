import React, { Component } from 'react';
import { api } from 'bento';
import { snackbar }  from 'bento-web';

module.exports = class WaitList extends Component {
  constructor(...args) {
    super(...args);

    this.state = {};
    let query = this.props.location.query;
    if (query) {
      this.state = query;
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
              <h2>Thanks { this.state.autoshow == 'yes' ? "You're In" : (this.state.waivework === 'yes' ? 'for Signing up' : 'for Coming') }!</h2>
              { this.state.autoshow == 'yes' &&
                <div>
                  <p>You've been fast-tracked for signup and have skipped the waitlist!</p>
                  <p>Please check your email for further instructions.</p>
                </div>
              }
              { this.state.waivework == 'yes' &&
                <div>
                  <p>Your information has been saved and our staff will contact you shortly.</p>
                  <p>In the meantime, you can still enjoy being a standard WaiveCar user by signing up through the app. Thanks.</p>
                </div>
              }
              { this.state.established == 'yes' &&
                <div>
                  <p>It looks like you're already a member!</p>
                  <p>If you're having issues logging in, try <a href="/reset-password">resetting your password</a>.</p>
                  <p>Still no luck? Give us a call at <a href="tel:+1855waive55">1 (855) WAIVE-55</a>.</p>
                </div>
              }
              { this.state.alreadyLetIn == 'yes' &&
                <div>
                  <p>It looks like we've already let you in!</p>
                  <p>You should have received an email with further instructions. We've sent another one in case you missed it.</p>
                  <p>Still can't find it? Give us a call at <a href="tel:+1855waive55">1 (855) WAIVE-55</a>.</p>
                </div>
              }
              { this.state.inside == 'no' &&
                <div>
                  <p>Our lovely WaiveCars currently live in sunny <b>Santa Monica, California</b>.</p>
                  <p>If you're going to be visiting the Los Angeles area soon, feel free to add yourself to the waitlist.</p> 
                  <button className='btn btn-primary' onClick={ this.addToWaitlist.bind(this) }>I'll be in LA soon. Add me!</button>
                </div>
              }
              { this.state.inside == 'yes' &&
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
