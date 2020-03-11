import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class UserCommunications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sms: [],
      email: [],
    };
  }

  componentDidMount() {
    api.get(`/users/${this.props.user.id}/communications`, (err, res) => {
      if (err) {
        console.log('err', err);
        return;
      }
      this.setState(
        {
          sms: res.filter(each => each.type === 'sms'),
          email: res.filter(each => each.type === 'email'),
        },
        () => console.log(this.state),
      );
    });
  }

  render() {
    return <div />;
  }
}
