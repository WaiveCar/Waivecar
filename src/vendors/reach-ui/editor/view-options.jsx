import React, { PropTypes, Component } from 'react';

export default class ViewOptions extends Component {

  static propTypes = {
    options : PropTypes.object.isRequired,
    update  : PropTypes.func.isRequired
  };

  render() {
    const { options } = this.props;
    let className = 'view-options';
    return (
      <div className={ className }>
        <p>{ JSON.stringify(options) }</p>
      </div>
    );
  }
}
