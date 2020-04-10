import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, relay} from 'bento';
import {snackbar} from 'bento-web';
import Table from 'bento-service/table';
import ThSort from '../components/table-th';
import moment from 'moment';

class Organizations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      organizations: [],
      offset: 0,
    };
    this.table = new Table(this, 'organizations', null, '/organizations');
    relay.subscribe(this, 'organizations');
  }

  componentDidMount() {
    this.table.init();
    this.setState({
      sort: {
        key: 'createdAt',
        order: 'DESC',
      },
      searchObj: {
        order: 'id,DESC',
      },
    });
  }

  createOrg() {
    let {name, organizations} = this.state;
    api.post('/organizations', {name}, (err, res) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({organizations: [...organizations, res]});
    });
  }

  row(org) {
    return (
      <tr key={org.id}>
        <td>{org.id}</td>
        <td>
          <Link to={`/organizations/${org.id}`}>{org.name}</Link>
        </td>
        <td className="hidden-sm-down">
          {moment(org.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </td>
      </tr>
    );
  }

  render() {
    let {organizations} = this.state;
    return (
      <div className="box">
        <h3>Organizations</h3>
        <div className="box-content">
          <div>New:</div>
          <input
            type={'text'}
            onChange={e => this.setState({name: e.target.value})}
          />
          <button
            className={'btn btn-primary'}
            onClick={() => this.createOrg()}>
            Create
          </button>
          <table className="box-table table-striped">
            <thead>
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this} />
                <ThSort sort="name" value="Name" ctx={this} />
                <ThSort
                  sort="createdAt"
                  value="Date"
                  ctx={this}
                  className="hidden-sm-down"
                />
              </tr>
            </thead>
            <tbody>{this.table.index()}</tbody>
          </table>
          {this.state.more ? (
            <div className="text-center" style={{marginTop: 20}}>
              <button
                className="btn btn-primary"
                onClick={() => this.table.more(false)}>
                Load More
              </button>
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
