'use strict';

import React       from 'react';
import Reach       from 'reach-react';
import { Mapping } from 'reach-components';
import UI          from '../ui';

let Relay = Reach.Relay;

export default function (view, fields, resource) {

  // ### Create Menus
  // If menus are provided we tell the UI to handle menu construction.

  if (view.menus) {
    UI.addMenus(view.route, view.menus);
  }

  /**
   * @class ListView
   */
  class MapView extends React.Component {

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
          let action            = {};
          action.type           = 'index';
          action[resource.name] = list;
          Relay.dispatch(resource.name, action);
        }.bind(this));
      } else {
        console.log('Admin Error > "%s" is missing list resource', view.name);
      }
    }

    /**
     * @method componentWillUnmount
     */
    componentWillUnmount() {
      console.log('unsubscribe %s', resource.name);
      Relay.unsubscribe(this, resource.name);
    }

    /**
     * @method render
     */
    render() {
      return (
        <Mapping title={ 'Fleet' } description={ 'Current location of all WaiveCars'} markers={ this.state[resource.name] } markerIcon={ '/images/admin/map-icon-waivecar.svg' } />
      );
    }

  }

  return MapView;

};