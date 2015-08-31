'use strict';

import React        from 'react';
import { Snackbar } from 'reach-components';
import { Link }     from 'react-router';
import './style.scss';

export default class App extends React.Component {

  /**
   * @constrcutor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      snackbar : null
    };
    Snackbar.hook(this);
  }

  /**
   * We only update the root component when a notification has been added.
   * @method shouldComponentUpdate
   * @param  {Object} props The next props
   * @param  {Object} state The next state
   */
  shouldComponentUpdate(props, state) {
    let oldPath  = this.props.location.pathname;
    let newPath  = props.location.pathname;
    if (oldPath !== newPath || this.snackbarUpdated(state.snackbar, this.state.snackbar)) {
      return true;
    }
    return false;
  }

  snackbarUpdated(newSnack, oldSnack) {
    if (newSnack === oldSnack) {
      return false;
    }
    return true;
  }

  /**
   * Render the root application.
   * @method render
   */
  render() {
    return (
      <div className="main">
        { this.props.children }
        { !this.state.snackbar || Snackbar.render() }
      </div>
    );
  }

}