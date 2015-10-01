import React, { PropTypes, Component } from 'react';
import { DropTarget }                  from 'react-dnd';
import ViewRow                         from './view-row';
import ViewComponent                   from './view-component';
import ViewOptions                     from './view-options';
import ViewItemIcon                    from './view-item-icon';
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
    let column = props;
    column.components.push(item);
    props.onDrop(column);
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
export default class ViewColumn extends Component {

  static propTypes = {
    id                : PropTypes.string.isRequired,
    name              : PropTypes.string.isRequired,
    type              : PropTypes.string.isRequired,
    category          : PropTypes.string.isRequired,
    options           : PropTypes.object.isRequired,
    connectDropTarget : PropTypes.func.isRequired,
    isOver            : PropTypes.bool.isRequired,
    canDrop           : PropTypes.bool.isRequired,
    accepts           : PropTypes.arrayOf(PropTypes.string).isRequired,
    lastDroppedItem   : PropTypes.object,
    components        : PropTypes.array,
    onDrop            : PropTypes.func.isRequired
  };

  handleChildUpdated(item) {
    let column = this.props;
    let existing = column.components.findIndex(i => i.id === item.id);
    if (existing > -1) {
      column.components[existing] = item;
    }
    this.props.onDrop(column);
  }

  updateOptions(value) {
    let updatedComponent = { ...this.props, ...{ options : value } };
    this.props.onDrop(updatedComponent);
  }

  render() {
    const { id, name, type, category, icon, components, accepts, options, onDrop, isOver, canDrop, connectDropTarget, lastDroppedItem } = this.props;
    let width = options && options.width ? options.width : 12;
    let className = `view-column col-xs-${ width }`;

    return connectDropTarget(
      <div className={ className }>
        <div className="view-header">
          <ViewItemIcon type={ type } icon={ icon} />
          <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
        </div>
        {
          components.map((component, componentIndex) => {
            switch (component.category) {
              case ItemCategories.ROW : return (
                <ViewRow
                  key             = { componentIndex }
                  id              = { component.id }
                  name            = { component.name }
                  type            = { component.type }
                  category        = { component.category }
                  icon            = { component.icon }
                  options         = { component.options }
                  components      = { component.components }
                  accepts         = { component.accepts }
                  lastDroppedItem = { component.lastDroppedItem }
                  onDrop          = { this.handleChildUpdated.bind(this) }
                />
              )
              case ItemCategories.COMPONENT : return (
                <ViewComponent
                  key          = { componentIndex }
                  id           = { component.id }
                  name         = { component.name }
                  type         = { component.type }
                  icon         = { component.icon }
                  category     = { component.category }
                  options      = { component.options }
                  onUpdate     = { this.handleChildUpdated.bind(this) }
                />
              )
            }
          })
        }
        <ViewItemDropzone isOver={ isOver } canDrop={ canDrop } accepts={ accepts } />
      </div>
    );
  }
}
