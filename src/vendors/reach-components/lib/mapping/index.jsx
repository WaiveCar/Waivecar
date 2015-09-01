'use strict';

import React from 'react';

export default class Mapping extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      map : 0
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    const position = [ 34.0604643, -118.4186743 ];
    this.mapElement = L.skobbler.map('map', {
      apiKey : '7ef929e2c765b1194804e5e8ca284c5a',
      center : position,
      zoom   : 11
    });
    this.setState({
      map : this.mapElement
    });
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    this.mapElement.remove();
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
    if (this.props.markers) {
      this.props.markers.forEach(function(marker) {
        L.marker([ marker.location.latitude, marker.location.longitude ], { icon : this.getMarkerIcon() }).addTo(this.state.map);
      }.bind(this));
    }
    return (
      <section className="card card-body-map">
        <div id="map" style={{ height : '600px', width : '100%' }} />
      </section>
    );
  }

}
