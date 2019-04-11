import React, {Component} from 'react';

export default class WaiveWorkRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rideshare: 'true',
      wantsElectric: 'true',
      offerPerWeek: null,

    }
  }

  render() {
    return (
      <div className="box">
        <h3>
          WaiveWork Quote Request
          <small>Request an insurance quote for this user</small>
        </h3>
        <div className="box-content">
          <label>For Rideshare</label>
          <div onChange={(e) => this.setState({rideshare: e.target.value})}>
            <input type="radio" value="true" name="rideshare" defaultChecked/> yes
            <input type="radio" value="false" name="rideshare"/> no
          </div>
          <label>Prefers Electric</label>
          <div onChange={(e) => this.setState({wantsElectric: e.target.value})}>
            <input type="radio" value="true" name="wantsElectric" defaultChecked/> yes
            <input type="radio" value="false" name="wantsElectric" /> no
          </div>
          <label>Offer Per Week</label>
          <input type="number" onChange={(e) => this.setState({offerPerWeek: e.target.value})}/>
        </div>
      </div>
    );
  };
}
