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
      disabled: false,
    };
  }

  requestQuote = () => {
    this.setState({disabled: true}, () => {
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
          let body = {
            ...this.props.user,
            ...licenses[0],
            ...this.state,
            licenseState: licenses[0].state,
            userId: this.props.user.id,
          };
          let requiredItems = [
            'firstName',
            'lastName',
            'licenseState',
            'street1',
            'number',
            'expirationDate',
            'offerPerWeek',
          ];
          for (let item of requiredItems) {
            if (!item in body) {
              let message =
                item !== 'offerPerWeek'
                  ? 'Please make sure that the all necessary license fields are entered into our system'
                  : 'Please enter the amount that the user is offering per week';
              return snackbar.notify({
                type: 'danger',
                message,
              });
            }
          }
          api.post('/waitlist/requestWorkQuote', body, (err, response) => {
            if (err) {
              return snackbar.notify({
                type: 'danger',
                message: err.message,
              });
            }
            return snackbar.notify({
              type: 'success',
              message: 'Quote for WaiveWork insurance requested',
            });
          });
        },
      );
    });
  };

  render() {
    let {disabled} = this.state;
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
              style={{marginLeft: '0.7rem'}}
              type="radio"
              value="true"
              name="rideshare"
              defaultChecked
            />{' '}
            Yes
            <input
              style={{marginLeft: '0.7rem'}}
              type="radio"
              value="false"
              name="rideshare"
            />{' '}
            No
          </div>
          <div onChange={e => this.setState({wantsElectric: e.target.value})}>
            <label>Prefers Electric</label>
            <input
              style={{marginLeft: '0.7rem'}}
              type="radio"
              value="true"
              name="wantsElectric"
              defaultChecked
            />{' '}
            Yes
            <input
              style={{marginLeft: '0.7rem'}}
              type="radio"
              value="false"
              name="wantsElectric"
            />{' '}
            No
          </div>
          <label style={{marginRight: '0.7rem'}}>Offer Per Week: </label>
          <input
            type="number"
            onChange={e => this.setState({offerPerWeek: e.target.value})}
          />
          <div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={disabled}
              onClick={() => this.requestQuote()}>
              Request Quote
            </button>
          </div>
        </div>
      </div>
    );
  }
}
