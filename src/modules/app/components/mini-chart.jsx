'use strict';

import React       from 'react';
import Reach       from 'reach-react';
import { Charts }  from 'reach-components';
import UI          from '../ui';

let { MiniChart } = Charts;
let Relay         = Reach.Relay;
let Actions       = Relay.getActions();

export default function (view, fields, resource) {

  const RESOURCE = resource.name.toUpperCase();

  /**
   * @class MiniChartComponent
   */
  class MiniChartComponent extends React.Component {

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
      return <MiniChart title={ view.title } data={ this.state[resource.name] } chartType={ this.props.chartType } className={ this.props.className } />
    }

  }

  return MiniChartComponent;

};