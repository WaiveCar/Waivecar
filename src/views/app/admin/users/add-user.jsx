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
    this.setState({usersToAdd: [...usersToAdd, data]}, () => form.reset());
  }

  submitUser(e) {
    let {currentOrganizations, isAdmin} = this.state;
    let {history} = this.props;
    if (!currentOrganizations.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'Users must be added with organizations.',
      });
    }
    let form = this.refs.addUser;
    let data = form.state.data;
    data.organizations = currentOrganizations.map(org => org.id);
    data.isAdmin = isAdmin;
    api.post('/organizations/addUser', data, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      snackbar.notify({
        type: 'success',
        message: 'User Successfully added.',
      });
      history.replaceState({}, '/users');
    });
  }

  render() {
    let {
      orgSearchWord,
      searchResults,
      currentOrganizations,
      isAdmin,
      usersToAdd,
    } = this.state;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add a User</h3>
        <div className="box-content">
          {this._user.organizations.length ? (
            <div>
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
            <div>
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
          </div>
          {usersToAdd.map((user, i) => (
            <div key={i}>
              {user.firstName} {user.lastName} {user.isAdmin ? 'admin' : ''}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default AddUser;
