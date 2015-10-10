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
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.props.resource);
  }

  /**
   * @method render
   */
  render() {
    let submit = this.props.actions ? this.props.actions.submit : (data) => {
      this.history.pushState(null, `/${ this.props.resource }/${ data.id }`);
    };
    return (
      <Map markers={ this.state[this.props.resource] } markerHandlerKey={ this.props.filters.id } markerHandler={ submit } markerIcon={ '/images/admin/map-icon-waivecar.svg' } />
    );
  }

}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Map',
      type    : 'map',
      class   : UIMap,
      icon    : 'map',
      options : {
        id : null
      }
    };
  }
}