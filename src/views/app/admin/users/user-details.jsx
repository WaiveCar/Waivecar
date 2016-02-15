import React          from 'react';
import { relay, api } from 'bento';
import { snackbar }   from 'bento-web';
import { Form }       from 'bento/lib/helpers';
import md5            from 'md5';
import FormInput      from '../components/form-input';
import CardList        from '../../components/user/cards/card-list';

module.exports = class UserDetails extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'users');
  }

  componentDidMount() {
    let user = this.state.users.find(val => val.id === parseInt(this.props.id));
    if (!user) {
      api.get(`/users/${ this.props.id }`, (err, user) => {
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
      url = `${ api.uri }/file/${ user.avatar }`;
    } else {
      url = `//www.gravatar.com/avatar/${ md5(user.email) }?s=150`;
    }
    return url;
  }

  submit = (event) => {
    let form = new Form(event);
    api.put(`/users/${ this.props.id }`, form.data, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      snackbar.notify({
        type    : 'success',
        message : 'User details successfully updated'
      });
    });
  }

  requestVerification = (event) => {
    api.post(`/verifications/phone-verification/${ this.props.id }`, {}, (err, res) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      snackbar.notify({
        type    : `success`,
        message : `Verification SMS has been sent.`
      });
    });
  }

  render() {
    let user = this.state.users.find(val => val.id === parseInt(this.props.id));
    if (!user) {
      return (
        <div className="box-empty">
          <h3>User Details</h3>
          Loading the user details...
        </div>
      );
    }
    return (
      <div>
        <div className="profile-header">
          <div className="profile-image">
            <div className="profile-image-view" style={{ background : `url(${ this.getAvatar(user) }) center center / cover` }} />
          </div>
          <div className="profile-meta">
            <div className="profile-name">
              { user.firstName } { user.lastName }
            </div>
          </div>
        </div>
        <div className="box">
          <h3>
            Personal Details
            <small>
              Review, and edit the users personal details
            </small>
          </h3>
          <div className="box-content">
            <form className="bento-form-static" role="form" onSubmit={ this.submit }>

              <div className="form-group row">
                <FormInput className="col-md-6 bento-form-input">
                  <label>First Name</label>
                  <input type="text" name="firstName" className="form-control" defaultValue={ user.firstName } required />
                </FormInput>
                <FormInput className="col-md-6 bento-form-input">
                  <label>Last Name</label>
                  <input type="text" name="lastName" className="form-control" defaultValue={ user.lastName } required />
                </FormInput>
              </div>

              <div className="form-group row">
                <FormInput className="col-md-6 bento-form-input" helpText={ user.verifiedPhone ? 'Email has been verified' : 'Email has not been verified' }>
                  <label>Email Address</label>
                  <input type="text" name="email" className="form-control" defaultValue={ user.email } required />
                </FormInput>
                <FormInput className="col-md-6 bento-form-input" helpText={ user.verifiedPhone ? 'Phone has been verified' : 'Phone has not been verified' }>
                  <label>Cell Phone</label>
                  <input type="text" name="phone" className="form-control" defaultValue={ user.phone } required />
                  { !user.verifiedPhone &&
                    <button type="button" className="btn btn-info" onClick={this.requestVerification}>Send Verification SMS</button> ||
                    ''
                  }
                </FormInput>
              </div>

              <div className="form-group row">
                <label className="col-sm-3 form-control-label" style={{ color : '#666', fontWeight : 300 }}>Account Status</label>
                <div className="col-sm-9 text-right" style={{ padding : '8px 25px' }}>
                  <div className="radio-inline">
                    <label>
                      <input type="radio" name="status" value="pending" defaultChecked={ user.status === 'pending' } />
                      Pending
                    </label>
                  </div>

                  <div className="radio-inline">
                    <label>
                      <input type="radio" name="status" value="suspended" defaultChecked={ user.status === 'suspended' } />
                      Suspended
                    </label>
                  </div>

                  <div className="radio-inline">
                    <label>
                      <input type="radio" name="status" value="active" defaultChecked={ user.status === 'active' } />
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions text-center">
                <div className="btn-group" role="group">
                  <button type="submit" className="btn btn-primary">Update Details</button>
                </div>
              </div>

            </form>
          </div>
        </div>

        <CardList user={ user } currentUser={ false }></CardList>
      </div>
    );
  }

}
