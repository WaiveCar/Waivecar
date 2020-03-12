import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class UserCommunications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sms: [],
      email: [],
      category: 'sms',
      textInput: '',
    };
  }

  componentDidMount() {
    this.getComs();
  }

  getComs() {
    api.get(`/users/${this.props.user.id}/communications`, (err, res) => {
      if (err) {
        return;
      }
      this.setState({
        sms: res.filter(each => each.type === 'sms'),
        email: res
          .filter(each => each.type === 'email')
          .map(item => {
            item.content = JSON.parse(item.content);
            return item;
          }),
      });
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
    console.log(email);
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
                  this.setState({category: 'sms'}, () =>
                    console.log(this.state),
                  )
                }>
                SMS
              </button>
              <button
                type="button"
                className={`btn btn-${
                  category === 'email' ? 'primary' : 'secondary'
                }`}
                onClick={() => this.setState({category: 'email'})}>
                Email
              </button>
            </div>
            <div className="row" style={{marginTop: '0.5rem'}}>
              {category === 'sms' ? (
                <div>
                  <h4>
                    {user.firstName} {user.lastName}: {user.phone}
                  </h4>
                  {sms.map((message, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent:
                          message.userId === message.creatorId
                            ? 'flex-end'
                            : 'flex-start',
                        textAlign:
                          message.userId === message.creatorId
                            ? 'right'
                            : 'left',
                      }}>
                      <div style={{maxWidth: '45%'}}>
                        <div>
                          {message.userId === message.creatorId
                            ? `${user.firstName} ${user.lastName}`
                            : message.creator
                            ? `${message.creator.firstName} ${message.creator.lastName}`
                            : 'The Computer'}
                          :
                        </div>
                        <div>{message.content}</div>
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
                        sendText(inputText, user, () => this.getComs())
                      }>
                      Send Message
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => this.getComs()}>
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
                        {email.map((message, i) => (
                          <tr key={i}>
                            <td></td>
                            <td>{message.createdAt}</td>
                            <td>{message.content.subject}</td>
                            <td></td>
                          </tr>
                        ))}
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
