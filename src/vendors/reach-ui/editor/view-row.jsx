import React, { PropTypes, Component } from 'react';
import { DropTarget }                  from 'react-dnd';
import ItemCategories                  from './item-categories';
import ViewColumn                      from './view-column';
import ViewOptions                     from './view-options';
import newId                           from './newid';

const target = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return; // don't be greedy.
    let item = monitor.getItem();
    item.id = newId();
    item.components = [];
    item.width = 12;
    let row = props;
    row.components.push(item);
    if (row.components.length > 0) {
      let width = Math.floor(12 / row.components.length);
      row.components.forEach(c => c.width = width);
    }

    props.onDrop(row);
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
export default class ViewRow extends Component {

  static propTypes = {
    id                : PropTypes.string.isRequired,
    name              : PropTypes.string.isRequired,
    type              : PropTypes.string.isRequired,
    category          : PropTypes.string.isRequired,
    options           : PropTypes.object.isRequired,
    connectDropTarget : PropTypes.func.isRequired,
    isOver            : PropTypes.bool.isRequired,
    canDrop           : PropTypes.bool.isRequired,
    lastDroppedItem   : PropTypes.object,
    components        : PropTypes.array,
    onDrop            : PropTypes.func.isRequired
  };

  handleChildUpdated(item) {
    let row = this.props;
    let existing = row.components.findIndex(i => i.id === item.id);
    if (existing > -1) {
      row.components[existing] = item;
    }
    this.props.onDrop(row);
  }

  updateOptions(value) {
    let row = this.props;
    row.options = value;
    this.props.onDrop(row);
  }

  render() {
    const { id, name, type, category, components, options, isOver, canDrop, onDrop, connectDropTarget, lastDroppedItem } = this.props;
    const isActive = isOver && canDrop;

    let activeStyle = 'untouched';
    if (isActive) {
      activeStyle = 'is-active';
    } else if (canDrop) {
      activeStyle = 'can-drop';
    }

    let className = `view-row ${ activeStyle }`;

    return connectDropTarget(
      <div className={ className }>
        <h6>{ name }</h6>
        { isActive && <p>Drag Columns on to this Row</p> }
        <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
        <div className="container-fluid">
          <div className="row">
          {
            components.map((component, componentIndex) => {
              return <ViewColumn
                key             = { componentIndex }
                id              = { component.id }
                name            = { component.name }
                type            = { component.type }
                category        = { component.category }
                options         = { component.options }
                components      = { component.components }
                accepts         = { component.accepts }
                lastDroppedItem = { component.lastDroppedItem }
                onDrop          = { this.handleChildUpdated.bind(this) }
                width           = { component.width }
              />
            })
          }
          </div>
        </div>
      </div>
    );
  }
}
