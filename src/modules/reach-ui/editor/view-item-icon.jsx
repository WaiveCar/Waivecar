import React, { PropTypes, Component } from 'react';

export default class ViewItemIcon extends Component {

  static propTypes = {
    type     : PropTypes.string.isRequired,
    icon     : PropTypes.string.isRequired,
  };

  render() {
    const { type, icon } = this.props;
    return (
      <div className="view-component-icon">
        <i className="material-icons" role={ type }>{ icon }</i>
      </div>
    );
  }
}