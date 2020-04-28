import React, {Component} from 'react';
import Login from './login';
import {api} from 'bento';

class OrganizationSignin extends Component {
  constructor(props) {
    super(props);
    let {organizationName} = props.params;
    this.state = {
      organizationName,
      organization: null,
    };
  }

  componentDidMount() {
    let {organizationName} = this.state;
    api.get(
      `/organizations?name=${organizationName}&includeImage=true`,
      (err, res) => {
        if (err) {
          console.log('error fetching organization', err);
        }
        this.setState({organization: res});
      },
    );
  }

  render() {
    return (
      <div>
        <Login />
      </div>
    );
  }
}

export default OrganizationSignin;
