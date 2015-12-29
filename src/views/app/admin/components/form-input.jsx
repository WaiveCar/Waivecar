import React   from 'react';
import { dom } from 'bento';

module.exports = class FormInput extends React.Component {

  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state    = {
      className : this.className(this.props.className)
    };
  }

  /**
   * Returns a className with optional focus class appended if input is focused.
   * @param  {String} value
   * @return {String}
   */
  className = (value) => {
    return dom.setClass({
      value : value,
      focus : this.hasFocus
    });
  }

  /**
   * Sets the focus state of the input to true.
   * @return {Void}
   */
  focus = () => {
    this.hasFocus = true;
    this.setState({
      className : this.className(this.props.className)
    });
  }

  /**
   * Sets the focus state of the input to false.
   * @return {Void}
   */
  blur = () => {
    this.hasFocus = false;
    this.setState({
      className : this.className(this.props.className)
    });
  }

  render() {
    return (
      <div className={ this.state.className }>
        {
          React.Children.map(this.props.children, child => {
            if (child.type === 'input') {
              return React.cloneElement(child, {
                onFocus : this.focus,
                onBlur  : this.blur
              })
            }
            return child
          })
        }
        <div className="focus-bar" />
      </div>
    );
  }

};
