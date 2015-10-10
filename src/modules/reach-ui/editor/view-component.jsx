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
    const { type, options } = this.props;
    options.canEdit = true;
    return components.render(type, options, this.props);
  }

  render() {
    const { accepts, name, type, category, icon, options } = this.props;
    let className = `view-component ${ type.toLowerCase() }-component ${ this.state.isActive ? 'is-active' : '' }`;
    return (
      <div className="view-component-container container-fluid">
        <div className="row">
          <div className="col-md-12">
            <ViewDropzone ref="topZone" zone={ 'top' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
        </div>
        <div className="row">
          <div className="col-md-1 vertical-align">
            <ViewDropzone ref="left-zone" zone={ 'left' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
          <div className="col-md-10">
            <div className={ className }>
              <div className="view-header">
                <ViewItemIcon type={ type } icon={ icon} />
                <ViewOptions componentCategory={ category } componentName={ name } componentType={ type } options={ options } update={ this.updateOptions.bind(this) } />
              </div>
              { this.renderType() }
            </div>
          </div>
          <div className="col-md-1 vertical-align">
            <ViewDropzone zone={ 'right' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <ViewDropzone zone={ 'bottom' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } />
          </div>
        </div>
      </div>
    );
  }
}
