import React                    from 'react';
import ReactSelect              from 'react-select';
import { api }                  from 'bento';
import { snackbar }             from 'bento-web';
import Switch                   from 'react-toolbox/lib/switch';
import { GMap }          from 'bento-web';

class LocationsIndex extends React.Component {

  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state = {
      loading: true
    };

    this.locationTypes = [
      {value : 'hub', label:'Hub'},
      {value : 'zone', label:'Zone'},
      {value : 'station', label:'Charging Station'},
      {value : 'valet', label:'Valet'},
      {value : 'homebase', label:'HomeBase'},
      {value : 'item-of-interest', label:'Item Of Interest'}
    ];

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
  }

  handleTypeChange(value) {
    this.state.location.type = value;
  }

  handleIsPublicChange(value) {
    this.state.location.isPublic = value;
    this.forceUpdate();
  }

  handleInputChange(event) {

    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.state.location[name] = value;
  }

  handleSubmit(event) {

    var data = this.state.location;

    api.put('/locations/' + this.props.params.id, data, (err) => {

      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }

      document.location = '/locations';

    });
    event.preventDefault();
  }

  handleDelete() {
    if (this.props.params.id && confirm("Are you sure you want to delete " + this.state.location.name + "?")) {
      api.delete(`/locations/${ this.props.params.id }`, (err) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }

        document.location = '/locations';
      });
    }
  }

  componentDidMount() {
    if (this.props.params.id) {
      this.setState({loading: true});
      api.get(`/locations/${ this.props.params.id }`, (err, location) => {
        if(location.shape) {
          location.path = JSON.parse(location.shape)
        }
        this.setState({location: location, loading: false});

        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
      });
    }
  }

  componentDidUpdate() {
    if (!this.state.loading && !this.adressIsInitialized) {
      let locationInput = this.refs.location;
      let autocomplete =  new google.maps.places.Autocomplete(locationInput, {types: ['establishment', 'geocode']});

      google.maps.event.addDomListener(locationInput, 'keydown', function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        }
      });

      autocomplete.addListener("place_changed", () => {

        let place = autocomplete.getPlace();
        let coord = place.geometry.location;

        this.state.location.address = place.formatted_address;
        this.state.location.latitude = coord.lat();
        this.state.location.longitude = coord.lng();
      });
    }
  }

  render() {

    if (this.state.loading) {
      return (
          <div className="box-empty">
            Loading the location details...
          </div>
      );
    }

    let location = this.state.location;

    return (
      <div className="location-show">
        <section className="container">
          <div className="row">
            <div className="col-xs-12">
              <div className="box">
                <div className="box-content">
                  <form className="bento-form" onSubmit={this.handleSubmit}>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>ID</label>
                        <input type="text" className="form-control" name="id" defaultValue={ location.id } onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Type</label>
                        <ReactSelect
                          name        = "type"
                          value       = {location.type}
                          options     = {this.locationTypes }
                          onChange    = {this.handleTypeChange}
                          />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <Switch checked={ this.state.location.isPublic } label="Show in the APP" onChange={this.handleIsPublicChange} />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Location</label>
                        <input type="text" className="form-control" name="location" defaultValue={ location.address }  ref="location"/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Name</label>
                        <input type="text" className="form-control" name="name" defaultValue={ location.name } onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Description</label>
                        <input type="text" className="form-control" name="description" defaultValue={ location.description } onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <p>Specify a radius or a polygon (leave one blank)</p>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Radius (in US Feet, 0.3048m) </label>
                        <input type="number" className="form-control" name="radius"  defaultValue={ location.radius } onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    { location.path &&
                      <GMap
                          markers    = { [{shape: location.path}] }
                          editPath   = "true"
                      />
                    }
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <textarea rows="5" placeholder="-118.27366,34.03844,0.0&#10;-118.27272,34.0453,0.0&#10;-118.25838,34.05358,0.0&#10;-118.24843,34.06226,0.0&#10;-118.23641,34.0565,0.0" className="form-control" name="shape" defaultValue={ location.shape } onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="form-actions text-center">
                      <div className="btn-group" role="group">
                        <button type="button" className="btn btn-danger btn-wave" onClick={() => this.handleDelete()} >delete</button>
                        <button type="submit" className="btn btn-primary btn-wave" >update</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
};

module.exports = LocationsIndex;
