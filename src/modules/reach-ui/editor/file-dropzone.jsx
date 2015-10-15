import React, { PropTypes } from 'react';
import { DropTarget }       from 'react-dnd';
import { helpers  }         from 'reach-react';

const target = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) return;
    let files = [];
    let droppedFiles = monitor.getItem();
    droppedFiles = droppedFiles.files || null;
    if (!droppedFiles) return;

    let max = props.multiple ? droppedFiles.length : 1;
    for (let i = 0; i < max; i++) {
      let file = droppedFiles[i];
      file.preview = URL.createObjectURL(file);
      files.push(file);
    }
    props.onDrop(files);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget : connect.dropTarget(),
    isOver            : monitor.isOver({ shallow : true }),
    canDrop           : monitor.canDrop()
  }
}

@DropTarget(props => [ '__NATIVE_FILE__' ], target, collect)
export default class FileDropzone extends React.Component {

  static propTypes = {
    isOver   : PropTypes.bool.isRequired,
    canDrop  : PropTypes.bool.isRequired,
    onDrop   : PropTypes.func.isRequired,
    multiple : PropTypes.bool
  };

  render() {
    const { accepts, isOver, canDrop, connectDropTarget } = this.props;
    let dropzoneClassName = `file-dropzone ${ isOver ? 'is-over' : '' } ${ canDrop ? 'is-active' : '' } ${ this.props.className }`;
    let message = 'drop a file';
    return connectDropTarget(
      <div className={ dropzoneClassName }>
        <div className="file-dropzone-title">
          <i title="{ message }" className="material-icons">file_upload</i>
          <p>Drag a file</p>
        </div>
      </div>
    );
  }
}