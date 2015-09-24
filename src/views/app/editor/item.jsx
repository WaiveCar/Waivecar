import React, { PropTypes, Component } from 'react';
import { DragSource }                  from 'react-dnd';

const source = {
  beginDrag(props, a, b) {
    return {
      type     : props.type,
      accepts  : props.accepts,
      category : props.category,
      icon     : props.icon,
      options  : props.options,
    };
  }
};

@DragSource(props => props.category, source, (connect, monitor) => ({
  connectDragSource : connect.dragSource(),
  isDragging        : monitor.isDragging()
}))
export default class Item extends Component {

  static propTypes = {
    connectDragSource : PropTypes.func.isRequired,
    isDragging        : PropTypes.bool.isRequired,
    type              : PropTypes.string.isRequired,
    category          : PropTypes.string.isRequired
  };

  render() {
    const { type, isDragging, connectDragSource } = this.props;
    const opacity = isDragging ? 0.4 : 1;
    let icon = this.props.icon || 'developer_board';

    return connectDragSource(
      <div className="view-editor-item" style={{ opacity }}>
        <i className="material-icons" role={ type }>{ icon }</i>
        { type }
      </div>
    );
  }
}