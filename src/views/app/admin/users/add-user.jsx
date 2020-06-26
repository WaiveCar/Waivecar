import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Form, snackbar} from 'bento-web';
import {Link} from 'react-router';

let buttons = [
  {
    value: 'Add Users',
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
      currentUsers: [],
      currentFailedUsers: [],
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

  toggleItem(item, org, cb) {
    let currentItems = this.state[`current${item}`];
    let idx = currentItems.findIndex(match => match.id === org.id);
    if (idx >= 0) {
      let temp = currentItems.slice();
      temp.splice(idx, 1);
      this.setState(
        {
          [`current${item}`]: temp,
        },
        () => {
          if (cb) {
            cb();
          }
        },
      );
    } else {
      this.setState(
        {
          [`current${item}`]: [...currentItems, org],
        },
        () => {
          if (cb) {
            cb();
          }
        },
      );
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
    let {currentUsers, isAdmin} = this.state;
    let form = this.refs.addUser;
    let data = form.state.data;
    data.isAdmin = isAdmin;
    this.setState({currentUsers: [...currentUsers, data], isAdmin: false}, () =>
      form.reset(),
    );
  }

  submitUsers() {
    let {currentOrganizations, currentUsers, currentFailedUsers} = this.state;
    let {history} = this.props;
    if (!currentOrganizations.length) {
      return snackbar.notify({
        type: 'danger',
        message:
          'You must select at least one organization to add these users to.',
      });
    }
    if (!currentUsers.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'You must add some users before submitting.',
      });
    }
    let data = {
      organizations: currentOrganizations.map(org => org.id),
      users: currentUsers,
    };
    api.post('/organizations/addUsers', data, (err, res) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
        return this.setState({
          currentFailedUsers: [...currentFailedUsers, ...err.data.failed],
          currentUsers: [],
        });
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

  edit(resource, user) {
    this.toggleItem(resource, user, () => {
      this.setState({isAdmin: user.isAdmin}, () => {
        this.refs['addUser'].setState({data: user});
      });
    });
  }

  render() {
    let {
      orgSearchWord,
      searchResults,
      currentOrganizations,
      isAdmin,
      currentUsers,
      currentFailedUsers,
    } = this.state;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add Users</h3>
        <div className="box-content">
          {this._user.organizations.length ? (
            <div className="row">
              <h4>Organizations (for all new users)</h4>
              {this._user.organizations.map((org, i) => (
                <div key={i} style={{marginLeft: '3rem'}}>
                  <input
                    onChange={() =>
                      this.toggleItem('Organizations', org.organization)
                    }
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
              <div style={{margin: '2rem', marginBottom: 0}}>
                <div className="row" style={{marginTop: '10px'}}>
                  <input
                    onChange={e =>
                      this.setState({orgSearchWord: e.target.value})
                    }
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
              </div>
              <div style={{margin: '2rem', marginTop: 0}}>
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
              </div>
              <h4 style={{marginTop: '1rem'}}>Selected</h4>
              <div style={{margin: '2rem', marginTop: 0}}>
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
                        onClick={() => this.toggleItem('Organizations', each)}>
                        Unselect
                      </button>
                    </div>
                  ))
                ) : (
                  <div>None Selected</div>
                )}
              </div>
            </div>
          )}
          <h4></h4>
          <div className="box-content">
            <input
              onInput={() => this.setState({isAdmin: !isAdmin})}
              type={'checkbox'}
              name={'is-admin'}
              id={'is-admin'}
              checked={isAdmin}
              style={{verticalAlign: 'middle', marginRight: '5px'}}
            />
            <label htmlFor={'is-admin'}>Is this user an admin?</label>
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
                  <tr className="user-add-row">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Is Admin?</th>
                    <th>Edit</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length ? (
                    currentUsers.map((user, i) => (
                      <tr key={i} className="user-add-row">
                        <td>
                          {user.firstName} {user.lastName}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.isAdmin ? 'yes' : 'no'}</td>
                        <td>
                          <button onClick={() => this.edit('Users', user)}>
                            <i
                              style={{color: 'green'}}
                              className="material-icons">
                              edit
                            </i>
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => this.toggleItem('Users', user)}>
                            <i className="material-icons">delete</i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No Users Selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div
                className="row"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1rem',
                }}>
                <button
                  className="btn btn-primary col-md-6"
                  onClick={() => this.submitUsers()}>
                  Submit New Users
                </button>
              </div>
              {currentFailedUsers.length ? (
                <div>
                  <h4 style={{color: 'red', marginTop: '1rem'}}>
                    Failed Additions
                  </h4>
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
                      {currentFailedUsers.map((fail, i) => (
                        <tr key={i}>
                          <td>
                            {fail.user.firstName} {fail.lastName}
                          </td>
                          <td>{fail.user.email}</td>
                          <td>{fail.error.message}</td>
                          <td>{fail.user.isAdmin ? 'admin' : 'no'}</td>
                          <td>
                            <button
                              onClick={() =>
                                this.edit('FailedUsers', fail.user)
                              }>
                              <i
                                style={{color: 'green'}}
                                className="material-icons">
                                edit
                              </i>
                            </button>
                          </td>
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
