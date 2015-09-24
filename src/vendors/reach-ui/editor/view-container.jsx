import React, { PropTypes, Component } from 'react';
import { DropTarget }                  from 'react-dnd';
import ViewRow                         from './view-row';
import ViewComponent                   from './view-component';
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
        id       = { component.id }
        name     = { component.name }
        type     = { component.type }
        icon     = { component.icon }
        category = { component.category }
        options  = { component.options }
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
        accepts         = { row.accepts }
        options         = { row.options }
        lastDroppedItem = { row.lastDroppedItem }
        onDrop          = { this.props.onDrop }
      />
    );
  }

  render() {
    const { components, accepts, onDrop, isOver, canDrop, connectDropTarget } = this.props;
    const isActive = isOver && canDrop;
    let activeStyle = 'untouched';

    if (isActive) {
      activeStyle = 'is-active';
    } else if (canDrop) {
      activeStyle = 'can-drop';
    }

    let className = `view-container ${ activeStyle }`;
    let showInstructions = components ? null : <p className="text-info text-center">Drag to add a { accepts.join(' or ') }</p>;
    return connectDropTarget(
      <div className={ className }>
        { isActive
          ? <p className="text-info text-center">Release to drop</p>
          : showInstructions
        }
        {
          Array.isArray(components)
            ? components.map(this.renderRow.bind(this))
            : this.renderComponent(components)
        }
      </div>
    );
  }
}
