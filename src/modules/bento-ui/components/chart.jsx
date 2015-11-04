'use strict';

import React                             from 'react';
import { relay, api }                    from 'bento';
import { components, fields, resources } from 'bento-ui';
import { Charts, snackbar }              from 'bento-web';

let { Chart } = Charts;

class UIChart extends React.Component {

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
      return snackbar.notify({
        type    : 'danger',
        message : `MiniChart component is missing ${ this.resourceName() }`
      });
    }
    api.get(index.uri, function(err, data) {
      if (err) {
        return snackbar.notify({
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
      <Chart
        title     = { this.props.title }
        data      = { this.state[this.resourceName()] }
        type      = { this.props.type }
        className = { this.props.color }
      />
    );
  }

}

// ### Register Component
module.exports = {
  build : function() {
    return {
      name    : 'Chart',
      type    : 'chart',
      icon    : 'insert_chart',
      order   : 8,
      class   : UIChart,
      options : [
        {
          label     : 'Title',
          component : 'input',
          type      : 'text',
          name      : 'title',
          helpText  : 'Enter a Title for the Chart',
        },
        {
          label     : 'Resource',
          component : 'select',
          name      : 'resource',
          options   : resources.getSelectList(),
          helpText  : 'Select a resource for this Chart',
          required  : true
        },
        {
          label     : 'Fields',
          component : 'select',
          name      : 'field',
          helpText  : 'Select field to sum',
          options   : {
            connector : 'resource',
            values    : fields.getSelectList()
          },
          required  : true
        },
        {
          label     : 'Chart Type',
          name      : 'type',
          component : 'select',
          options   : [
            {
              name  : 'Bar',
              value : 'bar'
            },
            {
              name  : 'Line',
              value : 'line'
            }
          ],
          helpText  : 'Select a Chart Type'
        },
        {
          name      : 'color',
          label     : 'Chart Color',
          component : 'select',
          options   : [
            {
              name  : 'Pink',
              value : 'chart-pink'
            },
            {
              name  : 'Blue Gray',
              value : 'chart-bluegray'
            },
            {
              name  : 'Yellow Green',
              value : 'chart-yellowgreen'
            },
            {
              name  : 'Primary',
              value : 'chart-primary'
            },
            {
              name  : 'Info',
              value : 'chart-info'
            },
            {
              name  : 'Warning',
              value : 'chart-warning'
            },
            {
              name  : 'Succcess',
              value : 'chart-success'
            },
            {
              name  : 'Danger',
              value : 'chart-danger'
            }
          ],
          helpText : 'Select a Chart Color'
        }
      ]
    };
  }
}