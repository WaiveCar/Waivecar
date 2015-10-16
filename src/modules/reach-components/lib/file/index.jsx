'use strict';
import React, { PropTypes }              from 'react';
import { type, object }                  from 'reach-react/lib/helpers';
import { auth, api }                          from 'reach-react';
import { components, fields, resources } from 'reach-ui';
import { Link }                          from 'react-router';
import FileDropzone                      from 'reach-ui/editor/file-dropzone';
// import './style.scss';

export default class File extends React.Component {

  static propTypes = {
    id       : PropTypes.string,
    name     : PropTypes.string,
    default  : PropTypes.object,
    onChange : PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.onChange = this.onChange.bind(this);
    this.reset    = this.reset.bind(this);
    this.remove = this.remove.bind(this);

    this.state = {
      droppedFiles : null,
      file         : null
    };
  }

  /**
   * @method componentWillReceiveProps
   */
  componentWillReceiveProps(nextProps, nextState) {
    this.setState({
      ...nextProps.default,
      ...this.state
    });
  }

  /**
   * Cancels the current editing process and reverts to default values.
   * @method reset
   */
  reset() {
    this.setState({
      file : this.props.default ? object.clone(this.props.default) : {}
    });
  }

  remove() {
    this.setState({
      file : null
    }, function() {
      this.onChange()
    });
  }

  onDrop(files) {
    this.setState({
      droppedFiles : files
    }, function() {
      this.persistFiles();
    });
  }

  /**
   * @method onChange
   * @param  {String} value
   * @param  {Object} options
   */
  onChange() {
    this.props.onChange({
      target : {
        type  : 'file',
        name  : this.props.name,
        value : this.state.file ? this.state.file.id : null
      }
    });
  }

  persistFiles() {
    let files = this.state.droppedFiles;
    let resource = resources.get('files').store;
    let data = {
      private : false,
      target  : 'local',
      files   : files
    };

    api.file(resource.uri, data, (error, data) => {
      if (error) {
        return handleError(error.message);
      }
      this.setState({
        file : data
      }, function() {
        this.onChange();
      });
    }.bind(this));

    function handleError(message) {
      snackbar.notify({
        type    : 'danger',
        message : message
      });
    }
  }

  onActive() {
    console.log('actively dropping');
  }

  renderDropzone() {
    if (this.props.id) {
      return false;
    }

    return (
      <FileDropzone ref="dropzone" onDrop={ this.onDrop.bind(this) } onActive={ this.onActive.bind(this) } multiple={ false } />
    );
  }

  renderImagePreview() {
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
    if (!this.props.id) return false;
    return (
      <div>
        <input type="text" readOnly={ true } value={ this.props.id } />
        <button type="button" className="btn btn-sm" onClick={ this.remove }>X</button>
      </div>
    );
  }

  render() {
    console.log(this.props);
    return (
      <div className="file-component">
        { this.renderDropzone() }
        { this.renderImagePreview() }
        { this.renderImage() }
      </div>
    );
  }
}
