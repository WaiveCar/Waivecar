'use strict';

import React from 'react';

let markers = [];

export default class Mapping extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      map : null
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.clearMarkers = this.clearMarkers.bind(this);
    this.setState({
      map : L.skobbler.map('map', {
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
    this.clearMarkers();
    let markerIcon = this.getMarkerIcon();
    props.markers.forEach(function(car) {
      let marker = L.marker([ car.location.latitude, car.location.longitude ], { icon : markerIcon });
      markers.push(marker);
      marker.addTo(this.state.map);
    }.bind(this));
  }

  /**
   * Clears any added marker from the map.
   * @method clearMarkers
   */
  clearMarkers() {
    markers.forEach(function (marker) {
      this.state.map.removeLayer(marker);
    }.bind(this));
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    this.state.map.remove();
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
   * @method getMapStyle
   */
  getMapStyle() {
    return { 
      height : '600px', 
      width  : '100%' 
    };
  }

  /**
   * @render
   */
  render() {
    return (
      <section className="card card-body-map">
        <div id="map" style={ this.getMapStyle() } />
      </section>
    );
  }

}
