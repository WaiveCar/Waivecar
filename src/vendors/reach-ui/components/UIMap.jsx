'use strict';

import React                     from 'react';
import { relay }                 from 'reach-react';
import { Content }               from 'reach-components';
import { components, resources } from 'reach-ui';

class UIContent extends React.Component {
  
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
    let submit =  this.props.actions
      ? this.props.actions.submit
      : (data) => {
        console.log(data);
        this.transitionTo(`/${ resource.name }/${ data.id }`);
      };

    return (
      <Map markers={ this.state[resource.name] } markerHandlerKey={ this.props.filters.id } markerHandler={ submit } markerIcon={ '/images/admin/map-icon-waivecar.svg' } />
    );
  }

}

// ### Register Component

components.register({
  name    : 'Content',
  type    : 'content',
  class   : UIContent,
  icon    : 'editor',
  options : {
    id : null
  }
});