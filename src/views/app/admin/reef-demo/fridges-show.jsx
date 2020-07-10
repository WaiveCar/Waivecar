import React, {Component} from 'react';
import {GMap} from 'bento-web';
import {api} from 'bento';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fridge: null,
    };
  }

  componentDidMount() {
    let {id} = this.props.params;
    api.get(`/cars/${id}`, (err, res) => this.setState({fridge: res}));
  }

  render() {
    let {fridge} = this.state;
    console.log(fridge);
    let fridgeData = fridge && JSON.parse(fridge.fridgeData);
    console.log(fridgeData);
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
              <h4>Data</h4>
              <div>
                <table className="table-logs">
                  <thead>
                    <tr ref="sort">
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(fridgeData).map((key, i) => (
                      <tr key={i}>
                        <td>{key}</td>
                        <td>{fridgeData[key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
}
