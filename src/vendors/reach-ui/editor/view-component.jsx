import React, { PropTypes, Component } from 'react';
import ViewOptions                     from './view-options';

export default class ViewComponent extends Component {

  static propTypes = {
    id       : PropTypes.string.isRequired,
    type     : PropTypes.string.isRequired,
    icon     : PropTypes.string.isRequired,
    options  : PropTypes.object.isRequired,
    onUpdate : PropTypes.func.isRequired
  };

  updateOptions(value) {
    let component = { ...this.props, ...{ options : value } };
    this.props.onUpdate(component);
  }

  render() {
    const { id, name, type, category, icon, options } = this.props;
    let className = `view-component ${ type.toLowerCase() }-component`;
    return (
      <div className={ className }>
        <h6>{ name }</h6>
        <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
        <div className="view-component-icon" style={{ marginTop : '20px' }}>
          <i className="material-icons" role={ type }>{ icon }</i>
        </div>
      </div>
    );
  }
}
