import React                    from 'react';
import ReactSelect              from 'react-select';
import { api }                  from 'bento';
import { snackbar }             from 'bento-web';


class LocationsIndex extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state = {
      type: "dropoff"
    };

    this.locationTypes = [
      {value : 'station', label:'Charging Station'},
      {value : 'valet', label:'valet'},
      {value : 'homebase', label:'HomeBase'},
      {value : 'item-of-interest', label:'Item Of Interest'},
      {value : 'dropoff', label:'Dropoff'},
    ];

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);

  }

  handleTypeChange(value) {
    this.setState({
      type: value
    });
  }

  handleInputChange(event) {

    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {

    api.post('/locations', this.state, (err) => {

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


  componentDidMount() {
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

      this.setState({
        latitude: coord.lat(),
        longitude: coord.lng(),
        address: place.formatted_address
      });
    });
  }

  render() {
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
                        <label>Type</label>
                        <ReactSelect
                          name        = "type"
                          value       = {this.state.type}
                          options     = {this.locationTypes }
                          onChange    = {this.handleTypeChange}
                          />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Location</label>
                        <input type="text" className="form-control" name="location" ref="location"/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Radius</label>
                        <input type="number" className="form-control" name="radius" onChange={this.handleInputChange}/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Name</label>
                        <input type="text" className="form-control" name="name" onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <div className="form-actions text-center">
                      <div className="btn-group" role="group">
                        <button type="submit" className="btn btn-primary btn-wave" >submit</button>
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
