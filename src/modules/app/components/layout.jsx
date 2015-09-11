'use strict';

import React      from 'react';
import Reach      from 'reach-react';
import { Layout } from 'reach-components';
import Components from '../components';
import UI         from '../ui';

let { Container, Row, Column } = Layout;
let Relay = Reach.Relay;

export default function (view) {

  // ### Create Menus
  // If menus are provided we tell the UI to handle menu construction.

  if (view.menus) {
    UI.addMenus(view.route, view.menus);
  }

  /**
   * @class LayoutComponent
   */
  class LayoutComponent extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
    }

    renderComponent(component) {
      let componentName;
      if (typeof component === 'string' || component instanceof String) {
        componentName = component;
      } else {
        componentName = component.component;
      }

      let Component = Components.list[componentName];
      return (
        <Component { ...this.props } { ...component.options }>
          { this.props.children }
        </Component>
      );
    }

    /**
     * @method renderColumn
     */
    renderColumn(component, columnIndex, columnWidth) {
      if (component && component.width) {
        columnWidth = component.width;
      }

      return (
        <Column key={ columnIndex } width={ columnWidth }>
          { this.renderComponent(component) }
        </Column>
      );
    }

    /**
     * @method renderRow
     */
    renderRow(row, rowIndex) {
      let columnWidth = Math.floor(12 / row.length) || 12;
      return (
        <Row key={ rowIndex }>
          {
            row.map((component, columnIndex) => {
              return this.renderColumn(component, columnIndex, columnWidth)
            }.bind(this))
          }
        </Row>
      );
    }

    /**
     * @method render
     */
    render() {
      return (
        <div id="content-wrapper">
          <div className="content-header">
            <h1><span>{ view.name }</span></h1>
          </div>
          <div className="container-fluid">
            {
              Array.isArray(view.layout)
                ? view.layout.map(this.renderRow.bind(this))
                : this.renderComponent(view.layout)
            }
          </div>
        </div>
      );
    }

  }

  return LayoutComponent;

};