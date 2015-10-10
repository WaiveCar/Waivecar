import React, { PropTypes } from 'react';
import { DropTarget }       from 'react-dnd';
import { helpers  }         from 'reach-react';
import { Layout }           from 'reach-components';
import ViewComponent        from './view-component';
import ViewDropzone         from './view-dropzone';
import ItemCategories       from './item-categories';

let { Row, Column } = Layout;

const target = {
};

function collect(connect, monitor) {
  return {
    connectDropTarget : connect.dropTarget(),
    isOver            : monitor.isOver(),
    canDrop           : monitor.canDrop()
  }
}

@DropTarget(props => props.accepts, target, collect)
export default class ViewContainer extends React.Component {

  static propTypes = {
    accepts  : PropTypes.arrayOf(PropTypes.string).isRequired,
    onDrop   : PropTypes.func.isRequired,
    onUpdate : PropTypes.func.isRequired,
  };

  /**
   * @method renderRow
   * @param  {Object} row
   * @param  {Number} rowIndex
   */
  renderRow(row, rowIndex) {
    let { components, options } = row;
    let columnWidth = Math.floor(12 / row.components.length) || 12;
    return (
      <Row key={ rowIndex } { ...options }>
        {
          components.map((column, columnIndex) => {
            return this.renderColumn(column, columnIndex, columnWidth, row.editorId)
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
  renderColumn(column, columnIndex, columnWidth, rowId) {
    let { components, options } = column;
    if (options && options.width) {
      columnWidth = options.width;
    }
    return (
      <Column key={ columnIndex } width={ columnWidth } { ...options }>
        { this.renderColumnComponents(components, rowId, column.editorId) }
      </Column>
    );
  }


  /**
   * @method renderColumnComponents
   * @param  {Array} components
   */
  renderColumnComponents(components, rowId, columnId) {
    if (components && components.length > 0) {
      let first = components[0];
      if (first.type === 'row') {
        // column has 1 or more child rows.
        return components.map(this.renderRow.bind(this));
      }

      // column has a component as its child.
      return this.renderComponent(first, rowId, columnId);
    }

    return;
  }

  renderComponent(component, rowId, columnId) {
    return (
      <ViewComponent
        editorId     = { component.editorId }
        name         = { component.name }
        type         = { component.type }
        icon         = { component.icon }
        category     = { component.category }
        options      = { component.options }
        accepts      = { component.accepts }
        row          = { rowId }
        column       = { columnId }
        onUpdate     = { this.props.onUpdate }
        onDrop       = { this.props.onDrop }
      />
    );
  }

  render() {
    const { components, accepts, isOver, canDrop, connectDropTarget } = this.props;
    let containerClassName = `view-container${ isOver ? ' is-over' : '' }${ canDrop ? ' is-active' : '' }${ this.props.className ? ' ' + this.props.className : '' }`;
    return connectDropTarget(
      <div className={ containerClassName }>
        {
          Array.isArray(components) && components.length > 0
            ? components.map(this.renderRow.bind(this))
            : <ViewDropzone zone={ 'all' } accepts={ accepts } onDrop={ this.props.onDrop.bind(this) } />
        }
      </div>
    );
  }
}
