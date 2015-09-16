'use strict';

import React      from 'react';
import Reach      from 'reach-react';
import { Layout } from 'reach-components';
import Components from '../components';
import UI         from '../ui';
import Wizard     from './wizard';

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
        // simple / no options.
        componentName = component;
      } else if (component.name) {
        // object (potentially with options)
        componentName = component.name;
      } else {
        console.log(component);
        throw new Error('Component not well defined', component);
      }

      console.log(Components);

      let Component = Components.list[componentName];
      return (
        <Component { ...this.props } { ...component.options }>
          { this.props.children }
        </Component>
      );
    }

    /**
     * @method renderType
     */
    renderType(column) {
      switch (column.type) {
        case 'Wizard' : return <Wizard { ...column } />;
        default       : return this.renderComponent(column.component);
      }
    }

    /**
     * @method renderColumn
     */
    renderColumn(column, columnIndex, columnWidth) {
      if (column.width) {
        columnWidth = column.width;
      }

      return (
        <Column key={ columnIndex } width={ columnWidth } classNames={ column.classNames }>
          { this.renderType(column) }
        </Column>
      );
    }

    /**
     * @method renderRow
     */
    renderRow(row, rowIndex) {
      let columnWidth = Math.floor(12 / row.columns.length) || 12;
      return (
        <Row key={ rowIndex } classNames={ row.classNames }>
          {
            row.columns.map((column, columnIndex) => {
              return this.renderColumn(column, columnIndex, columnWidth)
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
              Array.isArray(view.layout.rows)
                ? view.layout.rows.map(this.renderRow.bind(this))
                : this.renderComponent(view.layout)
            }
          </div>
        </div>
      );
    }

  }

  return LayoutComponent;

};