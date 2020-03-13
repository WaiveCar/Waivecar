import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import Email from './email.jsx';
import moment from 'moment';

export default class UserCommunications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sms: [],
      email: [],
      category: 'sms',
      textInput: '',
      offset: 0,
    };
  }

  componentDidMount() {
    this.getComs();
  }

  getComs(isStart) {
    let {sms, email, offset, category} = this.state;
    let {user} = this.props;
    api.get(
      `/users/${user.id}/communications?offset=${
        isStart ? 0 : offset
      }&type=${category}&limit=20`,
      (err, res) => {
        if (err) {
          return;
        }
        if (category === 'sms') {
          this.setState({
            sms: [...res.reverse(), ...(!isStart ? sms : [])],
            offset: isStart ? 0 : offset,
          });
        } else {
          this.setState({
            email: [
              ...(!isStart ? email : []),
              ...res.map(item => {
                item.content = JSON.parse(item.content);
                return item;
              }),
            ],
            offset: isStart ? 0 : offset,
          });
        }
      },
    );
  }

  showEarlier() {
    this.setState({offset: this.state.offset + 20}, () => this.getComs());
  }

  openEmail(idx, content) {
    let {email} = this.state;
    content.isExpansion = true;
    let temp = [...email];
    temp.splice(idx + 1, 0, content);
    this.setState({
      email: temp,
    });
  }

  closeEmail(idx) {
    let {email} = this.state;
    let temp = [...email];
    temp.splice(idx + 1, 1);
    this.setState({
      email: temp,
    });
  }

  render() {
    let {category, inputText, sms, email} = this.state;
    let {user, sendText} = this.props;
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1rem',
    };
    return (
      <div className="rides">
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
              <button
                type="button"
                className={'btn btn-primary'}
                onClick={() => this.showEarlier()}>
                Show Earlier
              </button>
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
                    <table className="table-rides">
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
                            <Email
                              key={i}
                              idx={i}
                              message={message}
                              openEmail={(idx, content) =>
                                this.openEmail(idx, content)
                              }
                              closeEmail={idx => this.closeEmail(idx)}
                            />
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
