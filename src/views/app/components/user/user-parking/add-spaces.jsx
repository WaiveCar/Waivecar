import React, {Component} from 'react';

export default class AddSpaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
    };
  }

  componentDidMount() {
    let locationInput = this.refs.location;
    let autocomplete = new google.maps.places.Autocomplete(locationInput, {
      types: ['establishment', 'geocode'],
    });
    let ctrl = this;
    google.maps.event.addDomListener(locationInput, 'keydown', function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    });
    let coors = document.getElementsByTagName('textarea')[0];
    coors.onfocus = () => {
      this.disableTA = true;
    };
    coors.onblur = () => {
      localStorage['coordinates'] = coors.value;
      this.disableTA = false;
    };
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();
      let coord = place.geometry.location;
      this.setState(
        {
          latitude: coord.lat(),
          longitude: coord.lng(),
          address: place.formatted_address,
        },
        () => console.log('state with location: ', this.state),
      );
    });
  }

  render = () => {
    let {address} = this.state;
    return (
      <div>
        Add Spaces Here Address:
        <div className="form-group row">
          <div className="col-xs-12 bento-form-input focus">
            <label>Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              defaultValue="Enter an address"
              ref="location"
            />
          </div>
        </div>
      </div>
    );
  };
}
