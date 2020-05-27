import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import moment from 'moment';

const limit = 20;

export default class UserCommunications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sms: [],
      email: [],
      category: 'sms',
      textInput: '',
      offset: 0,
      atEnd: false,
    };
  }

  componentDidMount() {
    this.getComs(true);
  }

  getComs(isStart) {
    let {sms, email, offset, category} = this.state;
    let {user} = this.props;
    api.get(
      `/users/${user.id}/communications?offset=${
        isStart ? 0 : offset
      }&type=${category}&limit=${limit}`,
      (err, res) => {
        if (err) {
          return;
        }
        if (category === 'sms') {
          this.setState({
            sms: res.length ? res.reverse() : sms,
            offset: isStart ? 0 : res.length ? offset : offset - limit,
            atEnd: res.length === 0,
          });
        } else {
          this.setState({
            email: res.length
              ? res.map(item => {
                  item.content = JSON.parse(item.content);
                  return item;
                })
              : email,
            offset: isStart ? 0 : res.length ? offset : offset - limit,
            atEnd: res.length === 0,
          });
        }
      },
    );
  }

  showOlder() {
    let {offset} = this.state;
    this.setState({offset: offset + limit}, () => this.getComs());
  }

  showNewer() {
    let {offset} = this.state;
    this.setState({offset: offset - limit >= 0 ? offset - limit : 0}, () =>
      this.getComs(),
    );
  }

  openEmail(idx, content) {
    let {email} = this.state;
    content.isExpansion = true;
    let temp = [...email];
    temp.splice(idx + 1, 0, content);
    temp[idx].open = true;
    this.setState({
      email: temp,
    });
  }

  closeEmail(idx) {
    let {email} = this.state;
    let temp = [...email];
    temp.splice(idx + 1, 1);
    temp[idx].open = false;
    this.setState({
      email: temp,
    });
  }

  toggle(message, idx) {
    let {open} = message;
    if (open) {
      this.closeEmail(idx);
    } else {
      this.openEmail(idx, message.content);
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
    let {category, inputText, sms, email, offset, atEnd} = this.state;
    let {user, sendText} = this.props;
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1rem',
    };
    return (
      <div>
        <div className="box">
          <h3>
            User Communications
            <small>View previous emails and texts</small>
          </h3>
          <div className="box-content">
            <div className="row">
              <button
                type="button"
                className={`btn btn-${
                  category === 'sms' ? 'primary' : 'secondary'
                }`}
                onClick={() =>
                  this.setState({category: 'sms'}, () => this.getComs(true))
                }>
                SMS
              </button>
              <button
                type="button"
                className={`btn btn-${
                  category === 'email' ? 'primary' : 'secondary'
                }`}
                onClick={() =>
                  this.setState({category: 'email'}, () => this.getComs(true))
                }>
                Email
              </button>
            </div>
            <div className="row" style={{marginTop: '0.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  disabled={atEnd}
                  className={'btn btn-sm'}
                  onClick={() => this.showOlder()}>
                  Show Older
                </button>
                <button
                  type="button"
                  disabled={offset <= 0}
                  className={'btn btn-sm btn-primary'}
                  onClick={() => this.showNewer()}>
                  Show Newer
                </button>
              </div>
              {category === 'sms' ? (
                <div>
                  <h4 style={{marginBottom: '1rem', marginTop: '1rem'}}>
                    {user.firstName} {user.lastName}: {user.phone}
                  </h4>
                  {sms.map((message, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        textAlign: 'left',
                        ...(message.userId === message.creatorId
                          ? {
                              justifyContent: 'flex-end',
                            }
                          : {
                              justifyContent: 'flex-start',
                            }),
                      }}>
                      <div
                        style={{
                          width: '45%',
                        }}>
                        <div style={{textDecoration: 'underline'}}>
                          {message.userId === message.creatorId
                            ? `${user.firstName} ${user.lastName}`
                            : message.creator
                            ? `${message.creator.firstName} ${message.creator.lastName}`
                            : 'The Computer'}{' '}
                          ({moment(message.createdAt).format('M/D/YY h:MM A')}
                          ):
                        </div>
                        <div
                          style={{
                            border: '1px solid black',
                            borderRadius: '5px',
                            padding: '0.5rem 1rem',
                            marginBottom: '0.5rem',
                          }}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="row" style={centerStyle}>
                    <textarea
                      style={{width: '80%'}}
                      value={inputText}
                      onChange={e => this.setState({inputText: e.target.value})}
                    />
                  </div>
                  <div className="row" style={centerStyle}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        sendText(inputText, user, () => this.getComs(true))
                      }>
                      Send Message
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => this.getComs(true)}>
                      Update Thread
                    </button>
                  </div>
                </div>
              ) : (
                <div className="box-content no-padding">
                  <div>
                    <table className="box-table table-striped">
                      <thead>
                        <tr>
                          <th width="24" />
                          <th>Date</th>
                          <th>Title</th>
                          <th>Resend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {email.map((message, i) =>
                          !message.isExpansion ? (
                            <tr className="ride-details" key={i}>
                              <td
                                className="text-center"
                                onClick={() => this.toggle(message, i)}>
                                {message.open ? (
                                  <i className="material-icons primary">
                                    keyboard_arrow_down
                                  </i>
                                ) : (
                                  <i className="material-icons">
                                    keyboard_arrow_right
                                  </i>
                                )}
                              </td>
                              <td>
                                {moment(message.createdAt).format('MM/DD/YYYY')}
                              </td>
                              <td>{message.content.subject}</td>
                              <td>
                                <button
                                  onClick={() => this.resend(message.id)}
                                  className="btn btn-xs btn-link undo">
                                  <span className="fa fa-undo"></span>
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr key={i}>
                              <td
                                colSpan="4"
                                style={{fontSize: '10px'}}
                                dangerouslySetInnerHTML={{
                                  __html: message.html,
                                }}
                              />
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
