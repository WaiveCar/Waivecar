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
    this.updateCurrent();
  }

  componentDidUpdate(prevProps) {
    let {type} = this.props;
    if (
      this.props[type].length &&
      prevProps[type].length !== this.props[type].length
    ) {
      this.updateCurrent();
    }
  }

  updateCurrent() {
    let {type} = this.props;
    let assignee = this.props[type];
    if (assignee.length) {
      let orgSet = new Set();
      let orgs = [];
      for (let each of assignee) {
        if (each.organization && !orgSet.has(each.organization.id)) {
          orgSet.add(each.organization.id);
          orgs.push(each.organization);
        } else {
          each.organizations && each.organizations.forEach(org => {
            if (!orgSet.has(org.organizationId)) {
              orgs.push(org.organization);
            }
            orgSet.add(org.organizationId);
          });
        }
      }
      return this.setState({currentOrganizations: orgs});
    }
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

  orgAction(action, orgId, cb) {
    let {type} = this.props;
    let assignee = this.props[type];
    let {currentOrganizations} = this.state;
    let seenSelf = false;
    api.put(
      `/organizations/${orgId}/${action}${capitalize(type)}`,
      assignee.id
        ? {
            [`${type}Id`]: assignee.id,
          }
        : {
            [`${type}List`]: assignee,
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
        this.setState({currentOrganizations}, () => cb && cb());
      },
    );
  }

  batchRemove(orgList) {
    let {type, updateCars} = this.props;
    if (orgList.length) {
      let next = orgList.pop();
      return this.orgAction('remove', next, () => this.batchRemove(orgList));
    }
    if (updateCars) {
      updateCars();
    }
  }

  render() {
    let {currentOrganizations, searchResults, orgSearchWord} = this.state;
    let {type, updateCars,full} = this.props;
    return (
      <div className={`box ${full ? 'full' : ''}`}>
        <h3>
          <span>
            {type[type.length - 1] !== 's'
              ? 'Organizations'
              : 'Batch Organization Actions'}
          </span>
          <small>
            {type[type.length - 1] !== 's' ? '' : '(on all selected)'}
          </small>
        </h3>
        <div className="box-content">
          <ul>
            {currentOrganizations &&
              currentOrganizations.map((each, i) => (
                <li key={i}>
                  <Link to={`/organizations/${each.id}`}>{each.name}</Link>
                  {this._user.hasAccess('waiveAdmin') && type !== 'cars' ? (
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
            <button
              className="btn btn-link"
              onClick={() =>
                this.batchRemove(currentOrganizations.map(each => each.id))
              }>
              Remove From All
            </button>
          ) : (
            ''
          )}
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
                    onClick={() =>
                      this.orgAction(
                        'add',
                        item.id,
                        () => updateCars && updateCars(),
                      )
                    }>
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
