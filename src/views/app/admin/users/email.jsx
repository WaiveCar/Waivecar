import React, {Component} from 'react';
import moment from 'moment';

export default class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  render() {
    let {message} = this.props;
    let {open} = this.state;
    return (
      <tr>
        <td>{open ? <div>open</div> : <div>closed</div>}</td>
        <td>{moment(message.createdAt).format('MM/DD/YYYY')}</td>
        <td>{message.content.subject}</td>
        <td></td>
      </tr>
    );
  }
}
