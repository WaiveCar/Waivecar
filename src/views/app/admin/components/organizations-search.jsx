import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';

const capitalize = word => word[0].toUpperCase() + word.slice(1);

class Organizations extends Component {
  constructor(props) {
    super(props);
    this._user = this.props._user;
    this.state = {
      currentOrganizations: [],
      searchResults: [],
      orgSearchWord: '',
    };
  }
  componentDidMount() {
    let {type} = this.props;
    let assignee = this.props[type];
    this.setState({
      currentOrganizations: assignee.organizations
        ? assignee.organizations.map(org => org.organization)
        : assignee.organization
        ? [assignee.organization]
        : [],
    });
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

  orgAction(action, orgId) {
    let {type} = this.props;
    let assignee = this.props[type];
    let {currentOrganizations} = this.state;
    api.put(
      `/organizations/${orgId}/${action}${capitalize(type)}`,
      {
        [`${type}Id`]: assignee.id,
      },
      (err, res) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        let idx = currentOrganizations.findIndex(org => org.id === orgId);
        let copy = currentOrganizations.slice();
        action === 'add'
          ? currentOrganizations.push(res)
          : currentOrganizations.splice(idx, 1);
        this.setState({currentOrganizations});
      },
    );
  }

  render() {
    let {currentOrganizations, searchResults, orgSearchWord} = this.state;
    return (
      <div className="box">
        <h3>Organizations</h3>
        <div className="box-content">
          <ul>
            {currentOrganizations.map((each, i) => (
              <li key={i}>
                  <Link to={`/organizations/${each.id}`}>{each.name}</Link>
                {this._user.hasAccess('waiveAdmin') ? (
                  <button
                    className="btn btn-link"
                    onClick={() => this.orgAction('remove', each.id)}>
                    Remove
                  </button>
                ) : (
                  ''
                )}
              </li>
            ))}
          </ul>
          {this._user.hasAccess('waiveAdmin') ? (
            <div>
              <h4>Search for More</h4>
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
                    onClick={() => this.orgAction('add', item.id)}>
                    Add Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

module.exports = Organizations;
