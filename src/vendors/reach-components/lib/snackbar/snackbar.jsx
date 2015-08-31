'use strict';

import React    from 'react';
import ReactDOM from 'react-dom';
import { DOM }  from 'reach-react';
import './style.scss';

export default class Snackbar extends React.Component {

  /**
   * Set the initial style state of the component.
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      style : {
        bottom     : 0,
        display    : 'inline-block',
        left       : '50%',
        marginLeft : 0,
        position   : 'fixed',
        zIndex     : 999
      }
    }
  }

  /**
   * Center the snackbar.
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      style : {
        ...this.state.style,
        marginLeft : -(this.refs.snackbar.offsetWidth / 2)
      }
    });
  }

  /**
   * Returns the current class names for the snackbar.
   * @method getClass
   * @return {String}
   */
  getClass() {
    let className = {};
    let animation = this.props.animation;

    className.snackbar   = true;
    className.animated   = true;
    className[animation] = true;

    return DOM.setClass(className);
  }

  render() {
    return (
      <div className={ this.getClass() } style={ this.state.style } ref="snackbar">
        { this.props.message }
      </div>
    );
  }
}