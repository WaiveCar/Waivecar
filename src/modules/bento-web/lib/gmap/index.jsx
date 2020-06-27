import { api } from 'bento';
import React   from 'react';
import config  from 'config';
import ReactDOM from 'react-dom';
import moment   from 'moment';

let icons = [
  'valet',
  'station',
  'homebase',
  'user-parking',
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
    //console.log(this.props);
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
    /*
    google.maps.event.addDomListener(this.refs.map, 'click', (e) => {
      this.addMarker(e)
    });
    */
    this.map.addListener('click', (e) => {
      this.addMarker(e.latLng)
    });

    if (this.props.markers) {
      this.prepareMarkers(this.props.markers);
    }

    if (this.props.path) {
      var opts = {};
      if(this.props.editPath) {
        opts.draggable = true;
      }
      this.preparePath(this.props.path, opts);
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
      } else if (rawMarkers.length) {
        this.addMarkers(markers);
        this.centerPosition(markers);
      }
    }.bind(this));
  }

  preparePath(rawPath, opts) {
    if (!this.map) {
      return;
    }


    if (this.props.heatmap) {
     let heatData = this.getHeatMap(rawPath);
     var heatmap = new google.maps.visualization.HeatmapLayer(Object.assign(opts || {}, {
      data: heatData
     }));
     heatmap.setMap(this.map);
    } else {
     let path = this.getPath(rawPath);
     var polyline = new google.maps.Polyline(Object.assign(opts || {}, {
       path: path,
       geodesic: true,
       strokeColor: '#0000FF',
       strokeOpacity: 1.0,
       strokeWeight: 2
     }));
    polyline.setMap(this.map);
    }

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

  getHeatMap(rawPath) {
   return rawPath.map((val) => {
     return(new google.maps.LatLng(val[0],val[1]))
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

      var lat, lng;

      if(!markers[0].lat) {
        lat = markers[0].shape[0][1];
        lng = markers[0].shape[0][0];
      } else {
        lat = markers[0].lat;
        lng = markers[0].long;
      }

      this.map.setCenter(new google.maps.LatLng(lat, lng));
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
    let infoWindow = new google.maps.InfoWindow;

    let markerIcon = this.getMarkerIcon();
    let ix = 0;
    markers.forEach((val) => {
      var 
        lastFormatted = '',
        marker = false,
        importance = 1, 
        label = val.name;
      if (val.shape) {
        var coor = val.shape.map(function(row) { return {lat: row[1], lng: row[0] }; });
        marker = new google.maps.Polygon({
          paths: coor,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });
        marker.setMap(this.map);
      } else if (val.license) {
        let duration = (moment.duration(moment.utc().diff(moment(val.lastActionTime)))).asMilliseconds();
        let lastAction = parseInt(moment.utc(duration).format('H'), 10);
        lastFormatted = moment.utc(duration).format('H:mm');

        label = val.license.replace(/[^\d]*/, '');
        if(!val.inRepair) {
          if(val.user) {
            label = [val.user.firstName[0], val.user.lastName].join(' ')
            if(val.user.isWaivework) {
              importance = 2;
            }
          }
        }

        /*
        if(val.booking && val.user && !val.user.isWaivework) {
          if( moment.utc().diff(moment(val.booking[0].createdAt) ) / 1000 / 3600 > 3 ) {
            importance++;
          }
        }
        */

        markerIcon = this.getImportanceIcon(importance);
      } else if (val.type) {
        markerIcon = this.getMarkerIcon(val.type);
      } else if (val.icon) {
        markerIcon = val.icon;
      }

      if(!marker) {
        let props = {
          map: this.map,
          position: new google.maps.LatLng(val.lat, val.long),
          icon: markerIcon,
          zIndex: importance * 100 + ix
        };

        if(label) {
          props.label = {
            fontSize: (9 + (1.3 * importance)) + 'px',
            color: 'rgba(0,0,0,' + (importance / 5 + 0.6) + ')',
            text: label,
            zIndex: importance * 100 + ix
          };
        }

        marker = new google.maps.Marker(props);
      }

      ix++;
      if(val.license) {
        marker.addListener('click', function(e) { 
          var content = `<div style="font-size:15px;margin-bottom:0.15em"><b><a href=/cars/${ val.id }>${ val.license }</a></b> (${ val.charge }%)</div>`;
          if(val.user) {
            content += `<div><a style="color:darkgreen" href=/users/${ val.user.id }>${ val.user.firstName } ${ val.user.lastName }</a></div>`;
          }
          if(val.booking) {
            if(val.booking.length) {
              let bid = val.booking[0].id;
              content += `<div> ${ val.booking[0].status } <a style="color:darkgreen" href=/bookings/${ bid }>Booking ${bid}</a></div>`;
            }
            content += `<div>${ lastFormatted }</div>`;
          }
          infoWindow.setContent(content);
          infoWindow.setPosition(e.latLng);
          infoWindow.open(this.map);
        });
      } else if ('radius' in val) {
        let {forOrg, orgId} = this.props;
        marker.addListener('click', (e) => {
          val.description = val.description || '';
          let linkText = this.props.parking ? `<a href=/waivepark/${val.spaceId}>${val.name}</a>` : forOrg ? `<a href=/organizations/${orgId}/hubs/${val.id}>${val.name}</a>` : `<a href=/locations/${ val.id }>${ val.name }</a>`;
          infoWindow.setContent(`<b>${linkText}</b> (${ val.type })<div style="width:20em">${ val.description }</div><em>${ val.address }</em>`);
          infoWindow.setPosition(e.latLng);
          infoWindow.open(this.map);
          //window.location = '/locations/' + val.id;
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

  addMarker(latLng) {
    let marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
    });
    console.log(marker)
  }

  render() {
    return (
      <div className="map-wrapper">
        <div ref="map" className="map-container" />
      </div>
    );
  }

}
