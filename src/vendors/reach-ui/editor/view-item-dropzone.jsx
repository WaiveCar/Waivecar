import React, { PropTypes, Component } from 'react';

export default class ViewItemDropzone extends Component {

  static propTypes = {
    isOver    : PropTypes.bool.isRequired,
    canDrop   : PropTypes.bool.isRequired,
    accepts   : PropTypes.array.isRequired,
  };

  render() {
    const { isOver, canDrop, accepts } = this.props;
    const isActive = isOver && canDrop;
    let activeStyle = 'untouched';

    if (isActive) {
      activeStyle = 'is-active';
    } else if (canDrop) {
      activeStyle = 'can-drop';
    }

    let dropzoneClassName = `view-dropzone ${ activeStyle }`;

    return (
      <div className={ dropzoneClassName }>
        <p className="text-info text-center">Drop a { accepts.join(' or ') }</p>
      </div>
    );
  }
}