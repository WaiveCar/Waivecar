import React, { PropTypes, Component } from 'react';
import ViewOptions                     from './view-options';
import ViewItemIcon                    from './view-item-icon';

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
        <div className="view-header">
          <ViewItemIcon type={ type } icon={ icon} />
          <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
        </div>
      </div>
    );
  }
}
