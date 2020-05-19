import React, {Component} from 'react';
import {api, relay} from 'bento';
import Table from 'bento-service/table';

class CarsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      more   : false,
    };
    this.row = this.props.row;
    let {organizationIds} = this.props;
    this.table = new Table(
      this,
      'carsWithBookings',
      null,
      `/carsWithBookings${organizationIds.length ? `?organizationIds=[${organizationIds.join(',')}]` : ''}`,
      20,
    );
    relay.subscribe(this, 'carsWithBookings');
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

  render() {
    return (
      <div>
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
