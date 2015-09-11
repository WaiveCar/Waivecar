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

    /**
     * @method componentDidMount
     */
    componentDidMount() {
    }

    /**
     * @method componentWillUnmount
     */
    componentWillUnmount() {
    }

    /**
     * @method renderColumn
     */
    renderColumn(componentName, columnIndex, columnWidth) {
      let Component = Components.list[componentName];
      return (
        <Column key={ columnIndex } width={ columnWidth }>
          <Component>
            { this.props.children }
          </Component>
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
            row.map((componentName, columnIndex) => {
              return this.renderColumn(componentName, columnIndex, columnWidth)
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
        <div id="layout">
          <div className="content-header">
            <h1><span>{ view.name }</span></h1>
          </div>
          <div className="container-fluid">
            {
              view.layout.map(this.renderRow.bind(this))
            }
          </div>
        </div>
      );
    }

  }

  return LayoutComponent;

};