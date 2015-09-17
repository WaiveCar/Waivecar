'use strict';

import React                from 'react';
import Reach                from 'reach-react';
import { Layout }           from 'reach-components';
import { components, menu } from 'reach-ui';
import Wizard               from './wizard';

let { Container, Row, Column } = Layout;
let Relay = Reach.Relay;

export default function (view) {

  // ### Create Menus
  // If menus are provided we tell the UI to handle menu construction.

  menu.addMenus(view.route, view.menus);

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
      return components.renderComponent(component, this.props);
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