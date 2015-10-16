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
    console.log(this.props);
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
    this.setState({ id : id });
    // api.get(this.props.resource.show.uri.replace(':id', id), (error, result) => {
    //   if (error) {
    //     return Snackbar.notify({
    //       type    : `danger`,
    //       message : `Could not retrieve image [ID: ${ id }]`
    //     });
    //   }
    //   let id = `image-${ result.id }`;
    //   this.setState({
    //     id     : id,
    //     data   : result,
    //     key    : result.id,
    //   }, () => {
    //   });
    // });
  }

  /**
   * @method render
   */
  render() {
    if (!this.props.id || !this.state.id) {
      return (<div className="image-component" />)
    }
    return (
      <div className="image-component">
        <img
          id = { this.state.id}
          key = { this.state.key }
          src = { this.props.resource.show.uri.replace(':id', this.state.id) }
          className = 'image'
        />
      </div>
    )
  }

}

Image.defaultProps = { canEdit : false };
