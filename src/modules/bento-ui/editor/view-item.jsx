import React, { PropTypes, Component } from 'react';
import { DragSource }                  from 'react-dnd';

const source = {
  beginDrag(props) {
    let viewComponent = {
      name     : props.name,
      type     : props.type,
      accepts  : props.accepts,
      category : props.category,
      icon     : props.icon,
      options  : {}
    }

    return viewComponent;
  }
};

@DragSource(props => props.category, source, (connect, monitor) => ({
  connectDragSource : connect.dragSource(),
  isDragging        : monitor.isDragging()
}))
class ViewItem extends Component {

  static propTypes = {
    connectDragSource : PropTypes.func.isRequired,
    isDragging        : PropTypes.bool.isRequired,
    name              : PropTypes.string.isRequired,
    type              : PropTypes.string.isRequired,
    category          : PropTypes.string.isRequired
  };

  render() {
    const { name, type, isDragging, connectDragSource } = this.props;
    const opacity = isDragging ? 0.4 : 1;
    let icon = this.props.icon || 'developer_board';

    return connectDragSource(
      <div className="ui-component-item" style={{ opacity }}>
        { isDragging && '(being dragged)' }
        <i className="material-icons" role={ type }>{ icon }</i>
        { name }
      </div>
    );
  }
}

export default ViewItem;