import React, { PropTypes, Component } from 'react';
import { DropTarget }                  from 'react-dnd';
import ViewRow                         from './view-row';
import ViewComponent                   from './view-component';
import ViewItemDropzone                from './view-item-dropzone';
import ItemCategories                  from './item-categories';
import newId                           from './newid';

const target = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return; // don't be greedy.
    let item = monitor.getItem();
    item.id = newId();
    if (item.category === ItemCategories.ROW) {
      item.components = [];
    }
    props.onDrop(item);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget : connect.dropTarget(),
    isOver            : monitor.isOver({ shallow : true }),
    canDrop           : monitor.canDrop()
  }
}

@DropTarget(props => props.accepts, target, collect)
export default class ViewContainer extends Component {

  static propTypes = {
    accepts           : PropTypes.arrayOf(PropTypes.string).isRequired,
    // components        : PropTypes.optionalUnion([ PropTypes.array, PropTypes.Object]),
    isOver            : PropTypes.bool.isRequired,
    canDrop           : PropTypes.bool.isRequired,
    connectDropTarget : PropTypes.func.isRequired,
    onDrop            : PropTypes.func.isRequired
  };

  renderComponent(component) {
    if (!component) return;
    return (
      <ViewComponent
        id           = { component.id }
        name         = { component.name }
        type         = { component.type }
        icon         = { component.icon }
        category     = { component.category }
        options      = { component.options }
        onUpdate     = { this.props.onDrop }
      />
    );
  }

  renderRow(row, rowIndex) {
    return (
      <ViewRow
        id              = { row.id }
        type            = { row.type }
        name            = { row.name }
        category        = { row.category }
        key             = { rowIndex }
        components      = { row.components }
        icon            = { row.icon }
        accepts         = { row.accepts }
        options         = { row.options }
        lastDroppedItem = { row.lastDroppedItem }
        onDrop          = { this.props.onDrop }
      />
    );
  }

  render() {
    const { components, accepts, isOver, canDrop, connectDropTarget } = this.props;
    let containerClassName = 'view-container';
    return connectDropTarget(
      <div className={ containerClassName }>
        {
          Array.isArray(components)
            ? components.map(this.renderRow.bind(this))
            : this.renderComponent(components)
        }
        <ViewItemDropzone isOver={ isOver } canDrop={ canDrop } accepts={ accepts } />
      </div>
    );
  }
}
