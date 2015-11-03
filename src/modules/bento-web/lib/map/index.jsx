import React  from 'react';
import config from 'config';

export default class Map extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      mapId   : 'map-' + Math.ceil(Math.random() * 100), // TODO: use ShortId or something.
      map     : null,
      markers : []
    };
    this.addMarkers   = this.addMarkers.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      map   : L.skobbler.map(this.state.mapId, {
        apiKey : config.web.components.map.key,
        center : [ 34.0604643, -118.4186743 ],
        zoom   : 11
      })
    }, function() {
      this.state.map.scrollWheelZoom.disable();
    });
  }

  /**
   * By default we never want to re-render the skobbler map once it has been loaded.
   * Marker locations are manually added to the map via componentWillReceiveProps.
   * @method shouldComponentUpdate
   */
  shouldComponentUpdate() {
    return false;
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} props
   */
  componentWillReceiveProps(props) {
    if (this.state.map && props.markers && props.markers.length > 0) {
      this.clearMarkers();
      let markers = this.getMarkers();
      this.addMarkers(markers);
      this.centerPosition(markers);
    }
  }

  getMarkers() {
    return this.props.markers.map((val) => {
      return {
        lat  : val.location ? val.location.latitude : val.latitude,
        long : val.location ? val.location.longitude : val.longitude,
        ...val
      }
    });
  }

  centerPosition(markers) {
    let markerPoints = this.getMarkerPoints(markers);
    var bounds = new L.LatLngBounds(markerPoints);
    this.state.map.fitBounds(bounds);
  }

  getMarkerPoints(markers) {
    return markers.map((marker) => {
      return L.latLng(marker.lat, marker.long);
    })
  }

  /**
   * Adds any markers defined in the current state.
   * @method addMarkers
   * @param  {Array} markers
   */
  addMarkers(markers) {
    let markerIcon = this.getMarkerIcon();
    if (!markers) {
      return;
    }

    markers.forEach((val) => {
      let marker = L.marker([ val.lat, val.long ], { icon : markerIcon });
      this.state.markers.push(marker);
      marker.addTo(this.state.map);
      this.addMarkerClick(marker, val.id);
    }.bind(this));
  }

  /**
   * Clears any added marker from the map.
   * @method clearMarkers
   */
  clearMarkers() {
    this.state.markers.forEach(function (marker) {
      this.state.map.removeLayer(marker);
    }.bind(this));
  }

  addMarkerClick(marker, id) {
    let handler = this.props.markerHandler;
    let key     = this.props.markerHandlerKey || 'id';
    let data    = {};
    data[key]   = id;
    marker.on('mousedown', function(e) {
      console.log('moused down');
      handler(data);
    });
  }

  /**
   * Returns leaflet marker icon.
   * @method getMarkerIcon
   * @return {Object}
   */
  getMarkerIcon() {
    return L.icon({
      iconUrl       : this.props.markerIcon,
      iconRetinaUrl : this.props.markerIcon,
      iconSize      : [ 16, 20 ],
      iconAnchor    : [ 16, 20 ],
      popupAnchor   : [ 0 , 0 ]
    });
  }

  /**
   * @render
   */
  render() {
    return (
      <div className="map-wrapper animated fadeIn">
        <div id={ this.state.mapId } className="map-container" />
      </div>
    );
  }

}
