import React, {Component} from 'react';
import {api, relay} from 'bento';
import Table from 'bento-service/table';

class CarsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      more: false,
    };
    this.row = this.props.row;
    let {organizationIds} = this.props;
    this.table = new Table(
      this,
      'carsWithBookings',
      null,
      `/carsWithBookings${
        organizationIds.length
          ? `?organizationIds=[${organizationIds.join(',')}]`
          : ''
      }`,
      20,
    );
    relay.subscribe(this, 'carsWithBookings');
  }

  componentDidMount() {
    this.table.init();
    this.setState({
      sort: {
        key: 'updatedAt',
        order: 'DESC',
      },
      searchObj: {
        order: 'updated_at,DESC',
      },
    });
  }

  render() {
    return (
      <div>
        <div className="col-md-9">
          <input
            type="text"
            className="form-control box-table-search"
            placeholder="Search [car name, organization]"
            onChange={e => this.table.search(e, e.target.value)}
          />
        </div>
        <table className="box-table table-striped">
          <thead>{this.props.header()}</thead>
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

export default CarsTable;
