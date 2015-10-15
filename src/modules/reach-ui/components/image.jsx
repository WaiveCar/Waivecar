'use strict';

import React                             from 'react';
import { auth, api }                     from 'reach-react';
import { File }                          from 'reach-components';
import { components, fields, resources } from 'reach-ui';

class UIImage extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      default : {}
    };
    this.onChange = this.onChange.bind(this);
  }

  /**
   * Checks if the Image is of type update and requests data if it is.
   * @method componentDidMount
   */
  componentDidMount() {
    if (!this.isCreate()) {
      this.setDefault(this.id());
    }
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    let prev = this.id();
    let nextId = nextProps.params ? nextProps.params.id : nextProps.id;
    if (nextId && nextId !== prev) {
      this.setDefault(nextId);
    }
  }

  /**
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    let prev = this.state.default.id;
    let next = nextState.default.id;
    if (next !== prev) {
      return true;
    }
    return false;
  }

  /**
   * @method id
   * @return {String}
   */
  id() {
    return this.props.id || 'create';
  }

  /**
   * @method isCreate
   * @return {Boolean}
   */
  isCreate() {
    return this.id() === 'create';
  }

  /**
   * Updates the data state based on the provided id.
   * @method setDefault
   * @param  {Mixed} id
   */
  setDefault(id) {
    let resource = this.resource();
    api.get(resource.uri.replace(':id', id), (error, data) => {
      if (error) {
        throw new Error(error);
      }
      this.setState({
        default : data
      });
    }.bind(this));
  }

  /**
   * Returns the resource resource for the current instance.
   * @method resource
   * @return {Object}
   */
  resource() {
    let resource = resources.get('files');
    if (this.isCreate()) {
      return resource.store;
    }
    return resource.update;
  }

  /**
   * @method submit
   * @param  {Object}   data
   * @param  {Function} reset
   */
  onChange(files, reset) {
    let resource = this.resource();
    let data = {
      private : false,
      target  : 'local',
      files   : files
    };

    // ### Submit Data
    // Submits the data to api either for create/update
    if (this.isCreate()) {
      api.post(resource.uri, data, (error, data) => {
        if (error) {
          return handleError(error.message);
        }
        this.goBack();
      }.bind(this));
    } else {
      api.put(resource.uri.replace(':id', this.id()), data, (error) => {
        if (error) {
          return handleError(error.message);
        }
        snackbar.notify({
          type    : 'success',
          message : 'File was successfully updated.'
        });
      });
    }

    // ### Error
    // Handle incoming errors.
    function handleError(message) {
      snackbar.notify({
        type    : 'danger',
        message : message
      });
    }
  }

  render() {
    return (
      <File className="r-image" default={ this.state.default } link={ this.props.link } onChange={ this.onChange } { ...this.props } />
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Image',
      type    : 'file',
      class   : UIImage,
      icon    : 'image',
      options : [
        {
          name      : 'type',
          label     : 'File Type',
          component : 'react-select',
          options   : [
            {
              name  : 'Image',
              value : 'image'
            },
            {
              name  : 'Document',
              value : 'document'
            }
          ],
          helpText  : 'Select the File Type to be displayed'
        },
        {
          name      : 'link',
          label     : 'Link',
          component : 'input',
          type      : 'text',
          helpText  : 'If the File should link somewhere, provide a URL'
        },
        {
          name      : 'id',
          label     : 'Image',
          component : 'input',
          type      : 'text',
          helpText  : 'File Id'
        }
      ]
    };
  }
}