import React, { PropTypes } from 'react';
import config               from 'config';
import Reach, { api }       from 'bento';
import Snackbar             from '../snackbar';

module.exports = class Image extends React.Component {

  static propTypes = {
    resource : PropTypes.object,
    canEdit  : PropTypes.bool,
    id       : PropTypes.string
  };

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      id  : null,
      api : config.api.uri + (config.api.port ? ':' + config.api.port : '')
    }
  }

  /**
   * Load the component from the api and update state.
   * @method componentDidMount
   */
  componentDidMount() {
    if (this.props.id) {
      this.setDefault(this.props.id);
    }
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.id !== nextProps.id) {
      this.setDefault(nextProps.id);
    }
  }

  setDefault(id) {
    api.get(this.props.resource.show.uri.replace(':id', id), (error, result) => {
      if (error) {
        return Snackbar.notify({
          type    : `danger`,
          message : `Could not retrieve image [ID: ${ id }]`
        });
      }
      let key = `image-${ id }`;
      this.setState({
        id : id,
        key  : key,
        data : result,
      });
    });
  }

  /**
   * @method render
   */
  render() {
    if (!this.props.id || !this.state.id) {
      return (<div className="image-component" />)
    }
    let data = `${ this.state.api }/file/${ this.state.id }`;
    return (
      <div className="image-component">
        <img
          id = { this.state.id}
          key = { this.state.key }
          src= { data }
          className = 'image'
        />
      </div>
    )
  }

}

Image.defaultProps = { canEdit : false };
