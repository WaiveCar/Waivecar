import React, { PropTypes, Component } from 'react';

export default class ViewComponent extends Component {

  static propTypes = {
    id      : PropTypes.string.isRequired,
    type    : PropTypes.string.isRequired,
    icon    : PropTypes.string.isRequired,
    options : PropTypes.object.isRequired
  };

  render() {
    const { id, type, icon, options } = this.props;
    let className = `view-component ${ type.toLowerCase() }-component`;
    return (
      <div className={ className }>
        <div className="view-component-icon">
          <i className="material-icons" role={ type }>{ icon }</i>
        </div>
        <div className="view-component-options" style={{ display: 'none' }}>
          <h6>{ type }</h6>
          <form className="form">
            <fieldset className="form-group">
              <label htmlFor="Name">Name</label>
              <input type="text" className="form-control" />
            </fieldset>
            <fieldset className="form-group">
              <label htmlFor="Name">Options</label>
              <input type="text" className="form-control" />
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
}
