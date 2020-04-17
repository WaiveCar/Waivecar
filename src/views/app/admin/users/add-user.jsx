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
    this.currentUser = auth.user();
    this.state = {
      currentOrganizations: [],
      searchResults: [],
      orgSearchWord: '',
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

  submitUser(e) {
    let {currentOrganizations} = this.state;
    if (!currentOrganizations.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'Users must be added with organizations.',
      });
    }
    let form = this.refs.addUser;
    let data = form.state.data;
    data.organizations = currentOrganizations.map(org => org.id);
    api.post('/organizations/addUser', data, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      snackbar.notify({
        type: 'User Successfully added.',
        message: err.message,
      });
      history.replaceState({}, '/users');
    });
  }

  render() {
    let {orgSearchWord, searchResults, currentOrganizations} = this.state;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add a User</h3>
        {this.currentUser.organizations.length ? (
          <div>
            <h4>Organizations</h4>
            {this.currentUser.organizations.map((org, i) => (
              <div key={i}>
                <input
                  onInput={() => this.toggleOrg(org)}
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
              {currentOrganizations.map((each, i) => (
                <li>
                  <Link to={`/organizations/${each.id}`} target="_blank">
                    {each.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="box-content">
          <Form
            ref="addUser"
            className="bento-form-static"
            fields={require('./user-form')}
            buttons={buttons}
            submit={e => this.submitUser(e)}
          />
        </div>
      </div>
    );
  }
}

export default AddUser;
