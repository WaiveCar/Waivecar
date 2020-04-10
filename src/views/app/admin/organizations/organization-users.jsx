import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, relay} from 'bento';
import Table from 'bento-service/table';
import ThSort from '../components/table-th';
import moment from 'moment';

class OrganizationCars extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
    };
    this.table = new Table(
      this,
      'users',
      null,
      `/users?organizationIds=[${this.props.organizationId}]`,
    );
    relay.subscribe(this, 'users');
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

  row(user) {
    return (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>
          <Link to={`/users/${user.id}`}>{user.firstName} {user.lastName}</Link>
        </td>
        <td className="hidden-sm-down">
          {moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <table className="box-table table-striped">
          <thead>
            <tr ref="sort">
              <ThSort sort="id" value="Id" ctx={this} />
              <ThSort sort="firstName" value="Name" ctx={this} />
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
    );
  }
}

export default OrganizationCars;
