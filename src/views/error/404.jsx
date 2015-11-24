'use strict';

import React                    from 'react';
import Bento                    from 'bento';
import config                   from 'config';
import { Link }                 from 'react-router';

module.exports = class NotFoundView extends React.Component {

  /**
   * @class HomeView
   * @constructor
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @method render
   */
  render() {
    return (
      <div>not found</div>
   );
  }

}
