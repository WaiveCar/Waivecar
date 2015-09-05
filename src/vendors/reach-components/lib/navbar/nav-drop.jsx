'use strict';

import React    from 'react';
import { DOM }  from 'reach-react';
import { Link } from 'react-router';

export default class NavDrop extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      class    : 'r-nav-drop',
      position : {
        left : 0
      }
    }
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    window.addEventListener("resize", this.updatePosition.bind(this));
    this.updatePosition();
  }

  /**
   * Check if the parent has changed and re-calculate position of the
   * nav box if it has.
   * @method componentDidUpdate
   * @param  {Object} prevProps
   * @param  {Object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.parent !== this.props.parent) {
      this.updatePosition();
    }
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
  updatePosition() {
    this.setState({
      class : DOM.setClass({
        'r-nav-drop' : true,
        'animated'   : true,
        'flipInY'    : true
      }),
      position : {
        left : this.getPosition()
      }
    });
    setTimeout(() => {
      this.setState({
        class : DOM.setClass({
          'r-nav-drop' : true
        })
      });
    }.bind(this), 500);
  }

  /**
   * @method getPosition
   */
  getPosition() {
    let parent     = this.props.parent;
    let box        = this.refs.box;
    if (!parent || !box) {
      return 0;
    }
    let adjustment = Math.floor((parent.offsetWidth - box.offsetWidth) / 2);
    if (adjustment < 0) {
      let left = Math.ceil(parent.offsetLeft - Math.abs(adjustment));
      return left > 20 ? left : 20;
    }
    return parent.offsetLeft + adjustment;
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className={ this.state.class } ref="box" style={ this.state.position }>
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