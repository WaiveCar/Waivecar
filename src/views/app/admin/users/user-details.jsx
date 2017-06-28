import React          from 'react';
import { relay, api } from 'bento';
import { snackbar }   from 'bento-web';
import { Form }       from 'bento/lib/helpers';
import md5            from 'md5';
import FormInput      from '../components/form-input';
import CardList       from '../../components/user/cards/card-list';
import RideList       from '../../components/user/rides/ride-list';
import ChargeList     from '../../components/user/charges/charge-list';


module.exports = class UserDetails extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      showDanger: false
    }
    relay.subscribe(this, 'users');
    relay.subscribe(this, 'notes');
  }

  componentDidMount() {
    let user = this.state.users.find(val => val.id === parseInt(this.props.id));
    if (!user) {
      api.get(`/users/${ this.props.id }`, (err, user) => {
        this.setState({currentUser: user});
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.users.store(user);
      });
    } else {
      this.setState({currentUser: user});
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
      url = `//www.gravatar.com/avatar/${ md5(user.email || '') }?s=150`;
    } 
    return url;
  }

  removeUser = (event) => {
    alert('Please tell Chris to delete user ' + this.props.id);
    /*
    api.delete(`/users/${ this.props.id }`, {}, (err) => {
      snackbar.notify({
        type    : 'success',
        message : 'User successfully deleted'
      });

      window.location = '/users/';
    });
    */
  }

  isWaiveWork = () => {
    return this.state.currentUser.isWaivework;
  }
  isFleetManager = () => {
    return this.state.currentUser.role.name === 'admin';
  }

  waiveWorkToggle = () => { 
    let user = this.state.currentUser;
    let word = this.isWaiveWork() ? ['remove', 'from'] : ['add', 'to'];
    if(!confirm(`Are you sure you want to ${word[0]} ${user.firstName} ${user.lastName} ${word[1]} WaiveWork?`)) {
      return;
    }
    api.put(`/users/${ this.props.id }`, {isWaivework: !this.isWaiveWork()}, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }

      user.isWaivework = !this.isWaiveWork();
      this.setState({currentUser: user});

      snackbar.notify({
        type    : 'success',
        message : `${user.firstName} ${user.lastName} ${word[0]} ${word[1]} WaiveWork successful`
      });
    });
  }

  fleetToggle = () => {
    let user = this.state.currentUser;
    let newRole = 0;

    if (this.isFleetManager()) {
      if(!confirm(`Are you sure you want to Remove ${user.firstName} ${user.lastName} as a fleet manager?`)) {
        return false;
      }
      newRole = 1;
    } else {
      if(!confirm(`Are you sure you want to Add ${user.firstName} ${user.lastName} as a fleet manager?`)) {
        return false;
      }
      newRole = 3;
    }
    if([1,3].indexOf(newRole) !== -1) {
      api.put(`/users/${ user.id }`, { role: newRole }, (err, user) => {
        snackbar.notify({
          type    : 'success',
          message : 'User status has changed.'
        });
        this.users.store(user);
        this.setState({currentUser: user});
      });
    }
  }
  
  submit = (event) => {
    let form = new Form(event);

    // If we are suspending the user then we ask for a reason
    if (form.data.status === 'suspended' && this.state.currentUser.status !== 'suspended') {
      var reason = prompt("Please optionally provide a reason for suspending the user (they will see this when try to use the service). You can leave this blank.");
      if(reason === null) {
        snackbar.notify({
          type    : 'success',
          message : 'Suspension aborted'
        });
        // and make sure we get out of here and do nothing.
        return false;
      }
      form.data.reason = reason;
    }

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

  verifyPhone = (event) => {
    api.put(`/users/${ this.props.id }`, {
      verifiedPhone: true
    }, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      snackbar.notify({
        type    : 'success',
        message : 'User phone successfully verified'
      });
    });
  }

  getSuspensionReason = (user) => {
    if(user.status === 'suspended' && this.state.notes.user[user.id]) {

      let notes = this.state.notes.user[user.id].filter((row) => {
        return row.type === 'suspension';
      });
      if(notes && notes[notes.length - 1]) {
        return notes[notes.length - 1].content;
      }
    }
  }

  toggleDanger = () => {
    this.setState({ showDanger: !this.state.showDanger });
  }

  render() {
    let user = this.state.currentUser;
    let suspensionReason = user ? this.getSuspensionReason(user) : false;

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
            <a target="_blank" href={ this.getAvatar(user) }>
              <div className="profile-image-view" style={{ background : `url(${ this.getAvatar(user) }) center center / cover` }} />
            </a>
          </div>
          <div className="profile-meta">
            <div className="profile-name">
              { user.firstName } { user.lastName } <span>{user.isWaivework ? 'Waivework' : ''}</span>
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
                    <div>
                      <button type="button" className="btn btn-info" style={{ marginRight: 5 }} onClick={this.requestVerification}>Send Code</button>
                      <button type="button" className="btn btn-info" onClick={this.verifyPhone}>Verify</button>
                    </div> || ''
                  }
                </FormInput>
              </div>

              <div className="form-group">
                <label className="col-sm-3 form-control-label" style={{ color : '#666', fontWeight : 300 }}>Account Status</label>
                <div className="col-sm-9 text-right" style={{ padding : '8px 0px' }}>
                  <div className="radio-inline">
                    <label>
                      <input type="radio" name="status" value="pending" defaultChecked={ user.status === 'pending' } />
                      Pending
                    </label>
                  </div>

                  <div className="radio-inline">
                    <label>
                      <input type="radio" name="status" value="pending" defaultChecked={ user.status === 'probation' } />
                      Probation
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

                  <div className="col-sm-12 text-right help-text" style={{ paddingRight: 0, fontSize: "85%", marginTop: "-0.70em" }}>
                    User #{ user.id }. Signup: { user.createdAt.split('T')[0] }
                    { suspensionReason ? <b><br/>Suspension Reason: {suspensionReason}</b> : '' } 
                  </div>
                  <a onClick={ this.waiveWorkToggle.bind(this) } className="btn btn-xs btn-link">{ this.isWaiveWork() ? "Remove From" : "Add to" } WaiveWork</a>
                </div>
                <label className="col-sm-4 form-control-label" style={{ color : '#666', fontWeight : 300 }}>Danger Zone <a onClick={ this.toggleDanger }>({ this.state.showDanger ? 'hide' : 'show' })</a></label>
                <div className="col-sm-8 text-right" style={{ padding : '8px 25px' }}>
                  { this.state.showDanger && 
                   <div>
                    <div className="radio-inline">
                      <a onClick={ this.removeUser } className="pull-left btn btn-xs btn-danger">Delete User</a>
                    </div>

                    <div className="radio-inline">
                      <a onClick={ this.fleetToggle.bind(this) } className="pull-left btn btn-xs btn-link">{ this.isFleetManager() ? "Remove As" : "Add As" } Fleet Manager</a>
                    </div>
                   </div>
                  }
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
        <div className='rides'>
          <RideList user={ user } currentUser={ false } full={ false }></RideList>
          <ChargeList user={ user } currentUser={ false } full={ false }></ChargeList>
        </div>
      </div>
    );
  }

}
