'use strict';
import React, { PropTypes }              from 'react';
import { type, object }                  from 'reach-react/lib/helpers';
import { auth }                          from 'reach-react';
import { components, fields, resources } from 'reach-ui';
import { Link }                          from 'react-router';
import FileDropzone                      from 'reach-ui/editor/file-dropzone';
// import './style.scss';

export default class File extends React.Component {

  //TODO: handle non-image file renders

  static propTypes = {
    id       : PropTypes.string,
    link     : PropTypes.string,
    canEdit  : PropTypes.bool,
    onChange : PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.state = {
      droppedFiles : null,
      data         : null,
      link         : null
    };
    this.onChange = this.onChange.bind(this);
    this.reset    = this.reset.bind(this);
  }

  /**
   * @method componentWillReceiveProps
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.link) {
      this.setState({
        link : nextProps.link
      });
    }

    this.setState({
      data : {
        ...nextProps.default,
        ...this.state.data
      }
    });
  }

  /**
   * Returns the current data state of the form.
   * @method data
   * @return {Object}
   */
  data() {
    return {
      ...this.props.default,
      ...this.state.data
    }
  }

  /**
   * @method onChange
   * @param  {Object} event
   */
  onChange() {
    let files        = this.state.droppedFiles;
    let { onChange } = this.props;
    if (type.isFunction(onChange)) {
      onChange(files, this.reset);
    }
  }

  /**
   * Cancels the current editing process and reverts to default values.
   * @method reset
   */
  reset() {
    this.setState({
      data : this.props.default ? object.clone(this.props.default) : {},
      link : null
    });
  }

  onDrop(files) {
    this.setState({
      droppedFiles : files
    }, function() {
      this.onChange();
    });
  }

  onActive() {
    console.log('actively dropping');
  }

  renderDropzone() {

    if (!this.props.canEdit) return false;
    if (this.state.data) {
      return false;
    }

    return (
      <FileDropzone ref="dropzone" onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } multiple={ false } />
    );
  }

  renderImagePreview() {
    if (!this.props.canEdit) return false;

    let files = this.state.droppedFiles;
    if (!files || files.length === 0) return false;

    return (
      <div>
        <h2>Uploading { files.length } files...</h2>
        <div>
          { files.map((file, index) => <img key={ index } src={ file.preview } />) }
        </div>
      </div>
    );
  }

  renderImage() {
    if (!this.state.data) return false;

    return (
      <img className="image" src={ this.data.path } />
    );
  }

  renderEditActions() {
    if (!this.props.canEdit) return false;

    return (
      <div className="component-actions">
      </div>
    );
  }

  render() {
    console.log('render');
    return (
      <div className="image-component">
        { this.renderDropzone() }
        { this.renderImagePreview() }
        { this.renderEditActions() }
        { this.renderImage() }
      </div>
    );
  }
}
