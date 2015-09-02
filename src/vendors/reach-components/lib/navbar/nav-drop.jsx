'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class NavDrop extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      position : {
        left : this.getPosition()
      }
    }
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    window.addEventListener("resize", this.updatePosition.bind(this));
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updatePosition.bind(this));
  }

  /**
   * @method updatePosition
   */
  updatePosition(left) {
    this.setState({
      position : {
        left : this.getPosition()
      }
    });
  }

  /**
   * @method getPosition
   */
  getPosition() {
    let { offsetLeft, offsetWidth } = this.props.parent;
    let left = Math.ceil(offsetLeft - (offsetWidth / 2));
    return left > 20 ? left + 3 : 20;
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="r-nav-drop animated flipInY" style={ this.state.position }>
        {
          this.props.menu.map((link, i) => {
            return (
              <Link key={ i } to={ link.href } onClick={ this.props.transit }>
                <i className="material-icons" role={ link.name }>{ link.icon }</i>
                { link.name }
              </Link>
            )
          })
        }
      </div>
    );
  }

}