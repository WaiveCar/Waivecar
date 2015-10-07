'use strict';

import React          from 'react';
import ReactDOM       from 'react-dom';
import { dom, relay } from 'reach-react';
import { helpers }    from 'reach-react';
import './style.scss';

/**
 * The current total width of the snackbar object.
 * @property width
 * @type     Number
 */
let width = 0;

/**
 * @class Snackbar
 */
export default class Snackbar extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      style : {
        bottom     : 50,
        display    : 'none',
        left       : '50%',
        marginLeft : 0,
        position   : 'fixed',
        zIndex     : 999
      }
    };
    relay.subscribe(this, 'snackbar');
  }

  /**
   * Center the snackbar.
   */
  componentDidMount() {
    this.align();
  }

  /**
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {

    // ### Animation
    // Check if a new animation sequence has been requested.

    let curAnim = this.state.snackbar.animation;
    let nxtAnim = nextState.snackbar.animation;

    if (nxtAnim !== curAnim) {
      return true;
    }

    // ### Alignment
    // Check if notification alignment has adjusted.

    let curAlign = this.state.style.marginLeft;
    let nxtAlign = nextState.style.marginLeft;

    if (nxtAlign !== curAlign) {
      return true;
    }

    return false;
  }

  /**
   * When component has updated we need to check if we also need to
   * re-align the position of the notification.
   * @param  {Object} prevOrops
   * @param  {Object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    this.align();
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'snackbar');
  }

  /**
   * Centers the snackbar object.
   * @return {Void}
   */
  align() {
    let cWidth = this.refs.snackbar.offsetWidth;
    let aWidth = this.refs.action ? this.refs.action.offsetWidth + 48 : 24;

    // ### Re-Align
    // Check if we need to re-align the element, since it can be somewhat
    // pixel sensetive we check if the remainder between new total and
    // previous width is more than 3px in width before re-alignment.

    if (width !== 0 && cWidth % width < 3) {
      return;
    }

    // ### Update Alignment

    this.setState({
      style : {
        ...this.state.style,
        marginLeft   : -(cWidth / 2),
        paddingRight : aWidth
      }
    });

    // ### Update
    // Update the width for future width checks

    width = cWidth;
  }

  /**
   * Returns the current class names for the snackbar.
   * @return {String}
   */
  getClass() {
    let { type, animation, show } = this.state.snackbar;
    return dom.setClass({
      snackbar  : true,
      type      : type || null,
      animated  : animation ? true : false,
      animation : animation ? animation : false
    });
  }

  /**
   * @return {Object}
   */
  getStyle() {
    let style = helpers.object.clone(this.state.style);
    if (this.state.snackbar.active) {
      style.display = 'inline-block';
    }
    return style;
  }

  /**
   * @return {button}
   */
  getAction() {
    let { action } = this.state.snackbar;
    if (action) {
      return (
        <button type="button" className="btn-snackbar" onClick={ action.click } ref="action">{ action.title }</button>
      );
    }
  }

  /**
   * Renders the snackbar components.
   * @return {Object}
   */
  render() {
    let { message } = this.state.snackbar;
    return (
      <div className={ this.getClass() } style={ this.getStyle() } ref="snackbar">
        { message }
        { this.getAction() }
      </div>
    );
  }

}