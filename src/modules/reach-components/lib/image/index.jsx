'use strict';

import React, { PropTypes } from 'react';
import Reach, { api }       from 'reach-react';
import Snackbar             from '../snackbar';
// import './style.scss';

export default class Image extends React.Component {

  static propTypes = {
    canEdit : PropTypes.bool,
    id      : PropTypes.string
  };

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      id     : null,
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
    function hexToBase64(str) {
      return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }

    api.get(this.props.resource.show.uri.replace(':id', id), (error, result) => {
      if (error) {
        return Snackbar.notify({
          type    : `danger`,
          message : `Could not retrieve image [ID: ${ id }]`
        });
      }
      let key = `image-${ id }`;
      this.setState({
        id     : id,
        key    : key,
        data   : hexToBase64(result),
      }, () => {
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
    let data = `data:image/jpeg;base64,${ this.state.data }`;
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
