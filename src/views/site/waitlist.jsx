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
              <h2>Thanks{ (this.state.csula == 'yes' || this.state.autoshow == 'yes' || this.state.level == 'yes') ? ", you're in" : (this.state.waivework === 'yes' ? ' for Signing up' : ' for Coming') }!</h2>
              { this.state.csula == 'yes' &&
                <div>
                  <p>You're just a few steps away from driving the shiny fleet of Hydrogen cars. Please check your email for further instructions.</p>
                </div>
              }
              { this.state.level == 'yes' &&
                <div>
                  <p>You're just a few steps away from your complementary electric car. Please check your email for further instructions.</p>
                </div>
              }
              { (this.state.fastTrack == 'yes' || this.state.autoshow == 'yes') &&
                <div>
                  <p>You've been fast-tracked and skipped the waitlist!</p>
                  <p>Please check your email for further instructions.</p>
                </div>
              }
              { this.state.waivework == 'yes' &&
                <div>
                  <p>Your information has been saved and our staff will contact you within about two business days.</p>
                  <p>If you have any questions, dont hesitate to give us a call at <a href="tel:+1855waive55">1 (855) WAIVE-55</a> or email us at <a href="mailto:support@waive.car">support@waive.car</a>.
                  </p>
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
                  <p>To drive with WaiveCar you'll need:
                    <ul style={{ marginLeft: '2em', textAlign: 'left' }}>
                      <li>A very clean driving record</li>
                      <li>A valid credit card</li>
                    </ul>
                  </p>
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
