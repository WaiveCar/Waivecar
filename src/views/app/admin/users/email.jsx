import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
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

  resend(id) {
    api.post(`/users/resendEmail/${id}`, {}, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error resending email: ${err.message}.`,
        });
      }
      return snackbar.notify({
        type: 'success',
        message: 'Email resent successfully',
      });
    });
  }

  render() {
    let {message} = this.props;
    let {open} = this.state;
    return (
      <tr ref="row">
        <td onClick={() => this.toggle()}>
          {open ? (
            <i className="material-icons primary">keyboard_arrow_down</i>
          ) : (
            <i className="material-icons">keyboard_arrow_right</i>
          )}
        </td>
        <td>{moment(message.createdAt).format('MM/DD/YYYY')}</td>
        <td>{message.content.subject}</td>
        <td>
          <button
            onClick={() => this.resend(message.id)}
            className="btn btn-xs btn-link undo">
            <span className="fa fa-undo"></span>
          </button>
        </td>
      </tr>
    );
  }
}
