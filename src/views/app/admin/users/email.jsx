import React, {Component} from 'react';
import moment from 'moment';

export default class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  toggle() {
    let {open} = this.state;
    let {openEmail, closeEmail, idx, message} = this.props;
    if (open) {
      this.setState({open: false}, () => closeEmail(idx));
    } else {
      this.setState({open: true}, () => openEmail(idx, message.content));
    }
  }

  render() {
    let {message} = this.props;
    let {open} = this.state;
    return (
      <tr ref="row">
        <td onClick={() => this.toggle()}>
          {open ? <div>open</div> : <div>closed</div>}
        </td>
        <td>{moment(message.createdAt).format('MM/DD/YYYY')}</td>
        <td>{message.content.subject}</td>
        <td></td>
      </tr>
    );
  }
}
