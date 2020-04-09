import React, {Component} from 'react';
import {Link} from 'react-router';

class Organizations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      orgSearchWord: '',
    };
  }
  orgSearch() {
  }

  addToOrg() {}

  removeFromOrg() {}

  render() {
    let {searchResults, orgSearchWord} = this.state;
    let {user} = this.props;
    console.log(user);
    return (
      <div className="box">
        <h3>Organizations</h3>
        <div className="box-content">
          <h4>Current Organizations</h4>
          {user.organizations.map((each, i) => 
            <div>
              {each.organization.name}
            </div>
          )}
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
                onClick={() => this.addToOrg(item.id)}>
                book now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

module.exports = Organizations;
