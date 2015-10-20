'use strict';

import React            from 'react';
import Reach, { relay } from 'reach-react';
import { Link }         from 'react-router';
import { Layout }       from 'reach-components';
import components       from './lib/components';

// ### Layout

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
      relay.subscribe(this, 'app');
      this.renderRow = this.renderRow.bind(this);
      this.renderContainer = this.renderContainer.bind(this);
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      this.app.update({
        title : view.title
      });
    }

    /**
     * @method componentDidUnmount
     */
    componentWillUnmount() {
      relay.unsubscribe(this, 'app');
    }

    /**
     * Renders the components that has been defined in the view.
     * @method renderView
     */
    renderView() {
      return view.layout.map(this.renderContainer);
    }

    /**
     * Renders the components that has been defined in the view.
     * @method renderView
     */
    renderContainer(container, containerIndex) {
      return (
        <Container key={ containerIndex } classNames={ container.classNames }>
          { Array.isArray(container.components) && container.components.map(this.renderRow) }
        </Container>
      );
    }

    /**
     * @method renderRow
     * @param  {Object} row
     * @param  {Number} rowIndex
     */
    renderRow(row, rowIndex) {
      let columnWidth = Math.floor(12 / row.components.length) || 12;
      return (
        <Row key={ rowIndex } classNames={ row.classNames }>
          {
            row.components.map((column, columnIndex) => {
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
      if (column.options && column.options.width) {
        columnWidth = column.options.width;
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
      if (column.components && column.components.length > 0) {
        let first = column.components[0];
        if (first.type === 'row') {
          return column.components.map(this.renderRow.bind(this));
        }

        return this.renderComponent(column.components[0]);
      }
    }

    /**
     * @method renderComponent
     * @param  {Object} component { type, options }
     */
    renderComponent(component) {
      return components.render(component.type, {
        ...component.options,
        ...this.props
      });
    }

    /**
     * @method render
     */
    render() {
      return (
        <div className={ view.class }>
          { this.renderView() }
        </div>
      );
    }

  }

}