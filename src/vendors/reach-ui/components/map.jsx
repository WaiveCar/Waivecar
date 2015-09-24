'use strict';

import React                     from 'react';
import { relay, api }            from 'reach-react';
import { Content }               from 'reach-components';
import { components, resources } from 'reach-ui';

class UIMap extends React.Component {
  
  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, this.props.resource);
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    /*
    if (resource.index) {
      api.get(resource.index.uri, function (err, list) {
        if (err) {
          return console.log(err);
        }
        relay.dispatch(resource.name, Actions[RESOURCE + '_INDEX'](list));
      }.bind(this));
    } else {
      console.log('Admin Error > "%s" is missing list resource', view.name);
    }
    */
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.props.resource);
  }

  /**
   * @method render
   */
  render() {
    /*
    let submit =  this.props.actions
      ? this.props.actions.submit
      : (data) => {
        console.log(data);
        this.transitionTo(`/${ resource.name }/${ data.id }`);
      };

    return (
      <Map markers={ this.state[resource.name] } markerHandlerKey={ this.props.filters.id } markerHandler={ submit } markerIcon={ '/images/admin/map-icon-waivecar.svg' } />
    );
    */
    return <div>MAP</div>
  }

}

// ### Register Component

components.register({
  name    : 'Map',
  type    : 'map',
  class   : UIMap,
  icon    : 'map',
  options : {
    id : null
  }
});