import React, { PropTypes } from 'react';
import { DropTarget }       from 'react-dnd';
import ViewOptions          from './view-options';
import ViewItemIcon         from './view-item-icon';
import ItemCategories       from './item-categories';
import { helpers  }         from 'reach-react';

const target = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return;
    let viewComponent = monitor.getItem();
    viewComponent.editorId = helpers.random(10);
    props.onDrop({ zone : props.zone, viewComponent : viewComponent });
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
export default class ViewDropzone extends React.Component {

  static propTypes = {
    isOver   : PropTypes.bool.isRequired,
    canDrop  : PropTypes.bool.isRequired,
    accepts  : PropTypes.array.isRequired,
    onDrop   : PropTypes.func.isRequired,
    onActive : PropTypes.func,
    zone     : PropTypes.oneOf([ 'all', 'top', 'right', 'bottom', 'left' ])
  };

  render() {
    const { zone, accepts, isOver, canDrop, connectDropTarget } = this.props;
    let dropzoneClassName = `view-dropzone view-dropzone-${ zone} ${ isOver ? 'is-over' : '' } ${ canDrop ? 'is-active' : '' } ${ this.props.className }`;
    let message = `drop a ${ accepts.join(' or ') } to get started`;
    return connectDropTarget(
      <div className={ dropzoneClassName }>
        <div className="view-dropzone-title">
          <i title="{ message }" className="material-icons">add_circle_outline</i>
          { zone === 'all' && <h6>{ message }</h6> }
        </div>
      </div>
    );
  }
}