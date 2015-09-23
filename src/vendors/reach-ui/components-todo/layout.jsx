'use strict';

import React                from 'react';
import Reach                from 'reach-react';
import { Layout }           from 'reach-components';
import { components, menu } from 'reach-ui';
import Wizard               from './wizard';

let { Container, Row, Column } = Layout;
let Relay = Reach.Relay;

export default (view) => {
  return class Layout extends React.Component {

    constructor(...args) {
      super(...args);
      this.renderRow = this.renderRow.bind(this);
    }

    /**
     * @method getClassName
     */
    getClassName() {
      return `view-${ view.class }`;
    }

    /**
     *
     */
    renderView() {
      if (Array.isArray(view.layout.rows)) {
        return view.layout.rows.map(this.renderRow);
      }
      return this.renderComponent(view.layout);
    }

    /**
     *
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
     *
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
     *
     */
    renderType(column) {
      switch (column.type) {
        case 'Wizard' : return <Wizard { ...column } />;
        default       : return this.renderComponent(column.component);
      }
    }

    /**
     *
     */
    renderComponent(component) {
      return components.renderComponent(component, this.props);
    }

    /**
     *
     */
    render() {
      return (
        <div className={ this.getClassName() }>
          { this.renderView() }
        </div>
      );
    }

  }
}