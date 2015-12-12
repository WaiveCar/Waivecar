import { api } from 'bento';
import React   from 'react';
import config  from 'config';


module.exports = class Map extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      mapId   : 'map-' + Math.ceil(Math.random() * 100), // TODO: use ShortId or something.
      markers : [],
    };
    // this.addMarkers   = this.addMarkers.bind(this);
    // this.clearMarkers = this.clearMarkers.bind(this);
  }

  /**
   * Creates a new skobbler map and adds it to the current map state.
   */
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGdpIiwiYSI6ImNpZzBoNHNnbDA2bmx0OGt4ZDRlaTN4NWcifQ.FZW1WQ5gRl7E4GnLVOy6Fg'; //config.web.components.map.key;
    this.map = new mapboxgl.Map({
      container : 'map',
      style     : 'mapbox://styles/mapbox/streets-v8',
      center    : [ -118.4186743, 34.0604643  ],
      zoom      : 14
    });

    // this.map.on('style.load', () => {
    //   this.map.addSource('satellite', {
    //     type: 'raster',
    //     url: 'mapbox://mapbox.satellite'
    //   });
    //   this.map.addLayer({
    //     'id': 'satellite',
    //     'type': 'raster',
    //     'source': 'satellite',
    //     'layout': {
    //       'visibility': 'none'
    //     }
    //   });
    // });
    //this.prepareMarkers();
  }

  componentDidUpdate() {
    // if (this.props.baselayer === 'satellite') {
    //   this.map.setLayoutProperty('satellite', 'visibility', 'visible');
    // } else {
    //   this.map.setLayoutProperty('satellite', 'visibility', 'none');
    // }
  }

  componentWillUnmount() {
    this.map.remove();
  }

  // /**
  //  * By default we never want to re-render the skobbler map once it has been loaded.
  //  * Marker locations are manually added to the map via componentWillReceiveProps.
  //  */
  // shouldComponentUpdate() {
  //   return false;
  // }

  // /**
  //  * Triggers when changes have been made to the marker array.
  //  * @param {Object} props
  //  */
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.markers) {
  //     this.prepareMarkers();
  //   }
  // }

  // /**
  //  * Prepares a list of markers.
  //  */
  // prepareMarkers() {
  //   if (!this.state.map) {
  //     return;
  //   }
  //   let markers = this.getMarkers();
  //   this.getUser(function(err, userMarker) {
  //     if (userMarker) {
  //       markers.push(userMarker);
  //     }

  //     if (this.state.markers.length > 0) {
  //       this.clearMarkers();
  //       this.addMarkers(markers);
  //     } else {
  //       this.addMarkers(markers);
  //       this.centerPosition(markers);
  //     }
  //   }.bind(this));
  // }

  // getUser(next) {
  //   if (!(this.props.includeUser && navigator)) {
  //     return next();
  //   }

  //   navigator.geolocation.getCurrentPosition(function(position) {
  //     this.getAddress(position.coords.latitude, position.coords.longitude, function(err, address) {
  //       return next(null, {
  //         lat     : position.coords.latitude,
  //         long    : position.coords.longitude,
  //         address : address.display_name
  //       });
  //     }.bind(this));
  //   }.bind(this));
  // }

  // getAddress(lat, long, next) {
  //   let url = `http://nominatim.openstreetmap.org/reverse`;
  //   let qs  = `format=json&zoom=18&addressdetails=1&lat=${ lat }&lon=${ long }`;
  //   api.external(url, qs, next);
  // }

  // /**
  //  * Returns a list of skobbler friendly markers based on the markers defined in the
  //  * component properties.
  //  * @return {Array}
  //  */
  // getMarkers() {
  //   let markers = this.props.markers.map((val) => {
  //     return {
  //       lat  : val.location ? val.location.latitude : val.latitude,
  //       long : val.location ? val.location.longitude : val.longitude,
  //       ...val
  //     }
  //   });

  //   return markers.filter(x => x.lat !== null);
  // }

  // *
  //  * Centers the position around the marker points.
  //  * @param  {Array} markers

  // centerPosition(markers) {
  //   let markerPoints = this.getMarkerPoints(markers);
  //   let bounds       = new L.LatLngBounds(markerPoints);
  //   this.state.map.fitBounds(bounds);
  // }

  // /**
  //  * Returns a map of marker points.
  //  * @param  {Array} markers
  //  * @return {Array}
  //  */
  // getMarkerPoints(markers) {
  //   return markers.map((marker) => {
  //     return L.latLng(marker.lat, marker.long);
  //   });
  // }

  // /**
  //  * Adds any markers defined in the current state.
  //  * @method addMarkers
  //  * @param  {Array} markers
  //  */
  // addMarkers(markers) {
  //   if (!markers) {
  //     return;
  //   }

  //   let markerIcon = this.getMarkerIcon();
  //   markers.forEach((val) => {
  //     if (val.license) {
  //       markerIcon = this.getMarkerIcon(val.license);
  //     } else if (val.type) {
  //       markerIcon = this.getMarkerIcon(val.type);
  //     } else if (val.icon) {
  //      markerIcon = val.icon;
  //     }
  //     let marker = L.marker([ val.lat, val.long ], { icon : markerIcon });
  //     this.state.markers.push(marker);
  //     marker.addTo(this.state.map);
  //     this.addMarkerClick(marker, val.id);
  //   }.bind(this));
  // }

  // /**
  //  * Clears any added marker from the map.
  //  */
  // clearMarkers() {
  //   this.state.markers.forEach(function (marker) {
  //     this.state.map.removeLayer(marker);
  //   }.bind(this));
  // }

  // /**
  //  * Adds a marker click handler to the provided marker.
  //  * @param {Object} marker
  //  * @param {String} id
  //  */
  // addMarkerClick(marker, id) {
  //   let handler = this.props.markerHandler;
  //   let key     = this.props.markerHandlerKey || 'id';
  //   let data    = {};
  //   data[key]   = id;
  //   marker.on('mousedown', function(e) {
  //     console.log('moused down');
  //     handler(data);
  //   });
  // }

  // /**
  //  * Returns leaflet marker icon.
  //  * @return {Object}
  //  */
  // getMarkerIcon(name) {
  //   return L.icon({
  //     iconUrl       : name ? `/images/map/icon-${ name }.svg` : this.props.markerIcon,
  //     iconRetinaUrl : name ? `/images/map/icon-${ name }.svg` : this.props.markerIcon,
  //     iconSize      : [ 16, 20 ],
  //     iconAnchor    : [ 16, 20 ],
  //     popupAnchor   : [ 0 , 0 ]
  //   });
  // }

  /**
   * @render
   */
  render() {
    return (
      <div className="map-wrapper animated fadeIn">
        <div id="map" className="map-container" />
      </div>
    );
  }

}
