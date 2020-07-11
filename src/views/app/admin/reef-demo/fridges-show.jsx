import React, {Component} from 'react';
import {GMap, Form} from 'bento-web';
import {api, auth} from 'bento';
import {fields, snackbar} from 'bento-ui';
import {Link} from 'react-router';
import moment from 'moment';

let formFields = [
  [
    {
      label: 'Max Fridge Temperature',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'fridge',
    },
    {
      label: 'Max Freezer Temperature',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'freezer',
    },
    {
      label: 'Max Humidity',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'humidity',
    },
    {
      label: 'Update Interval',
      component: 'input',
      type: 'text',
      className: 'col-md-6 bento-form-input',
      name: 'interval',
    },
  ],
];

let defaultValues = {
  fridge: 40,
  freezer: 31,
  humidity: 90,
  interval: 60,
};

export default class extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
    this.state = {
      fridge: null,
      search: '',
      searchResults: [],
      selected: null,
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

  search() {
    let {search} = this.state;
    api.get(
      `/users?search="${search}"${
        this._user.organizations.length
          ? `&organizationIds=[${this._user.organizations.map(
              org => org.organizationId,
            )}]`
          : ''
      }`,
      (err, userList) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({
          searchResults: userList,
        });
      },
    );
  }

  render() {
    let {fridge, search, searchResults, selected} = this.state;
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
              {!selected ? (
                <div
                  className="row"
                  style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                  <div className="col-md-9">
                    <div className="row" style={{marginTop: '10px'}}>
                      <input
                        onChange={e => this.setState({search: e.target.value})}
                        value={search}
                        style={{
                          marginTop: '1px',
                          padding: '2px',
                          height: '40px',
                        }}
                        className="col-xs-6"
                        placeholder="Search For User To Notify"
                      />
                      <button
                        className="btn btn-primary btn-sm col-xs-6"
                        onClick={() => this.search()}>
                        Find User
                      </button>
                    </div>
                    {searchResults &&
                      searchResults.map((user, i) => (
                        <div key={i} className="row">
                          <div style={{padding: '10px 0'}} className="col-xs-6">
                            <Link to={`/cars/${user.id}`} target="_blank">
                              {user.firstName} {user.lastName}
                            </Link>
                          </div>
                          <button
                            className="btn btn-link col-xs-6"
                            onClick={() => this.setState({selected: user})}>
                            select
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className="row"
                  style={{display: 'flex', justifyContent: 'center'}}>
                  <div className="col-md-9">
                    <button
                      className="btn btn-link col-xs-6"
                      onClick={() => {}}>
                      selected:
                    </button>
                    <div style={{padding: '10px 0'}} className="col-xs-6">
                      <Link to={`/cars/${selected.id}`} target="_blank">
                        {selected.firstName} {selected.lastName}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <Form
                ref="car"
                className="bento-form-static"
                fields={formFields}
                default={defaultValues}
                buttons={[
                  {
                    value: 'Update Notifications',
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
