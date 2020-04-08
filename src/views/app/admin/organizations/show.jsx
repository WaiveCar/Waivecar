import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Organization extends Component {
  constructor(props) {
    super(props);
    let pathName = window.location.pathname.split('/');
    this.state = {
      id: pathName.pop(),
    };
  }

  componentDidMount() {
    let {id} = this.state;
    api.get(`/organizations/${id}`, (err, result) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      console.log(result);
      this.setState({organization: result});
    });
  }

  render() {
    return <div>Orgs Show</div>;
  }
}

module.exports = Organization;
