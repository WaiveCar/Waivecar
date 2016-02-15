import React                              from 'react';
import { auth, dom } from 'bento';
import RideList from '../../components/user/rides/ride-list';

module.exports = class RideListView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('My Rides');
  }

  /**
   * Rdner the profile view.
   * @return {Object}
   */
  render() {
    return (
      <div className="rides container">
        <div className="row">
          <div className="col-xs-12">
            <RideList user={ auth.user() }></RideList>
          </div>
        </div>
      </div>
    );
  }

}
