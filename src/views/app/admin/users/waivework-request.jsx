import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class WaiveWorkRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rideshare: 'true',
      wantsElectric: 'true',
      offerPerWeek: null,
      enabled: true,
    };
  }

  requestQuote = () => {
    api.get(
      '/licenses',
      {
        userId: this.props.user.id,
      },
      (err, licenses) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        api.post(
          '/waitlist/requestWorkQuote',
          {
            ...this.props.user,
            ...licenses[0],
            ...this.state,
            licenseState: licenses[0].state,
            userId: this.props.user.id,
          },
          (err, response) => {
            if (err) {
              return snackbar.notify({
                type: 'danger',
                message: err.message,
              });
            }
            console.log('response: ', response);
          },
        );
      },
    );
  };

  render() {
    return (
      <div className="box">
        <h3>
          WaiveWork Quote Request
          <small>Request an insurance quote for this user</small>
        </h3>
        <div className="box-content">
          <div onChange={e => this.setState({rideshare: e.target.value})}>
            <label>For Rideshare</label>
            <input
              type="radio"
              value="true"
              name="rideshare"
              defaultChecked
            />{' '}
            yes
            <input type="radio" value="false" name="rideshare" /> no
          </div>
          <div onChange={e => this.setState({wantsElectric: e.target.value})}>
            <label>Prefers Electric</label>
            <input
              type="radio"
              value="true"
              name="wantsElectric"
              defaultChecked
            />{' '}
            yes
            <input type="radio" value="false" name="wantsElectric" /> no
          </div>
          <label>Offer Per Week: </label>
          <input
            type="number"
            onChange={e => this.setState({offerPerWeek: e.target.value})}
          />
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.requestQuote()}>
              Request Quote
            </button>
          </div>
        </div>
      </div>
    );
  }
}
