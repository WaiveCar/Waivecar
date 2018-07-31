import React, {Component} from 'react';

export default class AddSpaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      notes: '',
    };
  }

  componentDidMount() {
    let locationInput = this.refs.location;
    let autocomplete = new google.maps.places.Autocomplete(locationInput, {
      types: ['establishment', 'geocode'],
    });

    google.maps.event.addDomListener(locationInput, 'keydown', function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    });
    let coors = document.getElementsByTagName('input')[0];
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
      this.setState({
        latitude: coord.lat(),
        longitude: coord.lng(),
        address: place.formatted_address,
      });
    });
  }

  render = () => {
    let {addSpace} = this.props;
    return (
      <div>
        <h4>Add Spaces Here:</h4>
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
        <div className="form-group row">
          <div className="col-xs-12 bento-form-input focus">
            <label>Notes</label>
            <input
              type="text"
              className="form-control"
              name="parking-notes"
              onChange={e => this.setState({notes: e.target.value})}
            />
          </div>
          <div className="form-actions text-center">
            <div className="btn-group" role="group">
              <button
                type="submit"
                className="btn btn-primary btn-wave"
                style={{marginTop: '1em'}}
                onClick={() => addSpace(this.state)}>
                Add Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
