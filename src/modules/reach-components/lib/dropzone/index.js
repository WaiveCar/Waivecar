'use strict';

import React    from 'react';
import { auth } from 'reach-react';
import Dropzone from 'dropzone';
import './dropzone.scss';
import './basic.scss';

export default class DZ extends React.Component {
 
  /**
   * Mount a new dropzone on the provided dropzone ref.
   */
  componentDidMount() {
    new Dropzone(this.refs.dropzone, {
      paramName   : 'files',
      headers     : {
        Authorization : auth.user.token
      },
      ...this.props.options
    });
  }

  /**
   * Return dropzone component.
   * @return {Object}
   */
  render() {
    return <div className="dropzone" ref="dropzone" />
  }

}