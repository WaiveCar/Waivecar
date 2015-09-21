'use strict';

import React      from 'react';
import Reach      from 'reach-react';
import { Layout } from 'reach-components';
import components from './lib/components';

// ### Layout

let Relay                      = Reach.Relay;
let { Container, Row, Column } = Layout;

export default (view) => {

  /**
   * @class LayoutTemplate
   */
  return class LayoutTemplate extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.renderRow = this.renderRow.bind(this);
    }

    /**
     * Returns the assigned component className.
     * @method getClassName
     */
    getClassName() {
      return `view-${ view.class }`;
    }

    /**
     * Renders the components that has been defined in the view.
     * @method renderView
     */
    renderView() {
      if (Array.isArray(view.layout.rows)) {
        return view.layout.rows.map(this.renderRow);
      }
      return this.renderComponent(view.layout);
    }

    /**
     * @method renderRow
     * @param  {Object} row
     * @param  {Number} rowIndex
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
     * @method renderColumn
     * @param  {Object} column
     * @param  {Number} columnIndex
     * @param  {Number} columnWidth
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
     * @method renderType
     */
    renderType(column) {
      switch (column.type) {
        default : return this.renderComponent(column.component);
      }
    }

    /**
     * @method renderComponent
     * @param  {Object} component { type, options }
     */
    renderComponent(component) {
      return components.render(component.type, component.options, this.props);
    }

    /**
     * @method render
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