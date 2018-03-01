import React                    from 'react';
import ReactSelect              from 'react-select';
import { api }                  from 'bento';
import { snackbar }             from 'bento-web';
import Switch                   from 'react-toolbox/lib/switch';


class LocationsIndex extends React.Component {

  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state = {
      type: "hub"
    };

    this.locationTypes = [
      {value : 'hub', label:'Hub'},
      {value : 'zone', label:'Zone'},
      {value : 'parking', label:'Parking'},
      {value : 'station', label:'Charging Station'},
      {value : 'valet', label:'Valet'},
      {value : 'homebase', label:'HomeBase'},
      {value : 'item-of-interest', label:'Item Of Interest'},
    ];

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);

    setInterval(function() {
      var coors = document.getElementsByTagName('textarea')[0];
      coors.value = localStorage['coordinates'];
    }, 100);
  }

  handleTypeChange(value) {
    this.setState({
      type: value
    });
  }

  handleIsPublicChange(value) {
    this.setState({
      isPublic: value
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
                        <Switch checked={ this.state.isPublic } label="Show in the APP" onChange={this.handleIsPublicChange} />
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
                        <label>Name</label>
                        <input type="text" className="form-control" name="name" onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Description</label>
                        <input type="text" className="form-control" name="description" onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <p>Specify a radius or a polygon (leave one blank)</p>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Radius (in US Feet, 0.3048m) </label>
                        <input type="number" className="form-control" name="radius" onChange={this.handleInputChange}/>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Polygon (1. <a target="_blank" href="http://www.gmapgis.com/">Draw a Polygon</a> 2. Save as KML 3. Copy and paste the numbers)</label>
                        <textarea rows="5" placeholder="-118.27366,34.03844,0.0&#10;-118.27272,34.0453,0.0&#10;-118.25838,34.05358,0.0&#10;-118.24843,34.06226,0.0&#10;-118.23641,34.0565,0.0" className="form-control" name="shape" onChange={this.handleInputChange} />
                      </div>
                    </div>
  
                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <iframe src='/map.html' style={{ width: '100%', height: '550px' }}></iframe>
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-xs-12 bento-form-input focus">
                        <label>Parking restrictions</label>
                        <textarea rows="5" placeholder="MON10:00PM-TUE02:00AM&#10;ALL10:00PM-ALL11:00PM" className="form-control" name="restrictions" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    
                    <div className="form-group row">
  
                      <div className="col-xs-12 ">
                        <div>Street type</div>
                        <div className="radio-inline">
                          <label>
                            <input type="radio" name="streetType" onChange={this.handleInputChange} value="commercial"/>
                            Commercial
                          </label>
                        </div>
  
                        <div className="radio-inline">
                          <label>
                            <input type="radio" name="streetType" onChange={this.handleInputChange} value="residential"/>
                            Residential
                          </label>
                        </div>
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
