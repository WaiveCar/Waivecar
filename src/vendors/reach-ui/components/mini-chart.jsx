'use strict';

import React                     from 'react';
import { relay, api }            from 'reach-react';
import { Charts, Snackbar }      from 'reach-components';
import { components, resources } from 'reach-ui';

let { MiniChart } = Charts;

class UIMiniChart extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, this.resourceName());
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    let { index } = resources.get(this.resourceName());
    if (!index) {
      return Snackbar.notify({
        type    : 'danger',
        message : `MiniChart component is missing ${ this.resourceName() }`
      });
    }
    api.get(index.uri, (err, data) => {
      if (err) {
        return Snackbar.notify({
          type    : 'danger',
          message : `Could not fetch mini chart data ${ index.uri }`
        });
      }
      relay.dispatch(this.resourceName(), {
        type : 'index',
        data : data
      });
    }.bind(this));
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.resourceName());
  }

  /**
   * Returns the current resource name.
   * @method resourceName
   * @return {String}
   */
  resourceName(isUpperCase) {
    return this.props.resource;
  }

  /**
   * @method render
   */
  render() {
    return (
      <MiniChart
        title     = { this.props.title }
        data      = { this.state[this.resourceName()] }
        chartType = { this.props.type }
        className = { this.props.class }
      />
    );
  }

}

// ### Register Component

components.register({
  name    : 'Mini Chart',
  type    : 'mini-chart',
  icon    : 'insert_chart',
  class   : UIMiniChart,
  options : {
  }
});