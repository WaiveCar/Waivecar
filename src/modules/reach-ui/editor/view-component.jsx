import React, { PropTypes, Component } from 'react';
import ViewOptions                     from './view-options';
import ViewItemIcon                    from './view-item-icon';
import ViewDropzone                    from './view-dropzone';
import ItemCategories                  from './item-categories';
import components                      from '../lib/components';

export default class ViewComponent extends Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      isActive : false
    };
  }

  static propTypes = {
    editorId : PropTypes.string.isRequired,
    type     : PropTypes.string.isRequired,
    icon     : PropTypes.string.isRequired,
    options  : PropTypes.object.isRequired,
    accepts  : PropTypes.arrayOf(PropTypes.string).isRequired,
    row      : PropTypes.string.isRequired,
    column   : PropTypes.string.isRequired,
    onUpdate : PropTypes.func.isRequired,
    onDrop   : PropTypes.func.isRequired,
  };

  updateOptions(value) {
    let component = { ...this.props, ...{ options : value } };
    this.props.onUpdate(component);
  }

  onDrop(item) {
    item.nearest = this.props.editorId;
    item.row     = this.props.row;
    item.column  = this.props.column;
    this.props.onDrop(item);
  }

  onActive(zone) {
    this.setState({
      isActive : true
    });
  }

  renderType() {
    return components.render(this.props.type, {
      canEdit : true,
      ...this.props.options
    });
  }

  render() {
    const { accepts, name, type, category, icon, options } = this.props;
    let className = `view-component ${ type.toLowerCase() }-component ${ this.state.isActive ? 'is-active' : '' }`;
    let containerClass = `view-component-container container-fluid ${ this.state.isActive ? 'is-active' : '' }`;
    return (
      <div className={ containerClass }>
        <div className="row horizontal-dropzone">
          <div className="col-xs-12">
            <ViewDropzone ref="topZone" zone={ 'top' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <div className="vertical-align vertical-dropzone">
              <ViewDropzone ref="left-zone" zone={ 'left' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
            </div>
            <div className={ className }>
              <div className="view-component-header">
                <ViewItemIcon type={ type } icon={ icon} />
                <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
              </div>
              <div className="view-component-content">
                { this.renderType() }
              </div>
            </div>
            <div className="vertical-align vertical-dropzone">
              <ViewDropzone zone={ 'right' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
            </div>
          </div>
        </div>
        <div className="row horizontal-dropzone">
          <div className="col-xs-12">
            <ViewDropzone zone={ 'bottom' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
        </div>
      </div>
    );
  }
}
