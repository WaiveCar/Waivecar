import React, { Component } from 'react';

module.exports = class WaitList extends Component {
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className="col-xs-12 col-md-8 col-md-push-2 waitlist">
          <h2>Thanks for coming to WaiveCar!</h2>
          <p>Due to overwhelming popularity there is a wait list for new registrations.</p>
          <p>Our staff has been informed of your arrival and we'll contact you
          over email as soon as a slot opens up.</p>
          </div>
        </div>
      </div>
    );
  }
}
