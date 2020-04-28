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
        if (err || !res.length) {
          this.props.history.replaceState({}, '/login');
        }
        this.setState({organization: res[0]});
      },
    );
  }

  render() {
    let {organization} = this.state;
    return (
      <div>
        <Login organization={organization} />
      </div>
    );
  }
}

export default OrganizationSignin;
