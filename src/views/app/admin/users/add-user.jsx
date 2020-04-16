import React, {Component} from 'react';
import {api, auth} from 'bento';

class AddUser extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="box">
        <h3>Add Users</h3>
        <div className="box-content">
          User Adding Component
        </div>
      </div>
    );
  }
}

export default AddUser;
