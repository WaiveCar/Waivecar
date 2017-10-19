import { api } from 'bento';
import React   from 'react';
import config  from 'config';
import ReactDOM from 'react-dom';

let icons = [
  'WAIVE1',
  'WAIVE2',
  'WAIVE3',
  'WAIVE4',
  'WAIVE5',
  'WAIVE6',
  'WAIVE7',
  'WAIVE8',
  'WAIVE9',
  'WAIVE10',
  'WAIVE11',
  'valet',
  'station',
  'homebase',
  'car-available',
  'user-location',
  'start',
  'end'
];

module.exports = class GMap extends React.Component {

  constructor(...args) {
    super(...args);
    this.map = null;
    this.markers = [];

    this.addMarkers   = this.addMarkers.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
  }

  // Creates a new skobbler map and adds it to the current map state.
  componentDidMount() {
    this.loadMap();
  }

  loadMap() {

    // center and zoom was hardcoded in bento Map component, to maintain same interface I also hardcode them
    const mapConfig = {
      center: new google.maps.LatLng(34.0604643, -118.4186743),
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false
    };

    this.map = new google.maps.Map(ReactDOM.findDOMNode(this.refs.map), mapConfig);
    if (this.props.markers) {
      this.prepareMarkers(this.props.markers);
    }

    if (this.props.path) {
      this.preparePath(this.props.path);
    }
  }

  /**
   * By default we never want to re-render the google map once it has been loaded.
   * Marker locations are manually added to the map via componentWillReceiveProps.
   */
  shouldComponentUpdate() {
    return false;
  }

  /**
   * Triggers when changes have been made to the marker array.
   * @param {Object} props
   */
  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps ");

    if (nextProps.markers) {
      this.prepareMarkers(nextProps.markers);
    }

    if (nextProps.path) {
      this.preparePath(nextProps.path);
    }
  }

  prepareMarkers(rawMarkers) {
    if (!this.map) {
      return;
    }

    let markers = this.getMarkers(rawMarkers);
    this.getUser(function(err, userMarker) {

      if (userMarker) {
        markers.push(userMarker);
      }

      if (this.markers.length > 0) {
        this.clearMarkers();
        this.addMarkers(markers);
      } else {
        this.addMarkers(markers);
        this.centerPosition(markers);
      }
    }.bind(this));
  }

  preparePath(rawPath) {
    if (!this.map) {
      return;
    }

    let path = this.getPath(rawPath);


    var polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    polyline.setMap(this.map);
  }

  getUser(next) {
    if (!(this.props.includeUser && navigator)) {
      return next();
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      this.getAddress(position.coords.latitude, position.coords.longitude, function(err, address) {
        return next(null, {
          lat     : position.coords.latitude,
          long    : position.coords.longitude,
          address : address.display_name
        });
      }.bind(this));
    }.bind(this));
  }

  getAddress(lat, long, next) {
    let url = `http://nominatim.openstreetmap.org/reverse`;
    let qs  = `format=json&zoom=18&addressdetails=1&lat=${ lat }&lon=${ long }`;
    api.external(url, qs, next);
  }

  getMarkers(rawMarkers) {
    let markers = rawMarkers.map((val) => {
      return {
        lat  : val.location ? val.location.latitude : val.latitude,
        long : val.location ? val.location.longitude : val.longitude,
        ...val
      }
    });

    return markers.filter(x => x.lat !== null);
  }

  getPath(rawPath) {
    return rawPath.map((val) => {
      return {
        lat: val[0],
        lng: val[1]
      }
    })
  }

  centerPosition(markers) {
    if (markers.length > 1) {
      var bounds = new google.maps.LatLngBounds();
      markers.forEach((val) => {
        bounds.extend(new google.maps.LatLng(val.lat, val.long));
      });
      this.map.fitBounds(bounds);
    } else {
      this.map.setCenter(new google.maps.LatLng(markers[0].lat, markers[0].long));
    }
  }

  getImportanceIcon(importance) {
    return {
      url        : `/images/map/icon-default-${ importance }.svg`,
      scaledSize : new google.maps.Size( (1.75 * importance + 6) * 3, (1.75 * importance + 7) * 4 ),
      anchor     : new google.maps.Point(8, 20 ),
      origin     : new google.maps.Point(-1, -3),
      title      : "importance"
    };
  }

  addMarkers(markers) {
    if (!markers) {
      return;
    }

    let markerIcon = this.getMarkerIcon();
    let ix = 0;
    markers.forEach((val) => {
      var importance = 0, label = '';
      if (val.license) {
        label = val.license.replace(/[^\d]*/, '');
        if (val.charge < 25 && !val.isCharging) {
          importance++;
        }
        if (val.charge < 15 && !val.isCharging) {
          importance++;
        }
        if(val.booking && val.user && !val.user.isWaivework) {
          if( moment.utc().diff(moment(val.booking[0].createdAt) ) / 1000 / 3600 > 3 ) {
            importance++;
          }
        }

        markerIcon = this.getImportanceIcon(importance);
      } else if (val.type) {
        markerIcon = this.getMarkerIcon(val.type);
      } else if (val.icon) {
        markerIcon = val.icon;
      }

      var marker = new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(val.lat, val.long),
        label: {
          fontSize: (9 + (1.3 * importance)) + 'px',
          color: 'rgba(0,0,0,' + (importance / 5 + 0.6) + ')',
          text: label,
          zIndex: importance * 100 + ix
        },
        icon: markerIcon,
        zIndex: importance * 100 + ix
      });

      ix++;
      if(val.license) {
        marker.addListener('click', function() { 
          window.location = '/cars/' + val.id;
        });
      }

      if (val.license) {
        marker.license = val.id;
      }

      this.markers.push(marker);
    });
  }

  clearMarkers() {
    this.markers.forEach(function (marker) {
      marker.setMap(null);
    });

    this.markers = [];
  }

  getMarkerIcon(name) {
    return {
      url        : name && icons.indexOf(name) !== -1 ? `/images/map/icon-${ name }.svg` : this.props.markerIcon,
      scaledSize : new google.maps.Size( 16, 20 ),
      anchor     : new google.maps.Point(8, 20 ),
      origin     : new google.maps.Point(0, 0)
    };
  }

  render() {
    return (
      <div className="map-wrapper animated fadeIn">
        <div  ref="map" className="map-container" />
      </div>
    );
  }

}
