import React, {Component} from 'react';
import {Link} from 'react-router';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Organizations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      orgSearchWord: '',
    };
  }
  orgSearch() {
    let {orgSearchWord} = this.state;
    api.get(`/organizations/?name=${orgSearchWord}`, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({searchResults: res});
    });
  }

  addToOrg() {}

  removeFromOrg() {}

  render() {
    let {searchResults, orgSearchWord} = this.state;
    let {type} = this.props;
    let assignee = this.props[type];
    return (
      <div className="box">
        <h3>Organizations</h3>
        <div className="box-content">
          <h4>Current Organizations</h4>
          {assignee.organizations.map((each, i) => (
            <div className="row" key={i}>
              <div style={{padding: '10px 0'}} className="col-xs-6">
                <Link to={`/organizations/${each.organization.id}`}>
                  {each.organization.name}
                </Link>
              </div>
              <button
                className="btn btn-link col-xs-6"
                onClick={() => this.removeFromOrg(item.id)}>
                Remove Item
              </button>
            </div>
          ))}
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
                onClick={() => this.addToOrg(item.id)}>
                Add Now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

module.exports = Organizations;
