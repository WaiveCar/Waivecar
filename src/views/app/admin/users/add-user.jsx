import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Form, snackbar} from 'bento-web';
import {Link} from 'react-router';

let buttons = [
  {
    value: 'Add User',
    type: 'submit',
    class: 'btn btn-primary btn-profile-submit',
  },
];

class AddUser extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
    this.state = {
      currentOrganizations: [],
      searchResults: [],
      usersToAdd: [],
      failedUsers: [],
      orgSearchWord: '',
      isAdmin: false,
    };
  }

  addOrg(org) {
    let {currentOrganizations} = this.state;
    if (!currentOrganizations.find(match => match.id === org.id)) {
      this.setState({
        currentOrganizations: [...currentOrganizations, org],
      });
    }
  }

  toggleOrg(org) {
    let {currentOrganizations} = this.state;
    let idx = currentOrganizations.findIndex(match => match.id === org.id);
    if (idx >= 0) {
      let temp = currentOrganizations.slice();
      temp.splice(idx, 1);
      this.setState({
        currentOrganizations: temp,
      });
    } else {
      this.setState({
        currentOrganizations: [...currentOrganizations, org],
      });
    }
  }

  orgSearch() {
    let {orgSearchWord, currentOrganizations} = this.state;
    api.get(
      `/organizations/?name=${orgSearchWord}${
        currentOrganizations.length
          ? `&excluded=[${currentOrganizations.map(org => org.id)}]`
          : ''
      }`,
      (err, res) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: res});
      },
    );
  }

  addUser(e) {
    let {usersToAdd, isAdmin} = this.state;
    let form = this.refs.addUser;
    let data = form.state.data;
    data.isAdmin = isAdmin;
    this.setState({usersToAdd: [...usersToAdd, data], isAdmin: false}, () =>
      form.reset(),
    );
  }

  submitUsers() {
    let {currentOrganizations, usersToAdd} = this.state;
    let {history} = this.props;
    if (!currentOrganizations.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'Users must be added with organizations.',
      });
    }
    if (!usersToAdd.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'You must add some users before submitting.',
      });
    }
    let data = {
      organizations: currentOrganizations.map(org => org.id),
      users: usersToAdd,
    };
    api.post('/organizations/addUsers', data, (err, res) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
        return this.setState({failedUsers: err.data.failed, usersToAdd: []});
      }
      setTimeout(() => {
        history.replaceState({}, '/users');
        snackbar.notify({
          type: 'success',
          message: 'Users Successfully added.',
        });
      }, 1000);
    });
  }

  edit(user) {
    this.refs['addUser'].setState({data: user});
  }

  render() {
    let {
      orgSearchWord,
      searchResults,
      currentOrganizations,
      isAdmin,
      usersToAdd,
      failedUsers,
    } = this.state;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add a User</h3>
        <div className="box-content">
          {this._user.organizations.length ? (
            <div className="row">
              <h4>Organizations</h4>
              {this._user.organizations.map((org, i) => (
                <div key={i}>
                  <input
                    onChange={() => this.toggleOrg(org.organization)}
                    type={'checkbox'}
                    name={`org-${i}`}
                    id={`org-${i}`}
                    style={{verticalAlign: 'middle', marginRight: '5px'}}
                  />
                  <label htmlFor={`org-${i}`}>{org.organization.name}</label>
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              <h4>Search for Organizations</h4>
              <div className="row" style={{marginTop: '10px'}}>
                <input
                  onChange={e => this.setState({orgSearchWord: e.target.value})}
                  value={orgSearchWord}
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  className="col-xs-6"
                  placeholder="Organizations Name"
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  onClick={() => this.orgSearch()}>
                  Find Organization
                </button>
              </div>
              {searchResults.map((item, i) => (
                <div key={i} className="row">
                  <div style={{padding: '10px 0'}} className="col-xs-6">
                    <Link to={`/organizations/${item.id}`} target="_blank">
                      {item.name}
                    </Link>
                  </div>
                  <button
                    className="btn btn-link col-xs-6"
                    onClick={() => this.addOrg(item)}>
                    Add
                  </button>
                </div>
              ))}
              <h4 style={{marginTop: '10px'}}>Selected</h4>
              <ul>
                {currentOrganizations.length ? (
                  currentOrganizations.map((each, i) => (
                    <div key={i} className="row">
                      <div style={{padding: '10px 0'}} className="col-xs-6">
                        <Link to={`/organizations/${each.id}`} target="_blank">
                          {each.name}
                        </Link>
                      </div>
                      <button
                        className="btn btn-link col-xs-6"
                        onClick={() => this.toggleOrg(each)}>
                        Unselect
                      </button>
                    </div>
                  ))
                ) : (
                  <div>None Selected</div>
                )}
              </ul>
            </div>
          )}
          <h4>
            <input
              onInput={() => this.setState({isAdmin: !isAdmin})}
              type={'checkbox'}
              name={'is-admin'}
              id={'is-admin'}
              style={{verticalAlign: 'middle', marginRight: '5px'}}
            />
            <label htmlFor={'is-admin'}>Is this user an admin?</label>
          </h4>
          <div className="box-content">
            <Form
              ref="addUser"
              className="bento-form-static"
              fields={require('./user-form')}
              buttons={buttons}
              submit={e => this.addUser(e)}
            />
            <div className="row">
              <h4>Users to be added</h4>
              <table className="box-table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Is Admin?</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {usersToAdd.length ? (
                    usersToAdd.map((user, i) => (
                      <tr key={i}>
                        <td>
                          {user.firstName} {user.lastName}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.isAdmin ? 'admin' : 'no'}</td>
                        <td>x</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No Users Selected</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="row">
                <button
                  className="btn btn-primary col-md-3"
                  onClick={() => this.submitUsers()}>
                  Submit
                </button>
              </div>
              {failedUsers.length ? (
                <div>
                  <h4 style={{color: 'red', marginTop: '1rem'}}>Failed Additions</h4>
                  <table className="box-table table-striped">
                    <thead>                                                                                                        
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Error</th>
                        <th>Is Admin?</th>
                        <th>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedUsers.map((fail, i) => (
                        <tr key={i}>
                          <td>
                            {fail.user.firstName} {fail.lastName}
                          </td>
                          <td>{fail.user.email}</td>
                          <td>{fail.error.message}</td>
                          <td>{fail.user.isAdmin ? 'admin' : 'no'}</td>
                          <td onClick={() => this.edit(fail.user)}>x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AddUser;
