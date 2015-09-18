'use strict';

import React       from 'react';
import Reach       from 'reach-react';
import { Map }     from 'reach-components';

let Relay   = Reach.Relay;
let Actions = Relay.getActions();

export default function (view, fields, resource) {

  const RESOURCE = resource.name.toUpperCase();

  /**
   * @class ListView
   */
  class MapComponent extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      Relay.subscribe(this, resource.name);
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      if (resource.index) {
        Reach.API.get(resource.index.uri, function (err, list) {
          if (err) {
            return console.log(err);
          }
          Relay.dispatch(resource.name, Actions[RESOURCE + '_INDEX'](list));
        }.bind(this));
      } else {
        console.log('Admin Error > "%s" is missing list resource', view.name);
      }
    }

    /**
     * @method componentWillUnmount
     */
    componentWillUnmount() {
      Relay.unsubscribe(this, resource.name);
    }

    /**
     * @method render
     */
    render() {
      return (
        <Map markers={ this.state[resource.name] } markerHandlerKey={ this.props.filters.id } markerHandler={ this.props.actions.submit } markerIcon={ '/images/admin/map-icon-waivecar.svg' } />
      );
    }

  }

  return MapComponent;

};