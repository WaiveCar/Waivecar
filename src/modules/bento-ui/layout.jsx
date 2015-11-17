'use strict';

import React             from 'react';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import { relay, dom }    from 'bento';
import { Layout }        from 'bento-web';
import components        from './lib/components';

let { Container, Row, Column } = Layout;

function LayoutBuilder(view) {

  @mixin.decorate(History)
  class LayoutTemplate extends React.Component {

    constructor(...args) {
      super(...args);
      
      dom.setTitle(view.title);
      
      this.renderRow       = this.renderRow.bind(this);
      this.renderContainer = this.renderContainer.bind(this);
    }

    /**
     * Renders the components that has been defined in the view.
     */
    renderView() {
      return view.layout.map(this.renderContainer);
    }

    /**
     * Renders the components that has been defined in the view.
     */
    renderContainer(container, containerIndex) {
      return (
        <Container key={ containerIndex } classNames={ container.classNames } { ...container.options }>
          { Array.isArray(container.components) && container.components.map(this.renderRow) }
        </Container>
      );
    }

    /**
     * @param  {Object} row
     * @param  {Number} rowIndex
     */
    renderRow(row, rowIndex) {
      let columnWidth = Math.floor(12 / row.components.length) || 12;
      return (
        <Row key={ rowIndex } classNames={ row.classNames }>
          {
            row.components.map(function(column, columnIndex) {
              return this.renderColumn(column, columnIndex, columnWidth)
            }.bind(this))
          }
        </Row>
      );
    }

    /**
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
     * @param {Object} component { type, options }
     */
    renderComponent(component) {
      return components.render(component.type, {
        ...component.options,
        ...this.props
      });
    }

    render() {
      return (
        <div className={ view.class }>
          { this.renderView() }
        </div>
      );
    }

  }

  return LayoutTemplate;
}

module.exports = LayoutBuilder;