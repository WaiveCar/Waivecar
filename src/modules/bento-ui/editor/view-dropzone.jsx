import React, { PropTypes } from 'react';
import { DropTarget }       from 'react-dnd';
import { helpers  }         from 'bento';
import ViewOptions          from './view-options';
import ViewItemIcon         from './view-item-icon';
import ItemCategories       from './item-categories';
import components           from '../lib/components';

const target = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return;
    let viewComponent = monitor.getItem();
    viewComponent.editorId = helpers.random(10);

    let defaults = {};
    let defaultOptions = components.getOptions(viewComponent.type).filter((f) => { return f.default; });
    defaultOptions.forEach((option, index) => {
      defaults[option.name] =option.default;
    });

    viewComponent.options = defaults;
    if (viewComponent.type === 'container') {
      viewComponent.components = [];
    }

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
class ViewDropzone extends React.Component {

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
    if (zone === 'all') {
      let message = `drop a ${ accepts.join(' or ') } to get started`;
      return connectDropTarget(
        <div className={ dropzoneClassName }>
          <div className="view-dropzone-title">
            <i title="{ message }" className="material-icons">add_circle_outline</i>
            <h6>{ message }</h6>
          </div>
        </div>
      );
    }

    return connectDropTarget(
      <div className={ dropzoneClassName }>
        <div className="dropzone-separator" />
      </div>
    );
  }
}

module.exports = ViewDropzone;