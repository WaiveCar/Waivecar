import React, { PropTypes } from 'react';
import { DropTarget }       from 'react-dnd';
import { helpers  }         from 'reach-react';
import { Form, Layout }     from 'reach-components';
import components           from '../lib/components';
import ViewComponent        from './view-component';
import ViewDropzone         from './view-dropzone';
import ItemCategories       from './item-categories';

let { Container, Row, Column } = Layout;

export default class ViewContainer extends React.Component {

  static propTypes = {
    accepts     : PropTypes.arrayOf(PropTypes.string).isRequired,
    options     : PropTypes.object.isRequired,
    hasSiblings : PropTypes.bool.isRequired,
    onDrop      : PropTypes.func.isRequired,
    onUpdate    : PropTypes.func.isRequired,
  };

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);

    this.updateOptions        = this.updateOptions.bind(this);
    this.getMandatorySettings = this.getMandatorySettings.bind(this);
    this.toggleSettings       = this.toggleSettings.bind(this);
    this.onRemove             = this.onRemove.bind(this);
    this.updateOptions        = this.updateOptions.bind(this);

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
    if (mandatoryCount <= Object.keys(this.props.options).length) return false;
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
    if (this.state.showSettings) {
      this.toggleSettings();
    }
  }

  onRemove() {
    let component = this.props;
    this.props.onRemove(component);
  }

  onDrop(item) {
    item.nearest = this.props.editorId;
    item.onContainer = true;
    this.props.onDrop(item);
  }

  /**
   * @method renderRow
   * @param  {Object} row
   * @param  {Number} rowIndex
   */
  renderRow(row, rowIndex) {
    let { components, options } = row;
    let columnWidth = Math.floor(12 / row.components.length) || 12;
    return (
      <Row key={ rowIndex } { ...options }>
        {
          components.map((column, columnIndex) => {
            return this.renderColumn(column, columnIndex, columnWidth, row.editorId)
          }.bind(this))
        }
      </Row>
    );
  }

  /**
   * @method renderColumn
   * @param  {Object} column
   * @param  {Number} columnIndex
   * @param  {Number} columnWidth
   */
  renderColumn(column, columnIndex, columnWidth, rowId) {
    let { components, options } = column;
    if (options && options.width) {
      columnWidth = options.width;
    }
    return (
      <Column key={ columnIndex } width={ columnWidth } { ...options }>
        <h6>{ options.width }</h6>
        { this.renderColumnComponents(components, rowId, column.editorId) }
      </Column>
    );
  }


  /**
   * @method renderColumnComponents
   * @param  {Array} components
   */
  renderColumnComponents(components, rowId, columnId) {
    if (components && components.length > 0) {
      let first = components[0];
      if (first.type === 'row') {
        // column has 1 or more child rows.
        return components.map(this.renderRow.bind(this));
      }

      // column has a component as its child.
      return this.renderComponent(first, rowId, columnId);
    }

    return;
  }

  renderComponent(component, rowId, columnId) {
    return (
      <ViewComponent
        editorId     = { component.editorId }
        name         = { component.name }
        type         = { component.type }
        icon         = { component.icon }
        category     = { component.category }
        options      = { component.options }
        accepts      = { component.accepts }
        row          = { rowId }
        column       = { columnId }
        onUpdate     = { this.props.onUpdate }
        onDrop       = { this.props.onDrop }
        onRemove     = { this.props.onRemove }
      />
    );
  }

  renderType() {
    if (this.requiresOptions()) return false;
    if (this.state.showSettings) return false;
    const { components, accepts } = this.props;
    let containerClassName = `view-container${ this.props.className ? ' ' + this.props.className : '' }`;

    return (
      <Container className={ containerClassName }>
        {
          Array.isArray(components) && components.length > 0
            ? components.map(this.renderRow.bind(this))
            : <ViewDropzone zone={ 'all' } accepts={ accepts } onDrop={ this.onDrop.bind(this) } />
        }
      </Container>
    );
  }

  renderSettings() {
    if (!this.state.showSettings) return false;

    const { name, type, category, options } = this.props;
    return (
      <div className="view-options">
        <Form
          fields    = { this.state.settings }
          default   = { options }
          submit    = { this.updateOptions }
          buttons   = {[
            {
              type  : 'button',
              value : 'Reset',
              class : 'btn btn-info-outline btn-xs',
              click : 'reset'
            },
            {
              type  : 'submit',
              value : 'Ok',
              class : 'btn btn-success-outline btn-xs',
              click : 'submit'
            }
          ]}
        />
      </div>
    );
  }

  render() {
    const { components, accepts, isOver, type, hasSiblings } = this.props;
    let containerType = this.props.options && this.props.options.type ? this.props.options.type : 'Container';
    return (
      <div className="view-container-container">
        <div className="view-component-header">
          <div className="options-menu">
            { hasSiblings && <button type="button" className="btn btn-danger-outline btn-xs" onClick={ this.onRemove }>Remove { containerType }</button> }
            <button type="button" className="btn btn-icon" onClick={ this.toggleSettings }>
              <i className="material-icons" role="edit">more_horiz</i>
            </button>
          </div>
        </div>
        { this.renderSettings() }
        { this.renderType() }
      </div>
    );
  }
}
