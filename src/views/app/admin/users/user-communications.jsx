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
    api.get(`/users/${this.props.user.id}/communications`, (err, res) => {
      if (err) {
        return;
      }
      this.setState({
        sms: res.filter(each => each.type === 'sms'),
        email: res.filter(each => each.type === 'email'),
      });
    });
  }

  render() {
    let {category, inputText} = this.state;
    let {user, sendText} = this.props;
    return (
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
                this.setState({category: 'sms'}, () => console.log(this.state))
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
                <div className="row">
                  <textarea
                    onChange={e => this.setState({inputText: e.target.value})}
                  />
                </div>
                <div className="row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => sendText(inputText, user)}>
                    Send Message
                  </button>
                </div>
              </div>
            ) : (
              <div>email</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
