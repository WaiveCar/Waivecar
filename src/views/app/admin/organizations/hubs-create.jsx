import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, auth} from 'bento';

class HubsCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgSearchWord: '',
      currentOrganization: null,
      searchResults: [],
    };
    this._user = auth.user();
  }

  orgSearch() {
    let {orgSearchWord, currentOrganization} = this.state;
    api.get(
      `/organizations/?name=${orgSearchWord}${currentOrganization ? `&excluded=[${currentOrganization.id}]` : ''}`,
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
    let {orgSearchWord, currentOrganization, searchResults} = this.state;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>Add A Station</h3>
        <div className="box-content">
          {this._user.organizations.length ? (
            <div className="row">
              <h4>Organization</h4>
              {this._user.organizations.map((org, i) => (
                <div key={i}>
                  <input
                    onChange={() =>
                      this.setState({currentOrganization: org.organization})
                    }
                    type={'radio'}
                    checked={
                      currentOrganization &&
                      org.organizationId === currentOrganization.id
                    }
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
                    onClick={() => this.setState({currentOrganization: item})}>
                    Add
                  </button>
                </div>
              ))}
              {currentOrganization && (
                <h4 style={{marginTop: '10px'}}>
                  Selected: {currentOrganization.name}
                </h4>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default HubsCreate;
