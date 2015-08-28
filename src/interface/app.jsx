'use strict';

import React    from 'react';
import { Link } from 'react-router';
import './style.scss';

export default class App extends React.Component {

  /**
   * Set the current server state to true.
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      server : true
    });
  }

  /**
   * Set the current server state to false.
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      server : false
    });
  }

  /**
   * Render the root application.
   * @method render
   */
  render() {
    return (
      <div className="main">
        { this.props.children }
      </div>
    );
  }

}