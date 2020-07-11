import React, {Component} from 'react';
import {GMap, Form} from 'bento-web';
import {api, relay} from 'bento';
import {fields} from 'bento-ui';
import moment from 'moment';

let formFields = [
  [
    {
      label: 'Max Fridge Temperature',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'fridge',
      required: true,
    },
    {
      label: 'Max Freezer Temperature',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'freezer',
      required: true,
    },
    {
      label: 'Max Humidity',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'humidity',
      required: true,
    },
    {
      label: 'Update Interval',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'humidity',
      required: true,
    },
  ],
];

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fridge: null,
    };
  }

  componentDidMount() {
    this.fetchFridge(() => {
      this.interval = setInterval(() => this.fetchFridge(), 5000);
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  fetchFridge(cb) {
    let {id} = this.props.params;
    api.get(`/cars/${id}`, (err, res) =>
      this.setState({fridge: res}, () => {
        if (cb) {
          cb();
        }
      }),
    );
  }

  convertTemp(val) {
    return (val * (9 / 5) + 32).toFixed(2) + ' F';
  }

  convertHumid(val) {
    return val + '%';
  }

  convertTime(val) {
    return val
      ? moment(val).subtract(7, 'hours').format('MM/DD: h:mm:SSA')
      : 'never';
  }

  convertBool(val) {
    return val ? 'yes' : 'no';
  }

  render() {
    let {fridge} = this.state;
    let fridgeData = fridge && JSON.parse(fridge.fridgeData);
    return (
      fridge && (
        <div className="logs">
          <div className="box">
            <h3>{fridge.license}</h3>
            <div className="box-content">
              <h4>Location</h4>
              <div className="row" style={{marginBottom: '1.5rem'}}>
                <div className="col-xs-12">
                  <div className="map-short">
                    <GMap
                      markerIcon={'/images/map/active-waivecar.svg'}
                      markers={[
                        {
                          latitude: fridge.latitude,
                          longitude: fridge.longitude,
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div>
                <table className="table-logs">
                  <thead>
                    <tr ref="sort">
                      <th>Attribute</th>
                      <th>Latest Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Temp', 'Fridge Temperature', this.convertTemp],
                      ['Temp_2', 'Freezer Temperature', this.convertTemp],
                      ['Humidity', 'Humidity', this.convertHumid],
                      ['created_at', 'Last Seen At', this.convertTime],
                      ['Jolt_event', 'Recent Jolt', this.convertBool],
                      ['Fridge_door', 'Door Open', this.convertBool],
                      ['Last_fault', 'Last Fault', this.convertTime],
                    ].map(([key, name, func], i) => (
                      <tr key={i}>
                        <td>{name}</td>
                        <td>
                          {func ? func(fridgeData[key]) : fridgeData[key]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 style={{marginTop: '1rem'}}>Notification Settings</h4>
              <Form
                ref="car"
                className="bento-form-static"
                fields={formFields}
                default={{}}
                buttons={[
                  {
                    value: 'Update Intervals',
                    type: 'submit',
                    class: 'btn btn-primary btn-profile-submit',
                  },
                ]}
                submit={e => e.preventDefault}
              />
            </div>
          </div>
        </div>
      )
    );
  }
}
