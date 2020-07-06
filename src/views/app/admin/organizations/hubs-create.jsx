import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, auth} from 'bento';
import {Form, GMap} from 'bento-web';

let buttons = [
  {
    value: 'Create Hub',
    type: 'submit',
    class: 'btn btn-primary btn-profile-submit',
  },
];

class HubsCreate extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      orgSearchWord: '',
      currentOrganization: null,
      searchResults: [],
      type: 'hub',
      latitude: null,
      longitude: null,
      address: '',
    };
    this._user = auth.user();
  }

  componentDidMount() {
    this.locationInput = this.refs.location;
    this.autocomplete = new google.maps.places.Autocomplete(
      this.locationInput,
      {
        types: ['establishment', 'geocode'],
      },
    );
    this.autocomplete.addListener('place_changed', () => {
      let place = this.autocomplete.getPlace();
      let coord = place.geometry.location;
      this.refs['location-map'].clearMarkers();
      this.refs['location-map'].addMarker(coord, () => {
        this.setState({
          latitude: coord.lat(),
          longitude: coord.lng(),
          address: place.formatted_address,
        });
      });
    });
  }

  orgSearch() {
    let {orgSearchWord, currentOrganization} = this.state;
    api.get(
      `/organizations/?name=${orgSearchWord}${
        currentOrganization ? `&excluded=[${currentOrganization.id}]` : ''
      }`,
      (err, res) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: res});
      },
    );
  }

  createHub(e) {
    e.preventDefault();
  }

  render() {
    let {
      orgSearchWord,
      currentOrganization,
      searchResults,
      address,
    } = this.state;
    let organizationId = this.props.params.id;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add A Hub</h3>
        <div className="box-content">
          <h4>Location</h4>
          <div className="row" style={{marginBottom: '1.5rem'}}>
            <div className="col-xs-12">
              <div className="map-dynamic">
                <GMap
                  ref={'location-map'}
                  markerIcon={'/images/map/icon-homebase.svg'}
                  handleMarker={true}
                  onMarkerChange={loc => {
                    let geocoder = new google.maps.Geocoder();
                    geocoder.geocode({location: loc}, res => {
                      this.setState({
                        latitude: loc.lat(),
                        longitude: loc.lng(),
                        address: res[0].formatted_address,
                      });
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {!organizationId ? (
            this._user.organizations.length ? (
              <div>
                <h4>Organization</h4>
                {this._user.organizations.map((org, i) => (
                  <div key={i} style={{marginLeft: '2rem'}}>
                    <input
                      onChange={() =>
                        this.setState({currentOrganization: org.organization})
                      }
                      type={'radio'}
                      checked={
                        currentOrganization &&
                        org.organizationId === currentOrganization.id
                      }
                      name={`org-${i}`}
                      id={`org-${i}`}
                      style={{verticalAlign: 'middle', marginRight: '5px'}}
                    />
                    <label htmlFor={`org-${i}`}>{org.organization.name}</label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row">
                <h4>Search for Organizations</h4>
                <div style={{marginLeft: '2rem', marginRight: '2rem'}}>
                  <div
                    className="row"
                    style={{
                      marginTop: '10px',
                    }}>
                    <input
                      onChange={e =>
                        this.setState({orgSearchWord: e.target.value})
                      }
                      value={orgSearchWord}
                      style={{marginTop: '1px', padding: '2px', height: '40px'}}
                      className="col-xs-6"
                      placeholder="Organizations Name"
                    />
                    <button
                      className="btn btn-primary btn-sm col-xs-6"
                      onClick={() => this.orgSearch()}>
                      Find Organization
                    </button>
                  </div>
                  {searchResults.map((item, i) => (
                    <div
                      key={i}
                      className="row"
                      style={{marginLeft: '2rem', marginRight: '2rem'}}>
                      <div style={{padding: '10px 0'}} className="col-xs-6">
                        <Link to={`/organizations/${item.id}`} target="_blank">
                          {item.name}
                        </Link>
                      </div>
                      <button
                        className="btn btn-link col-xs-6"
                        onClick={() =>
                          this.setState({currentOrganization: item})
                        }>
                        Add
                      </button>
                    </div>
                  ))}
                  {currentOrganization && (
                    <h4 style={{marginTop: '10px'}}>
                      Selected: {currentOrganization.name}
                    </h4>
                  )}
                </div>
              </div>
            )
          ) : (
            ''
          )}
          <div className="form-group row">
            <div className="col-xs-12 bento-form-input focus">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                name="location"
                ref="location"
                onChange={e => this.setState({address: e.target.value})}
                value={address}
              />
            </div>
          </div>
          <div className="box-content">
            <Form
              ref="createStatement"
              className="bento-form-static"
              fields={require('./hub-form')}
              buttons={buttons}
              submit={e => this.createHub(e)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default HubsCreate;
