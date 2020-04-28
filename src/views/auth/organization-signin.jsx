import React, {Component} from 'react';

class OrganizationSignin extends Component {
  constructor(props) {
    super(props);
    let {organizationName} = props.params;
    this.state = {
      organizationName,
    }
  }
  render() {
    return <div>Signin</div>
  }
}

export default OrganizationSignin;
