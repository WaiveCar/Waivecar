'use strict';

import React                             from 'react';
import mixin                             from 'react-mixin';
import { relay, api }                    from 'reach-react';
import { History }                       from 'react-router';
import { Map }                           from 'reach-components';
import { components, fields, resources } from 'reach-ui';

@mixin.decorate(History)

class UIMap extends React.Component {

  /**
   * Sets up relay for the provided resrouce.
   * @param  {...Mixed} args
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, this.props.resource);
  }

  /**
   * Prepare resource and update the relay.
   */
  componentDidMount() {
    let resource = resources.get(this.props.resource);
    if (resource && resource.index) {
      api.get(resource.index.uri, function (err, data) {
        if (err) {
          return console.log(err);
        }
        relay.dispatch(this.props.resource, {
          type : 'index',
          data : data
        });
      }.bind(this));
    }
  }

  /**
   * Remove any event listeners from the relay within the component context.
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.props.resource);
  }

  /**
   * Renders the UI map.
   * @return {Object}
   */
  render() {
    return (
      <Map 
        markers          = { this.state[this.props.resource] } 
        markerHandlerKey = { this.props.key } 
        markerHandler    = { this.props.handler } 
        markerIcon       = { '/images/admin/map-icon-waivecar.svg' } 
      />
    );
  }

}

// ### Register Component

export default {
  build : () => {
    return {
      name    : 'Map',
      type    : 'map',
      class   : UIMap,
      icon    : 'map',
      options : [
        {
          label     : 'Resource',
          component : 'react-select',
          name      : 'resource',
          options   : resources.getSelectList(),
          helpText : 'Select resource for this Map'
        },
        {
          label     : 'Key',
          component : 'react-select',
          name      : 'key',
          helpText  : 'Select resource field to be used as selection key',
          options   : {
            connector : 'resource',
            values    : fields.getSelectList()
          }
        }
      ]
    };
  }
}