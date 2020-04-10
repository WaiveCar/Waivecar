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
      'cars',
      null,
      `/carsWithBookings?organizationIds=[${this.props.organizationId}]`,
    );
    relay.subscribe(this, 'cars');
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

  row(car) {
    return (
      <tr key={car.id}>
        <td>{car.id}</td>
        <td>
          <Link to={`/cars/${car.id}`}>{car.license}</Link>
        </td>
        <td className="hidden-sm-down">
          {moment(car.createdAt).format('YYYY-MM-DD HH:mm:ss')}
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
              <ThSort sort="license" value="Name" ctx={this} />
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
