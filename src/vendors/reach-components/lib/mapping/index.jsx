'use strict';

import React from 'react';

export default class Mapping extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      map : 0
    };
  }

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

  componentWillUnmount() {
    //super.componentWillUnmount();
    this.mapElement.remove();
  }

  render() {
    let self = this;
    if (this.props.markers) {
      let waiveCarIcon = L.icon({
        iconUrl       : this.props.markerIcon,
        iconRetinaUrl : this.props.markerIcon,
        iconSize      : [ 16, 20 ],
        iconAnchor    : [ 16, 20 ],
        popupAnchor   : [ 0 , 0 ]
      });

      this.props.markers.forEach(function(m) {
        L.marker([ m.location.latitude, m.location.longitude ], { icon : waiveCarIcon }).addTo(self.state.map);
      });
    }

    const map = this.mapElement;

    return (
      <section className="card card-body-map">
        <div className="card-header">
          <h2>{ this.props.title }</h2>
          <p>{ this.props.description }</p>
        </div>
        <div className="card-body">
          <div id="map" style={{ height : '600px', width : '100%' }} />
        </div>
      </section>
    );
  }

}
