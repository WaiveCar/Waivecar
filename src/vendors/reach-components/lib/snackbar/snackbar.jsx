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
        bottom     : 50,
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
        marginLeft   : -(this.refs.snackbar.offsetWidth / 2),
        paddingRight : this.refs.action ? (this.refs.action.offsetWidth + 48) : 24
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
    let type      = this.props.type;
    let animation = this.props.animation;

    className.snackbar   = true;
    className[type]      = type      ? true : false;
    className.animated   = animation ? true : false;
    className[animation] = animation ? true : false;

    return DOM.setClass(className);
  }

  /**
   * @method getAction
   */
  getAction() {
    let action = this.props.action;
    if (action) {
      return (
        <button type="button" className="btn-snackbar" onClick={ action.click } ref="action">{ action.title }</button>
      );
    }
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className={ this.getClass() } style={ this.state.style } ref="snackbar">
        { this.props.message }
        { this.getAction() }
      </div>
    );
  }

}