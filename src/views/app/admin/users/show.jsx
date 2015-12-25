import React          from 'react';
import { relay, api } from 'bento';
import { snackbar }   from 'bento-web';
import md5            from 'md5';

module.exports = class AdminUsersView extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'users');
  }

  componentDidMount() {
    let user = this.state.users.find(val => val.id === parseInt(this.props.params.id));
    if (!user) {
      api.get(`/users/${ this.props.params.id }`, (err, user) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.users.store(user);
      });
    }
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
  }

  getAvatar(user) {
    let url = null;
    if (user.avatar) {
      url = `${ apiUrl }/file/${ user.avatar }`;
    } else {
      url = `//www.gravatar.com/avatar/${ md5(user.email) }?s=150`;
    }
    return url;
  }

  render() {
    let user = this.state.users.find(val => val.id === parseInt(this.props.params.id));
    if (!user) {
      return <div>Loading user...</div>;
    }
    return (
      <div id="users">
        <div className="profile-header">
          <div className="profile-image">
            <div className="profile-image-view" style={{ background : `url(${ this.getAvatar(user) }) center center / cover` }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { user.firstName } { user.lastName }
            </div>
            User management coming on Monday
          </div>
        </div>
      </div>
    );
  }

};
