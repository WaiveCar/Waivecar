'use strict';

import React from 'react';

export default class Mapping extends React.Component {

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
        apiKey : '7ef929e2c765b1194804e5e8ca284c5a',
        center : [ 34.0604643, -118.4186743 ],
        zoom   : 11
      })
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
    if (this.state.map) {
      this.clearMarkers();
      this.addMarkers(props.markers);
    }
  }

  /**
   * Adds any markers defined in the current state.
   * @method addMarkers
   * @param  {Array} markers
   */
  addMarkers(markers) {
    let markerIcon = this.getMarkerIcon();
    markers.forEach((val) => {
      let marker = L.marker([ val.location.latitude, val.location.longitude ], { icon : markerIcon });
      this.state.markers.push(marker);
      marker.addTo(this.state.map);
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
