import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Form, snackbar} from 'bento-web';
import {Link} from 'react-router';

let buttons = [
];

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.currentUser = auth.user();
    this.state = {
      currentOrganizations: [],
      searchResults: [],
      orgSearchWord: '',
    }
  }

  submitUser() {
    console.log('submit');
  }

  addOrg(org) {
    let {currentOrganizations} = this.state;
    if (!currentOrganizations.find(match => match.id === org.id)) {
      this.setState({
        currentOrganizations: [...currentOrganizations, org]
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

  render() {
    let {orgSearchWord, searchResults} = this.state;
    return (
      <div className="box">
        <h3>Add a User</h3>
        <div className="box-content">
          <Form
            ref="personal"
            className="bento-form-static"
            fields={require('./user-form')}
            buttons={buttons}
            submit={() => this.submitUser()}
          />
          {this.currentUser.organizations.length ? (
            <div>Has Organizations</div>
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
                    onClick={() => this.addOrg(item.id)}>
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AddUser;
