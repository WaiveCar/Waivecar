import React, { PropTypes, Component } from 'react';
import ViewItemIcon                    from './view-item-icon';
import ViewDropzone                    from './view-dropzone';
import ItemCategories                  from './item-categories';
import components                      from '../lib/components';
import { Form }                        from 'reach-components';

export default class ViewComponent extends Component {

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

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);

    this.updateOptions = this.updateOptions.bind(this);
    this.getMandatorySettings = this.getMandatorySettings.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      isActive     : false,
    };
    this.state.settings = components.getOptions(this.props.type);
    this.state.showSettings = this.requiresOptions();
  }

  getMandatorySettings() {
    if (!(this.state && this.state.settings)) {
      return false;
    }

    let mandatorySettings = this.state.settings.filter((f) => f.hasOwnProperty('required') && f.required === true);
    return mandatorySettings;
  }

  requiresOptions() {
    let mandatoryOptions = this.getMandatorySettings();
    let mandatoryCount= mandatoryOptions.length;
    if (mandatoryCount === 0) return false;
    if (!this.props.options) return true;
    // TODO: actually test each key by name.
    if (mandatoryCount === Object.keys(this.props.options).length) return false;
    return true;
  }

  toggleSettings() {
    this.setState({
      showSettings : !this.state.showSettings
    });
  }

  updateOptions(value) {
    let component = { ...this.props, ...{ options : value } };
    this.props.onUpdate(component);
    this.toggleSettings();
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
    if (this.requiresOptions()) return false;
    if (this.state.showSettings) return false;

    return components.render(this.props.type, {
      canEdit : true,
      ...this.props.options
    });
  }

  renderSettings() {
    if (!this.state.showSettings) return false;

    const { name, type, category, options } = this.props;
    return (
      <Form
        fields    = { this.state.settings }
        default   = { options }
        submit    = { this.updateOptions }
        buttons   = {[
          {
            type  : 'button',
            value : 'Reset',
            class : 'btn btn-info btn-sm',
            click : 'reset'
          },
          {
            type  : 'submit',
            value : 'Save',
            class : 'btn btn-success btn-sm',
            click : 'submit'
          }
        ]}
      />
    );
  }

  render() {
    const { accepts, name, type, category, icon, options } = this.props;
    let className = `view-component ${ type.toLowerCase() }-component ${ this.state.isActive ? 'is-active' : '' }`;
    let containerClass = `view-component-container container-fluid ${ this.state.isActive ? 'is-active' : '' }`;
    return (
      <div className={ containerClass }>
        <div className="view-component-header">
          <ViewItemIcon type={ type } icon={ icon} />
          <div className="options-menu">
            <button type="button" className="btn btn-icon" onClick={ this.toggleSettings }>
              <i className="material-icons" role="edit">more_vert</i>
            </button>
          </div>
        </div>
        { this.renderSettings() }
        { this.renderType() }
        <ViewDropzone ref="topZone" zone={ 'top' } accepts={ accepts } onDrop={ this.onDrop } onActive={ this.onActive } />
        <ViewDropzone ref="leftZone" zone={ 'left' } accepts={ accepts } onDrop={ this.onDrop } onActive={ this.onActive } />
        <ViewDropzone ref="rightZone" zone={ 'right' } accepts={ accepts } onDrop={ this.onDrop } onActive={ this.onActive } />
        <ViewDropzone ref="bottomZone" zone={ 'bottom' } accepts={ accepts } onDrop={ this.onDrop } onActive={ this.onActive } />
      </div>
    );
  }
}
